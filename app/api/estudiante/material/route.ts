import { NextResponse } from "next/server";
import db from "@/db";

interface MaterialArchivo {
  id_material_archivo: string;
  titulo: string;
  extension: string;
}

interface Material {
  id_material: string;
  id_curso: string;
  id_asignatura: string;
  titulo: string;
  descripcion: string;
  fecha: string;
  enlace: string | null;
  archivos: string;
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
        m.*,
        json_group_array(
          json_object(
            'id_material_archivo', ma.id_material_archivo,
            'titulo', ma.titulo,
            'extension', ma.extension
          )
        ) as archivos
      FROM Material_educativo m
      LEFT JOIN Material_archivo ma ON m.id_material = ma.id_material
      WHERE m.id_asignatura = ? AND m.id_curso = ?
      GROUP BY m.id_material
      ORDER BY m.fecha DESC
    `);

    const materiales = query.all(asignaturaId, cursoId) as Material[];

    // Parse the JSON string to actual array
    materiales.forEach((material) => {
      material.archivos = JSON.parse(material.archivos).filter(
        (a: MaterialArchivo) => a.id_material_archivo
      );
    });

    return NextResponse.json({ success: true, materiales });
  } catch (error) {
    console.error("Error fetching materials:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener los materiales" },
      { status: 500 }
    );
  }
}
