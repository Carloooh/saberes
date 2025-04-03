// import { NextResponse } from 'next/server';
// import db from '@/db';

// export async function GET(req: Request) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const cursosIds = searchParams.get('cursos')?.split(',') || [];

//     const asignaturas = db.prepare(`
//       SELECT DISTINCT a.*
//       FROM Asignaturas asg
//       JOIN Asignatura a ON asg.id_asignatura = a.id_asignatura
//       WHERE asg.id_curso IN (${cursosIds.map(() => '?').join(',')})
//     `).all(...cursosIds);

//     return NextResponse.json(asignaturas);
//   } catch (error) {
//     console.error('Error al obtener asignaturas:', error);
//     return NextResponse.json({ success: false, error: 'Error en el servidor' }, { status: 500 });
//   }
// }

import { NextResponse, NextRequest } from "next/server";
import { Connection, Request as TediousRequest, TYPES } from "tedious";
import config from "@/app/api/dbConfig";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const cursosIds = searchParams.get("cursos")?.split(",") || [];

    // If no curso IDs provided, return empty array
    if (cursosIds.length === 0) {
      return NextResponse.json([]);
    }

    const connection = new Connection(config);

    return new Promise<NextResponse>((resolve, reject) => {
      connection.on("connect", (err) => {
        if (err) {
          console.error("Error al conectar a la base de datos:", err.message);
          reject(
            NextResponse.json(
              { success: false, error: "Error en el servidor" },
              { status: 500 }
            )
          );
          return;
        }

        const asignaturas: any[] = [];

        // Create parameterized query with proper SQL Server syntax
        const placeholders = cursosIds.map((_, i) => `@p${i}`).join(",");
        const query = `
          SELECT DISTINCT a.* 
          FROM Asignaturas asg
          JOIN Asignatura a ON asg.id_asignatura = a.id_asignatura
          WHERE asg.id_curso IN (${placeholders})
        `;

        const request = new TediousRequest(query, (err) => {
          if (err) {
            console.error("Error al ejecutar la consulta:", err.message);
            reject(
              NextResponse.json(
                { success: false, error: "Error en el servidor" },
                { status: 500 }
              )
            );
          } else {
            resolve(NextResponse.json(asignaturas));
          }
          connection.close();
        });

        // Add parameters for each curso ID
        cursosIds.forEach((id, index) => {
          request.addParameter(`p${index}`, TYPES.Int, parseInt(id));
        });

        request.on("row", (columns: any[]) => {
          const asignatura: { [key: string]: any } = {};
          columns.forEach((column) => {
            asignatura[column.metadata.colName] = column.value;
          });
          asignaturas.push(asignatura);
        });

        connection.execSql(request);
      });

      connection.connect();
    });
  } catch (error) {
    console.error("Error al obtener asignaturas:", error);
    return NextResponse.json(
      { success: false, error: "Error en el servidor" },
      { status: 500 }
    );
  }
}
