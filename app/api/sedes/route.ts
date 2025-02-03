import { NextResponse } from 'next/server';
import db from '@/db';

// GET: Obtener todas las sedes
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const searchQuery = searchParams.get('search') || '';

    const stmt = db.prepare(`
      SELECT id_sede, nombre, direccion, url, imagen
      FROM sede
      WHERE nombre LIKE ? OR direccion LIKE ?
    `);
    const sedes = stmt.all(`%${searchQuery}%`, `%${searchQuery}%`);

    return NextResponse.json({ success: true, data: sedes }, { status: 200 });
  } catch (error) {
    console.error('Error al obtener las sedes:', error);
    return NextResponse.json({ success: false, error: 'Error en el servidor' }, { status: 500 });
  }
}

// POST: Agregar una nueva sede
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const nombre = formData.get('nombre') as string;
    const direccion = formData.get('direccion') as string;
    const url = formData.get('url') as string;
    const imagen = formData.get('imagen') as File;

    if (!nombre || !direccion || !url || !imagen) {
      return NextResponse.json({ success: false, error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    const imagenBuffer = await imagen.arrayBuffer();
    const stmt = db.prepare(`
      INSERT INTO sede (id_sede, nombre, direccion, url, imagen)
      VALUES (?, ?, ?, ?, ?)
    `);
    const id = crypto.randomUUID(); // Generar un ID único
    stmt.run(id, nombre, direccion, url, Buffer.from(imagenBuffer));

    return NextResponse.json({ success: true, id }, { status: 201 });
  } catch (error) {
    console.error('Error al agregar la sede:', error);
    return NextResponse.json({ success: false, error: 'Error en el servidor' }, { status: 500 });
  }
}

// PUT: Modificar una sede
export async function PUT(req: Request) {
  try {
    const formData = await req.formData();
    const id_sede = formData.get('id_sede') as string;
    const nombre = formData.get('nombre') as string;
    const direccion = formData.get('direccion') as string;
    const url = formData.get('url') as string;
    const imagen = formData.get('imagen') as File;

    if (!id_sede || !nombre || !direccion || !url) {
      return NextResponse.json({ success: false, error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    let imagenBuffer: Buffer | null = null;
    if (imagen) {
      imagenBuffer = Buffer.from(await imagen.arrayBuffer());
    }

    const stmt = db.prepare(`
      UPDATE sede
      SET nombre = ?, direccion = ?, url = ?, imagen = ?
      WHERE id_sede = ?
    `);
    stmt.run(nombre, direccion, url, imagenBuffer, id_sede);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error al modificar la sede:', error);
    return NextResponse.json({ success: false, error: 'Error en el servidor' }, { status: 500 });
  }
}

// DELETE: Eliminar una sede
export async function DELETE(req: Request) {
  try {
    const { id_sede } = await req.json();

    const stmt = db.prepare('DELETE FROM sede WHERE id_sede = ?');
    stmt.run(id_sede);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error al eliminar la sede:', error);
    return NextResponse.json({ success: false, error: 'Error en el servidor' }, { status: 500 });
  }
}