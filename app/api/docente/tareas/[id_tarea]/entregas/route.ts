// api/docente/tareas/[id_tarea]/entregas/route.ts
import { NextResponse } from "next/server";
import db from "@/db";

interface ArchivoEntrega {
  id_archivo: string;
  titulo: string;
  extension: string;
}

interface EntregaDB {
  id_entrega: string;
  id_tarea: string;
  id_curso: string;
  id_asignatura: string;
  rut_estudiante: string;
  fecha_entrega: string;
  comentario: string | null;
  estado: string;
  nombres: string;
  apellidos: string;
  archivos_entrega: string;
}

interface EntregaResponse extends Omit<EntregaDB, 'archivos_entrega'> {
  archivos_entrega: ArchivoEntrega[];
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id_asignatura = searchParams.get("id_asignatura");
    const id_tarea = searchParams.get("id_tarea");

    if (!id_asignatura) {
      return NextResponse.json(
        { success: false, error: "Falta el ID de la asignatura" },
        { status: 400 }
      );
    }

    const query = db.prepare(`
      SELECT 
        et.*,
        u.nombres,
        u.apellidos,
        COALESCE(
          (
            SELECT json_group_array(
              json_object(
                'id_archivo', eta.id_archivo,
                'titulo', eta.titulo,
                'extension', eta.extension
              )
            )
            FROM EntregaTarea_Archivo eta
            WHERE eta.id_entrega = et.id_entrega
          ), '[]'
        ) as archivos_entrega
      FROM EntregaTarea et
      JOIN Usuario u ON et.rut_estudiante = u.rut_usuario
      WHERE et.id_tarea = ? AND et.id_asignatura = ?
    `);

    const entregas = query.all(id_tarea, id_asignatura) as EntregaDB[];
    const processedEntregas = entregas.map((e: EntregaDB): EntregaResponse => ({
      ...e,
      archivos_entrega: JSON.parse(e.archivos_entrega || '[]')
    }));
    // const entregas = query.all(id_tarea, id_asignatura);
    // const processedEntregas = entregas.map(e => ({
    //   ...e,
    //   archivos_entrega: JSON.parse(e.archivos_entrega || '[]')
    // }));

    return NextResponse.json({ success: true, entregas: processedEntregas });
  } catch (error) {
    console.error("Error fetching deliveries:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener las entregas" },
      { status: 500 }
    );
  }
}
