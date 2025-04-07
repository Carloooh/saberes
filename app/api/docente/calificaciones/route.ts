import { NextResponse, NextRequest } from "next/server";
import { Connection, Request, TYPES } from "tedious";
import config from "@/app/api/dbConfig";
import { v4 as uuidv4 } from "uuid";

interface Calificacion {
  id_evaluacion: string;
  nota: number;
}

interface Estudiante {
  rut_usuario: string;
  nombres: string;
  apellidos: string;
  calificaciones: any;
}

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
    const cursoId = searchParams.get("cursoId");
    const asignaturaId = searchParams.get("asignaturaId");

    if (!cursoId || !asignaturaId) {
      connection.close();
      return NextResponse.json(
        { success: false, error: "Faltan parámetros requeridos" },
        { status: 400 }
      );
    }

    // Get evaluations for the subject
    const queryEvaluaciones = `
      SELECT id_evaluacion, fecha, titulo
      FROM Evaluaciones
      WHERE id_asignatura = @asignaturaId AND id_curso = @cursoId
      ORDER BY fecha DESC
    `;

    const evaluaciones = await executeSQL(connection, queryEvaluaciones, [
      { name: "asignaturaId", type: TYPES.NVarChar, value: asignaturaId },
      { name: "cursoId", type: TYPES.NVarChar, value: cursoId },
    ]);

    // Get students in the course
    const studentsQuery = `
      SELECT DISTINCT u.id_user, u.rut_usuario, u.nombres, u.apellidos
      FROM Usuario u
      JOIN CursosAsignaturasLink cal ON u.id_user = cal.id_user
      WHERE cal.id_curso = @cursoId 
        AND u.tipo_usuario = 'Estudiante'
      order by u.apellidos
    `;

    const students = await executeSQL(connection, studentsQuery, [
      { name: "cursoId", type: TYPES.NVarChar, value: cursoId },
    ]);

    // For each student, get their grades
    const estudiantes: Estudiante[] = [];

    for (const student of students) {
      const gradesQuery = `
        SELECT e.id_evaluacion, COALESCE(c.nota, 0.0) as nota
        FROM Evaluaciones e
        LEFT JOIN Calificaciones c ON c.id_evaluacion = e.id_evaluacion 
          AND c.id_user = @userId
        WHERE e.id_asignatura = @asignaturaId AND e.id_curso = @cursoId
      `;

      const grades = await executeSQL(connection, gradesQuery, [
        { name: "userId", type: TYPES.NVarChar, value: student.id_user },
        { name: "asignaturaId", type: TYPES.NVarChar, value: asignaturaId },
        { name: "cursoId", type: TYPES.NVarChar, value: cursoId },
      ]);

      const calificaciones = grades.map((g) => ({
        id_evaluacion: g.id_evaluacion,
        nota: g.nota,
      }));

      estudiantes.push({
        rut_usuario: student.rut_usuario,
        nombres: student.nombres,
        apellidos: student.apellidos,
        calificaciones: calificaciones,
      });
    }

    connection.close();
    return NextResponse.json({
      success: true,
      data: {
        evaluaciones,
        estudiantes,
      },
    });
  } catch (error) {
    if (connection) connection.close();
    console.error("Error fetching grades:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener las calificaciones" },
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

    const { titulo, fecha, id_asignatura, cursoId } = await request.json();
    const id_evaluacion = uuidv4();

    // First check if the combination exists in Asignaturas table
    const checkAsignaturas = `
      SELECT COUNT(*) AS count FROM Asignaturas
      WHERE id_curso = @cursoId AND id_asignatura = @id_asignatura
    `;

    const asignaturasCheck = await executeSQL(connection, checkAsignaturas, [
      { name: "cursoId", type: TYPES.NVarChar, value: cursoId },
      { name: "id_asignatura", type: TYPES.NVarChar, value: id_asignatura },
    ]);

    // If the combination doesn't exist, insert it
    if (asignaturasCheck[0].count === 0) {
      const insertAsignaturas = `
        INSERT INTO Asignaturas (id_curso, id_asignatura)
        VALUES (@cursoId, @id_asignatura)
      `;

      await executeSQL(connection, insertAsignaturas, [
        { name: "cursoId", type: TYPES.NVarChar, value: cursoId },
        { name: "id_asignatura", type: TYPES.NVarChar, value: id_asignatura },
      ]);
    }

    const insertEvaluacion = `
      INSERT INTO Evaluaciones (id_evaluacion, id_curso, id_asignatura, titulo, fecha)
      VALUES (@id_evaluacion, @cursoId, @id_asignatura, @titulo, @fecha)
    `;

    await executeSQL(connection, insertEvaluacion, [
      { name: "id_evaluacion", type: TYPES.NVarChar, value: id_evaluacion },
      { name: "cursoId", type: TYPES.NVarChar, value: cursoId },
      { name: "id_asignatura", type: TYPES.NVarChar, value: id_asignatura },
      { name: "titulo", type: TYPES.NVarChar, value: titulo },
      { name: "fecha", type: TYPES.NVarChar, value: fecha },
    ]);

    // Get all students in the course
    const queryEstudiantes = `
      SELECT DISTINCT u.id_user
      FROM Usuario u
      JOIN CursosAsignaturasLink cal ON u.id_user = cal.id_user
      WHERE cal.id_curso = @cursoId
        AND u.tipo_usuario = 'Estudiante'
    `;

    const estudiantes = await executeSQL(connection, queryEstudiantes, [
      { name: "cursoId", type: TYPES.NVarChar, value: cursoId },
    ]);

    // Insert default grade (0.0) for each student
    for (const estudiante of estudiantes) {
      const insertCalificacion = `
        INSERT INTO Calificaciones (id_calificacion, id_evaluacion, id_user, nota)
        VALUES (@id_calificacion, @id_evaluacion, @id_user, 0.0)
      `;

      await executeSQL(connection, insertCalificacion, [
        { name: "id_calificacion", type: TYPES.NVarChar, value: uuidv4() },
        { name: "id_evaluacion", type: TYPES.NVarChar, value: id_evaluacion },
        { name: "id_user", type: TYPES.NVarChar, value: estudiante.id_user },
      ]);
    }

    connection.close();
    return NextResponse.json({ success: true });
  } catch (error) {
    if (connection) connection.close();
    console.error("Error creating evaluation:", error);
    return NextResponse.json(
      { success: false, error: "Error al crear la evaluación" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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

    const { id_evaluacion, rut_estudiante, nota } = await request.json();

    // Get id_user from rut_usuario
    const userQuery = `
      SELECT id_user FROM Usuario
      WHERE rut_usuario = @rut_usuario
    `;

    const users = await executeSQL(connection, userQuery, [
      { name: "rut_usuario", type: TYPES.NVarChar, value: rut_estudiante },
    ]);

    if (users.length === 0) {
      connection.close();
      return NextResponse.json(
        { success: false, error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    const id_user = users[0].id_user;

    const checkCalificacion = `
      SELECT id_calificacion 
      FROM Calificaciones 
      WHERE id_evaluacion = @id_evaluacion AND id_user = @id_user
    `;

    const existingCalificacion = await executeSQL(
      connection,
      checkCalificacion,
      [
        { name: "id_evaluacion", type: TYPES.NVarChar, value: id_evaluacion },
        { name: "id_user", type: TYPES.NVarChar, value: id_user },
      ]
    );

    if (existingCalificacion.length > 0) {
      // Actualizar calificación existente
      const updateCalificacion = `
        UPDATE Calificaciones
        SET nota = @nota
        WHERE id_evaluacion = @id_evaluacion AND id_user = @id_user
      `;

      await executeSQL(connection, updateCalificacion, [
        { name: "nota", type: TYPES.Float, value: nota },
        { name: "id_evaluacion", type: TYPES.NVarChar, value: id_evaluacion },
        { name: "id_user", type: TYPES.NVarChar, value: id_user },
      ]);
    } else {
      // Insertar nueva calificación
      const insertCalificacion = `
        INSERT INTO Calificaciones (id_calificacion, id_evaluacion, id_user, nota)
        VALUES (@id_calificacion, @id_evaluacion, @id_user, @nota)
      `;

      await executeSQL(connection, insertCalificacion, [
        { name: "id_calificacion", type: TYPES.NVarChar, value: uuidv4() },
        { name: "id_evaluacion", type: TYPES.NVarChar, value: id_evaluacion },
        { name: "id_user", type: TYPES.NVarChar, value: id_user },
        { name: "nota", type: TYPES.Float, value: nota },
      ]);
    }

    connection.close();
    return NextResponse.json({ success: true });
  } catch (error) {
    if (connection) connection.close();
    console.error("Error updating grade:", error);
    return NextResponse.json(
      { success: false, error: "Error al actualizar la calificación" },
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
    const id = searchParams.get("id");

    if (!id) {
      connection.close();
      return NextResponse.json(
        { success: false, error: "ID de evaluación no proporcionado" },
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
      // Delete grades first due to foreign key constraint
      const deleteCalificaciones = `
        DELETE FROM Calificaciones WHERE id_evaluacion = @id
      `;

      await executeSQL(connection, deleteCalificaciones, [
        { name: "id", type: TYPES.NVarChar, value: id },
      ]);

      // Then delete the evaluation
      const deleteEvaluacion = `
        DELETE FROM Evaluaciones WHERE id_evaluacion = @id
      `;

      await executeSQL(connection, deleteEvaluacion, [
        { name: "id", type: TYPES.NVarChar, value: id },
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
    console.error("Error deleting evaluation:", error);
    return NextResponse.json(
      { success: false, error: "Error al eliminar la evaluación" },
      { status: 500 }
    );
  }
}
