import { NextResponse, NextRequest } from "next/server";
import { Connection, Request, TYPES } from "tedious";
import config from "@/app/api/dbConfig";
import bcrypt from "bcrypt";
import { randomBytes } from "crypto";

// Add a new function to email.ts for welcome emails
import { sendWelcomeEmail } from "@/app/api/perfil/email";

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

// Generate a random password
function generatePassword(length = 8) {
  return randomBytes(Math.ceil(length / 2))
    .toString("hex")
    .slice(0, length);
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
        // Get all active students with email
        const studentsQuery = `
          SELECT id_user, rut_usuario, nombres, apellidos, email
          FROM Usuario
          WHERE tipo_usuario = 'Estudiante'
          AND estado = 'Activa'
          AND email IS NOT NULL
          AND email <> ''
        `;

        const students = await executeSQL(connection, studentsQuery);

        if (students.length === 0) {
          connection.close();
          return resolve(
            NextResponse.json(
              {
                success: false,
                error: "No se encontraron estudiantes activos con email",
              },
              { status: 404 }
            )
          );
        }

        let enviados = 0;
        const errores: string[] = [];

        // Process students in batches for better performance
        const batchSize = 10; // Process 10 students at a time
        const batches = [];

        for (let i = 0; i < students.length; i += batchSize) {
          batches.push(students.slice(i, i + batchSize));
        }

        // Process each batch
        for (const batch of batches) {
          // Create an array of promises for each student in the batch
          const batchPromises = batch.map(async (student) => {
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
                  value: student.id_user,
                },
              ]);

              // Send welcome email with credentials
              await sendWelcomeEmail(
                student.email,
                `${student.nombres} ${student.apellidos}`,
                student.rut_usuario,
                newPassword
              );

              enviados++;
              return { success: true, student };
            } catch (error: any) {
              console.error(
                `Error procesando estudiante ${student.id_user}:`,
                error
              );
              errores.push(
                `${student.rut_usuario}: ${
                  error.message || "Error desconocido"
                }`
              );
              return { success: false, error, student };
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
            total: students.length,
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
