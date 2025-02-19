import { NextResponse } from "next/server";
import db from "@/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cursoId = searchParams.get("curso");

    const query = db.prepare(`
      SELECT u.rut_usuario, u.nombres, u.apellidos
      FROM Usuario u
      JOIN CursosAsignaturasLink cal ON u.rut_usuario = cal.rut_usuario
      WHERE U.tipo_usuario = 'Estudiante' AND cal.id_curso = ?
    `);
    const estudiantes = query.all(cursoId);

    return NextResponse.json({ success: true, estudiantes });
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json({ success: false, error: "Error fetching students" }, { status: 500 });
  }
}