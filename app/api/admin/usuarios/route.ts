// import { NextResponse } from "next/server";
// import db from "@/db";

// export async function GET() {
//   try {
//     const query = db.prepare(`
//       SELECT 
//         u.rut_usuario,
//         u.nombres,
//         u.apellidos,
//         u.tipo_usuario,
//         u.estado,
//         u.email,
//         CASE 
//           WHEN u.tipo_usuario = 'Estudiante' THEN 
//             (SELECT c.nombre_curso 
//              FROM CursosAsignaturasLink cal
//              JOIN Curso c ON c.id_curso = cal.id_curso
//              WHERE cal.rut_usuario = u.rut_usuario
//              LIMIT 1)
//           ELSE NULL
//         END as curso_actual
//       FROM Usuario u
//       ORDER BY u.apellidos, u.nombres
//     `);

//     const usuarios = query.all();
//     return NextResponse.json({ success: true, data: usuarios });
//   } catch (error) {
//     console.error("Error fetching users:", error);
//     return NextResponse.json(
//       { success: false, error: "Error al obtener usuarios" },
//       { status: 500 }
//     );
//   }
// }

// export async function PUT(request: Request) {
//   try {
//     const data = await request.json();
//     const { rut_usuario, estado } = data;

//     const updateQuery = db.prepare(`
//       UPDATE Usuario 
//       SET estado = ?
//       WHERE rut_usuario = ?
//     `);

//     updateQuery.run(estado, rut_usuario);

//     return NextResponse.json({ success: true });
//   } catch (error) {
//     console.error("Error updating user:", error);
//     return NextResponse.json(
//       { success: false, error: "Error al actualizar usuario" },
//       { status: 500 }
//     );
//   }
// }

// export async function DELETE(request: Request) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const rut = searchParams.get("rut");

//     if (!rut) {
//       return NextResponse.json(
//         { success: false, error: "RUT no proporcionado" },
//         { status: 400 }
//       );
//     }

//     db.exec("BEGIN TRANSACTION");

//     try {
//       // Delete all related records first
//       const deleteQueries = [
//         "DELETE FROM CursosAsignaturasLink WHERE rut_usuario = ?",
//         "DELETE FROM Matricula WHERE rut_usuario = ?",
//         "DELETE FROM Usuario WHERE rut_usuario = ?"
//       ];

//       for (const query of deleteQueries) {
//         const stmt = db.prepare(query);
//         stmt.run(rut);
//       }

//       db.exec("COMMIT");
//       return NextResponse.json({ success: true });
//     } catch (error) {
//       db.exec("ROLLBACK");
//       throw error;
//     }
//   } catch (error) {
//     console.error("Error deleting user:", error);
//     return NextResponse.json(
//       { success: false, error: "Error al eliminar usuario" },
//       { status: 500 }
//     );
//   }
// }


import { NextResponse } from "next/server";
import db from "@/db";

export async function GET() {
  try {
    const query = db.prepare(`
      SELECT 
        u.rut_usuario,
        u.nombres,
        u.apellidos,
        u.tipo_usuario,
        u.estado,
        u.email,
        CASE 
          WHEN u.tipo_usuario = 'Estudiante' THEN 
            (SELECT c.nombre_curso 
             FROM CursosAsignaturasLink cal
             JOIN Curso c ON c.id_curso = cal.id_curso
             WHERE cal.rut_usuario = u.rut_usuario
             LIMIT 1)
          ELSE NULL
        END as curso_actual
      FROM Usuario u
      ORDER BY u.apellidos, u.nombres
    `);

    const usuarios = query.all();
    return NextResponse.json({ success: true, data: usuarios });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener usuarios" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { rut_usuario, estado, id_curso } = data;

    db.exec("BEGIN TRANSACTION");

    try {
      if (estado) {
        // Update user status
        const updateQuery = db.prepare(`
          UPDATE Usuario 
          SET estado = ?
          WHERE rut_usuario = ?
        `);
        updateQuery.run(estado, rut_usuario);
      }

      if (id_curso) {
        // Delete related records first
        const deleteQueries = [
          "DELETE FROM Calificaciones WHERE rut_estudiante = ?",
          "DELETE FROM Asistencia WHERE rut_usuario = ?",
          "DELETE FROM EntregaTarea WHERE rut_estudiante = ?",
          "DELETE FROM CursosAsignaturasLink WHERE rut_usuario = ?"
        ];

        for (const query of deleteQueries) {
          const stmt = db.prepare(query);
          stmt.run(rut_usuario);
        }

        // Insert new course assignment
        const insertNew = db.prepare(`
          INSERT INTO CursosAsignaturasLink (id_cursosasignaturaslink, rut_usuario, id_curso)
          VALUES (?, ?, ?)
        `);
        insertNew.run(crypto.randomUUID(), rut_usuario, id_curso);
      }

      db.exec("COMMIT");
      return NextResponse.json({ success: true });
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { success: false, error: "Error al actualizar usuario" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rut = searchParams.get("rut");

    if (!rut) {
      return NextResponse.json(
        { success: false, error: "RUT no proporcionado" },
        { status: 400 }
      );
    }

    db.exec("BEGIN TRANSACTION");

    try {
      const deleteQueries = [
        "DELETE FROM Calificaciones WHERE rut_estudiante = ?",
        "DELETE FROM Asistencia WHERE rut_usuario = ?",
        "DELETE FROM EntregaTarea WHERE rut_estudiante = ?",
        "DELETE FROM CursosAsignaturasLink WHERE rut_usuario = ?",
        "DELETE FROM Matricula WHERE rut_usuario = ?",
        "DELETE FROM Info_apoderado WHERE rut_usuario = ?",
        "DELETE FROM Info_medica WHERE rut_usuario = ?",
        "DELETE FROM Contacto_emergencia WHERE rut_usuario = ?",
        "DELETE FROM Usuario WHERE rut_usuario = ?"
      ];

      for (const query of deleteQueries) {
        const stmt = db.prepare(query);
        stmt.run(rut);
      }

      db.exec("COMMIT");
      return NextResponse.json({ success: true });
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { success: false, error: "Error al eliminar usuario" },
      { status: 500 }
    );
  }
}