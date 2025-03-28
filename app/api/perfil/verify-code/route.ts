import { NextResponse } from "next/server";
import db from "@/db";
import bcrypt from "bcrypt";

export async function POST(request: Request) {
  try {
    const { code, targetRut } = await request.json();
    
    // Get admin info from cookies
    const cookies = request.headers.get("cookie") || "";
    const userSessionCookie = cookies.split(';').find(c => c.trim().startsWith('userSession='));
    
    if (!userSessionCookie) {
      return NextResponse.json(
        { success: false, error: "No se encontró la sesión del usuario" },
        { status: 401 }
      );
    }

    let userSession;
    try {
      userSession = JSON.parse(decodeURIComponent(userSessionCookie.split('=')[1]));
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
        { success: false, error: "No tienes permisos para realizar esta acción" },
        { status: 403 }
      );
    }

    // Get admin data with verification code
    const adminQuery = db.prepare(`
      SELECT codigo_temporal, codigo_temporal_expira, codigo_temporal_target 
      FROM Usuario 
      WHERE rut_usuario = ?
    `);
    const admin = adminQuery.get(userSession.rut_usuario);
    
    if (!admin || !admin.codigo_temporal) {
      return NextResponse.json(
        { success: false, error: "No se encontró un código de verificación activo" },
        { status: 400 }
      );
    }

    // Check if code is expired
    const expiresAt = new Date(admin.codigo_temporal_expira);
    if (expiresAt < new Date()) {
      return NextResponse.json(
        { success: false, error: "El código de verificación ha expirado" },
        { status: 400 }
      );
    }

    // Verify code
    const isCodeValid = await bcrypt.compare(code, admin.codigo_temporal);
    if (!isCodeValid) {
      return NextResponse.json(
        { success: false, error: "Código de verificación incorrecto" },
        { status: 400 }
      );
    }

    // Verify target RUT matches
    if (admin.codigo_temporal_target !== targetRut) {
      return NextResponse.json(
        { success: false, error: "El usuario objetivo no coincide" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al verificar código:", error);
    return NextResponse.json(
      { success: false, error: "Error en el servidor" },
      { status: 500 }
    );
  }
}