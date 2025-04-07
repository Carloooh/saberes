import { NextResponse, NextRequest } from "next/server";
import { Connection, Request, TYPES } from "tedious";
import config from "@/app/api/dbConfig";
import { sendPasswordResetCode } from "@/app/api/perfil/email";

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
        const { identifier } = await request.json();

        if (!identifier) {
          connection.close();
          return resolve(
            NextResponse.json(
              { success: false, error: "Identificador requerido" },
              { status: 400 }
            )
          );
        }

        // Get user details
        const userQuery = `
          SELECT id_user, email, nombres, apellidos, estado 
          FROM Usuario 
          WHERE rut_usuario = @identifier
        `;

        const userResults = await executeSQL(connection, userQuery, [
          {
            name: "identifier",
            type: TYPES.NVarChar,
            value: identifier,
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

        // Check if user account is active
        if (user.estado !== "Activa") {
          connection.close();
          return resolve(
            NextResponse.json(
              {
                success: false,
                error:
                  "Tu cuenta no está activa. Por favor, contacta al administrador.",
              },
              { status: 403 }
            )
          );
        }

        // Generate verification code (6 digits)
        const resetCode = Math.floor(
          100000 + Math.random() * 900000
        ).toString();

        // Set expiration time (15 minutes from now)
        const expirationTime = new Date();
        expirationTime.setMinutes(expirationTime.getMinutes() + 15);

        // Store reset code in database
        const updateCodeQuery = `
          UPDATE Usuario
          SET codigo_temporal = @code,
              codigo_temporal_expira = @expiration
          WHERE id_user = @userId
        `;

        await executeSQLUpdate(connection, updateCodeQuery, [
          { name: "code", type: TYPES.NVarChar, value: resetCode },
          { name: "expiration", type: TYPES.DateTime, value: expirationTime },
          { name: "userId", type: TYPES.NVarChar, value: user.id_user },
        ]);

        // Send reset code to user's email
        await sendPasswordResetCode(
          user.email,
          resetCode,
          `${user.nombres} ${user.apellidos}`
        );

        // Mask email for privacy
        const maskedEmail = user.email.replace(/(.{2})(.*)(?=@)/, "$1***");

        connection.close();
        return resolve(
          NextResponse.json({
            success: true,
            message: "Código de restablecimiento enviado",
            email: maskedEmail,
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
