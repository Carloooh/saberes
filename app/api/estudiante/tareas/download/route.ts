import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";
import { Connection, Request, TYPES } from "tedious";
import config from "@/app/api/dbConfig";

interface Archivo {
  extension: string;
  titulo: string;
  archivo: Buffer;
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
        return resolve(
          NextResponse.json(
            { success: false, error: "Error al conectar a la base de datos" },
            { status: 500 }
          )
        );
      }

      try {
        // Get user session from cookies
        const cookieStore = await cookies();
        const userSessionCookie = cookieStore.get("userSession")?.value;
        if (!userSessionCookie) {
          connection.close();
          return resolve(
            NextResponse.json(
              { success: false, error: "No session found" },
              { status: 401 }
            )
          );
        }

        const userSession = JSON.parse(userSessionCookie);
        const rutEstudiante = userSession.rut_usuario;

        const { searchParams } = new URL(request.url);
        const archivoId = searchParams.get("id");
        const tareaId = searchParams.get("tareaId");
        const cursoId = searchParams.get("cursoId");
        const asignaturaId = searchParams.get("asignaturaId");
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

        // First get the user ID from the rut_usuario
        const getUserIdQuery = `
          SELECT id_user
          FROM Usuario
          WHERE rut_usuario = @rutUsuario
        `;

        const userResults = await executeSQL(connection, getUserIdQuery, [
          { name: "rutUsuario", type: TYPES.NVarChar, value: rutEstudiante },
        ]);

        if (userResults.length === 0) {
          connection.close();
          return resolve(
            NextResponse.json(
              { success: false, error: "Usuario no encontrado" },
              { status: 404 }
            )
          );
        }

        const userId = userResults[0].id_user;

        let archivo: Archivo | null = null;

        if (tipo === "tarea") {
          // For task files, verify the student has access to the task
          const query = `
            SELECT ta.archivo, ta.extension, ta.titulo
            FROM Tarea_archivo ta
            JOIN Tareas t ON ta.id_tarea = t.id_tarea
            JOIN CursosAsignaturasLink cal ON t.id_asignatura = cal.id_asignatura
            WHERE ta.id_archivo = @archivoId 
              AND t.id_tarea = @tareaId 
              AND t.id_curso = @cursoId 
              AND t.id_asignatura = @asignaturaId
              AND cal.id_user = @userId
          `;

          const results = await executeSQL(connection, query, [
            { name: "archivoId", type: TYPES.NVarChar, value: archivoId },
            { name: "tareaId", type: TYPES.NVarChar, value: tareaId },
            { name: "cursoId", type: TYPES.NVarChar, value: cursoId },
            { name: "asignaturaId", type: TYPES.NVarChar, value: asignaturaId },
            { name: "userId", type: TYPES.NVarChar, value: userId },
          ]);

          if (results.length > 0) {
            archivo = results[0] as Archivo;
          }
        } else {
          // For submission files, verify the student owns the submission
          const query = `
            SELECT eta.archivo, eta.extension, eta.titulo
            FROM EntregaTarea_Archivo eta
            JOIN EntregaTarea et ON eta.id_entrega = et.id_entrega
            WHERE eta.id_archivo = @archivoId 
              AND et.id_tarea = @tareaId 
              AND et.id_curso = @cursoId 
              AND et.id_asignatura = @asignaturaId
              AND et.id_user = @userId
          `;

          const results = await executeSQL(connection, query, [
            { name: "archivoId", type: TYPES.NVarChar, value: archivoId },
            { name: "tareaId", type: TYPES.NVarChar, value: tareaId },
            { name: "cursoId", type: TYPES.NVarChar, value: cursoId },
            { name: "asignaturaId", type: TYPES.NVarChar, value: asignaturaId },
            { name: "userId", type: TYPES.NVarChar, value: userId },
          ]);

          if (results.length > 0) {
            archivo = results[0] as Archivo;
          }
        }

        if (!archivo) {
          connection.close();
          return resolve(
            NextResponse.json(
              {
                success: false,
                error: "Archivo no encontrado o acceso no autorizado",
              },
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
        return resolve(
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
