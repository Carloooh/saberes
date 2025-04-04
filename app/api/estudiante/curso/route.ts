import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { Connection, Request, TYPES } from "tedious";
import config from "@/app/api/dbConfig";

interface Asignatura {
  id_asignatura: string;
  nombre_asignatura: string;
}

interface CursoResponse {
  cursoAlumno: {
    id_curso: string;
    nombre_curso: string;
  };
  asignaturas: Asignatura[];
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

        // Get the student's course
        const queryCurso = `
          SELECT 
            c.id_curso,
            c.nombre_curso
          FROM CursosAsignaturasLink cal
          JOIN Curso c ON cal.id_curso = c.id_curso
          WHERE cal.id_user = @userId
        `;

        const cursoResults = await executeSQL(connection, queryCurso, [
          { name: "userId", type: TYPES.NVarChar, value: userId },
        ]);

        if (cursoResults.length === 0) {
          connection.close();
          return resolve(
            NextResponse.json(
              { success: false, error: "No course found" },
              { status: 404 }
            )
          );
        }

        const cursoAlumno = {
          id_curso: cursoResults[0].id_curso,
          nombre_curso: cursoResults[0].nombre_curso,
        };

        // Get the subjects for this course
        const queryAsignaturas = `
          SELECT 
            a.id_asignatura,
            a.nombre_asignatura
          FROM Asignaturas asig
          JOIN Asignatura a ON asig.id_asignatura = a.id_asignatura
          WHERE asig.id_curso = @cursoId
        `;

        const asignaturasResults = await executeSQL(
          connection,
          queryAsignaturas,
          [
            {
              name: "cursoId",
              type: TYPES.NVarChar,
              value: cursoAlumno.id_curso,
            },
          ]
        );

        // Filter out any null values
        const asignaturas = asignaturasResults.filter(
          (a) => a.id_asignatura !== null && a.nombre_asignatura !== null
        );

        const response: CursoResponse = {
          cursoAlumno,
          asignaturas,
        };

        connection.close();
        return resolve(
          NextResponse.json({
            success: true,
            data: response,
          })
        );
      } catch (error) {
        console.error("Error fetching student course:", error);
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
