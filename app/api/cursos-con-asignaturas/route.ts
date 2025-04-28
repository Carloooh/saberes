import { NextResponse } from "next/server";
import { Connection, Request } from "tedious";
import config from "@/app/api/dbConfig";

export async function GET() {
  try {
    const connection = new Connection(config);

    return new Promise<NextResponse>((resolve, reject) => {
      connection.on("connect", (err) => {
        if (err) {
          console.error("Error al conectar a la base de datos:", err.message);
          reject(
            NextResponse.json(
              { success: false, error: "Error en el servidor" },
              { status: 500 }
            )
          );
          return;
        }

        const cursos: any[] = [];
        const query = `
          SELECT 
            c.id_curso, 
            c.nombre_curso,
            c.enlace_grupo_wsp,
            a.id_asignatura,
            a.nombre_asignatura
          FROM Curso c
          LEFT JOIN Asignaturas asg ON c.id_curso = asg.id_curso
          LEFT JOIN Asignatura a ON asg.id_asignatura = a.id_asignatura
          ORDER BY c.id_curso, a.nombre_asignatura
        `;

        const request = new Request(query, (err) => {
          if (err) {
            console.error("Error al ejecutar la consulta:", err.message);
            reject(
              NextResponse.json(
                { success: false, error: "Error en el servidor" },
                { status: 500 }
              )
            );
          } else {
            // Agrupar asignaturas por curso
            const cursosMap = new Map();

            cursos.forEach((row) => {
              if (!cursosMap.has(row.id_curso)) {
                cursosMap.set(row.id_curso, {
                  id_curso: row.id_curso,
                  nombre_curso: row.nombre_curso,
                  enlace_grupo_wsp: row.enlace_grupo_wsp,
                  asignaturas: [],
                });
              }

              if (row.id_asignatura) {
                const curso = cursosMap.get(row.id_curso);
                curso.asignaturas.push({
                  id_asignatura: row.id_asignatura,
                  nombre_asignatura: row.nombre_asignatura,
                });
              }
            });

            // Ordenar cursos
            const formatted = Array.from(cursosMap.values()).sort((a, b) => {
              // Usar la misma lógica de ordenamiento que en cursos/route.ts
              const getCourseInfo = (name: string) => {
                const isBasico = name.toLowerCase().includes("básico");
                const isMedio = name.toLowerCase().includes("medio");
                const match = name.match(/(\d+)/);
                return {
                  type: isBasico ? 0 : isMedio ? 1 : 2,
                  number: match ? parseInt(match[1]) : 0,
                  name: name.toLowerCase(),
                };
              };

              const aInfo = getCourseInfo(a.nombre_curso);
              const bInfo = getCourseInfo(b.nombre_curso);

              if (aInfo.type !== bInfo.type) return aInfo.type - bInfo.type;
              if (aInfo.number !== bInfo.number)
                return aInfo.number - bInfo.number;
              return aInfo.name.localeCompare(bInfo.name);
            });

            // Ordenar asignaturas alfabéticamente
            formatted.forEach(
              (curso: {
                id_curso: string;
                nombre_curso: string;
                enlace_grupo_wsp: string;
                asignaturas: Array<{
                  id_asignatura: string;
                  nombre_asignatura: string;
                }>;
              }) => {
                curso.asignaturas.sort((a, b) =>
                  a.nombre_asignatura.localeCompare(b.nombre_asignatura)
                );
              }
            );

            resolve(NextResponse.json(formatted));
          }
          connection.close();
        });

        request.on("row", (columns: any[]) => {
          const row: { [key: string]: any } = {};
          columns.forEach((column) => {
            row[column.metadata.colName] = column.value;
          });
          cursos.push(row);
        });

        connection.execSql(request);
      });

      connection.connect();
    });
  } catch (error) {
    console.error("Error al obtener cursos:", error);
    return NextResponse.json(
      { success: false, error: "Error en el servidor" },
      { status: 500 }
    );
  }
}
