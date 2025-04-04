import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { Connection, Request, TYPES } from "tedious";
import config from "@/app/api/dbConfig";

interface MaterialArchivo {
  id_material_archivo: string;
  titulo: string;
  extension: string;
}

interface Material {
  id_material: string;
  id_curso: string;
  id_asignatura: string;
  titulo: string;
  descripcion: string;
  fecha: string;
  enlace: string | null;
  archivos: MaterialArchivo[];
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
        const asignaturaId = searchParams.get("asignaturaId");
        const cursoId = searchParams.get("cursoId");

        if (!asignaturaId) {
          connection.close();
          return resolve(
            NextResponse.json(
              { success: false, error: "Falta el ID de la asignatura" },
              { status: 400 }
            )
          );
        }

        // First get all materials
        const query = `
          SELECT 
            id_material, id_curso, id_asignatura, titulo, descripcion, fecha, enlace
          FROM Material_educativo
          WHERE id_asignatura = @asignaturaId AND id_curso = @cursoId
          ORDER BY fecha DESC
        `;

        const materiales = await executeSQL(connection, query, [
          { name: "asignaturaId", type: TYPES.NVarChar, value: asignaturaId },
          { name: "cursoId", type: TYPES.NVarChar, value: cursoId },
        ]);

        // For each material, get its files
        const processedMateriales: Material[] = [];

        for (const material of materiales) {
          const filesQuery = `
            SELECT id_material_archivo, titulo, extension
            FROM Material_archivo
            WHERE id_material = @materialId
          `;

          const files = await executeSQL(connection, filesQuery, [
            {
              name: "materialId",
              type: TYPES.NVarChar,
              value: material.id_material,
            },
          ]);

          processedMateriales.push({
            ...material,
            archivos: files.filter(
              (a) => a.id_material_archivo
            ) as MaterialArchivo[],
          });
        }

        connection.close();
        return resolve(
          NextResponse.json({ success: true, materiales: processedMateriales })
        );
      } catch (error) {
        console.error("Error fetching materials:", error);
        connection.close();
        return resolve(
          NextResponse.json(
            { success: false, error: "Error al obtener los materiales" },
            { status: 500 }
          )
        );
      }
    });

    connection.connect();
  });
}
