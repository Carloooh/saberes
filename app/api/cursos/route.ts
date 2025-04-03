// import { NextResponse } from 'next/server';
// import db from '@/db';

// export async function GET() {
//   try {
//     const cursos = db.prepare('SELECT * FROM Curso').all();
//     return NextResponse.json(cursos);
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
        const request = new Request("SELECT * FROM Curso", (err, _rowCount) => {
          if (err) {
            console.error("Error al ejecutar la consulta:", err.message);
            reject(
              NextResponse.json(
                { success: false, error: "Error en el servidor" },
                { status: 500 }
              )
            );
          } else {
            resolve(
              NextResponse.json(
                { success: true, data: cursos },
                { status: 200 }
              )
            );
          }
          connection.close();
        });

        request.on("row", (columns: any[]) => {
          const curso: { [key: string]: any } = {};
          columns.forEach((column) => {
            curso[column.metadata.colName] = column.value;
          });
          cursos.push(curso);
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
