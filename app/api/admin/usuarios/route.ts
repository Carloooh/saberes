import { NextResponse, NextRequest } from "next/server";
import { Connection, Request, TYPES } from "tedious";
import config from "@/app/api/dbConfig";
import { randomUUID } from "crypto";
import {
  sendAccountStatusNotification,
  sendAccountDeletionNotification,
  sendCourseChangeNotification,
} from "@/app/api/perfil/email";

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
        const query = `
          SELECT 
            u.rut_usuario,
            u.nombres,
            u.apellidos,
            u.tipo_usuario,
            u.estado,
            u.email,
            CASE 
              WHEN u.tipo_usuario = 'Estudiante' THEN 
                (SELECT TOP 1 c.nombre_curso 
                 FROM CursosAsignaturasLink cal
                 JOIN Curso c ON c.id_curso = cal.id_curso
                 WHERE cal.id_user = u.id_user)
              ELSE NULL
            END as curso_actual
          FROM Usuario u
          ORDER BY u.apellidos, u.nombres
        `;

        const usuarios = await executeSQL(connection, query);
        connection.close();
        resolve(NextResponse.json({ success: true, data: usuarios }));
      } catch (error) {
        console.error("Error fetching users:", error);
        connection.close();
        resolve(
          NextResponse.json(
            { success: false, error: "Error al obtener usuarios" },
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
        const data = await request.json();
        const { rut_usuario, estado, id_curso } = data;

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
          // First get the id_user from rut_usuario
          const userResults = await executeSQL(
            connection,
            "SELECT id_user, nombres, apellidos, email FROM Usuario WHERE rut_usuario = @rut",
            [{ name: "rut", type: TYPES.NVarChar, value: rut_usuario }]
          );

          if (userResults.length === 0) {
            throw new Error("Usuario no encontrado");
          }

          const id_user = userResults[0].id_user;
          const userEmail = userResults[0].email;
          const userName = `${userResults[0].nombres} ${userResults[0].apellidos}`;

          if (estado) {
            // Update user status
            await executeSQLStatement(
              connection,
              `UPDATE Usuario SET estado = @estado WHERE rut_usuario = @rut`,
              [
                { name: "estado", type: TYPES.NVarChar, value: estado },
                { name: "rut", type: TYPES.NVarChar, value: rut_usuario },
              ]
            );
            try {
              await sendAccountStatusNotification(userEmail, userName, estado);
            } catch (emailError) {
              console.error(
                "Error sending status notification email:",
                emailError
              );
            }
          }

          if (id_curso) {
            // Delete related records first
            const deleteQueries = [
              "DELETE FROM Calificaciones WHERE id_user = @id_user",
              "DELETE FROM Asistencia WHERE id_user = @id_user",
              "DELETE FROM EntregaTarea WHERE id_user = @id_user",
              "DELETE FROM CursosAsignaturasLink WHERE id_user = @id_user",
            ];

            for (const query of deleteQueries) {
              await executeSQLStatement(connection, query, [
                { name: "id_user", type: TYPES.NVarChar, value: id_user },
              ]);
            }

            // Insert new course assignment
            await executeSQLStatement(
              connection,
              `INSERT INTO CursosAsignaturasLink (id_cursosasignaturaslink, id_user, id_curso, id_asignatura)
               VALUES (@id, @id_user, @id_curso, NULL)`,
              [
                { name: "id", type: TYPES.NVarChar, value: randomUUID() },
                { name: "id_user", type: TYPES.NVarChar, value: id_user },
                { name: "id_curso", type: TYPES.NVarChar, value: id_curso },
              ]
            );
            const courseResults = await executeSQL(
              connection,
              "SELECT nombre_curso FROM Curso WHERE id_curso = @id_curso",
              [{ name: "id_curso", type: TYPES.NVarChar, value: id_curso }]
            );

            const courseName =
              courseResults.length > 0
                ? courseResults[0].nombre_curso
                : "Nuevo curso";
            try {
              await sendCourseChangeNotification(
                userEmail,
                userName,
                courseName
              );
            } catch (emailError) {
              console.error("Error sending course change email:", emailError);
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
        console.error("Error updating user:", error);
        connection.close();
        resolve(
          NextResponse.json(
            { success: false, error: "Error al actualizar usuario" },
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
        const rut = searchParams.get("rut");

        if (!rut) {
          connection.close();
          return resolve(
            NextResponse.json(
              { success: false, error: "RUT no proporcionado" },
              { status: 400 }
            )
          );
        }

        // Get user details before deletion for email notification
        const userResults = await executeSQL(
          connection,
          "SELECT id_user, nombres, apellidos, email FROM Usuario WHERE rut_usuario = @rut",
          [{ name: "rut", type: TYPES.NVarChar, value: rut }]
        );

        if (userResults.length === 0) {
          connection.close();
          return resolve(
            NextResponse.json(
              { success: false, error: "Usuario no encontrado" },
              { status: 404 }
            )
          );
        }

        const id_user = userResults[0].id_user;
        const userEmail = userResults[0].email;
        const userName = `${userResults[0].nombres} ${userResults[0].apellidos}`;

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
          const deleteQueries = [
            "DELETE FROM Calificaciones WHERE id_user = @id_user",
            "DELETE FROM Asistencia WHERE id_user = @id_user",
            "DELETE FROM EntregaTarea WHERE id_user = @id_user",
            "DELETE FROM CursosAsignaturasLink WHERE id_user = @id_user",
            "DELETE FROM Matricula WHERE id_user = @id_user",
            "DELETE FROM Info_apoderado WHERE id_user = @id_user",
            "DELETE FROM Info_medica WHERE id_user = @id_user",
            "DELETE FROM contacto_emergencia WHERE id_user = @id_user",
            "DELETE FROM Consentimiento WHERE id_user = @id_user",
            "DELETE FROM Usuario WHERE id_user = @id_user",
          ];

          for (const query of deleteQueries) {
            await executeSQLStatement(connection, query, [
              { name: "id_user", type: TYPES.NVarChar, value: id_user },
            ]);
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

          // Send email notification about account deletion
          try {
            await sendAccountDeletionNotification(userEmail, userName);
          } catch (emailError) {
            console.error("Error sending account deletion email:", emailError);
            // Continue with the process even if email sending fails
          }

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
        console.error("Error deleting user:", error);
        connection.close();
        resolve(
          NextResponse.json(
            { success: false, error: "Error al eliminar usuario" },
            { status: 500 }
          )
        );
      }
    });

    connection.connect();
  });
}
