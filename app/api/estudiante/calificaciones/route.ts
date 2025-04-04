import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { Connection, Request, TYPES } from "tedious";
import config from "@/app/api/dbConfig";
import { cookies } from "next/headers";

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
        const cursoId = searchParams.get("cursoId");

        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get("userSession");
        const userSession = sessionCookie
          ? JSON.parse(sessionCookie.value)
          : null;
        const rutEstudiante = userSession?.rut_usuario;

        if (!asignaturaId || !rutEstudiante) {
          connection.close();
          return resolve(
            NextResponse.json(
              { success: false, error: "Faltan parámetros requeridos" },
              { status: 400 }
            )
          );
        }

        // First get the user ID from the rut_usuario
        const getUserIdQuery = `
          SELECT id_user
          FROM Usuario
          WHERE rut_usuario = @rutUsuario
        `;

        const userResults = await executeSQL(connection, getUserIdQuery, [
          { name: "rutUsuario", type: TYPES.NVarChar, value: rutEstudiante },
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
            COALESCE(c.nota, 0.0) as nota
          FROM Evaluaciones e
          LEFT JOIN Calificaciones c ON e.id_evaluacion = c.id_evaluacion 
            AND c.id_user = @userId
          WHERE e.id_asignatura = @asignaturaId AND e.id_curso = @cursoId
          ORDER BY e.fecha DESC
        `;

        const calificaciones = await executeSQL(connection, query, [
          { name: "userId", type: TYPES.NVarChar, value: userId },
          { name: "asignaturaId", type: TYPES.NVarChar, value: asignaturaId },
          { name: "cursoId", type: TYPES.NVarChar, value: cursoId },
        ]);

        connection.close();
        return resolve(
          NextResponse.json({
            success: true,
            calificaciones,
          })
        );
      } catch (error) {
        console.error("Error fetching calificaciones:", error);
        connection.close();
        return resolve(
          NextResponse.json(
            { success: false, error: "Error al obtener las calificaciones" },
            { status: 500 }
          )
        );
      }
    });

    connection.connect();
  });
}
