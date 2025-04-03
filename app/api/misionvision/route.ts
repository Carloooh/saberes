import { NextResponse, NextRequest } from "next/server";
import { Connection, Request, TYPES } from "tedious";
import config from "@/app/api/dbConfig";

// GET: Obtener misión y visión
export async function GET(): Promise<NextResponse> {
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

        const resultados: { tipo: string; contenido: string }[] = [];

        const request = new Request(
          "SELECT tipo, contenido FROM dbo.Informacion_institucional WHERE tipo IN ('mision', 'vision')",
          (err, _rowCount) => {
            if (err) {
              console.error("Error al ejecutar la consulta:", err.message);
              reject(
                NextResponse.json(
                  { success: false, error: "Error en el servidor" },
                  { status: 500 }
                )
              );
            } else {
              const data = {
                mision:
                  resultados.find((item) => item.tipo === "mision")
                    ?.contenido || "",
                vision:
                  resultados.find((item) => item.tipo === "vision")
                    ?.contenido || "",
              };
              resolve(
                NextResponse.json({ success: true, data }, { status: 200 })
              );
            }
            connection.close();
          }
        );

        request.on("row", (columns: any[]) => {
          const row: { [key: string]: any } = {};
          columns.forEach((column) => {
            row[column.metadata.colName] = column.value;
          });
          resultados.push(row as { tipo: string; contenido: string });
        });

        connection.execSql(request);
      });

      connection.connect();
    });
  } catch (error) {
    console.error("Error al obtener misión y visión:", error);
    return NextResponse.json(
      { success: false, error: "Error en el servidor" },
      { status: 500 }
    );
  }
}

// PUT: Actualizar misión y visión
export async function PUT(req: NextRequest): Promise<NextResponse> {
  try {
    const { mision, vision } = await req.json();

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

        const updateMisionRequest = new Request(
          "UPDATE dbo.Informacion_institucional SET contenido = @mision WHERE tipo = 'mision'",
          (err, _rowCount) => {
            if (err) {
              console.error("Error al actualizar la misión:", err.message);
              reject(
                NextResponse.json(
                  { success: false, error: "Error en el servidor" },
                  { status: 500 }
                )
              );
              connection.close();
              return;
            }

            const updateVisionRequest = new Request(
              "UPDATE dbo.Informacion_institucional SET contenido = @vision WHERE tipo = 'vision'",
              (err, _rowCount) => {
                if (err) {
                  console.error("Error al actualizar la visión:", err.message);
                  reject(
                    NextResponse.json(
                      { success: false, error: "Error en el servidor" },
                      { status: 500 }
                    )
                  );
                } else {
                  resolve(
                    NextResponse.json({ success: true }, { status: 200 })
                  );
                }
                connection.close();
              }
            );

            updateVisionRequest.addParameter("vision", TYPES.NVarChar, vision);
            connection.execSql(updateVisionRequest);
          }
        );

        updateMisionRequest.addParameter("mision", TYPES.NVarChar, mision);
        connection.execSql(updateMisionRequest);
      });

      connection.connect();
    });
  } catch (error) {
    console.error("Error al actualizar misión y visión:", error);
    return NextResponse.json(
      { success: false, error: "Error en el servidor" },
      { status: 500 }
    );
  }
}
