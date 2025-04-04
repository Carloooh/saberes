// import { NextResponse } from "next/server";
// import db from "@/db";

// export async function GET(request: Request) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const path = searchParams.get("path");
//     const userType = searchParams.get("userType");
//     const userId = searchParams.get("userId");

//     if (!path || !userType || !userId) {
//       return NextResponse.json({ isValid: false });
//     }

//     const pathParts = path.split("/").filter(Boolean);

//     if (userType === "gestor") {
//       const cursoId = pathParts[1];

//       // Validate course exists and teacher is assigned to it
//       const courseQuery = db.prepare(`
//         SELECT 1
//         FROM CursosAsignaturasLink
//         WHERE id_curso = ?
//         AND rut_usuario = ?
//       `);
//       const courseExists = courseQuery.get(cursoId, userId);

//       if (!courseExists) {
//         return NextResponse.json({ isValid: false });
//       }

//       // If there's an asignatura ID, validate it belongs to the course
//       if (pathParts.length > 2) {
//         const asignaturaId = pathParts[2];
//         const asignaturaQuery = db.prepare(`
//           SELECT 1
//           FROM CursosAsignaturasLink cal
//           JOIN Asignaturas a ON a.id_curso = cal.id_curso
//           WHERE cal.id_curso = ?
//           AND a.id_asignatura = ?
//           AND cal.rut_usuario = ?
//           AND cal.id_asignatura = ?
//         `);
//         const asignaturaExists = asignaturaQuery.get(
//           cursoId,
//           asignaturaId,
//           userId,
//           asignaturaId
//         );

//         return NextResponse.json({ isValid: !!asignaturaExists });
//       }

//       return NextResponse.json({ isValid: true });
//     } else if (userType === "estudiante") {
//       const asignaturaId = pathParts[1];

//       // Check if student's course has this asignatura
//       const asignaturaQuery = db.prepare(`
//         SELECT 1
//         FROM CursosAsignaturasLink cal
//         JOIN Asignaturas a ON a.id_curso = cal.id_curso
//         WHERE cal.rut_usuario = ?
//         AND a.id_asignatura = ?
//       `);

//       const asignaturaExists = asignaturaQuery.get(userId, asignaturaId);
//       return NextResponse.json({ isValid: !!asignaturaExists });
//     }

//     return NextResponse.json({ isValid: false });
//   } catch (error) {
//     console.error("Error validating route:", error);
//     return NextResponse.json({ isValid: false });
//   }
// }

import { NextResponse, NextRequest } from "next/server";
import { Connection, Request, TYPES } from "tedious";
import config from "@/app/api/dbConfig";

// Helper function to execute SQL queries
function executeSQL(
  connection: Connection,
  sql: string,
  parameters: { name: string; type: any; value: any }[] = []
): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const results: any[] = [];
    const request = new Request(sql, (err) => {
      if (err) {
        return reject(err);
      }
      resolve(results);
    });

    parameters.forEach((param) => {
      request.addParameter(param.name, param.type, param.value);
    });

    request.on("row", (columns: any[]) => {
      const row: any = {};
      columns.forEach((column) => {
        row[column.metadata.colName] = column.value;
      });
      results.push(row);
    });

    connection.execSql(request);
  });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get("path");
    const userType = searchParams.get("userType");
    const userId = searchParams.get("userId");

    if (!path || !userType || !userId) {
      return NextResponse.json({ isValid: false });
    }

    const pathParts = path.split("/").filter(Boolean);

    // Create and connect to the database
    const connection = new Connection(config);
    await new Promise<void>((resolve, reject) => {
      connection.on("connect", (err) => {
        if (err) {
          console.error("Error al conectar a la BD:", err.message);
          return reject(err);
        }
        resolve();
      });
      connection.connect();
    });

    try {
      if (userType === "Administrador" || userType === "Docente") {
        const cursoId = pathParts[1];

        // First get the user's id_user from their rut
        const userIdQuery = `
          SELECT id_user 
          FROM Usuario
          WHERE rut_usuario = @rut
        `;

        const userResults = await executeSQL(connection, userIdQuery, [
          { name: "rut", type: TYPES.NVarChar, value: userId },
        ]);

        if (userResults.length === 0) {
          connection.close();
          return NextResponse.json({ isValid: false });
        }

        const id_user = userResults[0].id_user;

        // Validate course exists and teacher is assigned to it using id_user
        const courseQuery = `
          SELECT 1 
          FROM CursosAsignaturasLink
          WHERE id_curso = @cursoId 
          AND id_user = @id_user
        `;

        const courseResults = await executeSQL(connection, courseQuery, [
          { name: "cursoId", type: TYPES.NVarChar, value: cursoId },
          { name: "id_user", type: TYPES.NVarChar, value: id_user },
        ]);

        if (courseResults.length === 0) {
          connection.close();
          return NextResponse.json({ isValid: false });
        }

        // If there's an asignatura ID, validate it belongs to the course
        if (pathParts.length > 2) {
          const asignaturaId = pathParts[2];
          const asignaturaQuery = `
            SELECT 1 
            FROM CursosAsignaturasLink cal
            JOIN Asignaturas a ON a.id_curso = cal.id_curso
            WHERE cal.id_curso = @cursoId 
            AND a.id_asignatura = @asignaturaId
            AND cal.id_user = @id_user
            AND cal.id_asignatura = @asignaturaId
          `;

          const asignaturaResults = await executeSQL(
            connection,
            asignaturaQuery,
            [
              { name: "cursoId", type: TYPES.NVarChar, value: cursoId },
              {
                name: "asignaturaId",
                type: TYPES.NVarChar,
                value: asignaturaId,
              },
              { name: "id_user", type: TYPES.NVarChar, value: id_user },
            ]
          );

          connection.close();
          return NextResponse.json({ isValid: asignaturaResults.length > 0 });
        }

        connection.close();
        return NextResponse.json({ isValid: true });
      } else if (userType === "estudiante") {
        const asignaturaId = pathParts[1];

        // First get the user's id_user from their rut
        const userIdQuery = `
          SELECT id_user 
          FROM Usuario
          WHERE rut_usuario = @rut
        `;

        const userResults = await executeSQL(connection, userIdQuery, [
          { name: "rut", type: TYPES.NVarChar, value: userId },
        ]);

        if (userResults.length === 0) {
          connection.close();
          return NextResponse.json({ isValid: false });
        }

        const id_user = userResults[0].id_user;

        // Check if student's course has this asignatura using id_user
        const asignaturaQuery = `
          SELECT 1 
          FROM CursosAsignaturasLink cal
          JOIN Asignaturas a ON a.id_curso = cal.id_curso
          WHERE cal.id_user = @id_user
          AND a.id_asignatura = @asignaturaId
        `;

        const asignaturaResults = await executeSQL(
          connection,
          asignaturaQuery,
          [
            { name: "id_user", type: TYPES.NVarChar, value: id_user },
            { name: "asignaturaId", type: TYPES.NVarChar, value: asignaturaId },
          ]
        );

        connection.close();
        return NextResponse.json({ isValid: asignaturaResults.length > 0 });
      }

      connection.close();
      return NextResponse.json({ isValid: false });
    } catch (error) {
      connection.close();
      throw error;
    }
  } catch (error) {
    console.error("Error validating route:", error);
    return NextResponse.json({ isValid: false });
  }
}
