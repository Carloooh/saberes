import { NextResponse } from "next/server";
import db from "@/db";
import { sendVerificationCode } from "@/app/api/perfil/email";
import bcrypt from "bcrypt";

export async function POST(request: Request) {
  try {
    const { targetRut } = await request.json();

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

    // Get admin email
    const adminQuery = db.prepare(
      "SELECT email, nombres FROM Usuario WHERE rut_usuario = ?"
    );
    const admin = adminQuery.get(userSession.rut_usuario);

    if (!admin || !admin.email) {
      return NextResponse.json(
        {
          success: false,
          error: "No se pudo obtener la información del administrador",
        },
        { status: 404 }
      );
    }

    // Generate verification code (6 digits)
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    const hashedCode = await bcrypt.hash(verificationCode, 10);

    // Store code in database with expiration (15 minutes)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    // Update admin with temporary code
    const updateStmt = db.prepare(`
      UPDATE Usuario 
      SET codigo_temporal = ?, 
          codigo_temporal_expira = ?, 
          codigo_temporal_target = ? 
      WHERE rut_usuario = ?
    `);

    updateStmt.run(
      hashedCode,
      expiresAt.toISOString(),
      targetRut,
      userSession.rut_usuario
    );

    // Send verification code via email
    await sendVerificationCode(admin.email, verificationCode, admin.nombres);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al solicitar código de verificación:", error);
    return NextResponse.json(
      { success: false, error: "Error en el servidor" },
      { status: 500 }
    );
  }
}
