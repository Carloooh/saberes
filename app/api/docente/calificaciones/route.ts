import { NextResponse } from "next/server";
import db from "@/db";
import { v4 as uuidv4 } from "uuid";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cursoId = searchParams.get("cursoId");
    const asignaturaId = searchParams.get("asignaturaId");

    if (!cursoId || !asignaturaId) {
      return NextResponse.json(
        { success: false, error: "Faltan parámetros requeridos" },
        { status: 400 }
      );
    }

    // Get evaluations for the subject
    const queryEvaluaciones = db.prepare(`
      SELECT id_evaluacion, fecha, titulo
      FROM Evaluaciones
      WHERE id_asignatura = ? AND id_curso = ?
      ORDER BY fecha DESC
    `);
    const evaluaciones = queryEvaluaciones.all(asignaturaId, cursoId);

    // Get students with their grades
    const queryEstudiantes = db.prepare(`
      SELECT 
        u.rut_usuario,
        u.nombres,
        u.apellidos,
        COALESCE(
          json_group_array(
            CASE 
              WHEN e.id_evaluacion IS NOT NULL THEN
                json_object(
                  'id_evaluacion', e.id_evaluacion,
                  'nota', COALESCE(c.nota, 0.0)
                )
              ELSE NULL
            END
          ),
          '[]'
        ) as calificaciones
      FROM Usuario u
      JOIN CursosAsignaturasLink cal ON u.rut_usuario = cal.rut_usuario
      LEFT JOIN Evaluaciones e ON e.id_asignatura = ?
      LEFT JOIN Calificaciones c ON c.id_evaluacion = e.id_evaluacion 
        AND c.rut_estudiante = u.rut_usuario
      WHERE cal.id_curso = ? 
        AND u.tipo_usuario = 'Estudiante'
      GROUP BY u.rut_usuario
    `);

    const estudiantes = queryEstudiantes.all(asignaturaId, cursoId);

    // Parse the JSON string to actual array for each student
    estudiantes.forEach((estudiante) => {
      estudiante.calificaciones = JSON.parse(estudiante.calificaciones).filter(
        Boolean
      );
    });

    return NextResponse.json({
      success: true,
      data: {
        evaluaciones,
        estudiantes,
      },
    });
  } catch (error) {
    console.error("Error fetching grades:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener las calificaciones" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { titulo, fecha, id_asignatura, cursoId } = await request.json();
    const id_evaluacion = uuidv4();

    const insertEvaluacion = db.prepare(`
      INSERT INTO Evaluaciones (id_evaluacion, id_curso, id_asignatura, titulo, fecha)
      VALUES (?, ?, ?, ?, ?)
    `);

    insertEvaluacion.run(id_evaluacion, cursoId, id_asignatura, titulo, fecha);

    // Get all students in the course
    const queryEstudiantes = db.prepare(`
      SELECT DISTINCT u.rut_usuario
      FROM Usuario u
      JOIN CursosAsignaturasLink cal ON u.rut_usuario = cal.rut_usuario
      WHERE cal.id_asignatura = ?
        AND u.tipo_usuario = 'Estudiante'
    `);

    const estudiantes = queryEstudiantes.all(id_asignatura);

    // Insert default grade (0.0) for each student
    const insertCalificacion = db.prepare(`
      INSERT INTO Calificaciones (id_calificacion, id_evaluacion, rut_estudiante, nota)
      VALUES (?, ?, ?, 0.0)
    `);

    estudiantes.forEach((estudiante) => {
      insertCalificacion.run(uuidv4(), id_evaluacion, estudiante.rut_usuario);
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error creating evaluation:", error);
    return NextResponse.json(
      { success: false, error: "Error al crear la evaluación" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { id_evaluacion, rut_estudiante, nota } = await request.json();

    const checkCalificacion = db.prepare(`
      SELECT id_calificacion 
      FROM Calificaciones 
      WHERE id_evaluacion = ? AND rut_estudiante = ?
    `);
    const existingCalificacion = checkCalificacion.get(
      id_evaluacion,
      rut_estudiante
    );

    if (existingCalificacion) {
      // Actualizar calificación existente
      const updateCalificacion = db.prepare(`
        UPDATE Calificaciones
        SET nota = ?
        WHERE id_evaluacion = ? AND rut_estudiante = ?
      `);
      updateCalificacion.run(nota, id_evaluacion, rut_estudiante);
    } else {
      // Insertar nueva calificación
      const insertCalificacion = db.prepare(`
        INSERT INTO Calificaciones (id_calificacion, id_evaluacion, rut_estudiante, nota)
        VALUES (?, ?, ?, ?)
      `);
      insertCalificacion.run(uuidv4(), id_evaluacion, rut_estudiante, nota);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating grade:", error);
    return NextResponse.json(
      { success: false, error: "Error al actualizar la calificación" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID de evaluación no proporcionado" },
        { status: 400 }
      );
    }

    // Delete grades first due to foreign key constraint
    const deleteCalificaciones = db.prepare(`
      DELETE FROM Calificaciones WHERE id_evaluacion = ?
    `);
    deleteCalificaciones.run(id);

    // Then delete the evaluation
    const deleteEvaluacion = db.prepare(`
      DELETE FROM Evaluaciones WHERE id_evaluacion = ?
    `);
    deleteEvaluacion.run(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting evaluation:", error);
    return NextResponse.json(
      { success: false, error: "Error al eliminar la evaluación" },
      { status: 500 }
    );
  }
}
