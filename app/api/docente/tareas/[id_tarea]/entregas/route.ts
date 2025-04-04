// // api/docente/tareas/[id_tarea]/entregas/route.ts
// import { NextResponse } from "next/server";
// import db from "@/db";

// interface ArchivoEntrega {
//   id_archivo: string;
//   titulo: string;
//   extension: string;
// }

// interface EntregaDB {
//   id_entrega: string;
//   id_tarea: string;
//   id_curso: string;
//   id_asignatura: string;
//   rut_estudiante: string;
//   fecha_entrega: string;
//   comentario: string | null;
//   estado: string;
//   nombres: string;
//   apellidos: string;
//   archivos_entrega: string;
// }

// interface EntregaResponse extends Omit<EntregaDB, 'archivos_entrega'> {
//   archivos_entrega: ArchivoEntrega[];
// }

// export async function GET(request: Request) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const id_asignatura = searchParams.get("id_asignatura");
//     const id_tarea = searchParams.get("id_tarea");

//     if (!id_asignatura) {
//       return NextResponse.json(
//         { success: false, error: "Falta el ID de la asignatura" },
//         { status: 400 }
//       );
//     }

//     const query = db.prepare(`
//       SELECT
//         et.*,
//         u.nombres,
//         u.apellidos,
//         COALESCE(
//           (
//             SELECT json_group_array(
//               json_object(
//                 'id_archivo', eta.id_archivo,
//                 'titulo', eta.titulo,
//                 'extension', eta.extension
//               )
//             )
//             FROM EntregaTarea_Archivo eta
//             WHERE eta.id_entrega = et.id_entrega
//           ), '[]'
//         ) as archivos_entrega
//       FROM EntregaTarea et
//       JOIN Usuario u ON et.rut_estudiante = u.rut_usuario
//       WHERE et.id_tarea = ? AND et.id_asignatura = ?
//     `);

//     const entregas = query.all(id_tarea, id_asignatura) as EntregaDB[];
//     const processedEntregas = entregas.map((e: EntregaDB): EntregaResponse => ({
//       ...e,
//       archivos_entrega: JSON.parse(e.archivos_entrega || '[]')
//     }));
//     // const entregas = query.all(id_tarea, id_asignatura);
//     // const processedEntregas = entregas.map(e => ({
//     //   ...e,
//     //   archivos_entrega: JSON.parse(e.archivos_entrega || '[]')
//     // }));

//     return NextResponse.json({ success: true, entregas: processedEntregas });
//   } catch (error) {
//     console.error("Error fetching deliveries:", error);
//     return NextResponse.json(
//       { success: false, error: "Error al obtener las entregas" },
//       { status: 500 }
//     );
//   }
// }

// api/docente/tareas/[id_tarea]/entregas/route.ts
import { NextResponse, NextRequest } from "next/server";
import { Connection, Request, TYPES } from "tedious";
import config from "@/app/api/dbConfig";

interface ArchivoEntrega {
  id_archivo: string;
  titulo: string;
  extension: string;
}

interface EntregaDB {
  id_entrega: string;
  id_tarea: string;
  id_curso: string;
  id_asignatura: string;
  id_user: string;
  fecha_entrega: string;
  comentario: string | null;
  estado: string;
  nombres: string;
  apellidos: string;
  rut_estudiante: string; // Add this field
}

interface EntregaResponse extends EntregaDB {
  archivos_entrega: ArchivoEntrega[];
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
        // Fix parameter names to match request
        const id_asignatura = searchParams.get("asignatura");
        const id_tarea = searchParams.get("tarea");
        const cursoId = searchParams.get("curso");

        // Add curso validation
        if (!cursoId) {
          connection.close();
          return resolve(
            NextResponse.json(
              { success: false, error: "Falta el ID del curso" },
              { status: 400 }
            )
          );
        }

        // Update query to use cursoId
        const query = `
          SELECT 
            et.id_entrega, et.id_tarea, et.id_curso, et.id_asignatura, 
            et.id_user, u.rut_usuario as rut_estudiante, et.fecha_entrega, 
            et.comentario, et.estado, u.nombres, u.apellidos
          FROM EntregaTarea et
          JOIN Usuario u ON et.id_user = u.id_user
          WHERE et.id_tarea = @id_tarea 
            AND et.id_asignatura = @id_asignatura
            AND et.id_curso = @cursoId
        `;

        const entregas = await executeSQL(connection, query, [
          { name: "id_tarea", type: TYPES.NVarChar, value: id_tarea },
          { name: "id_asignatura", type: TYPES.NVarChar, value: id_asignatura },
          { name: "cursoId", type: TYPES.NVarChar, value: cursoId },
        ]);

        // For each submission, get its files
        const processedEntregas: EntregaResponse[] = [];

        for (const entrega of entregas) {
          const filesQuery = `
            SELECT id_archivo, titulo, extension
            FROM EntregaTarea_Archivo
            WHERE id_entrega = @id_entrega
          `;

          const files = await executeSQL(connection, filesQuery, [
            {
              name: "id_entrega",
              type: TYPES.NVarChar,
              value: entrega.id_entrega,
            },
          ]);

          processedEntregas.push({
            ...entrega,
            archivos_entrega: files as ArchivoEntrega[],
          });
        }

        connection.close();
        return resolve(
          NextResponse.json({ success: true, entregas: processedEntregas })
        );
      } catch (error) {
        console.error("Error fetching deliveries:", error);
        connection.close();
        return resolve(
          NextResponse.json(
            { success: false, error: "Error al obtener las entregas" },
            { status: 500 }
          )
        );
      }
    });

    connection.connect();
  });
}
