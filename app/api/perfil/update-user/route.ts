// import { NextResponse, NextRequest } from "next/server";
// import { Connection, Request, TYPES } from "tedious";
// import config from "@/app/api/dbConfig";
// import bcrypt from "bcrypt";
// import { sendPasswordResetNotification } from "@/app/api/perfil/email";

// // Helper function to execute SQL queries and return results
// function executeSQL(
//   connection: Connection,
//   sql: string,
//   parameters: { name: string; type: any; value: any }[] = []
// ): Promise<any[]> {
//   return new Promise((resolve, reject) => {
//     const results: any[] = [];
//     const request = new Request(sql, (err) => {
//       if (err) {
//         return reject(err);
//       }
//       resolve(results);
//     });

//     parameters.forEach((param) => {
//       request.addParameter(param.name, param.type, param.value);
//     });

//     request.on("row", (columns: any[]) => {
//       const row: { [key: string]: any } = {};
//       columns.forEach((column) => {
//         row[column.metadata.colName] = column.value;
//       });
//       results.push(row);
//     });

//     connection.execSql(request);
//   });
// }

// // Helper function to execute SQL updates
// function executeSQLUpdate(
//   connection: Connection,
//   sql: string,
//   parameters: { name: string; type: any; value: any }[] = []
// ): Promise<void> {
//   return new Promise((resolve, reject) => {
//     const request = new Request(sql, (err) => {
//       if (err) {
//         return reject(err);
//       }
//       resolve();
//     });

//     parameters.forEach((param) => {
//       request.addParameter(param.name, param.type, param.value);
//     });

//     connection.execSql(request);
//   });
// }

// export async function POST(request: NextRequest) {
//   const connection = new Connection(config);

//   return new Promise<NextResponse>((resolve, reject) => {
//     connection.on("connect", async (err) => {
//       if (err) {
//         console.error("Error connecting to database:", err.message);
//         connection.close();
//         return resolve(
//           NextResponse.json(
//             { success: false, error: "Error al conectar a la base de datos" },
//             { status: 500 }
//           )
//         );
//       }

//       try {
//         const { targetRut, email, password } = await request.json();

//         if (!targetRut || (!email && !password)) {
//           connection.close();
//           return resolve(
//             NextResponse.json(
//               { success: false, error: "Datos incompletos" },
//               { status: 400 }
//             )
//           );
//         }

//         // Get admin info from cookies
//         const cookies = request.headers.get("cookie") || "";
//         const userSessionCookie = cookies
//           .split(";")
//           .find((c) => c.trim().startsWith("userSession="));

//         if (!userSessionCookie) {
//           connection.close();
//           return resolve(
//             NextResponse.json(
//               { success: false, error: "No se encontró la sesión del usuario" },
//               { status: 401 }
//             )
//           );
//         }

//         let userSession;
//         try {
//           userSession = JSON.parse(
//             decodeURIComponent(userSessionCookie.split("=")[1])
//           );
//         } catch (error) {
//           console.error("Error al parsear la sesión del usuario:", error);
//           connection.close();
//           return resolve(
//             NextResponse.json(
//               { success: false, error: "Sesión inválida" },
//               { status: 400 }
//             )
//           );
//         }

//         // Verify admin permissions
//         if (userSession.tipo_usuario !== "Administrador") {
//           connection.close();
//           return resolve(
//             NextResponse.json(
//               {
//                 success: false,
//                 error: "No tienes permisos para realizar esta acción",
//               },
//               { status: 403 }
//             )
//           );
//         }

//         // First get the id_user from rut_usuario
//         const userIdQuery = `
//           SELECT id_user, email, nombres, apellidos FROM Usuario WHERE rut_usuario = @targetRut
//         `;

//         const userResults = await executeSQL(connection, userIdQuery, [
//           { name: "targetRut", type: TYPES.NVarChar, value: targetRut },
//         ]);

//         if (userResults.length === 0) {
//           connection.close();
//           return resolve(
//             NextResponse.json(
//               { success: false, error: "Usuario no encontrado" },
//               { status: 404 }
//             )
//           );
//         }

//         const user = userResults[0];

//         try {
//           // Update user data
//           if (email && password) {
//             // Update both email and password
//             const hashedPassword = await bcrypt.hash(password, 10);
//             const updateStmt = `
//               UPDATE Usuario
//               SET email = @email, clave = @hashedPassword
//               WHERE id_user = @userId
//             `;

//             await executeSQLUpdate(connection, updateStmt, [
//               { name: "email", type: TYPES.NVarChar, value: email },
//               {
//                 name: "hashedPassword",
//                 type: TYPES.NVarChar,
//                 value: hashedPassword,
//               },
//               { name: "userId", type: TYPES.NVarChar, value: user.id_user },
//             ]);
//           } else if (email) {
//             // Update only email
//             const updateStmt = `
//               UPDATE Usuario
//               SET email = @email
//               WHERE id_user = @userId
//             `;

//             await executeSQLUpdate(connection, updateStmt, [
//               { name: "email", type: TYPES.NVarChar, value: email },
//               { name: "userId", type: TYPES.NVarChar, value: user.id_user },
//             ]);
//           } else if (password) {
//             // Update only password
//             const hashedPassword = await bcrypt.hash(password, 10);
//             const updateStmt = `
//               UPDATE Usuario
//               SET clave = @hashedPassword
//               WHERE id_user = @userId
//             `;

//             await executeSQLUpdate(connection, updateStmt, [
//               {
//                 name: "hashedPassword",
//                 type: TYPES.NVarChar,
//                 value: hashedPassword,
//               },
//               { name: "userId", type: TYPES.NVarChar, value: user.id_user },
//             ]);
//           }

//           // Clear verification code
//           const clearCodeStmt = `
//             UPDATE Usuario
//             SET codigo_temporal = NULL,
//                 codigo_temporal_expira = NULL,
//                 codigo_temporal_target = NULL
//             WHERE id_user = @adminId
//           `;

//           // Get admin id_user from rut_usuario
//           const adminIdQuery = `
//             SELECT id_user FROM Usuario WHERE rut_usuario = @adminRut
//           `;

//           const adminResults = await executeSQL(connection, adminIdQuery, [
//             {
//               name: "adminRut",
//               type: TYPES.NVarChar,
//               value: userSession.rut_usuario,
//             },
//           ]);

//           if (adminResults.length > 0) {
//             await executeSQLUpdate(connection, clearCodeStmt, [
//               {
//                 name: "adminId",
//                 type: TYPES.NVarChar,
//                 value: adminResults[0].id_user,
//               },
//             ]);
//           }

//           // Send notification email to user
//           if (email || password) {
//             await sendPasswordResetNotification(
//               email || user.email,
//               `${user.nombres} ${user.apellidos}`
//             );
//           }

//           connection.close();
//           return resolve(NextResponse.json({ success: true }));
//         } catch (error) {
//           console.error("Error during update:", error);
//           connection.close();
//           return resolve(
//             NextResponse.json(
//               { success: false, error: "Error en el servidor" },
//               { status: 500 }
//             )
//           );
//         }
//       } catch (error) {
//         console.error("Error al actualizar usuario:", error);
//         connection.close();
//         return resolve(
//           NextResponse.json(
//             { success: false, error: "Error en el servidor" },
//             { status: 500 }
//           )
//         );
//       }
//     });

//     connection.connect();
//   });
// }

import { NextResponse, NextRequest } from "next/server";
import { Connection, Request, TYPES } from "tedious";
import config from "@/app/api/dbConfig";
import bcrypt from "bcrypt";
import { sendPasswordResetNotification } from "@/app/api/perfil/email";

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

// Helper function to execute SQL updates
function executeSQLUpdate(
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
        const { targetRut, email, password, newRut } = await request.json();

        if (!targetRut || (!email && !password && !newRut)) {
          connection.close();
          return resolve(
            NextResponse.json(
              { success: false, error: "Datos incompletos" },
              { status: 400 }
            )
          );
        }

        // Get admin info from cookies
        const cookies = request.headers.get("cookie") || "";
        const userSessionCookie = cookies
          .split(";")
          .find((c) => c.trim().startsWith("userSession="));

        if (!userSessionCookie) {
          connection.close();
          return resolve(
            NextResponse.json(
              { success: false, error: "No se encontró la sesión del usuario" },
              { status: 401 }
            )
          );
        }

        let userSession;
        try {
          userSession = JSON.parse(
            decodeURIComponent(userSessionCookie.split("=")[1])
          );
        } catch (error) {
          console.error("Error al parsear la sesión del usuario:", error);
          connection.close();
          return resolve(
            NextResponse.json(
              { success: false, error: "Sesión inválida" },
              { status: 400 }
            )
          );
        }

        // Verify admin permissions
        if (userSession.tipo_usuario !== "Administrador") {
          connection.close();
          return resolve(
            NextResponse.json(
              {
                success: false,
                error: "No tienes permisos para realizar esta acción",
              },
              { status: 403 }
            )
          );
        }

        // First get the id_user from rut_usuario
        const userIdQuery = `
            SELECT id_user, email, nombres, apellidos FROM Usuario WHERE rut_usuario = @targetRut
          `;

        const userResults = await executeSQL(connection, userIdQuery, [
          { name: "targetRut", type: TYPES.NVarChar, value: targetRut },
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

        const user = userResults[0];

        try {
          // If newRut is provided, check if it already exists
          if (newRut) {
            const rutCheckQuery = `
                SELECT COUNT(*) as count FROM Usuario WHERE rut_usuario = @newRut
              `;

            const rutCheckResults = await executeSQL(
              connection,
              rutCheckQuery,
              [{ name: "newRut", type: TYPES.NVarChar, value: newRut }]
            );

            if (rutCheckResults[0].count > 0) {
              connection.close();
              return resolve(
                NextResponse.json(
                  {
                    success: false,
                    error: "El RUT ya está registrado en el sistema",
                  },
                  { status: 400 }
                )
              );
            }
          }

          // Update user data
          if (email && password && newRut) {
            // Update email, password and RUT
            const hashedPassword = await bcrypt.hash(password, 10);
            const updateStmt = `
                UPDATE Usuario 
                SET email = @email, clave = @hashedPassword, rut_usuario = @newRut 
                WHERE id_user = @userId
              `;

            await executeSQLUpdate(connection, updateStmt, [
              { name: "email", type: TYPES.NVarChar, value: email },
              {
                name: "hashedPassword",
                type: TYPES.NVarChar,
                value: hashedPassword,
              },
              { name: "newRut", type: TYPES.NVarChar, value: newRut },
              { name: "userId", type: TYPES.NVarChar, value: user.id_user },
            ]);
          } else if (email && newRut) {
            // Update email and RUT
            const updateStmt = `
                UPDATE Usuario 
                SET email = @email, rut_usuario = @newRut 
                WHERE id_user = @userId
              `;

            await executeSQLUpdate(connection, updateStmt, [
              { name: "email", type: TYPES.NVarChar, value: email },
              { name: "newRut", type: TYPES.NVarChar, value: newRut },
              { name: "userId", type: TYPES.NVarChar, value: user.id_user },
            ]);
          } else if (password && newRut) {
            // Update password and RUT
            const hashedPassword = await bcrypt.hash(password, 10);
            const updateStmt = `
                UPDATE Usuario 
                SET clave = @hashedPassword, rut_usuario = @newRut 
                WHERE id_user = @userId
              `;

            await executeSQLUpdate(connection, updateStmt, [
              {
                name: "hashedPassword",
                type: TYPES.NVarChar,
                value: hashedPassword,
              },
              { name: "newRut", type: TYPES.NVarChar, value: newRut },
              { name: "userId", type: TYPES.NVarChar, value: user.id_user },
            ]);
          } else if (newRut) {
            // Update only RUT
            const updateStmt = `
                UPDATE Usuario 
                SET rut_usuario = @newRut 
                WHERE id_user = @userId
              `;

            await executeSQLUpdate(connection, updateStmt, [
              { name: "newRut", type: TYPES.NVarChar, value: newRut },
              { name: "userId", type: TYPES.NVarChar, value: user.id_user },
            ]);
          } else if (email && password) {
            // Update both email and password
            const hashedPassword = await bcrypt.hash(password, 10);
            const updateStmt = `
                UPDATE Usuario 
                SET email = @email, clave = @hashedPassword 
                WHERE id_user = @userId
              `;

            await executeSQLUpdate(connection, updateStmt, [
              { name: "email", type: TYPES.NVarChar, value: email },
              {
                name: "hashedPassword",
                type: TYPES.NVarChar,
                value: hashedPassword,
              },
              { name: "userId", type: TYPES.NVarChar, value: user.id_user },
            ]);
          } else if (email) {
            // Update only email
            const updateStmt = `
                UPDATE Usuario 
                SET email = @email 
                WHERE id_user = @userId
              `;

            await executeSQLUpdate(connection, updateStmt, [
              { name: "email", type: TYPES.NVarChar, value: email },
              { name: "userId", type: TYPES.NVarChar, value: user.id_user },
            ]);
          } else if (password) {
            // Update only password
            const hashedPassword = await bcrypt.hash(password, 10);
            const updateStmt = `
                UPDATE Usuario 
                SET clave = @hashedPassword 
                WHERE id_user = @userId
              `;

            await executeSQLUpdate(connection, updateStmt, [
              {
                name: "hashedPassword",
                type: TYPES.NVarChar,
                value: hashedPassword,
              },
              { name: "userId", type: TYPES.NVarChar, value: user.id_user },
            ]);
          }

          // Clear verification code
          const clearCodeStmt = `
              UPDATE Usuario 
              SET codigo_temporal = NULL, 
                  codigo_temporal_expira = NULL,
                  codigo_temporal_target = NULL
              WHERE id_user = @adminId
            `;

          // Get admin id_user from rut_usuario
          const adminIdQuery = `
              SELECT id_user FROM Usuario WHERE rut_usuario = @adminRut
            `;

          const adminResults = await executeSQL(connection, adminIdQuery, [
            {
              name: "adminRut",
              type: TYPES.NVarChar,
              value: userSession.rut_usuario,
            },
          ]);

          if (adminResults.length > 0) {
            await executeSQLUpdate(connection, clearCodeStmt, [
              {
                name: "adminId",
                type: TYPES.NVarChar,
                value: adminResults[0].id_user,
              },
            ]);
          }

          // Send notification email to user
          if (email || password || newRut) {
            await sendPasswordResetNotification(
              email || user.email,
              `${user.nombres} ${user.apellidos}`
            );
          }

          connection.close();
          return resolve(NextResponse.json({ success: true }));
        } catch (error) {
          console.error("Error during update:", error);
          connection.close();
          return resolve(
            NextResponse.json(
              { success: false, error: "Error en el servidor" },
              { status: 500 }
            )
          );
        }
      } catch (error) {
        console.error("Error al actualizar usuario:", error);
        connection.close();
        return resolve(
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
