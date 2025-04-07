import { NextResponse, NextRequest } from "next/server";
import { Connection, Request, TYPES } from "tedious";
import config from "@/app/api/dbConfig";
import { sendWelcomeEmailTeacher } from "@/app/api/perfil/email";
import bcrypt from "bcrypt";

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

// Function to generate a random password
function generatePassword(length: number): string {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const connection = new Connection(config);

  return new Promise<NextResponse>((resolve) => {
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
        // Get all active teachers with email
        const teachersQuery = `
          SELECT id_user, rut_usuario, nombres, apellidos, email
          FROM Usuario
          WHERE tipo_usuario = 'Docente'
          AND estado = 'Activa'
          AND email IS NOT NULL
          AND email <> ''
        `;

        const teachers = await executeSQL(connection, teachersQuery);

        if (teachers.length === 0) {
          connection.close();
          return resolve(
            NextResponse.json(
              {
                success: false,
                error: "No se encontraron docentes activos con email",
              },
              { status: 404 }
            )
          );
        }

        let enviados = 0;
        const errores: string[] = [];

        // Process teachers in batches for better performance
        const batchSize = 10; // Process 10 teachers at a time
        const batches = [];

        for (let i = 0; i < teachers.length; i += batchSize) {
          batches.push(teachers.slice(i, i + batchSize));
        }

        // Process each batch
        for (const batch of batches) {
          // Create an array of promises for each teacher in the batch
          const batchPromises = batch.map(async (teacher) => {
            try {
              // Generate new password
              const newPassword = generatePassword(10);
              const hashedPassword = await bcrypt.hash(newPassword, 10);

              // Update password in database
              const updatePasswordQuery = `
                UPDATE Usuario
                SET clave = @hashedPassword
                WHERE id_user = @userId
              `;

              await executeSQLUpdate(connection, updatePasswordQuery, [
                {
                  name: "hashedPassword",
                  type: TYPES.NVarChar,
                  value: hashedPassword,
                },
                {
                  name: "userId",
                  type: TYPES.NVarChar,
                  value: teacher.id_user,
                },
              ]);

              // Send welcome email with credentials
              await sendWelcomeEmailTeacher(
                teacher.email,
                `${teacher.nombres} ${teacher.apellidos}`,
                teacher.rut_usuario,
                newPassword
              );

              enviados++;
              return { success: true, teacher };
            } catch (error: any) {
              console.error(
                `Error procesando docente ${teacher.id_user}:`,
                error
              );
              errores.push(
                `${teacher.rut_usuario}: ${
                  error.message || "Error desconocido"
                }`
              );
              return { success: false, error, teacher };
            }
          });

          // Wait for all operations in this batch to complete before moving to the next batch
          await Promise.all(batchPromises);
        }

        connection.close();
        return resolve(
          NextResponse.json({
            success: true,
            enviados,
            total: teachers.length,
            errores: errores.length > 0 ? errores : null,
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
