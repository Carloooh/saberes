import { NextResponse } from "next/server";
import db from "@/db";
import { v4 as uuidv4 } from "uuid";

interface TareaArchivo {
  id_archivo: string;
  titulo: string;
  extension: string;
}

interface TareaDB {
  id_tarea: string;
  id_asignatura: string;
  id_curso: string;
  titulo: string;
  descripcion: string;
  fecha: string;
  archivos: string;
}

interface TareaResponse {
  id_tarea: string;
  id_asignatura: string;
  titulo: string;
  descripcion: string;
  fecha: string;
  archivos: TareaArchivo[];
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const asignaturaId = searchParams.get("asignaturaId");
    const cursoId = searchParams.get("cursoId");

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
          DISTINCT json_object(
            'id_archivo', ta.id_archivo,
            'titulo', ta.titulo,
            'extension', ta.extension
          )
        ) as archivos
      FROM Tareas t
      LEFT JOIN Tarea_archivo ta ON t.id_tarea = ta.id_tarea
      WHERE t.id_asignatura = ? AND t.id_curso = ?
      GROUP BY t.id_tarea, t.id_asignatura
      ORDER BY t.fecha DESC
    `);

    const tareas = query.all(asignaturaId, cursoId) as TareaDB[];
    const processedTareas = tareas.map((tarea): TareaResponse => {
      const parsedArchivos = JSON.parse(tarea.archivos || "[]").filter(Boolean) as TareaArchivo[];
      return {
        id_tarea: tarea.id_tarea,
        id_asignatura: tarea.id_asignatura,
        titulo: tarea.titulo,
        descripcion: tarea.descripcion,
        fecha: tarea.fecha,
        archivos: parsedArchivos,
      };
    });
    // const processedTareas = tareas.map((tarea) => {
    //   const parsedArchivos = JSON.parse(tarea.archivos || "[]").filter(Boolean);
    //   return {
    //     id_tarea: tarea.id_tarea,
    //     id_asignatura: tarea.id_asignatura,
    //     titulo: tarea.titulo,
    //     descripcion: tarea.descripcion,
    //     fecha: tarea.fecha,
    //     archivos: parsedArchivos,
    //   };
    // });

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
    const cursoId = formData.get("cursoId") as string;
    const fecha = new Date().toISOString().split("T")[0];
    const archivos = formData.getAll("archivos");

    if (!titulo || !descripcion || !id_asignatura) {
      return NextResponse.json(
        { success: false, error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    const id_tarea = uuidv4();

    db.exec("BEGIN TRANSACTION");

    try {
      const insertTarea = db.prepare(`
        INSERT INTO Tareas (id_tarea, id_curso, id_asignatura, titulo, descripcion, fecha)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      insertTarea.run(
        id_tarea,
        cursoId,
        id_asignatura,
        titulo,
        descripcion,
        fecha
      );

      // Procesa archivos
      for (const file of archivos) {
        if (file instanceof File) {
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const fileName = file.name.split(".")[0];
          const extension = file.name.split(".").pop() || "";
          const id_archivo = uuidv4();

          const insertArchivo = db.prepare(`
            INSERT INTO Tarea_archivo (id_archivo, id_tarea, id_curso, id_asignatura, titulo, archivo, extension)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `);
          insertArchivo.run(
            id_archivo,
            id_tarea,
            cursoId,
            id_asignatura,
            fileName,
            buffer,
            extension
          );
        }
      }

      db.exec("COMMIT");
      return NextResponse.json({ success: true });
    } catch (error) {
      db.exec("ROLLBACK");
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
    const { id_tarea, id_asignatura, cursoId } = await request.json();

    if (!id_tarea || !id_asignatura) {
      return NextResponse.json(
        { success: false, error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    db.exec("BEGIN TRANSACTION");

    try {
      const deleteArchivos = db.prepare(`
        DELETE FROM Tarea_archivo
        WHERE id_tarea = ? AND id_asignatura = ? AND id_curso = ?
      `);
      deleteArchivos.run(id_tarea, id_asignatura, cursoId);

      const deleteTarea = db.prepare(`
        DELETE FROM Tareas
        WHERE id_tarea = ? AND id_asignatura = ? AND id_curso = ?
      `);
      deleteTarea.run(id_tarea, id_asignatura, cursoId);

      db.exec("COMMIT");
      return NextResponse.json({ success: true });
    } catch (error) {
      db.exec("ROLLBACK");
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

export async function PATCH(request: Request) {
  try {
    const { id_entrega, estado } = await request.json();

    if (!id_entrega || !estado) {
      return NextResponse.json(
        { success: false, error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    const updateEstado = db.prepare(`
      UPDATE EntregaTarea
      SET estado = ?
      WHERE id_entrega = ?
    `);
    updateEstado.run(estado, id_entrega);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating task status:", error);
    return NextResponse.json(
      { success: false, error: "Error al actualizar el estado de la tarea" },
      { status: 500 }
    );
  }
}
