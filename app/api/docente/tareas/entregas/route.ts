import { NextResponse, NextRequest } from "next/server";
import { Connection, Request, TYPES } from "tedious";
import config from "@/app/api/dbConfig";

// Helper function to execute SQL queries
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

export async function DELETE(request: NextRequest) {
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
        const body = await request.json();
        const { id_entrega } = body;

        if (!id_entrega) {
          connection.close();
          return resolve(
            NextResponse.json(
              { success: false, error: "Falta el ID de la entrega" },
              { status: 400 }
            )
          );
        }

        // First, delete the associated files (EntregaTarea_Archivo)
        // The ON DELETE CASCADE will handle this automatically in the database,
        // but we'll do it explicitly for clarity
        const deleteFilesQuery = `
          DELETE FROM EntregaTarea_Archivo
          WHERE id_entrega = @id_entrega
        `;

        await executeSQL(connection, deleteFilesQuery, [
          { name: "id_entrega", type: TYPES.NVarChar, value: id_entrega }
        ]);

        // Then, delete the submission itself
        const deleteEntregaQuery = `
          DELETE FROM EntregaTarea
          WHERE id_entrega = @id_entrega
        `;

        await executeSQL(connection, deleteEntregaQuery, [
          { name: "id_entrega", type: TYPES.NVarChar, value: id_entrega }
        ]);

        connection.close();
        return resolve(
          NextResponse.json({ 
            success: true, 
            message: "Entrega eliminada correctamente" 
          })
        );
      } catch (error) {
        console.error("Error deleting submission:", error);
        connection.close();
        return resolve(
          NextResponse.json(
            { success: false, error: "Error al eliminar la entrega" },
            { status: 500 }
          )
        );
      }
    });

    connection.connect();
  });
}