import { NextResponse } from 'next/server';
import db from '@/db';

// GET: Obtener misión y visión
export async function GET() {
  try {
    const stmt = db.prepare('SELECT * FROM informacioninstitucional WHERE tipo IN (?, ?)');
    const result = stmt.all('mision', 'vision') as { tipo: string; contenido: string }[];

    // Formatear los datos para devolverlos como un objeto
    const data = {
      mision: result.find((item) => item.tipo === 'mision')?.contenido || '',
      vision: result.find((item) => item.tipo === 'vision')?.contenido || '',
    };

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    console.error('Error al obtener misión y visión:', error);
    return NextResponse.json({ success: false, error: 'Error en el servidor' }, { status: 500 });
  }
}

// PUT: Actualizar misión y visión
export async function PUT(req: Request) {
  try {
    const { mision, vision } = await req.json();

    // Actualizar misión
    const stmtMision = db.prepare('UPDATE informacioninstitucional SET contenido = ? WHERE tipo = ?');
    stmtMision.run(mision, 'mision');

    // Actualizar visión
    const stmtVision = db.prepare('UPDATE informacioninstitucional SET contenido = ? WHERE tipo = ?');
    stmtVision.run(vision, 'vision');

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error al actualizar misión y visión:', error);
    return NextResponse.json({ success: false, error: 'Error en el servidor' }, { status: 500 });
  }
}