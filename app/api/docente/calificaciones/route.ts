import { NextResponse } from "next/server";
import db from "@/db";
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const asignaturaId = searchParams.get("asignaturaId");

    const query = db.prepare(`
      SELECT * FROM Calificaciones
      WHERE id_asignatura = ?
    `);
    const calificaciones = query.all(asignaturaId);

    return NextResponse.json({ success: true, calificaciones });
  } catch (error) {
    console.error("Error fetching grades:", error);
    return NextResponse.json({ success: false, error: "Error fetching grades" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { id_evaluacion, rut_estudiante, nota } = await request.json();

    const query = db.prepare(`
      INSERT INTO Calificaciones (id_calificaciones, id_evaluacion, rut_estudiante, nota)
      VALUES (?, ?, ?, ?)
    `);
    query.run(uuidv4(), id_evaluacion, rut_estudiante, nota);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving grade:", error);
    return NextResponse.json({ success: false, error: "Error saving grade" }, { status: 500 });
  }
}