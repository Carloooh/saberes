import { NextResponse } from 'next/server';
import db from '@/db';

// GET: Obtener todas las FAQs
export async function GET() {
  try {
    const stmt = db.prepare('SELECT * FROM informacioninstitucional WHERE tipo = ?');
    const faqs = stmt.all('faq');
    return NextResponse.json({ success: true, data: faqs }, { status: 200 });
  } catch (error) {
    console.error('Error al obtener las FAQs:', error);
    return NextResponse.json({ success: false, error: 'Error en el servidor' }, { status: 500 });
  }
}

// POST: Agregar una nueva FAQ
export async function POST(req: Request) {
  try {
    const { titulo, contenido } = await req.json();

    const stmt = db.prepare(`
      INSERT INTO informacioninstitucional (id_informacion, tipo, titulo, contenido)
      VALUES (?, ?, ?, ?)
    `);
    const id = crypto.randomUUID(); // Generar un ID único
    stmt.run(id, 'faq', titulo, contenido);

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Error al agregar la FAQ:', error);
    return NextResponse.json({ success: false, error: 'Error en el servidor' }, { status: 500 });
  }
}

// PUT: Actualizar una FAQ
export async function PUT(req: Request) {
  try {
    const { id_informacion, titulo, contenido } = await req.json();

    const stmt = db.prepare(`
      UPDATE informacioninstitucional
      SET titulo = ?, contenido = ?
      WHERE id_informacion = ?
    `);
    stmt.run(titulo, contenido, id_informacion);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error al actualizar la FAQ:', error);
    return NextResponse.json({ success: false, error: 'Error en el servidor' }, { status: 500 });
  }
}

// DELETE: Eliminar una FAQ
export async function DELETE(req: Request) {
  try {
    const { id_informacion } = await req.json();

    const stmt = db.prepare('DELETE FROM informacioninstitucional WHERE id_informacion = ?');
    stmt.run(id_informacion);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error al eliminar la FAQ:', error);
    return NextResponse.json({ success: false, error: 'Error en el servidor' }, { status: 500 });
  }
}