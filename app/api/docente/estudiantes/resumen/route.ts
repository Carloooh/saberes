import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Connection, Request, TYPES } from "tedious";
import config from "@/app/api/dbConfig";

// Define interfaces for the database results
interface Estudiante {
  rut_usuario: string;
  nombres: string;
  apellidos: string;
  id_user: string;
}

interface Asignatura {
  id_asignatura: string;
  nombre_asignatura: string;
}

interface Nota {
  nota: number;
}

interface Asistencia {
  presentes: number;
  total: number;
}

interface EstudianteResumen {
  rut_usuario: string;
  nombres: string;
  apellidos: string;
  promedio_general: number | null;
  porcentaje_asistencia: number | null;
  asignaturas?: AsignaturaEstudiante[];
}

interface AsignaturaEstudiante {
  id_asignatura: string;
  nombre_asignatura: string;
  promedio: number | null;
  porcentaje_asistencia: number | null;
}

interface AsignaturaResumen {
  id_asignatura: string;
  nombre_asignatura: string;
  promedio_general: number | null;
  porcentaje_asistencia: number | null;
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

        if (!cursoId) {
          connection.close();
          return resolve(
            NextResponse.json(
              { success: false, error: "Falta el ID del curso" },
              { status: 400 }
            )
          );
        }

        // Get all students in the course with their basic info
        const queryEstudiantes = `
          SELECT DISTINCT 
            u.rut_usuario,
            u.nombres,
            u.apellidos,
            u.id_user
          FROM Usuario u
          JOIN CursosAsignaturasLink cal ON u.id_user = cal.id_user
          WHERE cal.id_curso = @cursoId AND u.tipo_usuario = 'Estudiante'
          order by u.apellidos
        `;

        const estudiantes = (await executeSQL(connection, queryEstudiantes, [
          { name: "cursoId", type: TYPES.NVarChar, value: cursoId },
        ])) as Estudiante[];

        // Get all subjects for this course
        const queryAsignaturas = `
          SELECT a.id_asignatura, a.nombre_asignatura
          FROM Asignaturas as1
          JOIN Asignatura a ON as1.id_asignatura = a.id_asignatura
          WHERE as1.id_curso = @cursoId
        `;

        const asignaturas = (await executeSQL(connection, queryAsignaturas, [
          { name: "cursoId", type: TYPES.NVarChar, value: cursoId },
        ])) as Asignatura[];

        // Calculate subject averages
        const asignaturasResumen: AsignaturaResumen[] = [];

        for (const asignatura of asignaturas) {
          // Get all grades for this subject
          const queryNotas = `
            SELECT c.nota
            FROM Calificaciones c
            JOIN Evaluaciones e ON c.id_evaluacion = e.id_evaluacion
            JOIN CursosAsignaturasLink cal ON c.id_user = cal.id_user
            WHERE e.id_asignatura = @asignaturaId AND e.id_curso = @cursoId AND cal.id_curso = @cursoId
          `;

          const notas = (await executeSQL(connection, queryNotas, [
            {
              name: "asignaturaId",
              type: TYPES.NVarChar,
              value: asignatura.id_asignatura,
            },
            { name: "cursoId", type: TYPES.NVarChar, value: cursoId },
          ])) as Nota[];

          const notasValidas = notas.filter(
            (nota: Nota) => nota.nota !== null && nota.nota > 0
          );

          let promedioAsignatura = null;
          if (notasValidas.length > 0) {
            promedioAsignatura =
              notasValidas.reduce(
                (sum: number, nota: Nota) => sum + nota.nota,
                0
              ) / notasValidas.length;
          }

          // Get attendance for this subject
          const queryAsistencia = `
            SELECT 
              COUNT(CASE WHEN a.asistencia IN (1, 2) THEN 1 END) as presentes,
              COUNT(*) as total
            FROM DiasAsistencia d
            LEFT JOIN Asistencia a ON d.id_dia = a.id_dia
            JOIN CursosAsignaturasLink cal ON a.id_user = cal.id_user
            WHERE d.id_curso = @cursoId AND d.id_asignatura = @asignaturaId AND cal.id_curso = @cursoId
          `;

          const asistenciaResults = await executeSQL(
            connection,
            queryAsistencia,
            [
              { name: "cursoId", type: TYPES.NVarChar, value: cursoId },
              {
                name: "asignaturaId",
                type: TYPES.NVarChar,
                value: asignatura.id_asignatura,
              },
            ]
          );

          let porcentajeAsistencia = null;
          if (asistenciaResults.length > 0) {
            const asistencia = asistenciaResults[0] as Asistencia;
            if (asistencia && asistencia.total > 0) {
              porcentajeAsistencia =
                (asistencia.presentes / asistencia.total) * 100;
            }
          }

          asignaturasResumen.push({
            id_asignatura: asignatura.id_asignatura,
            nombre_asignatura: asignatura.nombre_asignatura,
            promedio_general: promedioAsignatura,
            porcentaje_asistencia: porcentajeAsistencia,
          });
        }

        // For each student, get their grades and attendance for each subject
        const estudiantesResumen: EstudianteResumen[] = [];

        for (const estudiante of asignaturas.length > 0 ? estudiantes : []) {
          // Calculate averages across all subjects
          let sumaPromedios = 0;
          let contadorPromedios = 0;
          let sumaAsistencias = 0;
          let contadorAsistencias = 0;

          const asignaturasEstudiante: AsignaturaEstudiante[] = [];

          // Get grades and attendance for each subject
          for (const asignatura of asignaturas) {
            // Get grades
            const queryNotas = `
              SELECT c.nota
              FROM Calificaciones c
              JOIN Evaluaciones e ON c.id_evaluacion = e.id_evaluacion
              WHERE c.id_user = @userId AND e.id_asignatura = @asignaturaId AND e.id_curso = @cursoId
            `;

            const notas = (await executeSQL(connection, queryNotas, [
              {
                name: "userId",
                type: TYPES.NVarChar,
                value: estudiante.id_user,
              },
              {
                name: "asignaturaId",
                type: TYPES.NVarChar,
                value: asignatura.id_asignatura,
              },
              { name: "cursoId", type: TYPES.NVarChar, value: cursoId },
            ])) as Nota[];

            const notasValidas = notas.filter(
              (nota: Nota) => nota.nota !== null && nota.nota > 0
            );

            let promedioAsignatura = null;
            if (notasValidas.length > 0) {
              promedioAsignatura =
                notasValidas.reduce(
                  (sum: number, nota: Nota) => sum + nota.nota,
                  0
                ) / notasValidas.length;

              sumaPromedios += promedioAsignatura;
              contadorPromedios++;
            }

            // Get attendance
            const queryAsistencia = `
              SELECT 
                COUNT(CASE WHEN a.asistencia IN (1, 2) THEN 1 END) as presentes,
                COUNT(*) as total
              FROM DiasAsistencia d
              LEFT JOIN Asistencia a ON d.id_dia = a.id_dia AND a.id_user = @userId
              WHERE d.id_curso = @cursoId AND d.id_asignatura = @asignaturaId
            `;

            const asistenciaResults = await executeSQL(
              connection,
              queryAsistencia,
              [
                {
                  name: "userId",
                  type: TYPES.NVarChar,
                  value: estudiante.id_user,
                },
                { name: "cursoId", type: TYPES.NVarChar, value: cursoId },
                {
                  name: "asignaturaId",
                  type: TYPES.NVarChar,
                  value: asignatura.id_asignatura,
                },
              ]
            );

            let porcentajeAsistencia = null;
            if (asistenciaResults.length > 0) {
              const asistencia = asistenciaResults[0] as Asistencia;
              if (asistencia && asistencia.total > 0) {
                porcentajeAsistencia =
                  (asistencia.presentes / asistencia.total) * 100;

                sumaAsistencias += porcentajeAsistencia;
                contadorAsistencias++;
              }
            }

            asignaturasEstudiante.push({
              id_asignatura: asignatura.id_asignatura,
              nombre_asignatura: asignatura.nombre_asignatura,
              promedio: promedioAsignatura,
              porcentaje_asistencia: porcentajeAsistencia,
            });
          }

          const estudianteResumen: EstudianteResumen = {
            rut_usuario: estudiante.rut_usuario,
            nombres: estudiante.nombres,
            apellidos: estudiante.apellidos,
            promedio_general:
              contadorPromedios > 0 ? sumaPromedios / contadorPromedios : null,
            porcentaje_asistencia:
              contadorAsistencias > 0
                ? sumaAsistencias / contadorAsistencias
                : null,
            asignaturas: asignaturasEstudiante,
          };

          estudiantesResumen.push(estudianteResumen);
        }

        connection.close();
        return resolve(
          NextResponse.json({
            success: true,
            estudiantes: estudiantesResumen,
            asignaturas: asignaturasResumen,
          })
        );
      } catch (error) {
        console.error("Error fetching student summaries:", error);
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
