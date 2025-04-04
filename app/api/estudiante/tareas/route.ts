import { NextRequest, NextResponse } from "next/server";
import { Connection, Request, TYPES } from "tedious";
import config from "@/app/api/dbConfig";
import { randomUUID } from "crypto";
import { cookies } from "next/headers";

interface TareaArchivo {
  id_archivo: string;
  titulo: string;
  extension: string;
}

interface TareaProcessed {
  id_tarea: string;
  id_curso: string;
  id_asignatura: string;
  titulo: string;
  descripcion: string;
  fecha: string;
  archivos: TareaArchivo[];
  entrega: {
    id_entrega: string;
    fecha_entrega: string;
    estado: string;
    comentario: string | null;
    archivos: TareaArchivo[];
  } | null;
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

// Helper function to execute SQL statements without returning results
async function executeSQLStatement(
  connection: Connection,
  sql: string,
  parameters: { name: string; type: any; value: any }[] = []
): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = new Request(sql, (err) => {
      if (err) {
        return reject(err);
      }
      resolve();
    });

    parameters.forEach((param) => {
      request.addParameter(param.name, param.type, param.value);
    });

    connection.execSql(request);
  });
}

export async function GET(request: NextRequest) {
  const connection = new Connection(config);

  return new Promise<NextResponse>((resolve, reject) => {
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
        const { searchParams } = new URL(request.url);
        const asignaturaId = searchParams.get("asignaturaId");
        const cursoId = searchParams.get("cursoId");

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

        if (!asignaturaId) {
          connection.close();
          return resolve(
            NextResponse.json(
              { success: false, error: "Falta el ID de la asignatura" },
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

        // Get all tasks for the subject and course
        const tasksQuery = `
          SELECT 
            t.id_tarea, t.id_curso, t.id_asignatura, t.titulo, t.descripcion, t.fecha
          FROM Tareas t
          WHERE t.id_asignatura = @asignaturaId AND t.id_curso = @cursoId
          ORDER BY t.fecha DESC
        `;

        const tasks = await executeSQL(connection, tasksQuery, [
          { name: "asignaturaId", type: TYPES.NVarChar, value: asignaturaId },
          { name: "cursoId", type: TYPES.NVarChar, value: cursoId },
        ]);

        // Process each task to get its files and submission info
        const processedTareas: TareaProcessed[] = [];

        for (const task of tasks) {
          // Get task files
          const filesQuery = `
            SELECT id_archivo, titulo, extension
            FROM Tarea_archivo
            WHERE id_tarea = @tareaId
          `;

          const files = await executeSQL(connection, filesQuery, [
            { name: "tareaId", type: TYPES.NVarChar, value: task.id_tarea },
          ]);

          // Get submission info if exists
          const submissionQuery = `
            SELECT id_entrega, fecha_entrega, estado, comentario
            FROM EntregaTarea
            WHERE id_tarea = @tareaId AND id_user = @userId
          `;

          const submissions = await executeSQL(connection, submissionQuery, [
            { name: "tareaId", type: TYPES.NVarChar, value: task.id_tarea },
            { name: "userId", type: TYPES.NVarChar, value: userId },
          ]);

          let entrega = null;

          if (submissions.length > 0) {
            const submission = submissions[0];

            // Get submission files
            const submissionFilesQuery = `
              SELECT id_archivo, titulo, extension
              FROM EntregaTarea_Archivo
              WHERE id_entrega = @entregaId
            `;

            const submissionFiles = await executeSQL(
              connection,
              submissionFilesQuery,
              [
                {
                  name: "entregaId",
                  type: TYPES.NVarChar,
                  value: submission.id_entrega,
                },
              ]
            );

            entrega = {
              id_entrega: submission.id_entrega,
              fecha_entrega: submission.fecha_entrega,
              estado: submission.estado,
              comentario: submission.comentario,
              archivos: submissionFiles,
            };
          }

          processedTareas.push({
            id_tarea: task.id_tarea,
            id_curso: task.id_curso,
            id_asignatura: task.id_asignatura,
            titulo: task.titulo,
            descripcion: task.descripcion,
            fecha: task.fecha,
            archivos: files,
            entrega,
          });
        }

        connection.close();
        return resolve(
          NextResponse.json({ success: true, tareas: processedTareas })
        );
      } catch (error) {
        console.error("Error fetching tasks:", error);
        connection.close();
        return resolve(
          NextResponse.json(
            { success: false, error: "Error al obtener las tareas" },
            { status: 500 }
          )
        );
      }
    });

    connection.connect();
  });
}

export async function POST(request: NextRequest) {
  const connection = new Connection(config);

  return new Promise<NextResponse>((resolve, reject) => {
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
        const formData = await request.formData();
        const tareaId = formData.get("tareaId") as string;
        const asignaturaId = formData.get("asignaturaId") as string;
        const cursoId = formData.get("cursoId") as string;
        const comentario = formData.get("comentario") as string;

        // Get user session
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

        if (!tareaId || !asignaturaId) {
          connection.close();
          return resolve(
            NextResponse.json(
              { success: false, error: "Faltan campos requeridos" },
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
        const id_entrega = randomUUID();
        const fecha_entrega = new Date().toISOString().split("T")[0];

        // Begin transaction
        await new Promise<void>((resolveTransaction, rejectTransaction) => {
          connection.beginTransaction((err) => {
            if (err) {
              console.error("Error starting transaction:", err.message);
              return rejectTransaction(err);
            }
            resolveTransaction();
          });
        });

        try {
          // Create task submission
          await executeSQLStatement(
            connection,
            `INSERT INTO EntregaTarea (
              id_entrega, id_tarea, id_curso, id_asignatura, id_user, 
              fecha_entrega, estado, comentario
            )
            VALUES (@id_entrega, @tareaId, @cursoId, @asignaturaId, @userId, 
              @fecha_entrega, 'entregada', @comentario)`,
            [
              { name: "id_entrega", type: TYPES.NVarChar, value: id_entrega },
              { name: "tareaId", type: TYPES.NVarChar, value: tareaId },
              { name: "cursoId", type: TYPES.NVarChar, value: cursoId },
              {
                name: "asignaturaId",
                type: TYPES.NVarChar,
                value: asignaturaId,
              },
              { name: "userId", type: TYPES.NVarChar, value: userId },
              {
                name: "fecha_entrega",
                type: TYPES.NVarChar,
                value: fecha_entrega,
              },
              {
                name: "comentario",
                type: TYPES.NVarChar,
                value: comentario || null,
              },
            ]
          );

          // Process files
          const files = formData.getAll("archivos") as File[];

          for (const file of files) {
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const extension = file.name.split(".").pop() || "";
            const id_archivo = randomUUID();

            await executeSQLStatement(
              connection,
              `INSERT INTO EntregaTarea_Archivo (
                id_archivo, id_entrega, titulo, 
                archivo, extension
              )
              VALUES (@id_archivo, @id_entrega, @titulo, @archivo, @extension)`,
              [
                { name: "id_archivo", type: TYPES.NVarChar, value: id_archivo },
                { name: "id_entrega", type: TYPES.NVarChar, value: id_entrega },
                {
                  name: "titulo",
                  type: TYPES.NVarChar,
                  value: file.name.split(".")[0],
                },
                { name: "archivo", type: TYPES.VarBinary, value: buffer },
                { name: "extension", type: TYPES.NVarChar, value: extension },
              ]
            );
          }

          // Commit transaction
          await new Promise<void>((resolveCommit, rejectCommit) => {
            connection.commitTransaction((err) => {
              if (err) {
                console.error("Error committing transaction:", err.message);
                return rejectCommit(err);
              }
              resolveCommit();
            });
          });

          connection.close();
          return resolve(NextResponse.json({ success: true }));
        } catch (error) {
          // Rollback transaction
          await new Promise<void>((resolveRollback) => {
            connection.rollbackTransaction(() => {
              resolveRollback();
            });
          });
          throw error;
        }
      } catch (error) {
        console.error("Error submitting task:", error);
        connection.close();
        return resolve(
          NextResponse.json(
            { success: false, error: "Error al entregar la tarea" },
            { status: 500 }
          )
        );
      }
    });

    connection.connect();
  });
}
