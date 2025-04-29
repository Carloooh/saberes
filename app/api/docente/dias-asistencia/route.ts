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

// Obtener todos los días de asistencia de un curso y asignatura
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
    const cursoId = searchParams.get("curso");
    const asignaturaId = searchParams.get("asignatura");

    if (!cursoId) {
      connection.close();
      return NextResponse.json(
        { success: false, error: "Falta el parámetro 'curso'" },
        { status: 400 }
      );
    }

    // Obtener los días de asistencia
    let query;
    let parameters;

    if (asignaturaId) {
      // Si se proporciona asignatura, filtrar por curso y asignatura
      query = `
        SELECT * FROM DiasAsistencia
        WHERE id_curso = @cursoId AND id_asignatura = @asignaturaId
        ORDER BY fecha DESC
      `;
      parameters = [
        { name: "cursoId", type: TYPES.NVarChar, value: cursoId },
        { name: "asignaturaId", type: TYPES.NVarChar, value: asignaturaId },
      ];
    } else {
      // Si no se proporciona asignatura, filtrar solo por curso (para compatibilidad)
      query = `
        SELECT * FROM DiasAsistencia
        WHERE id_curso = @cursoId AND id_asignatura IS NULL
        ORDER BY fecha DESC
      `;
      parameters = [{ name: "cursoId", type: TYPES.NVarChar, value: cursoId }];
    }

    const dias = await executeSQL(connection, query, parameters);

    connection.close();
    return NextResponse.json({ success: true, dias });
  } catch (error) {
    if (connection) connection.close();
    console.error("Error fetching attendance days:", error);
    return NextResponse.json(
      { success: false, error: "Error fetching attendance days" },
      { status: 500 }
    );
  }
}

// Crear un nuevo día de asistencia
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

    const { curso, asignatura, fecha } = await request.json();
    if (!curso || !fecha) {
      connection.close();
      return NextResponse.json(
        { success: false, error: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }

    // Generar un ID único para el día de asistencia
    const diaId = asignatura
      ? `${curso}-${asignatura}-${fecha}`
      : `${curso}-${fecha}`;

    // Insertar un nuevo día de asistencia
    const insertQuery = `
      INSERT INTO DiasAsistencia (id_dia, id_curso, id_asignatura, fecha)
      VALUES (@diaId, @cursoId, @asignaturaId, @fecha)
    `;

    await executeSQL(connection, insertQuery, [
      { name: "diaId", type: TYPES.NVarChar, value: diaId },
      { name: "cursoId", type: TYPES.NVarChar, value: curso },
      { name: "asignaturaId", type: TYPES.NVarChar, value: asignatura || null },
      { name: "fecha", type: TYPES.NVarChar, value: fecha },
    ]);

    connection.close();
    return NextResponse.json({ success: true });
  } catch (error) {
    if (connection) connection.close();
    console.error("Error creating attendance day:", error);
    return NextResponse.json(
      { success: false, error: "Error creating attendance day" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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
        { success: false, error: "Falta el ID del día" },
        { status: 400 }
      );
    }

    // Begin transaction
    await new Promise<void>((resolve, reject) => {
      connection.beginTransaction((err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    try {
      // Primero eliminar las asistencias relacionadas
      const deleteAsistenciasQuery = `
        DELETE FROM Asistencia WHERE id_dia = @diaId
      `;

      await executeSQL(connection, deleteAsistenciasQuery, [
        { name: "diaId", type: TYPES.NVarChar, value: diaId },
      ]);

      // Luego eliminar el día
      const deleteDiaQuery = `
        DELETE FROM DiasAsistencia WHERE id_dia = @diaId
      `;

      await executeSQL(connection, deleteDiaQuery, [
        { name: "diaId", type: TYPES.NVarChar, value: diaId },
      ]);

      // Commit transaction
      await new Promise<void>((resolve, reject) => {
        connection.commitTransaction((err) => {
          if (err) return reject(err);
          resolve();
        });
      });

      connection.close();
      return NextResponse.json({ success: true });
    } catch (error) {
      // Rollback transaction on error
      await new Promise<void>((resolve) => {
        connection.rollbackTransaction(() => {
          resolve();
        });
      });

      throw error;
    }
  } catch (error) {
    if (connection) connection.close();
    console.error("Error al eliminar día:", error);
    return NextResponse.json(
      { success: false, error: "Error al eliminar día" },
      { status: 500 }
    );
  }
}
