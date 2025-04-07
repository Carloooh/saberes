import { NextResponse, NextRequest } from "next/server";
import { Connection, Request, TYPES } from "tedious";
import config from "@/app/api/dbConfig";

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
        const { identifier, code } = await request.json();

        if (!identifier || !code) {
          connection.close();
          return resolve(
            NextResponse.json(
              { success: false, error: "Identificador y código requeridos" },
              { status: 400 }
            )
          );
        }

        // Get user details with verification code
        const userQuery = `
          SELECT id_user, codigo_temporal, codigo_temporal_expira 
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

        // Check if code exists
        if (!user.codigo_temporal) {
          connection.close();
          return resolve(
            NextResponse.json(
              { success: false, error: "No hay código de verificación activo" },
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
              { success: false, error: "El código ha expirado. Solicita uno nuevo." },
              { status: 400 }
            )
          );
        }

        // Check if code matches
        if (user.codigo_temporal !== code) {
          connection.close();
          return resolve(
            NextResponse.json(
              { success: false, error: "Código de verificación incorrecto" },
              { status: 400 }
            )
          );
        }

        connection.close();
        return resolve(
          NextResponse.json({
            success: true,
            message: "Código verificado correctamente"
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