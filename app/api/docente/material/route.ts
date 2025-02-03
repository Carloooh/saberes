import { NextResponse } from "next/server";
import db from "@/db";

// GET: Obtener materiales por curso y asignatura
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cursoId = searchParams.get("cursoId");
    const asignaturaId = searchParams.get("asignaturaId");

    if (!cursoId || !asignaturaId) {
      return NextResponse.json(
        { success: false, error: "Faltan parámetros requeridos" },
        { status: 400 }
      );
    }

    // Obtener materiales de la base de datos
    const stmt = db.prepare(`
      SELECT * FROM Material
      WHERE id_asignatura = ?
    `);
    const materiales = stmt.all(asignaturaId);

    return NextResponse.json({ success: true, data: materiales }, { status: 200 });
  } catch (error) {
    console.error("Error al obtener los materiales:", error);
    return NextResponse.json(
      { success: false, error: "Error en el servidor" },
      { status: 500 }
    );
  }
}

// POST: Agregar un nuevo material
export async function POST(request: Request) {
  try {
    const { nombre, archivo, enlace, id_asignatura } = await request.json();

    if (!nombre || !id_asignatura) {
      return NextResponse.json(
        { success: false, error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    // Insertar el material en la base de datos
    const stmt = db.prepare(`
      INSERT INTO Material (id_material, nombre, archivo, enlace, id_asignatura)
      VALUES (?, ?, ?, ?, ?)
    `);
    const id_material = crypto.randomUUID(); // Generar un ID único
    stmt.run(id_material, nombre, archivo, enlace, id_asignatura);

    return NextResponse.json({ success: true, id_material }, { status: 201 });
  } catch (error) {
    console.error("Error al agregar el material:", error);
    return NextResponse.json(
      { success: false, error: "Error en el servidor" },
      { status: 500 }
    );
  }
}

// PUT: Editar un material existente
export async function PUT(request: Request) {
  try {
    const { id_material, nombre, archivo, enlace, id_asignatura } = await request.json();

    if (!id_material || !nombre || !id_asignatura) {
      return NextResponse.json(
        { success: false, error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    // Actualizar el material en la base de datos
    const stmt = db.prepare(`
      UPDATE Material
      SET nombre = ?, archivo = ?, enlace = ?, id_asignatura = ?
      WHERE id_material = ?
    `);
    stmt.run(nombre, archivo, enlace, id_asignatura, id_material);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error al editar el material:", error);
    return NextResponse.json(
      { success: false, error: "Error en el servidor" },
      { status: 500 }
    );
  }
}

// DELETE: Eliminar un material
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id_material = searchParams.get("id");

    if (!id_material) {
      return NextResponse.json(
        { success: false, error: "Falta el ID del material" },
        { status: 400 }
      );
    }

    // Eliminar el material de la base de datos
    const stmt = db.prepare("DELETE FROM Material WHERE id_material = ?");
    stmt.run(id_material);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error al eliminar el material:", error);
    return NextResponse.json(
      { success: false, error: "Error en el servidor" },
      { status: 500 }
    );
  }
}