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
      const row: any = {};
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

  try {
    // Connect to database
    await new Promise<void>((resolve, reject) => {
      connection.on("connect", (err) => {
        if (err) {
          console.error("Error al conectar a la BD:", err.message);
          return reject(err);
        }
        resolve();
      });
      connection.connect();
    });

    const { searchParams } = new URL(request.url);
    const diaId = searchParams.get("dia");

    if (!diaId) {
      connection.close();
      return NextResponse.json(
        { success: false, error: "Falta el parámetro 'dia'" },
        { status: 400 }
      );
    }

    const query = `
      SELECT a.*, u.rut_usuario 
      FROM Asistencia a
      JOIN Usuario u ON a.id_user = u.id_user
      WHERE a.id_dia = @diaId
    `;

    const asistencias = await executeSQL(connection, query, [
      { name: "diaId", type: TYPES.NVarChar, value: diaId },
    ]);

    connection.close();
    return NextResponse.json({ success: true, asistencias });
  } catch (error) {
    if (connection) connection.close();
    console.error("Error al obtener asistencias:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener asistencias" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const connection = new Connection(config);

  try {
    // Connect to database
    await new Promise<void>((resolve, reject) => {
      connection.on("connect", (err) => {
        if (err) {
          console.error("Error al conectar a la BD:", err.message);
          return reject(err);
        }
        resolve();
      });
      connection.connect();
    });

    const {
      dia,
      rut_usuario,
      asistencia,
      id_curso,
      id_asignatura,
      justificacion,
    } = await request.json();

    if (
      !dia ||
      !rut_usuario ||
      asistencia === undefined ||
      !id_curso ||
      !id_asignatura
    ) {
      connection.close();
      return NextResponse.json(
        { success: false, error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    // Get id_user from rut_usuario
    const userQuery = `
      SELECT id_user FROM Usuario
      WHERE rut_usuario = @rut_usuario
    `;

    const users = await executeSQL(connection, userQuery, [
      { name: "rut_usuario", type: TYPES.NVarChar, value: rut_usuario },
    ]);

    if (users.length === 0) {
      connection.close();
      return NextResponse.json(
        { success: false, error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    const id_user = users[0].id_user;

    // Verificar si ya existe un registro
    const checkQuery = `
      SELECT id_asistencia FROM Asistencia
      WHERE id_dia = @dia AND id_user = @id_user
    `;

    const existingRecords = await executeSQL(connection, checkQuery, [
      { name: "dia", type: TYPES.NVarChar, value: dia },
      { name: "id_user", type: TYPES.NVarChar, value: id_user },
    ]);

    if (existingRecords.length > 0) {
      // Actualizar registro existente
      const updateQuery = `
        UPDATE Asistencia
        SET asistencia = @asistencia, justificacion = @justificacion
        WHERE id_dia = @dia AND id_user = @id_user
      `;

      await executeSQL(connection, updateQuery, [
        { name: "asistencia", type: TYPES.Int, value: asistencia },
        {
          name: "justificacion",
          type: TYPES.NVarChar,
          value: asistencia === 2 ? justificacion : null,
        },
        { name: "dia", type: TYPES.NVarChar, value: dia },
        { name: "id_user", type: TYPES.NVarChar, value: id_user },
      ]);
    } else {
      // Insertar nuevo registro
      const insertQuery = `
        INSERT INTO Asistencia (id_asistencia, id_dia, id_curso, id_asignatura, id_user, asistencia, justificacion)
        VALUES (@id_asistencia, @dia, @id_curso, @id_asignatura, @id_user, @asistencia, @justificacion)
      `;

      await executeSQL(connection, insertQuery, [
        {
          name: "id_asistencia",
          type: TYPES.NVarChar,
          value: `${dia}-${id_user}`,
        },
        { name: "dia", type: TYPES.NVarChar, value: dia },
        { name: "id_curso", type: TYPES.NVarChar, value: id_curso },
        { name: "id_asignatura", type: TYPES.NVarChar, value: id_asignatura },
        { name: "id_user", type: TYPES.NVarChar, value: id_user },
        { name: "asistencia", type: TYPES.Int, value: asistencia },
        {
          name: "justificacion",
          type: TYPES.NVarChar,
          value: asistencia === 2 ? justificacion : null,
        },
      ]);
    }

    connection.close();
    return NextResponse.json({ success: true });
  } catch (error) {
    if (connection) connection.close();
    console.error("Error al guardar asistencia:", error);
    return NextResponse.json(
      { success: false, error: "Error al guardar asistencia" },
      { status: 500 }
    );
  }
}
