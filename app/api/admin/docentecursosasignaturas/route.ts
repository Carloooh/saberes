import { NextResponse } from "next/server";
import db from "@/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rut = searchParams.get("rut");

    if (rut) {
      // Get specific teacher's courses and subjects
      const query = db.prepare(`
        SELECT 
          cal.id_curso,
          cal.id_asignatura
        FROM CursosAsignaturasLink cal
        WHERE cal.rut_usuario = ?
      `);
      
      // const assignments = query.all(rut);
      const assignments = query.all(rut) as { id_curso: string; id_asignatura: string }[];

      
      // Transform into the expected format
      const teacherCourses: { [key: string]: string[] } = {};
      assignments.forEach(assignment => {
        if (assignment.id_asignatura) {
          if (!teacherCourses[assignment.id_curso]) {
            teacherCourses[assignment.id_curso] = [];
          }
          teacherCourses[assignment.id_curso].push(assignment.id_asignatura);
        }
      });

      return NextResponse.json({ success: true, data: teacherCourses });
    }

    // Get all courses if no rut provided
    const query = db.prepare(`
      SELECT id_curso, nombre_curso 
      FROM Curso 
      ORDER BY id_curso
    `);
    
    const cursos = query.all();
    return NextResponse.json({ success: true, data: cursos });
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener cursos" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { rut_usuario, cursosAsignaturas } = await request.json();

    db.exec("BEGIN TRANSACTION");

    try {
      // Delete all existing assignments and related records
      const deleteQueries = [
        "DELETE FROM Calificaciones WHERE id_evaluacion IN (SELECT id_evaluacion FROM Evaluaciones WHERE id_asignatura IN (SELECT id_asignatura FROM CursosAsignaturasLink WHERE rut_usuario = ?))",
        "DELETE FROM Evaluaciones WHERE id_asignatura IN (SELECT id_asignatura FROM CursosAsignaturasLink WHERE rut_usuario = ?)",
        "DELETE FROM CursosAsignaturasLink WHERE rut_usuario = ?"
      ];

      for (const query of deleteQueries) {
        const stmt = db.prepare(query);
        stmt.run(rut_usuario);
      }

      // Insert new assignments
      if (cursosAsignaturas && cursosAsignaturas.length > 0) {
        const insertNew = db.prepare(`
          INSERT INTO CursosAsignaturasLink (id_cursosasignaturaslink, rut_usuario, id_curso, id_asignatura)
          VALUES (?, ?, ?, ?)
        `);

        cursosAsignaturas.forEach((curso: { cursoId: string; asignaturas: string[] }) => {
          curso.asignaturas.forEach((asignaturaId: string) => {
            insertNew.run(crypto.randomUUID(), rut_usuario, curso.cursoId, asignaturaId);
          });
        });
      }

      db.exec("COMMIT");
      return NextResponse.json({ success: true });
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("Error updating teacher courses:", error);
    return NextResponse.json(
      { success: false, error: "Error al actualizar cursos del docente" },
      { status: 500 }
    );
  }
}