import { NextResponse } from "next/server";
import db from "@/db";

// GET: Obtener todas las asignaturas
export async function GET() {
  try {
    const stmt = db.prepare("SELECT * FROM Asignatura ORDER BY id_asignatura");
    const asignaturas = stmt.all();
    return NextResponse.json(
      { success: true, data: asignaturas },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al obtener las asignaturas:", error);
    return NextResponse.json(
      { success: false, error: "Error en el servidor" },
      { status: 500 }
    );
  }
}

// POST: Agregar una nueva asignatura
export async function POST(req: Request) {
  try {
    const { nombre_asignatura } = await req.json();

    // Obtener el ID más alto actual
    const maxIdStmt = db.prepare(
      "SELECT MAX(CAST(id_asignatura AS INTEGER)) as maxId FROM Asignatura"
    );
    const { maxId } = maxIdStmt.get() as { maxId: number };
    const newId = (maxId || 0) + 1;

    const stmt = db.prepare(`
      INSERT INTO Asignatura (id_asignatura, nombre_asignatura)
      VALUES (?, ?)
    `);
    stmt.run(newId.toString(), nombre_asignatura);

    return NextResponse.json({ success: true, id: newId }, { status: 201 });
  } catch (error) {
    console.error("Error al agregar la asignatura:", error);
    return NextResponse.json(
      { success: false, error: "Error en el servidor" },
      { status: 500 }
    );
  }
}

// PUT: Actualizar una asignatura
export async function PUT(req: Request) {
  try {
    const { id_asignatura, nombre_asignatura } = await req.json();

    const stmt = db.prepare(`
      UPDATE Asignatura
      SET nombre_asignatura = ?
      WHERE id_asignatura = ?
    `);
    stmt.run(nombre_asignatura, id_asignatura);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error al actualizar la asignatura:", error);
    return NextResponse.json(
      { success: false, error: "Error en el servidor" },
      { status: 500 }
    );
  }
}

// DELETE: Eliminar una asignatura
export async function DELETE(req: Request) {
  try {
    const { id_asignatura } = await req.json();

    const stmt = db.prepare("DELETE FROM Asignatura WHERE id_asignatura = ?");
    stmt.run(id_asignatura);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error al eliminar la asignatura:", error);
    return NextResponse.json(
      { success: false, error: "Error en el servidor" },
      { status: 500 }
    );
  }
}
