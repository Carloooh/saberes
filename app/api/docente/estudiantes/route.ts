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
        const cursoId = searchParams.get("curso");

        if (!cursoId) {
          connection.close();
          return resolve(
            NextResponse.json(
              { success: false, error: "Falta el ID del curso" },
              { status: 400 }
            )
          );
        }

        const query = `
          SELECT u.rut_usuario, u.nombres, u.apellidos
          FROM Usuario u
          JOIN CursosAsignaturasLink cal ON u.id_user = cal.id_user
          WHERE u.tipo_usuario = 'Estudiante' AND u.estado = 'Activa' AND cal.id_curso = @cursoId
        `;

        const estudiantes = await executeSQL(connection, query, [
          { name: "cursoId", type: TYPES.NVarChar, value: cursoId },
        ]);

        connection.close();
        return resolve(NextResponse.json({ success: true, estudiantes }));
      } catch (error) {
        console.error("Error fetching students:", error);
        connection.close();
        return resolve(
          NextResponse.json(
            { success: false, error: "Error fetching students" },
            { status: 500 }
          )
        );
      }
    });

    connection.connect();
  });
}
