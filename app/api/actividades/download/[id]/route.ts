// import { NextResponse } from "next/server";
// import db from "@/db";

// interface Archivo {
//   archivo: Buffer;
//   extension: string;
//   titulo: string;
// }

// function getMimeType(extension: string): string {
//   const mimeTypes: { [key: string]: string } = {
//     jpg: "image/jpeg",
//     jpeg: "image/jpeg",
//     png: "image/png",
//     gif: "image/gif",
//     mp4: "video/mp4",
//     webm: "video/webm",
//   };
//   return mimeTypes[extension.toLowerCase()] || "application/octet-stream";
// }

// export async function GET(
//   request: Request,
//   context: { params: Promise<{ id: string }> }
// ) {
//   try {
//     // Ahora context.params es awaitable:
//     const { id } = await context.params;
//     if (!id) {
//       return NextResponse.json(
//         { success: false, error: "ID no proporcionado" },
//         { status: 400 }
//       );
//     }

//     const query = db.prepare(`
//       SELECT archivo, extension, titulo
//       FROM Actividad_archivo
//       WHERE id_archivo = ?
//     `);

//     const archivo = query.get(id) as Archivo | null;

//     if (!archivo || !archivo.archivo) {
//       return NextResponse.json(
//         { success: false, error: "Archivo no encontrado" },
//         { status: 404 }
//       );
//     }

//     const contentType = getMimeType(archivo.extension);

//     return new NextResponse(archivo.archivo, {
//       headers: {
//         "Content-Type": contentType,
//         "Content-Disposition": `inline; filename="${archivo.titulo}.${archivo.extension}"`,
//       },
//     });
//   } catch (error) {
//     console.error("Error in download endpoint:", error);
//     return NextResponse.json(
//       { success: false, error: "Error al descargar el archivo" },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse, NextRequest } from "next/server";
import { Connection, Request, TYPES } from "tedious";
import config from "@/app/api/dbConfig";

interface Archivo {
  archivo: Buffer;
  extension: string;
  titulo: string;
}

function getMimeType(extension: string): string {
  const mimeTypes: { [key: string]: string } = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    mp4: "video/mp4",
    webm: "video/webm",
  };
  return mimeTypes[extension.toLowerCase()] || "application/octet-stream";
}

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

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
): Promise<NextResponse> {
  const connection = new Connection(config);
  const { id } = context.params;

  return new Promise<NextResponse>((resolve) => {
    connection.on("connect", async (err) => {
      if (err) {
        console.error("Error connecting to database:", err.message);
        connection.close();
        return resolve(
          NextResponse.json(
            { success: false, error: "Error al conectar a la base de datos" },
            { status: 500 }
          )
        );
      }

      try {
        if (!id) {
          connection.close();
          return resolve(
            NextResponse.json(
              { success: false, error: "ID no proporcionado" },
              { status: 400 }
            )
          );
        }

        const query = `
          SELECT archivo, extension, titulo
          FROM Actividad_archivo
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

        const archivo = results[0] as Archivo;

        if (!archivo.archivo) {
          connection.close();
          return resolve(
            NextResponse.json(
              { success: false, error: "Contenido del archivo no encontrado" },
              { status: 404 }
            )
          );
        }

        const mimeType = getMimeType(archivo.extension);

        connection.close();
        return resolve(
          new NextResponse(archivo.archivo, {
            headers: {
              "Content-Type": mimeType,
              "Content-Disposition": `inline; filename="${archivo.titulo}.${archivo.extension}"`,
            },
          })
        );
      } catch (error) {
        console.error("Error fetching file:", error);
        connection.close();
        resolve(
          NextResponse.json(
            { success: false, error: "Error al obtener el archivo" },
            { status: 500 }
          )
        );
      }
    });

    connection.connect();
  });
}
