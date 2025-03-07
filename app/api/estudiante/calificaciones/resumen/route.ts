// import { NextResponse } from "next/server";
// import { NextRequest } from "next/server";
// import db from "@/db";

// export async function GET(request: NextRequest) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const asignaturaId = searchParams.get("asignaturaId");

//     if (!asignaturaId) {
//       return NextResponse.json(
//         { success: false, error: "Falta el ID de la asignatura" },
//         { status: 400 }
//       );
//     }

//     const userSessionCookie = request.cookies.get("userSession")?.value;
//     if (!userSessionCookie) {
//       return NextResponse.json(
//         { success: false, error: "No session found" },
//         { status: 401 }
//       );
//     }

//     const userSession = JSON.parse(userSessionCookie);
//     const rutUsuario = userSession.rut_usuario;

//     const query = db.prepare(`
//       SELECT
//         e.id_evaluacion,
//         e.titulo,
//         e.fecha,
//         c.nota
//       FROM Evaluaciones e
//       LEFT JOIN Calificaciones c ON e.id_evaluacion = c.id_evaluacion AND c.rut_estudiante = ?
//       WHERE e.id_asignatura = ?
//       ORDER BY e.fecha DESC
//     `);

//     const calificaciones = query.all(rutUsuario, asignaturaId);

//     // Calculate average grade
//     let promedio = 0;
//     const notasValidas = calificaciones.filter(
//       (cal: any) => cal.nota !== null && cal.nota > 0
//     );

//     if (notasValidas.length > 0) {
//       const sumaNotas = notasValidas.reduce(
//         (sum: number, cal: any) => sum + cal.nota,
//         0
//       );
//       promedio = sumaNotas / notasValidas.length;
//     }

//     return NextResponse.json({
//       success: true,
//       promedio: promedio,
//       totalEvaluaciones: calificaciones.length,
//       evaluacionesCalificadas: notasValidas.length,
//     });
//   } catch (error) {
//     console.error("Error fetching student grades summary:", error);
//     return NextResponse.json(
//       { success: false, error: "Server error" },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import db from "@/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const asignaturaId = searchParams.get("asignaturaId");

    if (!asignaturaId) {
      return NextResponse.json(
        { success: false, error: "Falta el ID de la asignatura" },
        { status: 400 }
      );
    }

    const userSessionCookie = request.cookies.get("userSession")?.value;
    if (!userSessionCookie) {
      return NextResponse.json(
        { success: false, error: "No session found" },
        { status: 401 }
      );
    }

    const userSession = JSON.parse(userSessionCookie);
    const rutUsuario = userSession.rut_usuario;

    const query = db.prepare(`
      SELECT 
        e.id_evaluacion,
        e.titulo,
        e.fecha,
        c.nota
      FROM Evaluaciones e
      LEFT JOIN Calificaciones c ON e.id_evaluacion = c.id_evaluacion AND c.rut_estudiante = ?
      WHERE e.id_asignatura = ?
      ORDER BY e.fecha DESC
    `);

    const calificaciones = query.all(rutUsuario, asignaturaId);

    // Calculate average grade
    let promedio = null;
    const notasValidas = calificaciones.filter(
      (cal: any) => cal.nota !== null && cal.nota > 0
    );

    if (notasValidas.length > 0) {
      const sumaNotas = notasValidas.reduce(
        (sum: number, cal: any) => sum + cal.nota,
        0
      );
      promedio = sumaNotas / notasValidas.length;
    }

    return NextResponse.json({
      success: true,
      promedio: promedio,
      totalEvaluaciones: calificaciones.length,
      evaluacionesCalificadas: notasValidas.length,
      tieneEvaluaciones: notasValidas.length > 0,
    });
  } catch (error) {
    console.error("Error fetching student grades summary:", error);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
