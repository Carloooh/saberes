import { NextResponse } from "next/server";
import db from "@/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rutDocente = searchParams.get("rut");

    if (!rutDocente) {
      return NextResponse.json(
        { success: false, error: "RUT no proporcionado" },
        { status: 400 }
      );
    }

    const query = db.prepare(`
      SELECT DISTINCT c.*, 
        (
          SELECT json_group_array(
            json_object(
              'id_asignatura', a.id_asignatura,
              'nombre_asignatura', a.nombre_asignatura
            )
          )
          FROM Asignatura a
          INNER JOIN CursosAsignaturasLink cal 
          WHERE cal.id_curso = c.id_curso 
          AND cal.rut_usuario = ?
          AND cal.id_asignatura = a.id_asignatura
        ) as asignaturas
      FROM Curso c
      INNER JOIN CursosAsignaturasLink cl ON c.id_curso = cl.id_curso
      WHERE cl.rut_usuario = ?
    `);

    const cursos = query.all(rutDocente, rutDocente).map(curso => ({
      ...curso,
      asignaturas: JSON.parse(curso.asignaturas || '[]')
    })).sort((a, b) => a.id_curso - b.id_curso);

    return NextResponse.json({ success: true, cursos });
  } catch (error) {
    console.error("Error al obtener cursos:", error);
    return NextResponse.json(
      { success: false, error: "Error en el servidor" },
      { status: 500 }
    );
  }
}