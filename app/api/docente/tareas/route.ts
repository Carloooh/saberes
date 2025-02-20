import { NextResponse } from "next/server";
import db from "@/db";
import { v4 as uuidv4 } from "uuid";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const asignaturaId = searchParams.get("asignaturaId");

    if (!asignaturaId) {
      return NextResponse.json(
        { success: false, error: "Falta el ID de la asignatura" },
        { status: 400 }
      );
    }

    const query = db.prepare(`
      SELECT 
        t.*,
        json_group_array(
          DISTINCT CASE WHEN ta.id_archivo IS NOT NULL THEN
            json_object(
              'id_archivo', ta.id_archivo,
              'titulo', ta.titulo,
              'extension', ta.extension
            )
          ELSE NULL END
        ) as archivos,
        json_group_array(
          DISTINCT CASE WHEN u.rut_usuario IS NOT NULL THEN
            json_object(
              'rut_estudiante', u.rut_usuario,
              'nombres', u.nombres,
              'apellidos', u.apellidos,
              'estado', COALESCE(et.estado, 'pendiente'),
              'fecha_entrega', et.fecha_entrega,
              'comentario', et.comentario,
              'archivos_entrega', (
                SELECT json_group_array(
                  DISTINCT CASE WHEN eta.id_archivo IS NOT NULL THEN
                    json_object(
                      'id_archivo', eta.id_archivo,
                      'titulo', eta.titulo,
                      'extension', eta.extension
                    )
                  ELSE NULL END
                )
                FROM EntregaTarea_Archivo eta
                WHERE eta.id_entrega = et.id_entrega
              )
            )
          ELSE NULL END
        ) as entregas
      FROM Tareas t
      LEFT JOIN Tarea_archivo ta ON t.id_tarea = ta.id_tarea
      LEFT JOIN CursosAsignaturasLink cal ON t.id_asignatura = cal.id_asignatura
      LEFT JOIN Usuario u ON cal.rut_usuario = u.rut_usuario AND u.tipo_usuario = 'Estudiante'
      LEFT JOIN EntregaTarea et ON t.id_tarea = et.id_tarea AND u.rut_usuario = et.rut_estudiante
      WHERE t.id_asignatura = ?
      GROUP BY t.id_tarea, t.id_asignatura
      ORDER BY t.fecha DESC
    `);

    const tareas = query.all(asignaturaId);

    // Process the results
    const processedTareas = tareas.map(tarea => ({
      ...tarea,
      archivos: JSON.parse(tarea.archivos).filter(Boolean),
      entregas: JSON.parse(tarea.entregas)
        .filter(Boolean)
        .map(e => ({
          ...e,
          archivos_entrega: e.archivos_entrega ? JSON.parse(e.archivos_entrega).filter(Boolean) : []
        }))
    }));

    return NextResponse.json({ success: true, tareas: processedTareas });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener las tareas" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const titulo = formData.get("titulo") as string;
    const descripcion = formData.get("descripcion") as string;
    const id_asignatura = formData.get("id_asignatura") as string;
    const fecha = new Date().toISOString().split('T')[0];
    const archivos = formData.getAll("archivos"); // Changed from getting individual files

    if (!titulo || !descripcion || !id_asignatura) {
      return NextResponse.json(
        { success: false, error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    const id_tarea = uuidv4();

    db.exec('BEGIN TRANSACTION');

    try {
      const insertTarea = db.prepare(`
        INSERT INTO Tareas (id_tarea, id_asignatura, titulo, descripcion, fecha)
        VALUES (?, ?, ?, ?, ?)
      `);
      insertTarea.run(id_tarea, id_asignatura, titulo, descripcion, fecha);
      
      console.log("archivos: ", archivos)
      // Process files
      for (const file of archivos) {
        if (file instanceof File) {
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const fileName = file.name.split('.')[0];
          const extension = file.name.split('.').pop() || '';
          const id_archivo = uuidv4();

          const insertArchivo = db.prepare(`
            INSERT INTO Tarea_archivo (id_archivo, id_tarea, id_asignatura, titulo, archivo, extension)
            VALUES (?, ?, ?, ?, ?, ?)
          `);
          console.log(id_archivo,
            id_tarea,
            id_asignatura,
            fileName,
            buffer,
            extension)
          insertArchivo.run(
            id_archivo,
            id_tarea,
            id_asignatura,
            fileName,
            buffer,
            extension
          );
        }
      }

      db.exec('COMMIT');
      return NextResponse.json({ success: true });
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { success: false, error: "Error al crear la tarea" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { id_tarea, id_asignatura } = await request.json();

    if (!id_tarea || !id_asignatura) {
      return NextResponse.json(
        { success: false, error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    db.exec('BEGIN TRANSACTION');

    try {
      // Eliminar archivos de la tarea
      const deleteArchivos = db.prepare(`
        DELETE FROM Tarea_archivo
        WHERE id_tarea = ? AND id_asignatura = ?
      `);
      deleteArchivos.run(id_tarea, id_asignatura);

      // Eliminar la tarea
      const deleteTarea = db.prepare(`
        DELETE FROM Tareas
        WHERE id_tarea = ? AND id_asignatura = ?
      `);
      deleteTarea.run(id_tarea, id_asignatura);

      db.exec('COMMIT');
      return NextResponse.json({ success: true });
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json(
      { success: false, error: "Error al eliminar la tarea" },
      { status: 500 }
    );
  }
}
