import { NextResponse, NextRequest } from "next/server";
import { Connection, Request, TYPES } from "tedious";
import config from "@/app/api/dbConfig";
import { randomUUID } from "crypto";

interface SedeArchivo {
  id_archivo: string;
  titulo: string;
  extension: string;
}

interface SedeProcessed {
  id_sede: string;
  nombre: string;
  direccion: string;
  url: string;
  url_iframe: string;
  cursos: string[];
  archivos: SedeArchivo[];
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
        // Get all sedes
        const sedesQuery = `
          SELECT id_sede, nombre, direccion, url, url_iframe, cursos
          FROM Sede
          ORDER BY nombre ASC
        `;

        const sedes = await executeSQL(connection, sedesQuery);
        const processedSedes: SedeProcessed[] = [];

        // For each sede, get its files
        for (const sede of sedes) {
          const archivosQuery = `
            SELECT id_archivo, titulo, extension
            FROM Sede_archivo
            WHERE id_sede = @id_sede
          `;

          const archivos = await executeSQL(connection, archivosQuery, [
            { name: "id_sede", type: TYPES.NVarChar, value: sede.id_sede },
          ]);

          processedSedes.push({
            ...sede,
            cursos: sede.cursos ? JSON.parse(sede.cursos) : [],
            archivos: archivos,
          });
        }

        connection.close();
        resolve(NextResponse.json({ success: true, data: processedSedes }));
      } catch (error) {
        console.error("Error fetching sedes:", error);
        connection.close();
        resolve(
          NextResponse.json(
            { success: false, error: "Error al obtener las sedes" },
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
        const nombre = formData.get("nombre") as string;
        const direccion = formData.get("direccion") as string;
        const url = formData.get("url") as string;
        const url_iframe = formData.get("url_iframe") as string;
        const cursos = formData.get("cursos") as string;

        const id_sede = randomUUID();

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
          // Insert sede
          await executeSQLStatement(
            connection,
            `INSERT INTO Sede (id_sede, nombre, direccion, url, url_iframe, cursos)
             VALUES (@id_sede, @nombre, @direccion, @url, @url_iframe, @cursos)`,
            [
              { name: "id_sede", type: TYPES.NVarChar, value: id_sede },
              { name: "nombre", type: TYPES.NVarChar, value: nombre },
              { name: "direccion", type: TYPES.NVarChar, value: direccion },
              { name: "url", type: TYPES.NVarChar, value: url },
              { name: "url_iframe", type: TYPES.NVarChar, value: url_iframe },
              { name: "cursos", type: TYPES.NVarChar, value: cursos },
            ]
          );

          // Process files
          const files = Object.keys(Object.fromEntries(formData))
            .filter((key) => key.startsWith("archivo-"))
            .map((key) => formData.get(key) as File);

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

                const extension = file.name.split(".").pop() || "";
                const id_archivo = randomUUID();

                // Insert file data
                await executeSQLStatement(
                  connection,
                  `INSERT INTO Sede_archivo (id_archivo, id_sede, titulo, extension, archivo)
                   VALUES (@id_archivo, @id_sede, @titulo, @extension, @archivo)`,
                  [
                    {
                      name: "id_archivo",
                      type: TYPES.NVarChar,
                      value: id_archivo,
                    },
                    { name: "id_sede", type: TYPES.NVarChar, value: id_sede },
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
          resolve(NextResponse.json({ success: true, id_sede }));
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
        console.error("Error creating sede:", error);
        connection.close();
        resolve(
          NextResponse.json(
            { success: false, error: `Error al crear la sede: ${error}` },
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
        const id_sede = formData.get("id_sede") as string;
        const nombre = formData.get("nombre") as string;
        const direccion = formData.get("direccion") as string;
        const url = formData.get("url") as string;
        const url_iframe = formData.get("url_iframe") as string;
        const cursos = formData.get("cursos") as string;
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
          // Update sede
          await executeSQLStatement(
            connection,
            `UPDATE Sede
             SET nombre = @nombre, direccion = @direccion, url = @url, 
                 url_iframe = @url_iframe, cursos = @cursos
             WHERE id_sede = @id_sede`,
            [
              { name: "nombre", type: TYPES.NVarChar, value: nombre },
              { name: "direccion", type: TYPES.NVarChar, value: direccion },
              { name: "url", type: TYPES.NVarChar, value: url },
              { name: "url_iframe", type: TYPES.NVarChar, value: url_iframe },
              { name: "cursos", type: TYPES.NVarChar, value: cursos },
              { name: "id_sede", type: TYPES.NVarChar, value: id_sede },
            ]
          );

          // Delete files if needed
          if (archivosAEliminar) {
            const ids = JSON.parse(archivosAEliminar) as string[];

            for (const id of ids) {
              await executeSQLStatement(
                connection,
                `DELETE FROM Sede_archivo WHERE id_archivo = @id_archivo`,
                [{ name: "id_archivo", type: TYPES.NVarChar, value: id }]
              );
            }
          }

          // Process new files
          const files = Object.keys(Object.fromEntries(formData))
            .filter((key) => key.startsWith("archivo-"))
            .map((key) => formData.get(key) as File);

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
                
                const extension = file.name.split(".").pop() || "";
                const id_archivo = randomUUID();

                // Insert file data with archivo in a single statement
                await executeSQLStatement(
                  connection,
                  `INSERT INTO Sede_archivo (id_archivo, id_sede, titulo, extension, archivo)
                   VALUES (@id_archivo, @id_sede, @titulo, @extension, @archivo)`,
                  [
                    {
                      name: "id_archivo",
                      type: TYPES.NVarChar,
                      value: id_archivo,
                    },
                    { name: "id_sede", type: TYPES.NVarChar, value: id_sede },
                    {
                      name: "titulo",
                      type: TYPES.NVarChar,
                      value: file.name.split(".")[0],
                    },
                    { name: "extension", type: TYPES.NVarChar, value: extension },
                    { name: "archivo", type: TYPES.VarBinary, value: buffer }
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
        console.error("Error updating sede:", error);
        connection.close();
        resolve(
          NextResponse.json(
            { success: false, error: `Error al actualizar la sede: ${error}` },
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
        const { id_sede } = await request.json();

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
          // Delete associated files
          await executeSQLStatement(
            connection,
            `DELETE FROM Sede_archivo WHERE id_sede = @id_sede`,
            [{ name: "id_sede", type: TYPES.NVarChar, value: id_sede }]
          );

          // Delete sede
          await executeSQLStatement(
            connection,
            `DELETE FROM Sede WHERE id_sede = @id_sede`,
            [{ name: "id_sede", type: TYPES.NVarChar, value: id_sede }]
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
        console.error("Error deleting sede:", error);
        connection.close();
        resolve(
          NextResponse.json(
            { success: false, error: "Error al eliminar la sede" },
            { status: 500 }
          )
        );
      }
    });

    connection.connect();
  });
}
