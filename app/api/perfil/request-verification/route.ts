import { NextResponse, NextRequest } from "next/server";
import { Connection, Request, TYPES } from "tedious";
import config from "@/app/api/dbConfig";
import { v4 as uuidv4 } from "uuid";
import { sendSelfVerificationCode } from "@/app/api/perfil/email";

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
        const { email } = await request.json();

        if (!email) {
          connection.close();
          return resolve(
            NextResponse.json(
              { success: false, error: "Correo electrónico requerido" },
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

        // Get user details
        const userQuery = `
          SELECT id_user, email, nombres, apellidos FROM Usuario 
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

        // Generate verification code (6 digits)
        const verificationCode = Math.floor(
          100000 + Math.random() * 900000
        ).toString();

        // Set expiration time (15 minutes from now)
        const expirationTime = new Date();
        expirationTime.setMinutes(expirationTime.getMinutes() + 15);

        // Store verification code in database
        const updateCodeQuery = `
          UPDATE Usuario
          SET codigo_temporal = @code,
              codigo_temporal_expira = @expiration,
              codigo_temporal_target = @targetEmail
          WHERE id_user = @userId
        `;

        await executeSQLUpdate(connection, updateCodeQuery, [
          { name: "code", type: TYPES.NVarChar, value: verificationCode },
          { name: "expiration", type: TYPES.DateTime, value: expirationTime },
          { name: "targetEmail", type: TYPES.NVarChar, value: email },
          { name: "userId", type: TYPES.NVarChar, value: user.id_user },
        ]);

        // Send verification code to user's current email
        await sendSelfVerificationCode(
          user.email,
          verificationCode,
          `${user.nombres} ${user.apellidos}`
        );

        connection.close();
        return resolve(
          NextResponse.json({
            success: true,
            message: "Código de verificación enviado",
          })
        );
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
