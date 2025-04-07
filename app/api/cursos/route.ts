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
        const request = new Request("SELECT * FROM Curso", (err, _rowCount) => {
          if (err) {
            console.error("Error al ejecutar la consulta:", err.message);
            reject(
              NextResponse.json(
                { success: false, error: "Error en el servidor" },
                { status: 500 }
              )
            );
          } else {
            // Sort courses manually
            cursos.sort((a, b) => {
              // Extract course type and number
              const getCourseInfo = (name: string) => {
                const isBasico = name.toLowerCase().includes('básico');
                const isMedio = name.toLowerCase().includes('medio');
                const match = name.match(/(\d+)/);
                return {
                  type: isBasico ? 0 : isMedio ? 1 : 2,
                  number: match ? parseInt(match[1]) : 0,
                  name: name.toLowerCase()
                };
              };

              const aInfo = getCourseInfo(a.nombre_curso);
              const bInfo = getCourseInfo(b.nombre_curso);

              // First sort by type (básico > medio > others)
              if (aInfo.type !== bInfo.type) return aInfo.type - bInfo.type;
              
              // Then sort by number
              if (aInfo.number !== bInfo.number) return aInfo.number - bInfo.number;
              
              // Finally sort by full name
              return aInfo.name.localeCompare(bInfo.name);
            });

            resolve(
              NextResponse.json(
                { success: true, data: cursos },
                { status: 200 }
              )
            );
          }
          connection.close();
        });

        request.on("row", (columns: any[]) => {
          const curso: { [key: string]: any } = {};
          columns.forEach((column) => {
            curso[column.metadata.colName] = column.value;
          });
          cursos.push(curso);
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
