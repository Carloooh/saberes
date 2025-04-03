// import { NextResponse } from 'next/server';
// import db from '@/db';

// export async function GET() {
//   try {
//     const cursos = db.prepare(`
//       SELECT
//         c.id_curso,
//         c.nombre_curso,
//         GROUP_CONCAT(a.id_asignatura) AS asignaturas_ids,
//         GROUP_CONCAT(a.nombre_asignatura) AS asignaturas_nombres
//       FROM Curso c
//       LEFT JOIN Asignaturas asg ON c.id_curso = asg.id_curso
//       LEFT JOIN Asignatura a ON asg.id_asignatura = a.id_asignatura
//       GROUP BY c.id_curso
//     `).all() as { id_curso: number, nombre_curso: string, asignaturas_ids: string, asignaturas_nombres: string }[];

//     const formatted = cursos.sort((a, b) => a.id_curso - b.id_curso).map(curso => ({
//       id_curso: curso.id_curso,
//       nombre_curso: curso.nombre_curso,
//       asignaturas: curso.asignaturas_ids
//         ? curso.asignaturas_ids.split(',').map((id: string, index: number) => ({
//             id_asignatura: id,
//             nombre_asignatura: curso.asignaturas_nombres.split(',')[index]
//           }))
//           .sort((a, b) => a.nombre_asignatura.localeCompare(b.nombre_asignatura))
//         : []
//     }));

//     return NextResponse.json(formatted);
//   } catch (error) {
//     console.error('Error al obtener cursos:', error);
//     return NextResponse.json({ success: false, error: 'Error en el servidor' }, { status: 500 });
//   }
// }

import { NextResponse } from "next/server";
import { Connection, Request } from "tedious";
import config from "@/app/api/dbConfig";

export async function GET() {
  try {
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

        const cursos: any[] = [];
        const query = `
          SELECT 
            c.id_curso, 
            c.nombre_curso,
            a.id_asignatura,
            a.nombre_asignatura
          FROM Curso c
          LEFT JOIN Asignaturas asg ON c.id_curso = asg.id_curso
          LEFT JOIN Asignatura a ON asg.id_asignatura = a.id_asignatura
          ORDER BY c.id_curso, a.nombre_asignatura
        `;

        const request = new Request(query, (err) => {
          if (err) {
            console.error("Error al ejecutar la consulta:", err.message);
            reject(
              NextResponse.json(
                { success: false, error: "Error en el servidor" },
                { status: 500 }
              )
            );
          } else {
            // Agrupar asignaturas por curso
            const cursosMap = new Map();

            cursos.forEach((row) => {
              if (!cursosMap.has(row.id_curso)) {
                cursosMap.set(row.id_curso, {
                  id_curso: row.id_curso,
                  nombre_curso: row.nombre_curso,
                  asignaturas: [],
                });
              }

              if (row.id_asignatura) {
                const curso = cursosMap.get(row.id_curso);
                curso.asignaturas.push({
                  id_asignatura: row.id_asignatura,
                  nombre_asignatura: row.nombre_asignatura,
                });
              }
            });

            // Convertir el mapa a un array y ordenar los cursos por id
            const formatted = Array.from(cursosMap.values()).sort(
              (a, b) => a.id_curso - b.id_curso
            );

            resolve(NextResponse.json(formatted));
          }
          connection.close();
        });

        request.on("row", (columns: any[]) => {
          const row: { [key: string]: any } = {};
          columns.forEach((column) => {
            row[column.metadata.colName] = column.value;
          });
          cursos.push(row);
        });

        connection.execSql(request);
      });

      connection.connect();
    });
  } catch (error) {
    console.error("Error al obtener cursos:", error);
    return NextResponse.json(
      { success: false, error: "Error en el servidor" },
      { status: 500 }
    );
  }
}
