// import { NextResponse } from "next/server";
// import db from "@/db";

// interface Archivo {
//   extension: string;
//   archivo: Buffer;
//   titulo: string;
// }

// function getMimeType(extension: string): string {
//   const mimeTypes: { [key: string]: string } = {
//     pdf: "application/pdf",
//     doc: "application/msword",
//     docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//     xls: "application/vnd.ms-excel",
//     xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//     png: "image/png",
//     jpg: "image/jpeg",
//     jpeg: "image/jpeg",
//     gif: "image/gif",
//     txt: "text/plain",
//   };
//   return mimeTypes[extension.toLowerCase()] || "application/octet-stream";
// }

// export async function GET(request: Request) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const archivoId = searchParams.get("id");
//     const tipo = searchParams.get("tipo") || "tarea"; // "tarea" o "entrega"
//     // const id_tarea = searchParams.get("tareaId");
//     // const asignaturaId = searchParams.get("asignaturaId");
//     // const cursoId = searchParams.get("cursoId");

//     if (!archivoId) {
//       return NextResponse.json(
//         { success: false, error: "Falta el ID del archivo" },
//         { status: 400 }
//       );
//     }

//     const query = db.prepare(`
//       SELECT archivo, extension, titulo
//       FROM ${tipo === "tarea" ? "Tarea_archivo" : "EntregaTarea_Archivo"}
//       WHERE id_archivo = ?
//     `);
//     // const archivo = query.get(archivoId, id_tarea, cursoId, asignaturaId);
//     const archivo = query.get(archivoId) as Archivo | null;

//     if (!archivo) {
//       return NextResponse.json(
//         { success: false, error: "Archivo no encontrado" },
//         { status: 404 }
//       );
//     }

//     return new NextResponse(archivo.archivo, {
//       headers: {
//         "Content-Type": getMimeType(archivo.extension),
//         "Content-Disposition": `inline; filename="${archivo.titulo}.${archivo.extension}"`,
//       },
//     });
//   } catch (error) {
//     console.error("Error downloading file:", error);
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
  extension: string;
  archivo: Buffer;
  titulo: string;
}

function getMimeType(extension: string): string {
  const mimeTypes: { [key: string]: string } = {
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    txt: "text/plain",
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

export async function GET(request: NextRequest) {
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
        const { searchParams } = new URL(request.url);
        const archivoId = searchParams.get("id");
        const tipo = searchParams.get("tipo") || "tarea"; // "tarea" o "entrega"

        if (!archivoId) {
          connection.close();
          return resolve(
            NextResponse.json(
              { success: false, error: "Falta el ID del archivo" },
              { status: 400 }
            )
          );
        }

        const tableName =
          tipo === "tarea" ? "Tarea_archivo" : "EntregaTarea_Archivo";

        const query = `
          SELECT archivo, extension, titulo
          FROM ${tableName}
          WHERE id_archivo = @archivoId
        `;

        const results = await executeSQL(connection, query, [
          { name: "archivoId", type: TYPES.NVarChar, value: archivoId },
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

        const archivo = results[0];

        if (!archivo.archivo) {
          connection.close();
          return resolve(
            NextResponse.json(
              { success: false, error: "Contenido del archivo no encontrado" },
              { status: 404 }
            )
          );
        }

        connection.close();
        return resolve(
          new Response(archivo.archivo, {
            headers: {
              "Content-Type": getMimeType(archivo.extension),
              "Content-Disposition": `inline; filename="${archivo.titulo}.${archivo.extension}"`,
            },
          })
        );
      } catch (error) {
        console.error("Error downloading file:", error);
        connection.close();
        resolve(
          NextResponse.json(
            { success: false, error: "Error al descargar el archivo" },
            { status: 500 }
          )
        );
      }
    });

    connection.connect();
  });
}
