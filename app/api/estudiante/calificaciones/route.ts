import { NextResponse } from "next/server";
import db from "@/db";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const asignaturaId = searchParams.get("asignaturaId");

    // Get user session from cookies instead of localStorage
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("userSession");
    const userSession = sessionCookie ? JSON.parse(sessionCookie.value) : null;
    const rutEstudiante = userSession?.rut_usuario;

    if (!asignaturaId || !rutEstudiante) {
      return NextResponse.json(
        { success: false, error: "Faltan parámetros requeridos" },
        { status: 400 }
      );
    }

    const query = db.prepare(`
      SELECT 
        e.id_evaluacion,
        e.titulo,
        e.fecha,
        COALESCE(c.nota, 0.0) as nota
      FROM Evaluaciones e
      LEFT JOIN Calificaciones c ON e.id_evaluacion = c.id_evaluacion 
        AND c.rut_estudiante = ?
      WHERE e.id_asignatura = ?
      ORDER BY e.fecha DESC
    `);

    const calificaciones = query.all(rutEstudiante, asignaturaId);

    return NextResponse.json({
      success: true,
      calificaciones,
    });
  } catch (error) {
    console.error("Error fetching calificaciones:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener las calificaciones" },
      { status: 500 }
    );
  }
}
