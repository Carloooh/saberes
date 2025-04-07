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

        if (!archivoId) {
          connection.close();
          return resolve(
            NextResponse.json(
              { success: false, error: "Falta el ID del archivo" },
              { status: 400 }
            )
          );
        }

        const query = `
          SELECT archivo, extension, titulo
          FROM Material_archivo
          WHERE id_material_archivo = @archivoId
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

        const material = results[0];

        if (!material.archivo) {
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
          new Response(material.archivo, {
            headers: {
              "Content-Type": getMimeType(material.extension),
              "Content-Disposition": `inline; filename="${material.titulo}.${material.extension}"`,
            },
          })
        );
      } catch (error) {
        console.error("Error downloading file:", error);
        connection.close();
        resolve(
          NextResponse.json(
            { success: false, error: "Error downloading file" },
            { status: 500 }
          )
        );
      }
    });

    connection.connect();
  });
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
    mp3: "audio/mpeg",
    mp4: "video/mp4",
  };

  return mimeTypes[extension.toLowerCase()] || "application/octet-stream";
}
