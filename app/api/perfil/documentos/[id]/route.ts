import { NextResponse, NextRequest } from "next/server";
import { Connection, Request, TYPES } from "tedious";
import config from "@/app/api/dbConfig";

interface Archivo {
  documento: Buffer;
  extension: string;
  titulo: string;
  tipo: string;
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
  context: { params: Promise<{ id: string }> }
) {
  const connection = new Connection(config);

  return new Promise<NextResponse | Response>((resolve, reject) => {
    connection.on("connect", async (err) => {
      if (err) {
        console.error("Error connecting to database:", err.message);
        connection.close();
        return resolve(
          NextResponse.json(
            { error: "Error al conectar a la base de datos" },
            { status: 500 }
          )
        );
      }

      try {
        const { id } = await context.params;
        if (!id) {
          connection.close();
          return resolve(
            NextResponse.json({ error: "ID no proporcionado" }, { status: 400 })
          );
        }

        const query = `
          SELECT documento, titulo, extension, tipo
          FROM Matricula_archivo
          WHERE id_documento = @documentoId
        `;

        const results = await executeSQL(connection, query, [
          { name: "documentoId", type: TYPES.NVarChar, value: id },
        ]);

        if (results.length === 0) {
          connection.close();
          return resolve(
            NextResponse.json(
              { error: "Documento no encontrado" },
              { status: 404 }
            )
          );
        }

        const documento = results[0];
        const fileName = `${documento.titulo}.${documento.extension}`;
        const headers = new Headers();
        headers.set(
          "Content-Disposition",
          `attachment; filename="${fileName}"`
        );
        headers.set("Content-Type", `application/${documento.extension}`);

        const buffer = Buffer.from(documento.documento);

        connection.close();
        return resolve(
          new Response(buffer, {
            status: 200,
            headers,
          })
        );
      } catch (error) {
        console.error("Error al obtener el documento:", error);
        connection.close();
        return resolve(
          NextResponse.json(
            { error: "Error al obtener el documento" },
            { status: 500 }
          )
        );
      }
    });

    connection.connect();
  });
}
