import { NextResponse, NextRequest } from "next/server";
import { Connection, Request, TYPES } from "tedious";
import config from "@/app/api/dbConfig";
import { sendGeneralMessage } from "@/app/api/perfil/email";

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
        const { subject, message, userIds } = await request.json();

        if (!subject || !message || !userIds || userIds.length === 0) {
          connection.close();
          return resolve(
            NextResponse.json(
              {
                success: false,
                error: "Faltan datos requeridos (asunto, mensaje o usuarios seleccionados)",
              },
              { status: 400 }
            )
          );
        }

        // Get user details for the selected IDs
        const placeholders = userIds.map((_, i) => `@id${i}`).join(", ");
        const query = `
          SELECT id_user, nombres, apellidos, email
          FROM Usuario
          WHERE id_user IN (${placeholders})
          AND email IS NOT NULL
          AND email <> ''
        `;

        // Create parameters for the query
        const parameters = userIds.map((id, index) => ({
          name: `id${index}`,
          type: TYPES.NVarChar,
          value: id,
        }));

        const users = await executeSQL(connection, query, parameters);

        if (users.length === 0) {
          connection.close();
          return resolve(
            NextResponse.json(
              {
                success: false,
                error: "No se encontraron usuarios válidos entre los seleccionados",
              },
              { status: 404 }
            )
          );
        }

        let enviados = 0;
        const errores: string[] = [];

        // Process users in batches for better performance
        const batchSize = 10; // Process 10 users at a time
        const batches = [];

        for (let i = 0; i < users.length; i += batchSize) {
          batches.push(users.slice(i, i + batchSize));
        }

        // Process each batch
        for (const batch of batches) {
          // Create an array of promises for each user in the batch
          const batchPromises = batch.map(async (user) => {
            try {
              // Send general message
              await sendGeneralMessage(
                user.email,
                `${user.nombres} ${user.apellidos}`,
                subject,
                message
              );

              enviados++;
              return { success: true, user };
            } catch (error: any) {
              console.error(`Error enviando mensaje a ${user.id_user}:`, error);
              errores.push(
                `${user.email}: ${error.message || "Error desconocido"}`
              );
              return { success: false, error, user };
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
            total: users.length,
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