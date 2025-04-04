// import { NextRequest, NextResponse } from "next/server";
// import { v4 as uuidv4 } from "uuid";
// import db from "@/db";

// export async function GET(request: NextRequest) {
//   const { searchParams } = new URL(request.url);
//   const destacado = searchParams.get("destacado");

//   try {
//     let query = db.prepare(`
//       SELECT n.*, GROUP_CONCAT(na.id_archivo) as archivo_ids,
//              GROUP_CONCAT(na.titulo) as archivo_titulos,
//              GROUP_CONCAT(na.extension) as archivo_extensions
//       FROM Noticia n
//       LEFT JOIN Noticia_Archivo na ON n.id_noticia = na.id_noticia
//       GROUP BY n.id_noticia
//       ORDER BY n.fecha DESC
//     `);
//     if (destacado) {
//       query = db.prepare(`
//         SELECT n.*, GROUP_CONCAT(na.id_archivo) as archivo_ids,
//                GROUP_CONCAT(na.titulo) as archivo_titulos,
//                GROUP_CONCAT(na.extension) as archivo_extensions
//         FROM Noticia n
//         LEFT JOIN Noticia_Archivo na ON n.id_noticia = na.id_noticia
//         WHERE n.destacado = '1'
//         GROUP BY n.id_noticia
//         ORDER BY n.fecha DESC
//       `);
//     }

//     // const noticias = query.all().map((noticia) => {
//       const noticias = query.all().map((noticia: any) => {

//       const archivo_ids = noticia.archivo_ids
//         ? noticia.archivo_ids.split(",")
//         : [];
//       const archivo_titulos = noticia.archivo_titulos
//         ? noticia.archivo_titulos.split(",")
//         : [];
//       const archivo_extensions = noticia.archivo_extensions
//         ? noticia.archivo_extensions.split(",")
//         : [];

//       const archivos = archivo_ids.map((id: string, index: number) => ({
//         id_archivo: id,
//         titulo: archivo_titulos[index],
//         extension: archivo_extensions[index],
//       }));

//       delete noticia.archivo_ids;
//       delete noticia.archivo_titulos;
//       delete noticia.archivo_extensions;

//       return {
//         ...noticia,
//         archivos,
//       };
//     });

//     return NextResponse.json({ success: true, noticias });
//   } catch (error) {
//     console.error("Error fetching noticias:", error);
//     return NextResponse.json(
//       { success: false, error: "Error al obtener las noticias" },
//       { status: 500 }
//     );
//   }
// }

// export async function POST(request: Request) {
//   try {
//     const formData = await request.formData();
//     const titulo = formData.get("titulo") as string;
//     const contenido = formData.get("contenido") as string;
//     const destacado = formData.get("destacado") === "1" ? 1 : 0;

//     const id_noticia = uuidv4();
//     const fecha = new Date().toISOString();

//     db.exec("BEGIN TRANSACTION");

//     try {
//       const insertNoticia = db.prepare(`
//         INSERT INTO Noticia (id_noticia, titulo, contenido, destacado, fecha)
//         VALUES (?, ?, ?, ?, ?)
//       `);
//       insertNoticia.run(id_noticia, titulo, contenido, destacado, fecha);

//       // Process multiple files
//       const files = Object.keys(Object.fromEntries(formData))
//         .filter((key) => key.startsWith("archivo-"))
//         .map((key) => formData.get(key) as File);

//       if (files.length > 0) {
//         const insertArchivo = db.prepare(`
//           INSERT INTO Noticia_Archivo (id_archivo, id_noticia, titulo, archivo, extension)
//           VALUES (?, ?, ?, ?, ?)
//         `);

//         for (const file of files) {
//           const arrayBuffer = await file.arrayBuffer();
//           const buffer = Buffer.from(arrayBuffer);
//           const extension = file.name.split(".").pop() || "";
//           const id_archivo = uuidv4();

//           insertArchivo.run(
//             id_archivo,
//             id_noticia,
//             file.name.split(".")[0],
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
//     console.error("Error creating noticia:", error);
//     return NextResponse.json(
//       { success: false, error: "Error al crear la noticia" },
//       { status: 500 }
//     );
//   }
// }

// export async function PUT(request: Request) {
//   try {
//     const formData = await request.formData();
//     const id_noticia = formData.get("id_noticia") as string;
//     const titulo = formData.get("titulo") as string;
//     const contenido = formData.get("contenido") as string;
//     const destacado = formData.get("destacado") === "1" ? 1 : 0;
//     const archivosAEliminar = formData.get("archivosAEliminar") as string;

//     db.exec("BEGIN TRANSACTION");

//     try {
//       // Actualizar noticia
//       const updateNoticia = db.prepare(`
//         UPDATE Noticia
//         SET titulo = ?, contenido = ?, destacado = ?
//         WHERE id_noticia = ?
//       `);
//       updateNoticia.run(titulo, contenido, destacado, id_noticia);

//       // Eliminar archivos específicos si existen
//       if (archivosAEliminar) {
//         const ids = JSON.parse(archivosAEliminar);
//         const deleteArchivos = db.prepare(`
//           DELETE FROM Noticia_Archivo
//           WHERE id_archivo IN (${ids.map(() => "?").join(",")})
//         `);
//         deleteArchivos.run(...ids);
//       }

//       // Procesar nuevos archivos
//       const files = Object.keys(Object.fromEntries(formData))
//         .filter((key) => key.startsWith("archivo-"))
//         .map((key) => formData.get(key) as File);

//       if (files.length > 0) {
//         const insertArchivo = db.prepare(`
//           INSERT INTO Noticia_Archivo
//           (id_archivo, id_noticia, titulo, archivo, extension)
//           VALUES (?, ?, ?, ?, ?)
//         `);

//         for (const file of files) {
//           const arrayBuffer = await file.arrayBuffer();
//           const buffer = Buffer.from(arrayBuffer);
//           const extension = file.name.split(".").pop() || "";
//           const id_archivo = uuidv4();

//           insertArchivo.run(
//             id_archivo,
//             id_noticia,
//             file.name.split(".")[0],
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
//     console.error("Error updating noticia:", error);
//     return NextResponse.json(
//       { success: false, error: "Error al actualizar la noticia" },
//       { status: 500 }
//     );
//   }
// }

// export async function DELETE(request: Request) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const id = searchParams.get("id");

//     if (!id) {
//       return NextResponse.json(
//         { success: false, error: "ID de noticia no proporcionado" },
//         { status: 400 }
//       );
//     }

//     db.exec("BEGIN TRANSACTION");

//     try {
//       // Delete associated files first
//       const deleteArchivos = db.prepare(`
//         DELETE FROM Noticia_Archivo WHERE id_noticia = ?
//       `);
//       deleteArchivos.run(id);

//       // Then delete the noticia
//       const deleteNoticia = db.prepare(`
//         DELETE FROM Noticia WHERE id_noticia = ?
//       `);
//       deleteNoticia.run(id);

//       db.exec("COMMIT");
//       return NextResponse.json({ success: true });
//     } catch (error) {
//       db.exec("ROLLBACK");
//       throw error;
//     }
//   } catch (error) {
//     console.error("Error deleting noticia:", error);
//     return NextResponse.json(
//       { success: false, error: "Error al eliminar la noticia" },
//       { status: 500 }
//     );
//   }
// }

import { NextRequest, NextResponse } from "next/server";
import { Connection, Request, TYPES } from "tedious";
import config from "@/app/api/dbConfig";
import { randomUUID } from "crypto";

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
        const destacado = searchParams.get("destacado");

        // First, get all noticias
        let query = `
          SELECT id_noticia, titulo, contenido, destacado, fecha
          FROM Noticia
          ORDER BY fecha DESC
        `;

        if (destacado) {
          query = `
            SELECT id_noticia, titulo, contenido, destacado, fecha
            FROM Noticia
            WHERE destacado = 1
            ORDER BY fecha DESC
          `;
        }

        const noticias = await executeSQL(connection, query);
        const processedNoticias = [];

        // For each noticia, get its files
        for (const noticia of noticias) {
          // Just pass the date as is without trying to convert it
          // The frontend will handle the formatting with the formatDate function

          if (noticia.fecha) {
            // Convert SQL Server date to a string format that's safe for JavaScript
            const dateObj = new Date(noticia.fecha);
            if (!isNaN(dateObj.getTime())) {
              // If valid date, format it as ISO string
              noticia.fecha = dateObj.toISOString();
            } else {
              // If invalid, use a formatted string of the original value
              noticia.fecha = String(noticia.fecha);
            }
          }

          const archivosQuery = `
            SELECT id_archivo, titulo, extension
            FROM Noticia_Archivo
            WHERE id_noticia = @id_noticia
          `;

          const archivos = await executeSQL(connection, archivosQuery, [
            {
              name: "id_noticia",
              type: TYPES.NVarChar,
              value: noticia.id_noticia,
            },
          ]);

          processedNoticias.push({
            ...noticia,
            archivos: archivos,
          });
        }

        connection.close();
        resolve(
          NextResponse.json({ success: true, noticias: processedNoticias })
        );
      } catch (error) {
        console.error("Error fetching noticias:", error);
        connection.close();
        resolve(
          NextResponse.json(
            { success: false, error: "Error al obtener las noticias" },
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
        const contenido = formData.get("contenido") as string;
        const destacado = formData.get("destacado") === "1" ? 1 : 0;

        const id_noticia = randomUUID();
        const fecha = new Date().toISOString();

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
          // Insert noticia
          await executeSQLStatement(
            connection,
            `INSERT INTO Noticia (id_noticia, titulo, contenido, destacado, fecha)
             VALUES (@id_noticia, @titulo, @contenido, @destacado, @fecha)`,
            [
              { name: "id_noticia", type: TYPES.NVarChar, value: id_noticia },
              { name: "titulo", type: TYPES.NVarChar, value: titulo },
              { name: "contenido", type: TYPES.NVarChar, value: contenido },
              { name: "destacado", type: TYPES.Int, value: destacado },
              { name: "fecha", type: TYPES.DateTime, value: new Date(fecha) },
            ]
          );

          // Process multiple files
          const files = Object.keys(Object.fromEntries(formData))
            .filter((key) => key.startsWith("archivo-"))
            .map((key) => formData.get(key) as File);

          if (files.length > 0) {
            for (const file of files) {
              const arrayBuffer = await file.arrayBuffer();
              const buffer = Buffer.from(arrayBuffer);
              const extension = file.name.split(".").pop() || "";
              const id_archivo = randomUUID();

              await executeSQLStatement(
                connection,
                `INSERT INTO Noticia_Archivo (id_archivo, id_noticia, titulo, archivo, extension)
                 VALUES (@id_archivo, @id_noticia, @titulo, @archivo, @extension)`,
                [
                  {
                    name: "id_archivo",
                    type: TYPES.NVarChar,
                    value: id_archivo,
                  },
                  {
                    name: "id_noticia",
                    type: TYPES.NVarChar,
                    value: id_noticia,
                  },
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
          resolve(NextResponse.json({ success: true }));
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
        console.error("Error creating noticia:", error);
        connection.close();
        resolve(
          NextResponse.json(
            { success: false, error: "Error al crear la noticia" },
            { status: 500 }
          )
        );
      }
    });

    connection.connect();
  });
}

export async function PUT(request: NextRequest) {
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
        const id_noticia = formData.get("id_noticia") as string;
        const titulo = formData.get("titulo") as string;
        const contenido = formData.get("contenido") as string;
        const destacado = formData.get("destacado") === "1" ? 1 : 0;
        const archivosAEliminar = formData.get("archivosAEliminar") as string;

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
          // Update noticia
          await executeSQLStatement(
            connection,
            `UPDATE Noticia
             SET titulo = @titulo, contenido = @contenido, destacado = @destacado
             WHERE id_noticia = @id_noticia`,
            [
              { name: "titulo", type: TYPES.NVarChar, value: titulo },
              { name: "contenido", type: TYPES.NVarChar, value: contenido },
              { name: "destacado", type: TYPES.Int, value: destacado },
              { name: "id_noticia", type: TYPES.NVarChar, value: id_noticia },
            ]
          );

          // Eliminar archivos específicos si existen
          if (archivosAEliminar) {
            const ids = JSON.parse(archivosAEliminar);
            if (ids.length > 0) {
              // SQL Server doesn't support parameterized IN clauses easily
              // We'll delete one by one
              for (const id of ids) {
                await executeSQLStatement(
                  connection,
                  `DELETE FROM Noticia_Archivo WHERE id_archivo = @id_archivo`,
                  [{ name: "id_archivo", type: TYPES.NVarChar, value: id }]
                );
              }
            }
          }

          // Procesar nuevos archivos
          const files = Object.keys(Object.fromEntries(formData))
            .filter((key) => key.startsWith("archivo-"))
            .map((key) => formData.get(key) as File);

          if (files.length > 0) {
            for (const file of files) {
              const arrayBuffer = await file.arrayBuffer();
              const buffer = Buffer.from(arrayBuffer);
              const extension = file.name.split(".").pop() || "";
              const id_archivo = randomUUID();

              await executeSQLStatement(
                connection,
                `INSERT INTO Noticia_Archivo (id_archivo, id_noticia, titulo, archivo, extension)
                 VALUES (@id_archivo, @id_noticia, @titulo, @archivo, @extension)`,
                [
                  {
                    name: "id_archivo",
                    type: TYPES.NVarChar,
                    value: id_archivo,
                  },
                  {
                    name: "id_noticia",
                    type: TYPES.NVarChar,
                    value: id_noticia,
                  },
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
          resolve(NextResponse.json({ success: true }));
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
        console.error("Error updating noticia:", error);
        connection.close();
        resolve(
          NextResponse.json(
            { success: false, error: "Error al actualizar la noticia" },
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
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
          connection.close();
          return resolve(
            NextResponse.json(
              { success: false, error: "ID de noticia no proporcionado" },
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
          // Delete associated files first
          await executeSQLStatement(
            connection,
            `DELETE FROM Noticia_Archivo WHERE id_noticia = @id_noticia`,
            [{ name: "id_noticia", type: TYPES.NVarChar, value: id }]
          );

          // Then delete the noticia
          await executeSQLStatement(
            connection,
            `DELETE FROM Noticia WHERE id_noticia = @id_noticia`,
            [{ name: "id_noticia", type: TYPES.NVarChar, value: id }]
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
          resolve(NextResponse.json({ success: true }));
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
        console.error("Error deleting noticia:", error);
        connection.close();
        resolve(
          NextResponse.json(
            { success: false, error: "Error al eliminar la noticia" },
            { status: 500 }
          )
        );
      }
    });

    connection.connect();
  });
}
