// import { NextResponse } from 'next/server';
// import db from '@/db';

// // GET: Obtener todas las FAQs
// export async function GET() {
//   try {
//     const stmt = db.prepare('SELECT * FROM informacion_institucional WHERE tipo = ?');
//     const faqs = stmt.all('faq');
//     return NextResponse.json({ success: true, data: faqs }, { status: 200 });
//   } catch (error) {
//     console.error('Error al obtener las FAQs:', error);
//     return NextResponse.json({ success: false, error: 'Error en el servidor' }, { status: 500 });
//   }
// }

// // POST: Agregar una nueva FAQ
// export async function POST(req: Request) {
//   try {
//     const { titulo, contenido } = await req.json();

//     const stmt = db.prepare(`
//       INSERT INTO informacion_institucional (id_informacion, tipo, titulo, contenido)
//       VALUES (?, ?, ?, ?)
//     `);
//     const id = crypto.randomUUID(); // Generar un ID único
//     stmt.run(id, 'faq', titulo, contenido);

//     return NextResponse.json({ success: true }, { status: 201 });
//   } catch (error) {
//     console.error('Error al agregar la FAQ:', error);
//     return NextResponse.json({ success: false, error: 'Error en el servidor' }, { status: 500 });
//   }
// }

// // PUT: Actualizar una FAQ
// export async function PUT(req: Request) {
//   try {
//     const { id_informacion, titulo, contenido } = await req.json();

//     const stmt = db.prepare(`
//       UPDATE informacion_institucional
//       SET titulo = ?, contenido = ?
//       WHERE id_informacion = ?
//     `);
//     stmt.run(titulo, contenido, id_informacion);

//     return NextResponse.json({ success: true }, { status: 200 });
//   } catch (error) {
//     console.error('Error al actualizar la FAQ:', error);
//     return NextResponse.json({ success: false, error: 'Error en el servidor' }, { status: 500 });
//   }
// }

// // DELETE: Eliminar una FAQ
// export async function DELETE(req: Request) {
//   try {
//     const { id_informacion } = await req.json();

//     const stmt = db.prepare('DELETE FROM informacion_institucional WHERE id_informacion = ?');
//     stmt.run(id_informacion);

//     return NextResponse.json({ success: true }, { status: 200 });
//   } catch (error) {
//     console.error('Error al eliminar la FAQ:', error);
//     return NextResponse.json({ success: false, error: 'Error en el servidor' }, { status: 500 });
//   }
// }

import { NextResponse, NextRequest } from "next/server";
import { Connection, Request, TYPES } from "tedious";
import config from "@/app/api/dbConfig";
import { randomUUID } from "crypto";

// GET: Obtener todas las FAQs
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

        const faqs: any[] = [];

        const request = new Request(
          "SELECT id_informacion, titulo, contenido FROM dbo.Informacion_institucional WHERE tipo = 'faq'",
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
              resolve(
                NextResponse.json(
                  { success: true, data: faqs },
                  { status: 200 }
                )
              );
            }
            connection.close();
          }
        );

        request.on("row", (columns) => {
          const row: { [key: string]: any } = {};
          columns.forEach((column) => {
            row[column.metadata.colName] = column.value;
          });
          faqs.push(row);
        });

        connection.execSql(request);
      });

      connection.connect();
    });
  } catch (error) {
    console.error("Error al obtener las FAQs:", error);
    return NextResponse.json(
      { success: false, error: "Error en el servidor" },
      { status: 500 }
    );
  }
}

// POST: Agregar una nueva FAQ
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { titulo, contenido } = await req.json();

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

        const id = randomUUID();

        const request = new Request(
          "INSERT INTO dbo.Informacion_institucional (id_informacion, tipo, titulo, contenido) VALUES (@id, 'faq', @titulo, @contenido)",
          (err, _rowCount) => {
            if (err) {
              console.error("Error al agregar la FAQ:", err.message);
              reject(
                NextResponse.json(
                  { success: false, error: "Error en el servidor" },
                  { status: 500 }
                )
              );
            } else {
              resolve(NextResponse.json({ success: true }, { status: 201 }));
            }
            connection.close();
          }
        );

        request.addParameter("id", TYPES.NVarChar, id);
        request.addParameter("titulo", TYPES.NVarChar, titulo);
        request.addParameter("contenido", TYPES.NVarChar, contenido);

        connection.execSql(request);
      });

      connection.connect();
    });
  } catch (error) {
    console.error("Error al agregar la FAQ:", error);
    return NextResponse.json(
      { success: false, error: "Error en el servidor" },
      { status: 500 }
    );
  }
}

// PUT: Actualizar una FAQ
export async function PUT(req: NextRequest): Promise<NextResponse> {
  try {
    const { id_informacion, titulo, contenido } = await req.json();

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

        const request = new Request(
          "UPDATE dbo.Informacion_institucional SET titulo = @titulo, contenido = @contenido WHERE id_informacion = @id_informacion",
          (err, _rowCount) => {
            if (err) {
              console.error("Error al actualizar la FAQ:", err.message);
              reject(
                NextResponse.json(
                  { success: false, error: "Error en el servidor" },
                  { status: 500 }
                )
              );
            } else {
              resolve(NextResponse.json({ success: true }, { status: 200 }));
            }
            connection.close();
          }
        );

        request.addParameter("titulo", TYPES.NVarChar, titulo);
        request.addParameter("contenido", TYPES.NVarChar, contenido);
        request.addParameter("id_informacion", TYPES.NVarChar, id_informacion);

        connection.execSql(request);
      });

      connection.connect();
    });
  } catch (error) {
    console.error("Error al actualizar la FAQ:", error);
    return NextResponse.json(
      { success: false, error: "Error en el servidor" },
      { status: 500 }
    );
  }
}

// DELETE: Eliminar una FAQ
export async function DELETE(req: NextRequest): Promise<NextResponse> {
  try {
    const { id_informacion } = await req.json();

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

        const request = new Request(
          "DELETE FROM dbo.Informacion_institucional WHERE id_informacion = @id_informacion",
          (err, _rowCount) => {
            if (err) {
              console.error("Error al eliminar la FAQ:", err.message);
              reject(
                NextResponse.json(
                  { success: false, error: "Error en el servidor" },
                  { status: 500 }
                )
              );
            } else {
              resolve(NextResponse.json({ success: true }, { status: 200 }));
            }
            connection.close();
          }
        );

        request.addParameter("id_informacion", TYPES.NVarChar, id_informacion);

        connection.execSql(request);
      });

      connection.connect();
    });
  } catch (error) {
    console.error("Error al eliminar la FAQ:", error);
    return NextResponse.json(
      { success: false, error: "Error en el servidor" },
      { status: 500 }
    );
  }
}
