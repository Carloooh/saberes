// import { NextResponse } from "next/server";
// import db from "@/db";

// export async function GET(request: Request) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const cursoId = searchParams.get("cursoId");
//     const asignaturaId = searchParams.get("asignaturaId");

//     if (!cursoId || !asignaturaId) {
//       return NextResponse.json(
//         { success: false, error: "Faltan parámetros requeridos" },
//         { status: 400 }
//       );
//     }

//     // Get evaluations for the subject
//     const queryEvaluaciones = db.prepare(`
//       SELECT id_evaluacion, fecha, titulo
//       FROM Evaluaciones
//       WHERE id_asignatura = ?
//       ORDER BY fecha DESC
//     `);
//     const evaluaciones = queryEvaluaciones.all(asignaturaId);

//     // Get students and their grades
//     const queryEstudiantes = db.prepare(`
//       SELECT 
//         u.rut_usuario,
//         u.nombres,
//         u.apellidos,
//         json_group_array(
//           json_object(
//             'id_evaluacion', e.id_evaluacion,
//             'nota', COALESCE(c.nota, 0.0)
//           )
//         ) as calificaciones
//       FROM Usuario u
//       JOIN CursosAsignaturasLink cal ON u.rut_usuario = cal.rut_usuario
//       LEFT JOIN Evaluaciones e ON e.id_asignatura = cal.id_asignatura
//       LEFT JOIN Calificaciones c ON c.id_evaluacion = e.id_evaluacion AND c.rut_estudiante = u.rut_usuario
//       WHERE cal.id_curso = ? AND cal.id_asignatura = ? AND u.tipo_usuario = 'Estudiante'
//       GROUP BY u.rut_usuario
//     `);
//     const estudiantes = queryEstudiantes.all(cursoId, asignaturaId);

//     // Parse the JSON string to actual array
//     estudiantes.forEach(estudiante => {
//       estudiante.calificaciones = JSON.parse(estudiante.calificaciones);
//     });

//     return NextResponse.json({ 
//       success: true, 
//       data: { evaluaciones, estudiantes } 
//     });
//   } catch (error) {
//     console.error("Error fetching grades:", error);
//     return NextResponse.json(
//       { success: false, error: "Error fetching grades" },
//       { status: 500 }
//     );
//   }
// }

// export async function POST(request: Request) {
//   try {
//     const { titulo, fecha, id_asignatura } = await request.json();

//     if (!titulo || !fecha || !id_asignatura) {
//       return NextResponse.json(
//         { success: false, error: "Faltan campos requeridos" },
//         { status: 400 }
//       );
//     }

//     const id_evaluacion = `${id_asignatura}-${Date.now()}`;

//     db.exec('BEGIN TRANSACTION');

//     try {
//       // Insert evaluation
//       const insertEvaluacion = db.prepare(`
//         INSERT INTO Evaluaciones (id_evaluacion, id_asignatura, fecha, titulo)
//         VALUES (?, ?, ?, ?)
//       `);
//       insertEvaluacion.run(id_evaluacion, id_asignatura, fecha, titulo);

//       // Get all students in the subject
//       const queryEstudiantes = db.prepare(`
//         SELECT DISTINCT u.rut_usuario
//         FROM Usuario u
//         JOIN CursosAsignaturasLink cal ON u.rut_usuario = cal.rut_usuario
//         WHERE cal.id_asignatura = ? AND u.tipo_usuario = 'Estudiante'
//       `);
//       const estudiantes = queryEstudiantes.all(id_asignatura);

//       // Insert default grade (0.0) for each student
//       const insertCalificacion = db.prepare(`
//         INSERT INTO Calificaciones (id_calificaciones, id_evaluacion, rut_estudiante, nota)
//         VALUES (?, ?, ?, 0.0)
//       `);

//       estudiantes.forEach(estudiante => {
//         const id_calificaciones = `${id_evaluacion}-${estudiante.rut_usuario}`;
//         insertCalificacion.run(id_calificaciones, id_evaluacion, estudiante.rut_usuario);
//       });

//       db.exec('COMMIT');
//       return NextResponse.json({ success: true, id_evaluacion });
//     } catch (error) {
//       db.exec('ROLLBACK');
//       throw error;
//     }
//   } catch (error) {
//     console.error("Error creating evaluation:", error);
//     return NextResponse.json(
//       { success: false, error: "Error creating evaluation" },
//       { status: 500 }
//     );
//   }
// }

// export async function PUT(request: Request) {
//   try {
//     const { id_evaluacion, rut_estudiante, nota } = await request.json();

//     if (!id_evaluacion || !rut_estudiante || nota === undefined) {
//       return NextResponse.json(
//         { success: false, error: "Faltan campos requeridos" },
//         { status: 400 }
//       );
//     }

//     if (nota < 1.0 || nota > 7.0) {
//       return NextResponse.json(
//         { success: false, error: "La nota debe estar entre 1.0 y 7.0" },
//         { status: 400 }
//       );
//     }

//     const updateCalificacion = db.prepare(`
//       UPDATE Calificaciones
//       SET nota = ?
//       WHERE id_evaluacion = ? AND rut_estudiante = ?
//     `);
//     updateCalificacion.run(nota, id_evaluacion, rut_estudiante);

//     return NextResponse.json({ success: true });
//   } catch (error) {
//     console.error("Error updating grade:", error);
//     return NextResponse.json(
//       { success: false, error: "Error updating grade" },
//       { status: 500 }
//     );
//   }
// }

// export async function DELETE(request: Request) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const id_evaluacion = searchParams.get("id");

//     if (!id_evaluacion) {
//       return NextResponse.json(
//         { success: false, error: "Falta el ID de la evaluación" },
//         { status: 400 }
//       );
//     }

//     db.exec('BEGIN TRANSACTION');

//     try {
//       // Delete grades first
//       const deleteCalificaciones = db.prepare(`
//         DELETE FROM Calificaciones WHERE id_evaluacion = ?
//       `);
//       deleteCalificaciones.run(id_evaluacion);

//       // Then delete evaluation
//       const deleteEvaluacion = db.prepare(`
//         DELETE FROM Evaluaciones WHERE id_evaluacion = ?
//       `);
//       deleteEvaluacion.run(id_evaluacion);

//       db.exec('COMMIT');
//       return NextResponse.json({ success: true });
//     } catch (error) {
//       db.exec('ROLLBACK');
//       throw error;
//     }
//   } catch (error) {
//     console.error("Error deleting evaluation:", error);
//     return NextResponse.json(
//       { success: false, error: "Error deleting evaluation" },
//       { status: 500 }
//     );
//   }
// }





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
      WHERE id_asignatura = ?
      ORDER BY fecha DESC
    `);
    const evaluaciones = queryEvaluaciones.all(asignaturaId);

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
    estudiantes.forEach(estudiante => {
      estudiante.calificaciones = JSON.parse(estudiante.calificaciones).filter(Boolean);
    });

    return NextResponse.json({
      success: true,
      data: {
        evaluaciones,
        estudiantes
      }
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
    const { titulo, fecha, id_asignatura } = await request.json();
    const id_evaluacion = uuidv4();

    const insertEvaluacion = db.prepare(`
      INSERT INTO Evaluaciones (id_evaluacion, id_asignatura, titulo, fecha)
      VALUES (?, ?, ?, ?)
    `);

    insertEvaluacion.run(id_evaluacion, id_asignatura, titulo, fecha);

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

    estudiantes.forEach(estudiante => {
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
    const existingCalificacion = checkCalificacion.get(id_evaluacion, rut_estudiante);

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

    // const updateCalificacion = db.prepare(`
    //   UPDATE Calificaciones
    //   SET nota = ?
    //   WHERE id_evaluacion = ? AND rut_estudiante = ?
    // `);

    // updateCalificacion.run(nota, id_evaluacion, rut_estudiante);

    // return NextResponse.json({ success: true });
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