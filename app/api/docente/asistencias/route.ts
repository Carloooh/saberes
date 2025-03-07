// import { NextResponse } from "next/server";
// import db from "@/db";

// export async function GET(request: Request) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const diaId = searchParams.get("dia");

//     if (!diaId) {
//       return NextResponse.json(
//         { success: false, error: "Falta el parámetro 'dia'" },
//         { status: 400 }
//       );
//     }

//     const query = db.prepare(`
//       SELECT * FROM Asistencia
//       WHERE id_dia = ? AND id_curso = ?
//     `);
//     const asistencias = query.all(diaId);

//     return NextResponse.json({ success: true, asistencias });
//   } catch (error) {
//     console.error("Error al obtener asistencias:", error);
//     return NextResponse.json(
//       { success: false, error: "Error al obtener asistencias" },
//       { status: 500 }
//     );
//   }
// }

// export async function POST(request: Request) {
//   try {
//     const { dia, rut_usuario, asistencia } = await request.json();

//     if (!dia || !rut_usuario || asistencia === undefined) {
//       return NextResponse.json(
//         { success: false, error: "Faltan campos requeridos" },
//         { status: 400 }
//       );
//     }

//     // Verificar si ya existe un registro
//     const checkQuery = db.prepare(`
//       SELECT id_asistencia FROM Asistencia
//       WHERE id_dia = ? AND rut_usuario = ?
//     `);
//     const existingRecord = checkQuery.get(dia, rut_usuario);

//     if (existingRecord) {
//       // Actualizar registro existente
//       const updateQuery = db.prepare(`
//         UPDATE Asistencia
//         SET asistencia = ?
//         WHERE id_dia = ? AND rut_usuario = ?
//       `);
//       updateQuery.run(asistencia, dia, rut_usuario);
//     } else {
//       // Insertar nuevo registro
//       const insertQuery = db.prepare(`
//         INSERT INTO Asistencia (id_asistencia, id_dia, rut_usuario, asistencia)
//         VALUES (?, ?, ?, ?)
//       `);
//       insertQuery.run(`${dia}-${rut_usuario}`, dia, rut_usuario, asistencia);
//     }

//     return NextResponse.json({ success: true });
//   } catch (error) {
//     console.error("Error al guardar asistencia:", error);
//     return NextResponse.json(
//       { success: false, error: "Error al guardar asistencia" },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse } from "next/server";
import db from "@/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const diaId = searchParams.get("dia");

    if (!diaId) {
      return NextResponse.json(
        { success: false, error: "Falta el parámetro 'dia'" },
        { status: 400 }
      );
    }

    const query = db.prepare(`
      SELECT * FROM Asistencia
      WHERE id_dia = ?
    `);
    const asistencias = query.all(diaId);

    return NextResponse.json({ success: true, asistencias });
  } catch (error) {
    console.error("Error al obtener asistencias:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener asistencias" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { dia, rut_usuario, asistencia, id_curso, id_asignatura } =
      await request.json();

    if (!dia || !rut_usuario || asistencia === undefined) {
      return NextResponse.json(
        { success: false, error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    // Verificar si ya existe un registro
    const checkQuery = db.prepare(`
      SELECT id_asistencia FROM Asistencia
      WHERE id_dia = ? AND rut_usuario = ?
    `);
    const existingRecord = checkQuery.get(dia, rut_usuario);

    if (existingRecord) {
      // Actualizar registro existente
      const updateQuery = db.prepare(`
        UPDATE Asistencia
        SET asistencia = ?
        WHERE id_dia = ? AND rut_usuario = ?
      `);
      updateQuery.run(asistencia, dia, rut_usuario);
    } else {
      // Insertar nuevo registro
      const insertQuery = db.prepare(`
        INSERT INTO Asistencia (id_asistencia, id_dia, rut_usuario, asistencia, id_curso, id_asignatura)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      insertQuery.run(
        `${dia}-${rut_usuario}`,
        dia,
        rut_usuario,
        asistencia,
        id_curso || null,
        id_asignatura || null
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al guardar asistencia:", error);
    return NextResponse.json(
      { success: false, error: "Error al guardar asistencia" },
      { status: 500 }
    );
  }
}
