import { NextResponse, NextRequest } from "next/server";
import { Connection, Request, TYPES } from "tedious";
import config from "@/app/api/dbConfig";

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

// Helper function to execute SQL statements without returning results
async function executeSQLStatement(
  connection: Connection,
  sql: string,
  parameters: { name: string; type: any; value: any }[] = []
): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = new Request(sql, (err) => {
      if (err) {
        return reject(err);
      }
      resolve();
    });

    parameters.forEach((param) => {
      request.addParameter(param.name, param.type, param.value);
    });

    connection.execSql(request);
  });
}

// GET: Obtener todas las asignaturas
export async function GET() {
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
        const query = "SELECT * FROM Asignatura ORDER BY id_asignatura";
        const asignaturas = await executeSQL(connection, query);

        connection.close();
        resolve(
          NextResponse.json(
            { success: true, data: asignaturas },
            { status: 200 }
          )
        );
      } catch (error) {
        console.error("Error al obtener las asignaturas:", error);
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

// POST: Agregar una nueva asignatura
export async function POST(req: NextRequest) {
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
        const { nombre_asignatura } = await req.json();

        // Obtener el ID más alto actual
        const maxIdQuery =
          "SELECT MAX(CAST(id_asignatura AS INT)) as maxId FROM Asignatura";
        const maxIdResult = await executeSQL(connection, maxIdQuery);
        const maxId = maxIdResult.length > 0 ? maxIdResult[0].maxId || 0 : 0;
        const newId = (maxId + 1).toString();

        // Insert new subject
        await executeSQLStatement(
          connection,
          "INSERT INTO Asignatura (id_asignatura, nombre_asignatura) VALUES (@id, @nombre)",
          [
            { name: "id", type: TYPES.NVarChar, value: newId },
            { name: "nombre", type: TYPES.NVarChar, value: nombre_asignatura },
          ]
        );

        connection.close();
        resolve(
          NextResponse.json({ success: true, id: newId }, { status: 201 })
        );
      } catch (error) {
        console.error("Error al agregar la asignatura:", error);
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

// PUT: Actualizar una asignatura
export async function PUT(req: NextRequest) {
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
        const { id_asignatura, nombre_asignatura } = await req.json();

        await executeSQLStatement(
          connection,
          "UPDATE Asignatura SET nombre_asignatura = @nombre WHERE id_asignatura = @id",
          [
            { name: "nombre", type: TYPES.NVarChar, value: nombre_asignatura },
            { name: "id", type: TYPES.NVarChar, value: id_asignatura },
          ]
        );

        connection.close();
        resolve(NextResponse.json({ success: true }, { status: 200 }));
      } catch (error) {
        console.error("Error al actualizar la asignatura:", error);
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

// DELETE: Eliminar una asignatura
export async function DELETE(req: NextRequest) {
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
        const { id_asignatura } = await req.json();

        await executeSQLStatement(
          connection,
          "DELETE FROM Asignatura WHERE id_asignatura = @id",
          [{ name: "id", type: TYPES.NVarChar, value: id_asignatura }]
        );

        connection.close();
        resolve(NextResponse.json({ success: true }, { status: 200 }));
      } catch (error) {
        console.error("Error al eliminar la asignatura:", error);
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
