import { NextResponse, NextRequest } from "next/server";
import { Connection, Request, TYPES } from "tedious";
import config from "@/app/api/dbConfig";

interface Asignatura {
  id_asignatura: string;
  nombre_asignatura: string;
}

interface CursoResponse {
  id_curso: string;
  nombre_curso: string;
  asignaturas: Asignatura[];
  enlace_grupo_wsp: string;
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
        return reject(
          NextResponse.json(
            { success: false, error: "Error al conectar a la base de datos" },
            { status: 500 }
          )
        );
      }

      try {
        const { searchParams } = new URL(request.url);
        const rutDocente = searchParams.get("rut");

        if (!rutDocente) {
          connection.close();
          return resolve(
            NextResponse.json(
              { success: false, error: "RUT no proporcionado" },
              { status: 400 }
            )
          );
        }

        // First get the id_user from rut_usuario
        const userQuery =
          "SELECT id_user FROM Usuario WHERE rut_usuario = @rut";
        const userResults = await executeSQL(connection, userQuery, [
          { name: "rut", type: TYPES.NVarChar, value: rutDocente },
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

        const id_user = userResults[0].id_user;

        // Get distinct courses for the teacher
        const coursesQuery = `
          SELECT DISTINCT c.id_curso, c.nombre_curso, c.enlace_grupo_wsp
          FROM Curso c
          INNER JOIN CursosAsignaturasLink cl ON c.id_curso = cl.id_curso
          WHERE cl.id_user = @id_user
          ORDER BY c.id_curso
        `;

        const courses = await executeSQL(connection, coursesQuery, [
          { name: "id_user", type: TYPES.NVarChar, value: id_user },
        ]);

        // For each course, get its subjects assigned to this teacher
        const cursos: CursoResponse[] = [];

        for (const course of courses) {
          const subjectsQuery = `
            SELECT a.id_asignatura, a.nombre_asignatura
            FROM Asignatura a
            INNER JOIN CursosAsignaturasLink cal ON a.id_asignatura = cal.id_asignatura
            WHERE cal.id_curso = @id_curso AND cal.id_user = @id_user
          `;

          const subjects = await executeSQL(connection, subjectsQuery, [
            { name: "id_curso", type: TYPES.NVarChar, value: course.id_curso },
            { name: "id_user", type: TYPES.NVarChar, value: id_user },
          ]);

          cursos.push({
            id_curso: course.id_curso,
            nombre_curso: course.nombre_curso,
            asignaturas: subjects,
            enlace_grupo_wsp: course.enlace_grupo_wsp,
          });
        }

        connection.close();
        resolve(NextResponse.json({ success: true, cursos }));
      } catch (error) {
        console.error("Error al obtener cursos:", error);
        connection.close();
        resolve(
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
