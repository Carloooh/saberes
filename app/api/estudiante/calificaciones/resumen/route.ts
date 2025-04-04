import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
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

export async function GET(request: NextRequest) {
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
        const { searchParams } = new URL(request.url);
        const asignaturaId = searchParams.get("asignaturaId");

        if (!asignaturaId) {
          connection.close();
          return resolve(
            NextResponse.json(
              { success: false, error: "Falta el ID de la asignatura" },
              { status: 400 }
            )
          );
        }

        const userSessionCookie = request.cookies.get("userSession")?.value;
        if (!userSessionCookie) {
          connection.close();
          return resolve(
            NextResponse.json(
              { success: false, error: "No session found" },
              { status: 401 }
            )
          );
        }

        const userSession = JSON.parse(userSessionCookie);
        const rutUsuario = userSession.rut_usuario;

        // First get the user ID from the rut_usuario
        const getUserIdQuery = `
          SELECT id_user
          FROM Usuario
          WHERE rut_usuario = @rutUsuario
        `;

        const userResults = await executeSQL(connection, getUserIdQuery, [
          { name: "rutUsuario", type: TYPES.NVarChar, value: rutUsuario },
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

        const userId = userResults[0].id_user;

        // Now get the grades
        const query = `
          SELECT 
            e.id_evaluacion,
            e.titulo,
            e.fecha,
            c.nota
          FROM Evaluaciones e
          LEFT JOIN Calificaciones c ON e.id_evaluacion = c.id_evaluacion AND c.id_user = @userId
          WHERE e.id_asignatura = @asignaturaId
          ORDER BY e.fecha DESC
        `;

        const calificaciones = await executeSQL(connection, query, [
          { name: "userId", type: TYPES.NVarChar, value: userId },
          { name: "asignaturaId", type: TYPES.NVarChar, value: asignaturaId },
        ]);

        // Calculate average grade
        let promedio = null;
        const notasValidas = calificaciones.filter(
          (cal: any) => cal.nota !== null && cal.nota > 0
        );

        if (notasValidas.length > 0) {
          const sumaNotas = notasValidas.reduce(
            (sum: number, cal: any) => sum + cal.nota,
            0
          );
          promedio = sumaNotas / notasValidas.length;
        }

        connection.close();
        return resolve(
          NextResponse.json({
            success: true,
            promedio: promedio,
            totalEvaluaciones: calificaciones.length,
            evaluacionesCalificadas: notasValidas.length,
            tieneEvaluaciones: notasValidas.length > 0,
          })
        );
      } catch (error) {
        console.error("Error fetching student grades summary:", error);
        connection.close();
        return resolve(
          NextResponse.json(
            { success: false, error: "Server error" },
            { status: 500 }
          )
        );
      }
    });

    connection.connect();
  });
}
