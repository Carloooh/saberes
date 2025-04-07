import { NextResponse, NextRequest } from "next/server";
import { Connection, Request, TYPES } from "tedious";
import config from "@/app/api/dbConfig";
import bcrypt from "bcrypt";
import { sendSelfPasswordResetNotification } from "../email";

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
        const { email, password, verificationCode } = await request.json();

        if (!verificationCode) {
          connection.close();
          return resolve(
            NextResponse.json(
              { success: false, error: "Código de verificación requerido" },
              { status: 400 }
            )
          );
        }

        // Get user info from cookies
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

        // Get user details with verification code
        const userQuery = `
          SELECT id_user, email, codigo_temporal, codigo_temporal_expira, codigo_temporal_target , nombres, apellidos
          FROM Usuario 
          WHERE rut_usuario = @rutUsuario
        `;

        const userResults = await executeSQL(connection, userQuery, [
          {
            name: "rutUsuario",
            type: TYPES.NVarChar,
            value: userSession.rut_usuario,
          },
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

        // Verify code
        if (user.codigo_temporal !== verificationCode) {
          connection.close();
          return resolve(
            NextResponse.json(
              { success: false, error: "Código de verificación inválido" },
              { status: 400 }
            )
          );
        }

        // Check if code is expired
        const now = new Date();
        const expirationTime = new Date(user.codigo_temporal_expira);
        if (now > expirationTime) {
          connection.close();
          return resolve(
            NextResponse.json(
              { success: false, error: "Código de verificación expirado" },
              { status: 400 }
            )
          );
        }

        // Verify target email matches
        if (user.codigo_temporal_target !== email) {
          connection.close();
          return resolve(
            NextResponse.json(
              {
                success: false,
                error: "El correo electrónico no coincide con el solicitado",
              },
              { status: 400 }
            )
          );
        }

        try {
          // Update user data
          if (email && password) {
            // Update both email and password
            const hashedPassword = await bcrypt.hash(password, 10);
            const updateStmt = `
              UPDATE Usuario
              SET email = @email, clave = @hashedPassword,
                  codigo_temporal = NULL,
                  codigo_temporal_expira = NULL,
                  codigo_temporal_target = NULL
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
            console.log(
              `Notificación de actualización de credenciales enviada a ${email}`
            );
          } else if (email) {
            // Update only email
            const updateStmt = `
                UPDATE Usuario
                SET email = @email,
                    codigo_temporal = NULL,
                    codigo_temporal_expira = NULL,
                    codigo_temporal_target = NULL
                WHERE id_user = @userId
              `;

            await executeSQLUpdate(connection, updateStmt, [
              { name: "email", type: TYPES.NVarChar, value: email },
              { name: "userId", type: TYPES.NVarChar, value: user.id_user },
            ]);
            await sendSelfPasswordResetNotification(
              email,
              `${user.nombres} ${user.apellidos}`,
              true,
              false
            );
          } else if (password) {
            // Update only password
            const hashedPassword = await bcrypt.hash(password, 10);
            const updateStmt = `
                UPDATE Usuario
                SET clave = @hashedPassword,
                    codigo_temporal = NULL,
                    codigo_temporal_expira = NULL,
                    codigo_temporal_target = NULL
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
            await sendSelfPasswordResetNotification(
              user.email,
              `${user.nombres} ${user.apellidos}`,
              false,
              true
            );
          }

          connection.close();
          return resolve(
            NextResponse.json({
              success: true,
              message: "Información actualizada correctamente",
            })
          );
        } catch (error) {
          console.error("Error al actualizar la información:", error);
          connection.close();
          return resolve(
            NextResponse.json(
              { success: false, error: "Error al actualizar la información" },
              { status: 500 }
            )
          );
        }
      } catch (error) {
        console.error("Error al procesar la solicitud:", error);
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
