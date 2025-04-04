// import { NextResponse } from 'next/server';
// import db from '@/db';

// export async function GET(req: Request) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const id = searchParams.get('id');

//     if (!id) {
//       return NextResponse.json({ success: false, error: 'ID de archivo no proporcionado' }, { status: 400 });
//     }

//     const stmt = db.prepare('SELECT archivo, extension FROM Galeria WHERE id_archivo = ?');
//     const file = stmt.get(id) as { archivo: Buffer, extension: string };

//     if (!file) {
//       return NextResponse.json({ success: false, error: 'Archivo no encontrado' }, { status: 404 });
//     }

//     return new Response(file.archivo, {
//       headers: {
//         'Content-Type': file.extension === 'mp4' ? 'video/mp4' : `image/${file.extension}`,
//         'Content-Disposition': `inline; filename="${id}.${file.extension}"`,
//       },
//     });
//   } catch (error) {
//     console.error('Error al descargar el archivo:', error);
//     return NextResponse.json({ success: false, error: 'Error en el servidor' }, { status: 500 });
//   }
// }

import { NextResponse, NextRequest } from "next/server";
import { Connection, Request, TYPES } from "tedious";
import config from "@/app/api/dbConfig";

// Helper function to execute SQL queries and return results
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
      const row: { [key: string]: any } = {};
      columns.forEach((column) => {
        row[column.metadata.colName] = column.value;
      });
      results.push(row);
    });

    connection.execSql(request);
  });
}

export async function GET(req: NextRequest) {
  const connection = new Connection(config);

  return new Promise<NextResponse | Response>((resolve, reject) => {
    connection.on("connect", async (err) => {
      if (err) {
        console.error("Error connecting to database:", err.message);
        connection.close();
        return reject(
          NextResponse.json(
            { success: false, error: "Error al conectar a la base de datos" },
            { status: 500 }
          )
        );
      }

      try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
          connection.close();
          return resolve(
            NextResponse.json(
              { success: false, error: "ID de archivo no proporcionado" },
              { status: 400 }
            )
          );
        }

        const query = `
          SELECT archivo, extension, titulo
          FROM Galeria
          WHERE id_archivo = @id
        `;

        const results = await executeSQL(connection, query, [
          { name: "id", type: TYPES.NVarChar, value: id },
        ]);

        if (results.length === 0) {
          connection.close();
          return resolve(
            NextResponse.json(
              { success: false, error: "Archivo no encontrado" },
              { status: 404 }
            )
          );
        }

        const file = results[0];

        if (!file.archivo) {
          connection.close();
          return resolve(
            NextResponse.json(
              { success: false, error: "Contenido del archivo no encontrado" },
              { status: 404 }
            )
          );
        }

        const contentType =
          file.extension === "mp4" ? "video/mp4" : `image/${file.extension}`;

        connection.close();
        return resolve(
          new Response(file.archivo, {
            headers: {
              "Content-Type": contentType,
              "Content-Disposition": `inline; filename="${file.titulo}.${file.extension}"`,
            },
          })
        );
      } catch (error) {
        console.error("Error al descargar el archivo:", error);
        connection.close();
        resolve(
          NextResponse.json(
            { success: false, error: "Error en el servidor" },
            { status: 500 }
          )
        );
      }
    });

    connection.connect();
  });
}
