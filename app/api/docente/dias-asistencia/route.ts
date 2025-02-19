import { NextResponse } from "next/server";
import db from "@/db";

// Obtener todos los días de asistencia de un curso
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cursoId = searchParams.get("curso");

    if (!cursoId) {
      return NextResponse.json(
        { success: false, error: "Falta el parámetro 'curso'" },
        { status: 400 }
      );
    }

    // Obtener los días de asistencia
    const diasQuery = db.prepare(`
      SELECT * FROM DiasAsistencia
      WHERE id_curso = ?
      ORDER BY fecha DESC
    `);
    const dias = diasQuery.all(cursoId);

    return NextResponse.json({ success: true, dias });
  } catch (error) {
    console.error("Error fetching attendance days:", error);
    return NextResponse.json(
      { success: false, error: "Error fetching attendance days" },
      { status: 500 }
    );
  }
}

// Crear un nuevo día de asistencia
export async function POST(request: Request) {
    try {
      const { curso, fecha } = await request.json();
  
      if (!curso || !fecha) {
        return NextResponse.json(
          { success: false, error: "Faltan campos obligatorios" },
          { status: 400 }
        );
      }
  
      // Insertar un nuevo día de asistencia
      const insertDia = db.prepare(`
        INSERT INTO DiasAsistencia (id_dia, id_curso, fecha)
        VALUES (?, ?, ?)
      `);
      insertDia.run(`${curso}-${fecha}`, curso, fecha);
  
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("Error creating attendance day:", error);
      return NextResponse.json(
        { success: false, error: "Error creating attendance day" },
        { status: 500 }
      );
    }
  }
// export async function POST(request: Request) {
//     try {
//       const { curso, fecha } = await request.json();
  
//       if (!curso || !fecha) {
//         return NextResponse.json(
//           { success: false, error: "Faltan campos obligatorios" },
//           { status: 400 }
//         );
//       }
  
//       const insertDia = db.prepare(`
//         INSERT INTO DiasAsistencia (id_dia, id_curso, fecha)
//         VALUES (?, ?, ?)
//       `);
//       insertDia.run(`${curso}-${fecha}`, curso, fecha);
  
//       return NextResponse.json({ success: true });
//     } catch (error) {
//       console.error("Error creating attendance day:", error);
//       return NextResponse.json(
//         { success: false, error: "Error creating attendance day" },
//         { status: 500 }
//       );
//     }
//   }

  export async function DELETE(request: Request) {
    try {
      const { searchParams } = new URL(request.url);
      const diaId = searchParams.get("dia");
  
      if (!diaId) {
        return NextResponse.json(
          { success: false, error: "Falta el ID del día" },
          { status: 400 }
        );
      }
  
      db.exec('BEGIN TRANSACTION');
  
      try {
        // Primero eliminar las asistencias relacionadas
        const deleteAsistencias = db.prepare(`
          DELETE FROM Asistencia WHERE id_dia = ?
        `);
        deleteAsistencias.run(diaId);
  
        // Luego eliminar el día
        const deleteDia = db.prepare(`
          DELETE FROM DiasAsistencia WHERE id_dia = ?
        `);
        deleteDia.run(diaId);
  
        db.exec('COMMIT');
        return NextResponse.json({ success: true });
      } catch (error) {
        db.exec('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error("Error al eliminar día:", error);
      return NextResponse.json(
        { success: false, error: "Error al eliminar día" },
        { status: 500 }
      );
    }
  }