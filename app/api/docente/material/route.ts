// import { NextResponse } from "next/server";
// import db from "@/db";

// interface MaterialArchivo {
//   id_material_archivo: string;
//   titulo: string;
//   extension: string;
// }

// interface Material {
//   id_material: string;
//   id_curso: string;
//   id_asignatura: string;
//   titulo: string;
//   descripcion: string;
//   fecha: string;
//   enlace: string | null;
//   archivos: string;
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

//     if (!cursoId) {
//       return NextResponse.json(
//         { success: false, error: "Falta el ID del curso" },
//         { status: 400 }
//       );
//     }

//     const query = db.prepare(`
//       SELECT
//         m.*,
//         json_group_array(
//           json_object(
//             'id_material_archivo', ma.id_material_archivo,
//             'titulo', ma.titulo,
//             'extension', ma.extension
//           )
//         ) as archivos
//       FROM Material_educativo m
//       LEFT JOIN Material_archivo ma ON m.id_material = ma.id_material
//       WHERE m.id_asignatura = ? AND m.id_curso = ?
//       GROUP BY m.id_material
//     `);
//     const materiales = query.all(asignaturaId, cursoId) as Material[];

//     // Parse the JSON string to actual array
//     materiales.forEach((material: Material) => {
//       material.archivos = JSON.parse(material.archivos).filter(
//         (a: MaterialArchivo) => a.id_material_archivo
//       );
//     });

//     return NextResponse.json({ success: true, materiales });
//   } catch (error) {
//     console.error("Error fetching materials:", error);
//     return NextResponse.json(
//       { success: false, error: "Error fetching materials" },
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
//     const enlace = formData.get("enlace") as string;

//     if (!titulo || !descripcion || !id_asignatura) {
//       return NextResponse.json(
//         { success: false, error: "Faltan campos requeridos" },
//         { status: 400 }
//       );
//     }

//     const id_material = `${id_asignatura}-${Date.now()}`;

//     db.exec("BEGIN TRANSACTION");

//     try {
//       const fecha = new Date().toISOString().split("T")[0];
//       const insertMaterial = db.prepare(`
//         INSERT INTO Material_educativo (id_material, id_curso, id_asignatura, titulo, descripcion, fecha, enlace)
//         VALUES (?, ?, ?, ?, ?, ?, ?)
//       `);
//       insertMaterial.run(
//         id_material,
//         cursoId,
//         id_asignatura,
//         titulo,
//         descripcion,
//         fecha,
//         enlace
//       );

//       // Process multiple files
//       const files = Object.keys(Object.fromEntries(formData))
//         .filter((key) => key.startsWith("archivo-"))
//         .map((key) => formData.get(key) as File);

//       for (const file of files) {
//         const arrayBuffer = await file.arrayBuffer();
//         const buffer = Buffer.from(arrayBuffer);
//         const extension = file.name.split(".").pop();
//         const id_material_archivo = `${id_material}-${Date.now()}-${Math.random()
//           .toString(36)
//           .substr(2, 9)}`;

//         const insertArchivo = db.prepare(`
//           INSERT INTO Material_archivo (id_material_archivo, id_material, id_curso, id_asignatura, titulo, archivo, extension)
//           VALUES (?, ?, ?, ?, ?, ?, ?)
//         `);
//         insertArchivo.run(
//           id_material_archivo,
//           id_material,
//           cursoId,
//           id_asignatura,
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
//     console.error("Error creating material:", error);
//     return NextResponse.json(
//       { success: false, error: "Error creating material" },
//       { status: 500 }
//     );
//   }
// }

// export async function PUT(request: Request) {
//   try {
//     const formData = await request.formData();
//     const id_material = formData.get("id_material") as string;
//     const titulo = formData.get("titulo") as string;
//     const descripcion = formData.get("descripcion") as string;
//     const enlace = formData.get("enlace") as string;

//     if (!id_material || !titulo || !descripcion) {
//       return NextResponse.json(
//         { success: false, error: "Faltan campos requeridos" },
//         { status: 400 }
//       );
//     }

//     db.exec("BEGIN TRANSACTION");

//     try {
//       const updateMaterial = db.prepare(`
//         UPDATE Material_educativo
//         SET titulo = ?, descripcion = ?, enlace = ?
//         WHERE id_material = ?
//       `);
//       updateMaterial.run(titulo, descripcion, enlace, id_material);

//       // Process multiple files
//       const files = Object.keys(Object.fromEntries(formData))
//         .filter((key) => key.startsWith("archivo-"))
//         .map((key) => formData.get(key) as File);

//       if (files.length > 0) {
//         // Delete existing files only if new files are being uploaded
//         const deleteArchivo = db.prepare(`
//           DELETE FROM Material_archivo WHERE id_material = ?
//         `);
//         deleteArchivo.run(id_material);

//         // Insert new files
//         for (const file of files) {
//           const arrayBuffer = await file.arrayBuffer();
//           const buffer = Buffer.from(arrayBuffer);
//           const extension = file.name.split(".").pop();
//           const id_material_archivo = `${id_material}-${Date.now()}-${Math.random()
//             .toString(36)
//             .substr(2, 9)}`;

//           const insertArchivo = db.prepare(`
//             INSERT INTO Material_archivo (id_material_archivo, id_material, id_curso, id_asignatura, titulo, archivo, extension)
//             VALUES (?, ?, ?, ?, ?, ?, ?)
//           `);
//           insertArchivo.run(
//             id_material_archivo,
//             id_material,
//             formData.get("cursoId"),
//             formData.get("id_asignatura"),
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
//     console.error("Error updating material:", error);
//     return NextResponse.json(
//       { success: false, error: "Error updating material" },
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
//         { success: false, error: "Falta el ID del material" },
//         { status: 400 }
//       );
//     }

//     db.exec("BEGIN TRANSACTION");

//     try {
//       const deleteArchivos = db.prepare(`
//         DELETE FROM Material_archivo WHERE id_material = ?
//       `);
//       deleteArchivos.run(id);

//       const deleteMaterial = db.prepare(`
//         DELETE FROM Material_educativo WHERE id_material = ?
//       `);
//       deleteMaterial.run(id);

//       db.exec("COMMIT");
//       return NextResponse.json({ success: true });
//     } catch (error) {
//       db.exec("ROLLBACK");
//       throw error;
//     }
//   } catch (error) {
//     console.error("Error deleting material:", error);
//     return NextResponse.json(
//       { success: false, error: "Error deleting material" },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse, NextRequest } from "next/server";
import { Connection, Request, TYPES } from "tedious";
import config from "@/app/api/dbConfig";
import { randomUUID } from "crypto";

interface MaterialArchivo {
  id_material_archivo: string;
  titulo: string;
  extension: string;
}

interface Material {
  id_material: string;
  id_curso: string;
  id_asignatura: string;
  titulo: string;
  descripcion: string;
  fecha: string;
  enlace: string | null;
  archivos: MaterialArchivo[];
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

        // First get all materials
        const materialsQuery = `
          SELECT 
            id_material, id_curso, id_asignatura, titulo, descripcion, fecha, enlace
          FROM Material_educativo
          WHERE id_asignatura = @asignaturaId AND id_curso = @cursoId
        `;

        const materials = await executeSQL(connection, materialsQuery, [
          { name: "asignaturaId", type: TYPES.NVarChar, value: asignaturaId },
          { name: "cursoId", type: TYPES.NVarChar, value: cursoId },
        ]);

        // For each material, get its files
        const materialesWithFiles: Material[] = [];

        for (const material of materials) {
          const filesQuery = `
            SELECT id_material_archivo, titulo, extension
            FROM Material_archivo
            WHERE id_material = @materialId AND id_curso = @cursoId AND id_asignatura = @asignaturaId
          `;

          const files = await executeSQL(connection, filesQuery, [
            {
              name: "materialId",
              type: TYPES.NVarChar,
              value: material.id_material,
            },
            { name: "cursoId", type: TYPES.NVarChar, value: cursoId },
            { name: "asignaturaId", type: TYPES.NVarChar, value: asignaturaId },
          ]);

          materialesWithFiles.push({
            ...material,
            archivos: files as MaterialArchivo[],
          });
        }

        connection.close();
        return resolve(
          NextResponse.json({ success: true, materiales: materialesWithFiles })
        );
      } catch (error) {
        console.error("Error fetching materials:", error);
        connection.close();
        return resolve(
          NextResponse.json(
            { success: false, error: "Error fetching materials" },
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
        const enlace = formData.get("enlace") as string;

        if (!titulo || !descripcion || !id_asignatura || !cursoId) {
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
          const id_material = `${id_asignatura}-${Date.now()}`;
          const fecha = new Date().toISOString().split("T")[0];

          // Insert material
          await executeSQLStatement(
            connection,
            `INSERT INTO Material_educativo (id_material, id_curso, id_asignatura, titulo, descripcion, fecha, enlace)
             VALUES (@id_material, @cursoId, @id_asignatura, @titulo, @descripcion, @fecha, @enlace)`,
            [
              { name: "id_material", type: TYPES.NVarChar, value: id_material },
              { name: "cursoId", type: TYPES.NVarChar, value: cursoId },
              {
                name: "id_asignatura",
                type: TYPES.NVarChar,
                value: id_asignatura,
              },
              { name: "titulo", type: TYPES.NVarChar, value: titulo },
              { name: "descripcion", type: TYPES.NVarChar, value: descripcion },
              { name: "fecha", type: TYPES.NVarChar, value: fecha },
              { name: "enlace", type: TYPES.NVarChar, value: enlace || null },
            ]
          );

          // Process multiple files
          const files = Object.keys(Object.fromEntries(formData))
            .filter((key) => key.startsWith("archivo-"))
            .map((key) => formData.get(key) as File);

          for (const file of files) {
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const extension = file.name.split(".").pop() || "";
            const id_material_archivo = randomUUID();

            await executeSQLStatement(
              connection,
              `INSERT INTO Material_archivo (id_material_archivo, id_material, id_curso, id_asignatura, titulo, archivo, extension)
               VALUES (@id_material_archivo, @id_material, @cursoId, @id_asignatura, @titulo, @archivo, @extension)`,
              [
                {
                  name: "id_material_archivo",
                  type: TYPES.NVarChar,
                  value: id_material_archivo,
                },
                {
                  name: "id_material",
                  type: TYPES.NVarChar,
                  value: id_material,
                },
                { name: "cursoId", type: TYPES.NVarChar, value: cursoId },
                {
                  name: "id_asignatura",
                  type: TYPES.NVarChar,
                  value: id_asignatura,
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
        console.error("Error creating material:", error);
        connection.close();
        return resolve(
          NextResponse.json(
            { success: false, error: "Error creating material" },
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
        const id_material = formData.get("id_material") as string;
        const titulo = formData.get("titulo") as string;
        const descripcion = formData.get("descripcion") as string;
        const enlace = formData.get("enlace") as string;
        const cursoId = formData.get("cursoId") as string;
        const id_asignatura = formData.get("id_asignatura") as string;

        if (!id_material || !titulo || !descripcion) {
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
          // Update material
          await executeSQLStatement(
            connection,
            `UPDATE Material_educativo
             SET titulo = @titulo, descripcion = @descripcion, enlace = @enlace
             WHERE id_material = @id_material`,
            [
              { name: "titulo", type: TYPES.NVarChar, value: titulo },
              { name: "descripcion", type: TYPES.NVarChar, value: descripcion },
              { name: "enlace", type: TYPES.NVarChar, value: enlace || null },
              { name: "id_material", type: TYPES.NVarChar, value: id_material },
            ]
          );

          // Process multiple files
          const files = Object.keys(Object.fromEntries(formData))
            .filter((key) => key.startsWith("archivo-"))
            .map((key) => formData.get(key) as File);

          if (files.length > 0) {
            // Delete existing files
            await executeSQLStatement(
              connection,
              `DELETE FROM Material_archivo WHERE id_material = @id_material`,
              [
                {
                  name: "id_material",
                  type: TYPES.NVarChar,
                  value: id_material,
                },
              ]
            );

            // Insert new files
            for (const file of files) {
              const arrayBuffer = await file.arrayBuffer();
              const buffer = Buffer.from(arrayBuffer);
              const extension = file.name.split(".").pop() || "";
              const id_material_archivo = randomUUID();

              await executeSQLStatement(
                connection,
                `INSERT INTO Material_archivo (id_material_archivo, id_material, id_curso, id_asignatura, titulo, archivo, extension)
                 VALUES (@id_material_archivo, @id_material, @cursoId, @id_asignatura, @titulo, @archivo, @extension)`,
                [
                  {
                    name: "id_material_archivo",
                    type: TYPES.NVarChar,
                    value: id_material_archivo,
                  },
                  {
                    name: "id_material",
                    type: TYPES.NVarChar,
                    value: id_material,
                  },
                  { name: "cursoId", type: TYPES.NVarChar, value: cursoId },
                  {
                    name: "id_asignatura",
                    type: TYPES.NVarChar,
                    value: id_asignatura,
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
        console.error("Error updating material:", error);
        connection.close();
        return resolve(
          NextResponse.json(
            { success: false, error: "Error updating material" },
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
              { success: false, error: "Falta el ID del material" },
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
            `DELETE FROM Material_archivo WHERE id_material = @id`,
            [{ name: "id", type: TYPES.NVarChar, value: id }]
          );

          // Delete material
          await executeSQLStatement(
            connection,
            `DELETE FROM Material_educativo WHERE id_material = @id`,
            [{ name: "id", type: TYPES.NVarChar, value: id }]
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
        console.error("Error deleting material:", error);
        connection.close();
        return resolve(
          NextResponse.json(
            { success: false, error: "Error deleting material" },
            { status: 500 }
          )
        );
      }
    });

    connection.connect();
  });
}
