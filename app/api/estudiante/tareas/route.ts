import { NextRequest, NextResponse } from "next/server";
import db from "@/db";
import { v4 as uuidv4 } from "uuid";
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const asignaturaId = searchParams.get("asignaturaId");
    
    // Get user session from cookies
    const cookieStore = await cookies();
    const userSessionCookie = cookieStore.get("userSession")?.value;
    if (!userSessionCookie) {
      return NextResponse.json(
        { success: false, error: "No session found" },
        { status: 401 }
      );
    }

    const userSession = JSON.parse(userSessionCookie);
    const rutEstudiante = userSession.rut_usuario;

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
        et.id_entrega,
        et.fecha_entrega,
        et.estado,
        et.comentario,
        json_group_array(
          DISTINCT CASE WHEN eta.id_archivo IS NOT NULL THEN
            json_object(
              'id_archivo', eta.id_archivo,
              'titulo', eta.titulo,
              'extension', eta.extension
            )
          ELSE NULL END
        ) as archivos_entrega
      FROM Tareas t
      LEFT JOIN Tarea_archivo ta ON t.id_tarea = ta.id_tarea
      LEFT JOIN EntregaTarea et ON t.id_tarea = et.id_tarea 
        AND et.rut_estudiante = ?
      LEFT JOIN EntregaTarea_Archivo eta ON et.id_entrega = eta.id_entrega
      WHERE t.id_asignatura = ?
      GROUP BY t.id_tarea, t.id_asignatura
      ORDER BY t.fecha DESC
    `);

    const tareas = query.all(rutEstudiante, asignaturaId);

    // Process the results
    const processedTareas = tareas.map(tarea => ({
      ...tarea,
      archivos: JSON.parse(tarea.archivos).filter(Boolean),
      entrega: tarea.id_entrega ? {
        id_entrega: tarea.id_entrega,
        fecha_entrega: tarea.fecha_entrega,
        estado: tarea.estado,
        comentario: tarea.comentario,
        archivos: JSON.parse(tarea.archivos_entrega).filter(Boolean)
      } : null
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

export async function POST(request: NextRequest) {
    try {
      const formData = await request.formData();
      const tareaId = formData.get("tareaId") as string;
      const asignaturaId = formData.get("asignaturaId") as string;
      const comentario = formData.get("comentario") as string;
      
      // Get user session
      const cookieStore = await cookies();
      const userSessionCookie = cookieStore.get("userSession")?.value;
      if (!userSessionCookie) {
        return NextResponse.json(
          { success: false, error: "No session found" },
          { status: 401 }
        );
      }
  
      const userSession = JSON.parse(userSessionCookie);
      const rutEstudiante = userSession.rut_usuario;
  
      if (!tareaId || !asignaturaId) {
        return NextResponse.json(
          { success: false, error: "Faltan campos requeridos" },
          { status: 400 }
        );
      }
  
      const id_entrega = uuidv4();
      const fecha_entrega = new Date().toISOString().split('T')[0];
  
      db.exec('BEGIN TRANSACTION');
  
      try {
        // Create task submission
        const insertEntrega = db.prepare(`
          INSERT INTO EntregaTarea (
            id_entrega, id_tarea, id_asignatura, rut_estudiante, 
            fecha_entrega, estado, comentario
          )
          VALUES (?, ?, ?, ?, ?, 'entregada', ?)
        `);
        
        insertEntrega.run(
          id_entrega,
          tareaId,
          asignaturaId,
          rutEstudiante,
          fecha_entrega,
          comentario || null
        );
  
        // Process files
        const files = formData.getAll("archivos") as File[];
        
        for (const file of files) {
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const extension = file.name.split('.').pop() || '';
          const id_archivo = uuidv4();
  
          const insertArchivo = db.prepare(`
            INSERT INTO EntregaTarea_Archivo (
              id_archivo, id_entrega, titulo, 
              archivo, extension
            )
            VALUES (?, ?, ?, ?, ?)
          `);
  
          insertArchivo.run(
            id_archivo,
            id_entrega,
            file.name.split('.')[0],
            buffer,
            extension
          );
        }
  
        db.exec('COMMIT');
        return NextResponse.json({ success: true });
      } catch (error) {
        db.exec('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error("Error submitting task:", error);
      return NextResponse.json(
        { success: false, error: "Error al entregar la tarea" },
        { status: 500 }
      );
    }
  }