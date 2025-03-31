import { NextResponse } from "next/server";
import db from "@/db";
import bcrypt from "bcrypt";
import { sendPasswordResetNotification } from "@/app/api/perfil/email";

export async function POST(request: Request) {
  try {
    const { targetRut, email, password } = await request.json();

    if (!targetRut || (!email && !password)) {
      return NextResponse.json(
        { success: false, error: "Datos incompletos" },
        { status: 400 }
      );
    }

    // Get admin info from cookies
    const cookies = request.headers.get("cookie") || "";
    const userSessionCookie = cookies
      .split(";")
      .find((c) => c.trim().startsWith("userSession="));

    if (!userSessionCookie) {
      return NextResponse.json(
        { success: false, error: "No se encontró la sesión del usuario" },
        { status: 401 }
      );
    }

    let userSession;
    try {
      userSession = JSON.parse(
        decodeURIComponent(userSessionCookie.split("=")[1])
      );
    } catch (error) {
      console.error("Error al parsear la sesión del usuario:", error);
      return NextResponse.json(
        { success: false, error: "Sesión inválida" },
        { status: 400 }
      );
    }

    // Verify admin permissions
    if (userSession.tipo_usuario !== "Administrador") {
      return NextResponse.json(
        {
          success: false,
          error: "No tienes permisos para realizar esta acción",
        },
        { status: 403 }
      );
    }

    // Get target user info
    const userQuery = db.prepare(
      "SELECT email, nombres, apellidos FROM Usuario WHERE rut_usuario = ?"
    );
    const user = userQuery.get(targetRut) as {
      email: string;
      nombres: string;
      apellidos: string;
    };

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Start transaction
    db.exec("BEGIN TRANSACTION");

    try {
      // Update user data
      if (email && password) {
        // Update both email and password
        const hashedPassword = await bcrypt.hash(password, 10);
        const updateStmt = db.prepare(`
          UPDATE Usuario 
          SET email = ?, clave = ? 
          WHERE rut_usuario = ?
        `);
        updateStmt.run(email, hashedPassword, targetRut);
      } else if (email) {
        // Update only email
        const updateStmt = db.prepare(`
          UPDATE Usuario 
          SET email = ? 
          WHERE rut_usuario = ?
        `);
        updateStmt.run(email, targetRut);
      } else if (password) {
        // Update only password
        const hashedPassword = await bcrypt.hash(password, 10);
        const updateStmt = db.prepare(`
          UPDATE Usuario 
          SET clave = ? 
          WHERE rut_usuario = ?
        `);
        updateStmt.run(hashedPassword, targetRut);
      }

      // Clear verification code
      const clearCodeStmt = db.prepare(`
        UPDATE Usuario 
        SET codigo_temporal = NULL, 
            codigo_temporal_expira = NULL,
            codigo_temporal_target = NULL
        WHERE rut_usuario = ?
      `);

      clearCodeStmt.run(userSession.rut_usuario);

      db.exec("COMMIT");

      // Send notification email to user
      if (email || password) {
        await sendPasswordResetNotification(
          email || user.email,
          `${user.nombres} ${user.apellidos}`
        );
      }

      return NextResponse.json({ success: true });
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    return NextResponse.json(
      { success: false, error: "Error en el servidor" },
      { status: 500 }
    );
  }
}
