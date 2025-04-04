// import { NextResponse } from "next/server";
// import db from "@/db";
// import { v4 as uuidv4 } from "uuid";

// interface TareaArchivo {
//   id_archivo: string;
//   titulo: string;
//   extension: string;
// }

// interface TareaDB {
//   id_tarea: string;
//   id_asignatura: string;
//   id_curso: string;
//   titulo: string;
//   descripcion: string;
//   fecha: string;
//   archivos: string;
// }

// interface TareaResponse {
//   id_tarea: string;
//   id_asignatura: string;
//   titulo: string;
//   descripcion: string;
//   fecha: string;
//   archivos: TareaArchivo[];
// }

// export async function GET(request: Request) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const asignaturaId = searchParams.get("asignaturaId");
//     const cursoId = searchParams.get("cursoId");

//     if (!asignaturaId) {
//       return NextResponse.json(
//         { success: false, error: "Falta el ID de la asignatura" },
//         { status: 400 }
//       );
//     }

//     const query = db.prepare(`
//       SELECT
//         t.*,
//         json_group_array(
//           DISTINCT json_object(
//             'id_archivo', ta.id_archivo,
//             'titulo', ta.titulo,
//             'extension', ta.extension
//           )
//         ) as archivos
//       FROM Tareas t
//       LEFT JOIN Tarea_archivo ta ON t.id_tarea = ta.id_tarea
//       WHERE t.id_asignatura = ? AND t.id_curso = ?
//       GROUP BY t.id_tarea, t.id_asignatura
//       ORDER BY t.fecha DESC
//     `);

//     const tareas = query.all(asignaturaId, cursoId) as TareaDB[];
//     const processedTareas = tareas.map((tarea): TareaResponse => {
//       const parsedArchivos = JSON.parse(tarea.archivos || "[]").filter(Boolean) as TareaArchivo[];
//       return {
//         id_tarea: tarea.id_tarea,
//         id_asignatura: tarea.id_asignatura,
//         titulo: tarea.titulo,
//         descripcion: tarea.descripcion,
//         fecha: tarea.fecha,
//         archivos: parsedArchivos,
//       };
//     });
//     // const processedTareas = tareas.map((tarea) => {
//     //   const parsedArchivos = JSON.parse(tarea.archivos || "[]").filter(Boolean);
//     //   return {
//     //     id_tarea: tarea.id_tarea,
//     //     id_asignatura: tarea.id_asignatura,
//     //     titulo: tarea.titulo,
//     //     descripcion: tarea.descripcion,
//     //     fecha: tarea.fecha,
//     //     archivos: parsedArchivos,
//     //   };
//     // });

//     return NextResponse.json({ success: true, tareas: processedTareas });
//   } catch (error) {
//     console.error("Error fetching tasks:", error);
//     return NextResponse.json(
//       { success: false, error: "Error al obtener las tareas" },
//       { status: 500 }
//     );
//   }
// }

// export async function POST(request: Request) {
//   try {
//     const formData = await request.formData();
//     const titulo = formData.get("titulo") as string;
//     const descripcion = formData.get("descripcion") as string;
//     const id_asignatura = formData.get("id_asignatura") as string;
//     const cursoId = formData.get("cursoId") as string;
//     const fecha = new Date().toISOString().split("T")[0];
//     const archivos = formData.getAll("archivos");

//     if (!titulo || !descripcion || !id_asignatura) {
//       return NextResponse.json(
//         { success: false, error: "Faltan campos requeridos" },
//         { status: 400 }
//       );
//     }

//     const id_tarea = uuidv4();

//     db.exec("BEGIN TRANSACTION");

//     try {
//       const insertTarea = db.prepare(`
//         INSERT INTO Tareas (id_tarea, id_curso, id_asignatura, titulo, descripcion, fecha)
//         VALUES (?, ?, ?, ?, ?, ?)
//       `);
//       insertTarea.run(
//         id_tarea,
//         cursoId,
//         id_asignatura,
//         titulo,
//         descripcion,
//         fecha
//       );

//       // Procesa archivos
//       for (const file of archivos) {
//         if (file instanceof File) {
//           const arrayBuffer = await file.arrayBuffer();
//           const buffer = Buffer.from(arrayBuffer);
//           const fileName = file.name.split(".")[0];
//           const extension = file.name.split(".").pop() || "";
//           const id_archivo = uuidv4();

//           const insertArchivo = db.prepare(`
//             INSERT INTO Tarea_archivo (id_archivo, id_tarea, id_curso, id_asignatura, titulo, archivo, extension)
//             VALUES (?, ?, ?, ?, ?, ?, ?)
//           `);
//           insertArchivo.run(
//             id_archivo,
//             id_tarea,
//             cursoId,
//             id_asignatura,
//             fileName,
//             buffer,
//             extension
//           );
//         }
//       }

//       db.exec("COMMIT");
//       return NextResponse.json({ success: true });
//     } catch (error) {
//       db.exec("ROLLBACK");
//       throw error;
//     }
//   } catch (error) {
//     console.error("Error creating task:", error);
//     return NextResponse.json(
//       { success: false, error: "Error al crear la tarea" },
//       { status: 500 }
//     );
//   }
// }

// export async function DELETE(request: Request) {
//   try {
//     const { id_tarea, id_asignatura, cursoId } = await request.json();

//     if (!id_tarea || !id_asignatura) {
//       return NextResponse.json(
//         { success: false, error: "Faltan campos requeridos" },
//         { status: 400 }
//       );
//     }

//     db.exec("BEGIN TRANSACTION");

//     try {
//       const deleteArchivos = db.prepare(`
//         DELETE FROM Tarea_archivo
//         WHERE id_tarea = ? AND id_asignatura = ? AND id_curso = ?
//       `);
//       deleteArchivos.run(id_tarea, id_asignatura, cursoId);

//       const deleteTarea = db.prepare(`
//         DELETE FROM Tareas
//         WHERE id_tarea = ? AND id_asignatura = ? AND id_curso = ?
//       `);
//       deleteTarea.run(id_tarea, id_asignatura, cursoId);

//       db.exec("COMMIT");
//       return NextResponse.json({ success: true });
//     } catch (error) {
//       db.exec("ROLLBACK");
//       throw error;
//     }
//   } catch (error) {
//     console.error("Error deleting task:", error);
//     return NextResponse.json(
//       { success: false, error: "Error al eliminar la tarea" },
//       { status: 500 }
//     );
//   }
// }

// export async function PATCH(request: Request) {
//   try {
//     const { id_entrega, estado } = await request.json();

//     if (!id_entrega || !estado) {
//       return NextResponse.json(
//         { success: false, error: "Faltan campos requeridos" },
//         { status: 400 }
//       );
//     }

//     const updateEstado = db.prepare(`
//       UPDATE EntregaTarea
//       SET estado = ?
//       WHERE id_entrega = ?
//     `);
//     updateEstado.run(estado, id_entrega);

//     return NextResponse.json({ success: true });
//   } catch (error) {
//     console.error("Error updating task status:", error);
//     return NextResponse.json(
//       { success: false, error: "Error al actualizar el estado de la tarea" },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse, NextRequest } from "next/server";
import { Connection, Request, TYPES } from "tedious";
import config from "@/app/api/dbConfig";
import { randomUUID } from "crypto";

interface TareaArchivo {
  id_archivo: string;
  titulo: string;
  extension: string;
}

interface TareaResponse {
  id_tarea: string;
  id_asignatura: string;
  id_curso: string;
  titulo: string;
  descripcion: string;
  fecha: string;
  archivos: TareaArchivo[];
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
        return reject(
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

        if (!asignaturaId) {
          connection.close();
          return resolve(
            NextResponse.json(
              { success: false, error: "Falta el ID de la asignatura" },
              { status: 400 }
            )
          );
        }

        if (!cursoId) {
          connection.close();
          return resolve(
            NextResponse.json(
              { success: false, error: "Falta el ID del curso" },
              { status: 400 }
            )
          );
        }

        // First get all tasks
        const query = `
          SELECT 
            id_tarea, id_asignatura, id_curso, titulo, descripcion, fecha
          FROM Tareas
          WHERE id_asignatura = @asignaturaId AND id_curso = @cursoId
          ORDER BY fecha DESC
        `;

        const tareas = await executeSQL(connection, query, [
          { name: "asignaturaId", type: TYPES.NVarChar, value: asignaturaId },
          { name: "cursoId", type: TYPES.NVarChar, value: cursoId },
        ]);

        // For each task, get its files
        const processedTareas: TareaResponse[] = [];

        for (const tarea of tareas) {
          const filesQuery = `
            SELECT id_archivo, titulo, extension
            FROM Tarea_archivo
            WHERE id_tarea = @id_tarea AND id_asignatura = @asignaturaId AND id_curso = @cursoId
          `;

          const files = await executeSQL(connection, filesQuery, [
            { name: "id_tarea", type: TYPES.NVarChar, value: tarea.id_tarea },
            { name: "asignaturaId", type: TYPES.NVarChar, value: asignaturaId },
            { name: "cursoId", type: TYPES.NVarChar, value: cursoId },
          ]);

          processedTareas.push({
            ...tarea,
            archivos: files as TareaArchivo[],
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
        return reject(
          NextResponse.json(
            { success: false, error: "Error al conectar a la base de datos" },
            { status: 500 }
          )
        );
      }

      try {
        const formData = await request.formData();
        const titulo = formData.get("titulo") as string;
        const descripcion = formData.get("descripcion") as string;
        const id_asignatura = formData.get("id_asignatura") as string;
        const cursoId = formData.get("cursoId") as string;
        const fecha = new Date().toISOString().split("T")[0];
        const archivos = formData.getAll("archivos");

        if (!titulo || !descripcion || !id_asignatura || !cursoId) {
          connection.close();
          return resolve(
            NextResponse.json(
              { success: false, error: "Faltan campos requeridos" },
              { status: 400 }
            )
          );
        }

        const id_tarea = randomUUID();

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
          // Insert task
          await executeSQLStatement(
            connection,
            `INSERT INTO Tareas (id_tarea, id_curso, id_asignatura, titulo, descripcion, fecha)
             VALUES (@id_tarea, @cursoId, @id_asignatura, @titulo, @descripcion, @fecha)`,
            [
              { name: "id_tarea", type: TYPES.NVarChar, value: id_tarea },
              { name: "cursoId", type: TYPES.NVarChar, value: cursoId },
              {
                name: "id_asignatura",
                type: TYPES.NVarChar,
                value: id_asignatura,
              },
              { name: "titulo", type: TYPES.NVarChar, value: titulo },
              { name: "descripcion", type: TYPES.NVarChar, value: descripcion },
              { name: "fecha", type: TYPES.NVarChar, value: fecha },
            ]
          );

          // Process files
          for (const file of archivos) {
            if (file instanceof File) {
              const arrayBuffer = await file.arrayBuffer();
              const buffer = Buffer.from(arrayBuffer);
              const fileName = file.name.split(".")[0];
              const extension = file.name.split(".").pop() || "";
              const id_archivo = randomUUID();

              await executeSQLStatement(
                connection,
                `INSERT INTO Tarea_archivo (id_archivo, id_tarea, id_curso, id_asignatura, titulo, archivo, extension)
                 VALUES (@id_archivo, @id_tarea, @cursoId, @id_asignatura, @titulo, @archivo, @extension)`,
                [
                  {
                    name: "id_archivo",
                    type: TYPES.NVarChar,
                    value: id_archivo,
                  },
                  { name: "id_tarea", type: TYPES.NVarChar, value: id_tarea },
                  { name: "cursoId", type: TYPES.NVarChar, value: cursoId },
                  {
                    name: "id_asignatura",
                    type: TYPES.NVarChar,
                    value: id_asignatura,
                  },
                  { name: "titulo", type: TYPES.NVarChar, value: fileName },
                  { name: "archivo", type: TYPES.VarBinary, value: buffer },
                  { name: "extension", type: TYPES.NVarChar, value: extension },
                ]
              );
            }
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
        console.error("Error creating task:", error);
        connection.close();
        return resolve(
          NextResponse.json(
            { success: false, error: "Error al crear la tarea" },
            { status: 500 }
          )
        );
      }
    });

    connection.connect();
  });
}

export async function DELETE(request: NextRequest) {
  const connection = new Connection(config);

  return new Promise<NextResponse>((resolve, reject) => {
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
        const { id_tarea, id_asignatura, cursoId } = await request.json();

        if (!id_tarea || !id_asignatura || !cursoId) {
          connection.close();
          return resolve(
            NextResponse.json(
              { success: false, error: "Faltan campos requeridos" },
              { status: 400 }
            )
          );
        }

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
          // Delete files first (due to foreign key constraints)
          await executeSQLStatement(
            connection,
            `DELETE FROM Tarea_archivo
             WHERE id_tarea = @id_tarea AND id_asignatura = @id_asignatura AND id_curso = @cursoId`,
            [
              { name: "id_tarea", type: TYPES.NVarChar, value: id_tarea },
              {
                name: "id_asignatura",
                type: TYPES.NVarChar,
                value: id_asignatura,
              },
              { name: "cursoId", type: TYPES.NVarChar, value: cursoId },
            ]
          );

          // Delete task
          await executeSQLStatement(
            connection,
            `DELETE FROM Tareas
             WHERE id_tarea = @id_tarea AND id_asignatura = @id_asignatura AND id_curso = @cursoId`,
            [
              { name: "id_tarea", type: TYPES.NVarChar, value: id_tarea },
              {
                name: "id_asignatura",
                type: TYPES.NVarChar,
                value: id_asignatura,
              },
              { name: "cursoId", type: TYPES.NVarChar, value: cursoId },
            ]
          );

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
        console.error("Error deleting task:", error);
        connection.close();
        return resolve(
          NextResponse.json(
            { success: false, error: "Error al eliminar la tarea" },
            { status: 500 }
          )
        );
      }
    });

    connection.connect();
  });
}

export async function PATCH(request: NextRequest) {
  const connection = new Connection(config);

  return new Promise<NextResponse>((resolve, reject) => {
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
        const { id_entrega, estado } = await request.json();

        if (!id_entrega || !estado) {
          connection.close();
          return resolve(
            NextResponse.json(
              { success: false, error: "Faltan campos requeridos" },
              { status: 400 }
            )
          );
        }

        await executeSQLStatement(
          connection,
          `UPDATE EntregaTarea
           SET estado = @estado
           WHERE id_entrega = @id_entrega`,
          [
            { name: "estado", type: TYPES.NVarChar, value: estado },
            { name: "id_entrega", type: TYPES.NVarChar, value: id_entrega },
          ]
        );

        connection.close();
        return resolve(NextResponse.json({ success: true }));
      } catch (error) {
        console.error("Error updating task status:", error);
        connection.close();
        return resolve(
          NextResponse.json(
            {
              success: false,
              error: "Error al actualizar el estado de la tarea",
            },
            { status: 500 }
          )
        );
      }
    });

    connection.connect();
  });
}
