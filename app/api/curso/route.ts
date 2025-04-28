import { NextRequest, NextResponse } from "next/server";
import { Connection, Request, TYPES } from "tedious";
import config from "@/app/api/dbConfig";

// Definir una interfaz para el tipo de curso
interface Curso {
  id_curso: string;
  nombre_curso: string;
  enlace_grupo_wsp?: string;
  [key: string]: any; // Para otras propiedades que pueda tener el curso
}

// Interfaz para las columnas de la base de datos
interface Column {
  metadata: {
    colName: string;
  };
  value: any;
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const cursoId = url.searchParams.get("cursoId");

  if (!cursoId) {
    return NextResponse.json(
      { success: false, error: "ID de curso no proporcionado" },
      { status: 400 }
    );
  }

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

        let curso: Curso | null = null;
        const query = `SELECT * FROM Curso WHERE id_curso = @cursoId`;

        const request = new Request(query, (err, rowCount) => {
          if (err) {
            console.error("Error al ejecutar la consulta:", err.message);
            reject(
              NextResponse.json(
                { success: false, error: "Error en el servidor" },
                { status: 500 }
              )
            );
          } else if (rowCount === 0) {
            resolve(
              NextResponse.json(
                { success: false, error: "Curso no encontrado" },
                { status: 404 }
              )
            );
          } else {
            resolve(
              NextResponse.json({ success: true, curso }, { status: 200 })
            );
          }
          connection.close();
        });

        // Usar TYPES.NVarChar en lugar de "NVARCHAR"
        request.addParameter("cursoId", TYPES.NVarChar, cursoId);

        request.on("row", (columns: Column[]) => {
          curso = {
            id_curso: "",
            nombre_curso: ""
          };
          
          columns.forEach((column) => {
            curso![column.metadata.colName] = column.value;
          });
        });

        connection.execSql(request);
      });

      connection.connect();
    });
  } catch (error) {
    console.error("Error al obtener curso:", error);
    return NextResponse.json(
      { success: false, error: "Error en el servidor" },
      { status: 500 }
    );
  }
}
