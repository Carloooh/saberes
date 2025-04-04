// import { NextResponse } from "next/server";
// import { v4 as uuidv4 } from "uuid";
// import db from "@/db";

// interface ActividadRow {
//   id_actividad: string;
//   titulo: string;
//   descripcion: string;
//   fecha: string;
//   archivo_ids?: string | null;
//   archivo_titulos?: string | null;
//   archivo_extensions?: string | null;
// }

// export async function GET() {
//   try {
//     const query = db.prepare(`
//       SELECT a.*, GROUP_CONCAT(aa.id_archivo) as archivo_ids,
//              GROUP_CONCAT(aa.titulo) as archivo_titulos,
//              GROUP_CONCAT(aa.extension) as archivo_extensions
//       FROM Actividad a
//       LEFT JOIN Actividad_archivo aa ON a.id_actividad = aa.id_actividad
//       GROUP BY a.id_actividad
//       ORDER BY a.fecha DESC
//     `);

//     const rows = query.all() as ActividadRow[];
//     // const actividades = query.all().map((actividad) => {
//       const actividades = rows.map((actividad) => {
//       const archivo_ids = actividad.archivo_ids
//         ? actividad.archivo_ids.split(",")
//         : [];
//       const archivo_titulos = actividad.archivo_titulos
//         ? actividad.archivo_titulos.split(",")
//         : [];
//       const archivo_extensions = actividad.archivo_extensions
//         ? actividad.archivo_extensions.split(",")
//         : [];

//       const archivos = archivo_ids.map((id: string, index: number) => ({
//         id_archivo: id,
//         titulo: archivo_titulos[index],
//         extension: archivo_extensions[index],
//       }));

//       delete actividad.archivo_ids;
//       delete actividad.archivo_titulos;
//       delete actividad.archivo_extensions;

//       return {
//         ...actividad,
//         archivos,
//       };
//     });

//     return NextResponse.json({ success: true, actividades });
//   } catch (error) {
//     console.error("Error fetching actividades:", error);
//     return NextResponse.json(
//       { success: false, error: "Error al obtener las actividades" },
//       { status: 500 }
//     );
//   }
// }

// export async function POST(request: Request) {
//   try {
//     const formData = await request.formData();
//     const titulo = formData.get("titulo") as string;
//     const descripcion = formData.get("descripcion") as string;
//     const fecha = formData.get("fecha") as string;
//     const id_actividad = uuidv4();

//     db.exec("BEGIN TRANSACTION");

//     try {
//       const insertActividad = db.prepare(`
//         INSERT INTO Actividad (id_actividad, titulo, descripcion, fecha)
//         VALUES (?, ?, ?, ?)
//       `);
//       insertActividad.run(id_actividad, titulo, descripcion, fecha);

//       const insertArchivo = db.prepare(`
//         INSERT INTO Actividad_archivo (id_archivo, id_actividad, titulo, archivo, extension)
//         VALUES (?, ?, ?, ?, ?)
//       `);

//       const files = [];
//       for (const [key, value] of formData.entries()) {
//         if (value instanceof File) {
//           files.push(value);
//         }
//       }

//       for (const file of files) {
//         const arrayBuffer = await file.arrayBuffer();
//         const buffer = Buffer.from(arrayBuffer);
//         const extension = file.name.split(".").pop()?.toLowerCase() || "";
//         const id_archivo = uuidv4();

//         insertArchivo.run(
//           id_archivo,
//           id_actividad,
//           file.name.split(".")[0],
//           buffer,
//           extension
//         );
//       }

//       db.exec("COMMIT");
//       return NextResponse.json({ success: true });
//     } catch (error) {
//       db.exec("ROLLBACK");
//       throw error;
//     }
//   } catch (error) {
//     console.error("Error creating actividad:", error);
//     return NextResponse.json(
//       { success: false, error: "Error al crear la actividad" },
//       { status: 500 }
//     );
//   }
// }

// export async function PUT(request: Request) {
//   try {
//     const formData = await request.formData();
//     const id_actividad = formData.get("id_actividad") as string;
//     const titulo = formData.get("titulo") as string;
//     const descripcion = formData.get("descripcion") as string;
//     const fecha = formData.get("fecha") as string;
//     const archivosAEliminar = formData.get("archivosAEliminar") as string;

//     db.exec("BEGIN TRANSACTION");

//     try {
//       const updateActividad = db.prepare(`
//         UPDATE Actividad
//         SET titulo = ?, descripcion = ?, fecha = ?
//         WHERE id_actividad = ?
//       `);
//       updateActividad.run(titulo, descripcion, fecha, id_actividad);

//       if (archivosAEliminar) {
//         const ids = JSON.parse(archivosAEliminar);
//         const deleteArchivos = db.prepare(`
//           DELETE FROM Actividad_archivo
//           WHERE id_archivo IN (${ids.map(() => "?").join(",")})
//         `);
//         deleteArchivos.run(...ids);
//       }

//       const files = [];
//       for (const [key, value] of formData.entries()) {
//         if (value instanceof File) {
//           files.push(value);
//         }
//       }

//       if (files.length > 0) {
//         const insertArchivo = db.prepare(`
//           INSERT INTO Actividad_archivo (id_archivo, id_actividad, titulo, archivo, extension)
//           VALUES (?, ?, ?, ?, ?)
//         `);

//         for (const file of files) {
//           const arrayBuffer = await file.arrayBuffer();
//           const buffer = Buffer.from(arrayBuffer);
//           const extension = file.name.split(".").pop()?.toLowerCase() || "";
//           const id_archivo = uuidv4();

//           insertArchivo.run(
//             id_archivo,
//             id_actividad,
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
//     console.error("Error updating actividad:", error);
//     return NextResponse.json(
//       { success: false, error: "Error al actualizar la actividad" },
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
//         { success: false, error: "ID no proporcionado" },
//         { status: 400 }
//       );
//     }

//     db.exec("BEGIN TRANSACTION");

//     try {
//       const deleteArchivos = db.prepare(
//         "DELETE FROM Actividad_archivo WHERE id_actividad = ?"
//       );
//       const deleteActividad = db.prepare(
//         "DELETE FROM Actividad WHERE id_actividad = ?"
//       );

//       deleteArchivos.run(id);
//       deleteActividad.run(id);

//       db.exec("COMMIT");
//       return NextResponse.json({ success: true });
//     } catch (error) {
//       db.exec("ROLLBACK");
//       throw error;
//     }
//   } catch (error) {
//     console.error("Error deleting actividad:", error);
//     return NextResponse.json(
//       { success: false, error: "Error al eliminar la actividad" },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse, NextRequest } from "next/server";
import { Connection, Request, TYPES } from "tedious";
import config from "@/app/api/dbConfig";
import { randomUUID } from "crypto";

interface ActividadRow {
  id_actividad: string;
  titulo: string;
  descripcion: string;
  fecha: string;
  archivo_ids?: string | null;
  archivo_titulos?: string | null;
  archivo_extensions?: string | null;
}

interface ActividadProcessed {
  id_actividad: string;
  titulo: string;
  descripcion: string;
  fecha: string;
  archivos: {
    id_archivo: string;
    titulo: string;
    extension: string;
  }[];
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

export async function GET() {
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
        // First, get all actividades
        const actividadesQuery = `
          SELECT id_actividad, titulo, descripcion, fecha
          FROM Actividad
          ORDER BY fecha DESC
        `;

        const actividades = await executeSQL(connection, actividadesQuery);
        const processedActividades = [];

        // For each actividad, get its files
        for (const actividad of actividades) {
          const archivosQuery = `
            SELECT id_archivo, titulo, extension
            FROM Actividad_archivo
            WHERE id_actividad = @id_actividad
          `;

          const archivos = await executeSQL(connection, archivosQuery, [
            {
              name: "id_actividad",
              type: TYPES.NVarChar,
              value: actividad.id_actividad,
            },
          ]);

          processedActividades.push({
            ...actividad,
            archivos: archivos,
          });
        }

        connection.close();
        resolve(
          NextResponse.json({
            success: true,
            actividades: processedActividades,
          })
        );
      } catch (error) {
        console.error("Error fetching actividades:", error);
        connection.close();
        resolve(
          NextResponse.json(
            { success: false, error: "Error al obtener las actividades" },
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
        const fecha = formData.get("fecha") as string;
        const id_actividad = randomUUID();

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
          // Insert actividad
          await executeSQLStatement(
            connection,
            `INSERT INTO Actividad (id_actividad, titulo, descripcion, fecha)
             VALUES (@id_actividad, @titulo, @descripcion, @fecha)`,
            [
              {
                name: "id_actividad",
                type: TYPES.NVarChar,
                value: id_actividad,
              },
              { name: "titulo", type: TYPES.NVarChar, value: titulo },
              { name: "descripcion", type: TYPES.NVarChar, value: descripcion },
              { name: "fecha", type: TYPES.NVarChar, value: fecha },
            ]
          );

          // Process files
          const files = [];
          for (const [key, value] of formData.entries()) {
            if (value instanceof File) {
              files.push(value);
            }
          }

          for (const file of files) {
            try {
              const arrayBuffer = await file.arrayBuffer();
              const buffer = Buffer.from(arrayBuffer);

              // Skip files with no content
              if (buffer.length === 0) {
                console.warn(`Skipping empty file: ${file.name}`);
                continue;
              }

              const extension = file.name.split(".").pop()?.toLowerCase() || "";
              const id_archivo = randomUUID();

              // Insert file data
              await executeSQLStatement(
                connection,
                `INSERT INTO Actividad_archivo (id_archivo, id_actividad, titulo, extension, archivo)
                 VALUES (@id_archivo, @id_actividad, @titulo, @extension, @archivo)`,
                [
                  {
                    name: "id_archivo",
                    type: TYPES.NVarChar,
                    value: id_archivo,
                  },
                  {
                    name: "id_actividad",
                    type: TYPES.NVarChar,
                    value: id_actividad,
                  },
                  {
                    name: "titulo",
                    type: TYPES.NVarChar,
                    value: file.name.split(".")[0],
                  },
                  { name: "extension", type: TYPES.NVarChar, value: extension },
                  { name: "archivo", type: TYPES.VarBinary, value: buffer },
                ]
              );
            } catch (fileError) {
              console.error(`Error processing file ${file.name}:`, fileError);
              throw fileError;
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
          resolve(NextResponse.json({ success: true, id_actividad }));
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
        console.error("Error creating actividad:", error);
        connection.close();
        resolve(
          NextResponse.json(
            { success: false, error: `Error al crear la actividad: ${error}` },
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
        const id_actividad = formData.get("id_actividad") as string;
        const titulo = formData.get("titulo") as string;
        const descripcion = formData.get("descripcion") as string;
        const fecha = formData.get("fecha") as string;
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
          // Update actividad
          await executeSQLStatement(
            connection,
            `UPDATE Actividad
             SET titulo = @titulo, descripcion = @descripcion, fecha = @fecha
             WHERE id_actividad = @id_actividad`,
            [
              { name: "titulo", type: TYPES.NVarChar, value: titulo },
              { name: "descripcion", type: TYPES.NVarChar, value: descripcion },
              { name: "fecha", type: TYPES.NVarChar, value: fecha },
              {
                name: "id_actividad",
                type: TYPES.NVarChar,
                value: id_actividad,
              },
            ]
          );

          // Delete files if needed
          if (archivosAEliminar) {
            const ids = JSON.parse(archivosAEliminar) as string[];

            for (const id of ids) {
              await executeSQLStatement(
                connection,
                `DELETE FROM Actividad_archivo WHERE id_archivo = @id_archivo`,
                [{ name: "id_archivo", type: TYPES.NVarChar, value: id }]
              );
            }
          }

          // Process new files
          const files = [];
          for (const [key, value] of formData.entries()) {
            if (value instanceof File) {
              files.push(value);
            }
          }

          if (files.length > 0) {
            for (const file of files) {
              try {
                const arrayBuffer = await file.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);

                // Skip files with no content
                if (buffer.length === 0) {
                  console.warn(`Skipping empty file: ${file.name}`);
                  continue;
                }

                const extension =
                  file.name.split(".").pop()?.toLowerCase() || "";
                const id_archivo = randomUUID();

                // Insert file data
                await executeSQLStatement(
                  connection,
                  `INSERT INTO Actividad_archivo (id_archivo, id_actividad, titulo, extension, archivo)
                   VALUES (@id_archivo, @id_actividad, @titulo, @extension, @archivo)`,
                  [
                    {
                      name: "id_archivo",
                      type: TYPES.NVarChar,
                      value: id_archivo,
                    },
                    {
                      name: "id_actividad",
                      type: TYPES.NVarChar,
                      value: id_actividad,
                    },
                    {
                      name: "titulo",
                      type: TYPES.NVarChar,
                      value: file.name.split(".")[0],
                    },
                    {
                      name: "extension",
                      type: TYPES.NVarChar,
                      value: extension,
                    },
                    { name: "archivo", type: TYPES.VarBinary, value: buffer },
                  ]
                );
              } catch (fileError) {
                console.error(`Error processing file ${file.name}:`, fileError);
                throw fileError;
              }
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
        console.error("Error updating actividad:", error);
        connection.close();
        resolve(
          NextResponse.json(
            {
              success: false,
              error: `Error al actualizar la actividad: ${error}`,
            },
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
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

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
        if (!id) {
          connection.close();
          return resolve(
            NextResponse.json(
              { success: false, error: "ID no proporcionado" },
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
          // Delete related files first
          await executeSQLStatement(
            connection,
            `DELETE FROM Actividad_archivo WHERE id_actividad = @id_actividad`,
            [{ name: "id_actividad", type: TYPES.NVarChar, value: id }]
          );

          // Then delete the actividad
          await executeSQLStatement(
            connection,
            `DELETE FROM Actividad WHERE id_actividad = @id_actividad`,
            [{ name: "id_actividad", type: TYPES.NVarChar, value: id }]
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
        console.error("Error deleting actividad:", error);
        connection.close();
        resolve(
          NextResponse.json(
            {
              success: false,
              error: `Error al eliminar la actividad: ${error}`,
            },
            { status: 500 }
          )
        );
      }
    });

    connection.connect();
  });
}
