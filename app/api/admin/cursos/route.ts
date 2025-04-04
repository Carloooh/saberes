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

// GET: Obtener todos los cursos con sus asignaturas
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
        // Get all courses
        const coursesQuery = `
          SELECT 
            c.id_curso,
            c.nombre_curso
          FROM Curso c
          ORDER BY c.nombre_curso
        `;

        const cursos = await executeSQL(connection, coursesQuery);

        // For each course, get its subjects
        const result = [];
        for (const curso of cursos) {
          const subjectsQuery = `
            SELECT 
              a.id_asignatura,
              a.nombre_asignatura
            FROM Asignaturas as_link
            JOIN Asignatura a ON as_link.id_asignatura = a.id_asignatura
            WHERE as_link.id_curso = @id_curso
          `;

          const asignaturas = await executeSQL(connection, subjectsQuery, [
            { name: "id_curso", type: TYPES.NVarChar, value: curso.id_curso },
          ]);

          result.push({
            id_curso: curso.id_curso,
            nombre_curso: curso.nombre_curso,
            asignaturas: asignaturas,
          });
        }

        // Get all available subjects
        const allAsignaturasQuery = `
          SELECT * FROM Asignatura ORDER BY nombre_asignatura
        `;

        const allAsignaturas = await executeSQL(
          connection,
          allAsignaturasQuery
        );

        connection.close();
        resolve(
          NextResponse.json({
            success: true,
            data: result,
            asignaturas: allAsignaturas,
          })
        );
      } catch (error) {
        console.error("Error al obtener los cursos:", error);
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

// POST: Crear nuevo curso
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
        const { nombre_curso, asignaturas } = await req.json();

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
          // Get max id_curso
          const maxIdQuery = `
            SELECT MAX(CAST(id_curso AS INT)) as maxId FROM Curso
          `;

          const maxIdResult = await executeSQL(connection, maxIdQuery);
          const maxId = maxIdResult.length > 0 ? maxIdResult[0].maxId || 0 : 0;
          const newId = (maxId + 1).toString();

          // Insert new course
          await executeSQLStatement(
            connection,
            `INSERT INTO Curso (id_curso, nombre_curso) VALUES (@id_curso, @nombre_curso)`,
            [
              { name: "id_curso", type: TYPES.NVarChar, value: newId },
              {
                name: "nombre_curso",
                type: TYPES.NVarChar,
                value: nombre_curso,
              },
            ]
          );

          // Insert course-subject relationships
          for (const asignaturaId of asignaturas) {
            await executeSQLStatement(
              connection,
              `INSERT INTO Asignaturas (id_curso, id_asignatura) VALUES (@id_curso, @id_asignatura)`,
              [
                { name: "id_curso", type: TYPES.NVarChar, value: newId },
                {
                  name: "id_asignatura",
                  type: TYPES.NVarChar,
                  value: asignaturaId,
                },
              ]
            );
          }

          // Get all administrators
          const adminsQuery = `
            SELECT id_user FROM Usuario WHERE tipo_usuario = 'Administrador'
          `;

          const admins = await executeSQL(connection, adminsQuery);

          // Insert admin links
          for (const admin of admins) {
            for (const asignaturaId of asignaturas) {
              await executeSQLStatement(
                connection,
                `INSERT INTO CursosAsignaturasLink (id_cursosasignaturaslink, id_user, id_curso, id_asignatura)
                 VALUES (@id, @id_user, @id_curso, @id_asignatura)`,
                [
                  { name: "id", type: TYPES.NVarChar, value: randomUUID() },
                  {
                    name: "id_user",
                    type: TYPES.NVarChar,
                    value: admin.id_user,
                  },
                  { name: "id_curso", type: TYPES.NVarChar, value: newId },
                  {
                    name: "id_asignatura",
                    type: TYPES.NVarChar,
                    value: asignaturaId,
                  },
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
          resolve(
            NextResponse.json({ success: true, id: newId }, { status: 201 })
          );
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
        console.error("Error al crear el curso:", error);
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

// PUT: Actualizar curso
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
        const { id_curso, nombre_curso, asignaturas } = await req.json();

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
          // Update course name
          await executeSQLStatement(
            connection,
            `UPDATE Curso SET nombre_curso = @nombre_curso WHERE id_curso = @id_curso`,
            [
              {
                name: "nombre_curso",
                type: TYPES.NVarChar,
                value: nombre_curso,
              },
              { name: "id_curso", type: TYPES.NVarChar, value: id_curso },
            ]
          );

          // Delete existing course-subject relationships
          await executeSQLStatement(
            connection,
            `DELETE FROM Asignaturas WHERE id_curso = @id_curso`,
            [{ name: "id_curso", type: TYPES.NVarChar, value: id_curso }]
          );

          // Insert new course-subject relationships
          for (const asignaturaId of asignaturas) {
            await executeSQLStatement(
              connection,
              `INSERT INTO Asignaturas (id_curso, id_asignatura) VALUES (@id_curso, @id_asignatura)`,
              [
                { name: "id_curso", type: TYPES.NVarChar, value: id_curso },
                {
                  name: "id_asignatura",
                  type: TYPES.NVarChar,
                  value: asignaturaId,
                },
              ]
            );
          }

          // Delete existing admin links
          await executeSQLStatement(
            connection,
            `DELETE FROM CursosAsignaturasLink 
             WHERE id_curso = @id_curso AND id_user IN (
               SELECT id_user FROM Usuario WHERE tipo_usuario = 'Administrador'
             )`,
            [{ name: "id_curso", type: TYPES.NVarChar, value: id_curso }]
          );

          // Get all administrators
          const adminsQuery = `
            SELECT id_user FROM Usuario WHERE tipo_usuario = 'Administrador'
          `;

          const admins = await executeSQL(connection, adminsQuery);

          // Insert new admin links
          for (const admin of admins) {
            for (const asignaturaId of asignaturas) {
              await executeSQLStatement(
                connection,
                `INSERT INTO CursosAsignaturasLink (id_cursosasignaturaslink, id_user, id_curso, id_asignatura)
                 VALUES (@id, @id_user, @id_curso, @id_asignatura)`,
                [
                  { name: "id", type: TYPES.NVarChar, value: randomUUID() },
                  {
                    name: "id_user",
                    type: TYPES.NVarChar,
                    value: admin.id_user,
                  },
                  { name: "id_curso", type: TYPES.NVarChar, value: id_curso },
                  {
                    name: "id_asignatura",
                    type: TYPES.NVarChar,
                    value: asignaturaId,
                  },
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
        console.error("Error al actualizar el curso:", error);
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

// DELETE: Eliminar curso
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
        const { id_curso } = await req.json();

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
          // Delete associated records in CursosAsignaturasLink
          await executeSQLStatement(
            connection,
            `DELETE FROM CursosAsignaturasLink WHERE id_curso = @id_curso`,
            [{ name: "id_curso", type: TYPES.NVarChar, value: id_curso }]
          );

          // Delete associated records in Asignaturas
          await executeSQLStatement(
            connection,
            `DELETE FROM Asignaturas WHERE id_curso = @id_curso`,
            [{ name: "id_curso", type: TYPES.NVarChar, value: id_curso }]
          );

          // Delete the course itself
          await executeSQLStatement(
            connection,
            `DELETE FROM Curso WHERE id_curso = @id_curso`,
            [{ name: "id_curso", type: TYPES.NVarChar, value: id_curso }]
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
        console.error("Error al eliminar el curso:", error);
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
