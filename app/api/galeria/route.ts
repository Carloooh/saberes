// import { NextResponse } from 'next/server';
// import db from '@/db';
// import { v4 as uuidv4 } from 'uuid';

// // GET: Obtener todos los archivos de la galería
// export async function GET(req: Request) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const searchQuery = searchParams.get('search') || '';

//     const stmt = db.prepare(`
//       SELECT id_archivo, extension
//       FROM Galeria
//       WHERE id_archivo LIKE ? OR extension LIKE ?
//     `);
//     const files = stmt.all(`%${searchQuery}%`, `%${searchQuery}%`);

//     return NextResponse.json({ success: true, data: files }, { status: 200 });
//   } catch (error) {
//     console.error('Error al obtener los archivos:', error);
//     return NextResponse.json({ success: false, error: 'Error en el servidor' }, { status: 500 });
//   }
// }

// // POST: Subir un nuevo archivo con manejo de nombres duplicados
// export async function POST(req: Request) {
//     try {
//       const formData = await req.formData();
//       const file = formData.get('file') as File;

//       if (!file) {
//         return NextResponse.json({ success: false, error: 'No se proporcionó ningún archivo' }, { status: 400 });
//       }

//       // Validar el tipo de archivo
//       const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'video/mp4'];
//       if (!allowedTypes.includes(file.type)) {
//         return NextResponse.json({ success: false, error: 'Formato de archivo no permitido. Solo se permiten PNG, JPG, JPEG y MP4.' }, { status: 400 });
//       }

//       const fileBuffer = await file.arrayBuffer();
//       const originalName = file.name.split('.').slice(0, -1).join('.') || 'archivo';
//       const extension = file.name.split('.').pop() || '';

//       let id = originalName;
//       let count = 1;

//       // Verificar si ya existe un archivo con el mismo nombre
//       while (db.prepare('SELECT id_archivo FROM Galeria WHERE id_archivo = ?').get(id)) {
//         id = `${originalName} (${count})`; // Agregar sufijo incremental
//         count++;
//       }

//       const stmt = db.prepare(`
//         INSERT INTO Galeria (id_archivo, titulo, archivo, extension)
//         VALUES (?, ?, ?, ?)
//       `);
//       stmt.run(uuidv4(), id, Buffer.from(fileBuffer), extension);

//       return NextResponse.json({ success: true, id }, { status: 201 });
//     } catch (error) {
//       console.error('Error al subir el archivo:', error);
//       return NextResponse.json({ success: false, error: 'Error en el servidor' }, { status: 500 });
//     }
//   }

// // PUT: Renombrar un archivo
// export async function PUT(req: Request) {
//   try {
//     const { id_archivo, nuevoNombre } = await req.json();

//     if (!id_archivo || !nuevoNombre) {
//       return NextResponse.json({ success: false, error: 'Datos insuficientes' }, { status: 400 });
//     }

//     const stmt = db.prepare('UPDATE Galeria SET id_archivo = ? WHERE id_archivo = ?');
//     stmt.run(nuevoNombre, id_archivo);

//     return NextResponse.json({ success: true }, { status: 200 });
//   } catch (error) {
//     console.error('Error al renombrar el archivo:', error);
//     return NextResponse.json({ success: false, error: 'Error en el servidor' }, { status: 500 });
//   }
// }

// // DELETE: Eliminar un archivo
// export async function DELETE(req: Request) {
//   try {
//     const { id_archivo } = await req.json();

//     const stmt = db.prepare('DELETE FROM Galeria WHERE id_archivo = ?');
//     stmt.run(id_archivo);

//     return NextResponse.json({ success: true }, { status: 200 });
//   } catch (error) {
//     console.error('Error al eliminar el archivo:', error);
//     return NextResponse.json({ success: false, error: 'Error en el servidor' }, { status: 500 });
//   }
// }

import { NextResponse, NextRequest } from "next/server";
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

// GET: Obtener todos los archivos de la galería
export async function GET(req: NextRequest) {
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
        const { searchParams } = new URL(req.url);
        const searchQuery = searchParams.get("search") || "";

        const query = `
          SELECT id_archivo, extension, titulo
          FROM Galeria
          WHERE id_archivo LIKE @search OR extension LIKE @search OR titulo LIKE @search
        `;

        const files = await executeSQL(connection, query, [
          { name: "search", type: TYPES.NVarChar, value: `%${searchQuery}%` },
        ]);

        connection.close();
        resolve(
          NextResponse.json({ success: true, data: files }, { status: 200 })
        );
      } catch (error) {
        console.error("Error al obtener los archivos:", error);
        connection.close();
        resolve(
          NextResponse.json(
            { success: false, error: "Error en el servidor" },
            { status: 500 }
          )
        );
      }
    });

    connection.connect();
  });
}

// POST: Subir un nuevo archivo con manejo de nombres duplicados
export async function POST(req: NextRequest) {
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
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
          connection.close();
          return resolve(
            NextResponse.json(
              { success: false, error: "No se proporcionó ningún archivo" },
              { status: 400 }
            )
          );
        }

        // Validar el tipo de archivo
        const allowedTypes = [
          "image/png",
          "image/jpeg",
          "image/jpg",
          "video/mp4",
        ];
        if (!allowedTypes.includes(file.type)) {
          connection.close();
          return resolve(
            NextResponse.json(
              {
                success: false,
                error:
                  "Formato de archivo no permitido. Solo se permiten PNG, JPG, JPEG y MP4.",
              },
              { status: 400 }
            )
          );
        }

        const fileBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(fileBuffer);
        const originalName =
          file.name.split(".").slice(0, -1).join(".") || "archivo";
        const extension = file.name.split(".").pop() || "";

        let id = originalName;
        let count = 1;

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
          // Verificar si ya existe un archivo con el mismo nombre
          const checkQuery = `SELECT id_archivo FROM Galeria WHERE id_archivo = @id`;

          let exists = true;
          while (exists) {
            const result = await executeSQL(connection, checkQuery, [
              { name: "id", type: TYPES.NVarChar, value: id },
            ]);

            if (result.length === 0) {
              exists = false;
            } else {
              id = `${originalName} (${count})`; // Agregar sufijo incremental
              count++;
            }
          }

          const id_archivo = randomUUID();

          // Insert file
          await executeSQLStatement(
            connection,
            `INSERT INTO Galeria (id_archivo, titulo, archivo, extension)
             VALUES (@id_archivo, @titulo, @archivo, @extension)`,
            [
              { name: "id_archivo", type: TYPES.NVarChar, value: id_archivo },
              { name: "titulo", type: TYPES.NVarChar, value: id },
              { name: "archivo", type: TYPES.VarBinary, value: buffer },
              { name: "extension", type: TYPES.NVarChar, value: extension },
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
          resolve(NextResponse.json({ success: true, id }, { status: 201 }));
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
        console.error("Error al subir el archivo:", error);
        connection.close();
        resolve(
          NextResponse.json(
            { success: false, error: "Error en el servidor" },
            { status: 500 }
          )
        );
      }
    });

    connection.connect();
  });
}

// PUT: Renombrar un archivo
export async function PUT(req: NextRequest) {
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
        const { id_archivo, nuevoNombre } = await req.json();

        if (!id_archivo || !nuevoNombre) {
          connection.close();
          return resolve(
            NextResponse.json(
              { success: false, error: "Datos insuficientes" },
              { status: 400 }
            )
          );
        }

        await executeSQLStatement(
          connection,
          `UPDATE Galeria SET titulo = @nuevoNombre WHERE id_archivo = @id_archivo`,
          [
            { name: "nuevoNombre", type: TYPES.NVarChar, value: nuevoNombre },
            { name: "id_archivo", type: TYPES.NVarChar, value: id_archivo }
          ]
        );

        connection.close();
        resolve(NextResponse.json({ success: true }, { status: 200 }));
      } catch (error) {
        console.error("Error al renombrar el archivo:", error);
        connection.close();
        resolve(
          NextResponse.json(
            { success: false, error: "Error en el servidor" },
            { status: 500 }
          )
        );
      }
    });

    connection.connect();
  });
}

// DELETE: Eliminar un archivo
export async function DELETE(req: NextRequest) {
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
        const { id_archivo } = await req.json();

        if (!id_archivo) {
          connection.close();
          return resolve(
            NextResponse.json(
              { success: false, error: "ID de archivo no proporcionado" },
              { status: 400 }
            )
          );
        }

        await executeSQLStatement(
          connection,
          `DELETE FROM Galeria WHERE id_archivo = @id_archivo`,
          [{ name: "id_archivo", type: TYPES.NVarChar, value: id_archivo }]
        );

        connection.close();
        resolve(NextResponse.json({ success: true }, { status: 200 }));
      } catch (error) {
        console.error("Error al eliminar el archivo:", error);
        connection.close();
        resolve(
          NextResponse.json(
            { success: false, error: "Error en el servidor" },
            { status: 500 }
          )
        );
      }
    });

    connection.connect();
  });
}
