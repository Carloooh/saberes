// api/docente/tareas/[id_tarea]/entregas/route.ts
import { NextResponse } from "next/server";
import db from "@/db";

export async function GET(request: Request, { params }: { params: { id_tarea: string } }) {
  try {
    const { searchParams } = new URL(request.url);
    const id_asignatura = searchParams.get("id_asignatura");

    if (!id_asignatura) {
      return NextResponse.json(
        { success: false, error: "Falta el ID de la asignatura" },
        { status: 400 }
      );
    }

    const id_tarea = params.id_tarea;

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

    const entregas = query.all(id_tarea, id_asignatura);
    const processedEntregas = entregas.map(e => ({
      ...e,
      archivos_entrega: JSON.parse(e.archivos_entrega || '[]')
    }));

    return NextResponse.json({ success: true, entregas: processedEntregas });
  } catch (error) {
    console.error("Error fetching deliveries:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener las entregas" },
      { status: 500 }
    );
  }
}
