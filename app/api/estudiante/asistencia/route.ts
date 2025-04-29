import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { Connection, Request, TYPES } from "tedious";
import config from "@/app/api/dbConfig";

interface AsistenciaDB {
  id_dia: string;
  fecha: string;
  estado: "Presente" | "Ausente" | "Justificado";
  justificacion?: string | null;
}

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
        const cursoId = searchParams.get("cursoId");
        const asignaturaId = searchParams.get("asignaturaId");

        if (!cursoId || !asignaturaId) {
          connection.close();
          return resolve(
            NextResponse.json(
              { success: false, error: "Faltan parámetros requeridos" },
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

        // Now get the attendance data
        const query = `
          SELECT
            d.id_dia,
            d.fecha,
            CASE
              WHEN a.asistencia = 1 THEN 'Presente'
              WHEN a.asistencia = 2 THEN 'Justificado'
              ELSE 'Ausente'
            END as estado,
            a.justificacion
          FROM DiasAsistencia d
          LEFT JOIN Asistencia a ON d.id_dia = a.id_dia AND a.id_user = @userId
          WHERE d.id_curso = @cursoId AND d.id_asignatura = @asignaturaId
          ORDER BY d.fecha DESC
        `;

        const asistencias = await executeSQL(connection, query, [
          { name: "userId", type: TYPES.NVarChar, value: userId },
          { name: "cursoId", type: TYPES.NVarChar, value: cursoId },
          { name: "asignaturaId", type: TYPES.NVarChar, value: asignaturaId },
        ]);

        const mappedAsistencias = asistencias.map(
          (row: any): AsistenciaDB => ({
            id_dia: row.id_dia,
            fecha: row.fecha,
            estado: row.estado || "Ausente",
            justificacion: row.justificacion || null,
          })
        );

        const validAsistencias = mappedAsistencias.filter(
          (a: AsistenciaDB) =>
            a.fecha && ["Presente", "Ausente", "Justificado"].includes(a.estado)
        );

        connection.close();
        return resolve(
          NextResponse.json({
            success: true,
            data: validAsistencias,
          })
        );
      } catch (error) {
        console.error("Error fetching student attendance by subject:", error);
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
