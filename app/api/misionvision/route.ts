import { NextResponse, NextRequest } from "next/server";
import db from "@/db";
import { Connection, Request, TYPES, ConnectionConfiguration } from "tedious";

// GET: Obtener misión y visión
export async function GET() {
  try {
    const stmt = db.prepare(
      "SELECT * FROM informacion_institucional WHERE tipo IN (?, ?)"
    );
    const result = stmt.all("mision", "vision") as {
      tipo: string;
      contenido: string;
    }[];

    // Formatear los datos para devolverlos como un objeto
    const data = {
      mision: result.find((item) => item.tipo === "mision")?.contenido || "",
      vision: result.find((item) => item.tipo === "vision")?.contenido || "",
    };

    // Nueva conexión para obtener todos los resultados de dbo.Informacion_institucional
    const config: ConnectionConfiguration = {
      server: process.env.BD_HOST || "", // Reemplaza con la IP de tu VM
      authentication: {
        type: "default",
        options: {
          userName: process.env.BD_USER || "",
          password: process.env.BD_PASSWORD || "",
        },
      },
      options: {
        database: process.env.BD_NAME || "",
        encrypt: true, // Si es necesario
        trustServerCertificate: true,
        cryptoCredentialsDetails: {
          minVersion: "TLSv1.2",
        },
      },
    };

    const connection = new Connection(config);

    connection.on("connect", (err) => {
      if (err) {
        console.error("Error al conectar a la base de datos:", err.message);
      } else {
        // Create an array to collect the rows
        const resultados: any[] = [];

        const request = new Request(
          "SELECT * FROM dbo.Informacion_institucional",
          (err, rowCount) => {
            if (err) {
              console.error("Error al ejecutar la consulta:", err.message);
            } else {
              console.log(
                "Resultados de dbo.Informacion_institucional:",
                resultados
              );
            }
            connection.close();
          }
        );

        // Handle each row as it comes in
        request.on("row", (columns) => {
          const row: any = {};
          columns.forEach((column: any) => {
            row[column.metadata.colName] = column.value;
          });
          resultados.push(row);
        });

        connection.execSql(request);
      }
    });

    connection.connect();

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    console.error("Error al obtener misión y visión:", error);
    return NextResponse.json(
      { success: false, error: "Error en el servidor" },
      { status: 500 }
    );
  }
}

// PUT: Actualizar misión y visión
export async function PUT(req: NextRequest) {
  try {
    const { mision, vision } = await req.json();

    // Actualizar misión
    const stmtMision = db.prepare(
      "UPDATE informacion_institucional SET contenido = ? WHERE tipo = ?"
    );
    stmtMision.run(mision, "mision");

    // Actualizar visión
    const stmtVision = db.prepare(
      "UPDATE informacion_institucional SET contenido = ? WHERE tipo = ?"
    );
    stmtVision.run(vision, "vision");

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error al actualizar misión y visión:", error);
    return NextResponse.json(
      { success: false, error: "Error en el servidor" },
      { status: 500 }
    );
  }
}
