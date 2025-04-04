import { NextResponse, NextRequest } from "next/server";
import { Connection, Request, TYPES } from "tedious";
import config from "@/app/api/dbConfig";
import { randomUUID } from "crypto";
import { sendTeacherAssignmentNotification } from "@/app/api/perfil/email";

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
        const rut = searchParams.get("rut");

        if (rut) {
          // First get the id_user from rut_usuario
          const userResults = await executeSQL(
            connection,
            "SELECT id_user FROM Usuario WHERE rut_usuario = @rut",
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

          // Get specific teacher's courses and subjects
          const query = `
            SELECT 
              cal.id_curso,
              cal.id_asignatura
            FROM CursosAsignaturasLink cal
            WHERE cal.id_user = @id_user
          `;

          const assignments = await executeSQL(connection, query, [
            { name: "id_user", type: TYPES.NVarChar, value: id_user },
          ]);

          // Transform into the expected format
          const teacherCourses: { [key: string]: string[] } = {};
          assignments.forEach((assignment) => {
            if (assignment.id_asignatura) {
              if (!teacherCourses[assignment.id_curso]) {
                teacherCourses[assignment.id_curso] = [];
              }
              teacherCourses[assignment.id_curso].push(
                assignment.id_asignatura
              );
            }
          });

          connection.close();
          return resolve(
            NextResponse.json({ success: true, data: teacherCourses })
          );
        }

        // Get all courses if no rut provided
        const query = `
          SELECT id_curso, nombre_curso 
          FROM Curso 
          ORDER BY id_curso
        `;

        const cursos = await executeSQL(connection, query);
        connection.close();
        return resolve(NextResponse.json({ success: true, data: cursos }));
      } catch (error) {
        console.error("Error fetching courses:", error);
        connection.close();
        resolve(
          NextResponse.json(
            { success: false, error: "Error al obtener cursos" },
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
        const { rut_usuario, cursosAsignaturas } = await request.json();

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

          // Delete all existing assignments and related records
          const deleteQueries = [
            "DELETE FROM Calificaciones WHERE id_evaluacion IN (SELECT id_evaluacion FROM Evaluaciones WHERE id_asignatura IN (SELECT id_asignatura FROM CursosAsignaturasLink WHERE id_user = @id_user))",
            "DELETE FROM Evaluaciones WHERE id_asignatura IN (SELECT id_asignatura FROM CursosAsignaturasLink WHERE id_user = @id_user)",
            "DELETE FROM CursosAsignaturasLink WHERE id_user = @id_user",
          ];

          for (const query of deleteQueries) {
            await executeSQLStatement(connection, query, [
              { name: "id_user", type: TYPES.NVarChar, value: id_user },
            ]);
          }

          // Prepare data for email notification
          const courseDetails = [];

          // Insert new assignments
          if (cursosAsignaturas && cursosAsignaturas.length > 0) {
            for (const curso of cursosAsignaturas) {
              // Get course name for email
              const courseResult = await executeSQL(
                connection,
                "SELECT nombre_curso FROM Curso WHERE id_curso = @id_curso",
                [{ name: "id_curso", type: TYPES.NVarChar, value: curso.cursoId }]
              );
              
              const courseName = courseResult.length > 0 ? courseResult[0].nombre_curso : curso.cursoId;
              const subjectNames = [];

              for (const asignaturaId of curso.asignaturas) {
                // Get subject name for email
                const subjectResult = await executeSQL(
                  connection,
                  "SELECT nombre_asignatura FROM Asignatura WHERE id_asignatura = @id_asignatura",
                  [{ name: "id_asignatura", type: TYPES.NVarChar, value: asignaturaId }]
                );
                
                const subjectName = subjectResult.length > 0 ? subjectResult[0].nombre_asignatura : asignaturaId;
                subjectNames.push(subjectName);

                // Insert into database
                await executeSQLStatement(
                  connection,
                  `INSERT INTO CursosAsignaturasLink (id_cursosasignaturaslink, id_user, id_curso, id_asignatura)
                   VALUES (@id, @id_user, @id_curso, @id_asignatura)`,
                  [
                    { name: "id", type: TYPES.NVarChar, value: randomUUID() },
                    { name: "id_user", type: TYPES.NVarChar, value: id_user },
                    {
                      name: "id_curso",
                      type: TYPES.NVarChar,
                      value: curso.cursoId,
                    },
                    {
                      name: "id_asignatura",
                      type: TYPES.NVarChar,
                      value: asignaturaId,
                    },
                  ]
                );
              }

              courseDetails.push({
                courseName,
                subjects: subjectNames
              });
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

          // Send email notification
          try {
            await sendTeacherAssignmentNotification(userEmail, userName, courseDetails);
          } catch (emailError) {
            console.error("Error sending teacher assignment notification:", emailError);
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
        console.error("Error updating teacher courses:", error);
        connection.close();
        resolve(
          NextResponse.json(
            { success: false, error: "Error al actualizar cursos del docente" },
            { status: 500 }
          )
        );
      }
    });

    connection.connect();
  });
}
