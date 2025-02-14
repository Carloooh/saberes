import { NextResponse } from 'next/server';
import db from '@/db';

// GET: Obtener todos los archivos de la galería
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const searchQuery = searchParams.get('search') || '';

    const stmt = db.prepare(`
      SELECT id_archivo, extension
      FROM Galeria
      WHERE id_archivo LIKE ? OR extension LIKE ?
    `);
    const files = stmt.all(`%${searchQuery}%`, `%${searchQuery}%`);

    return NextResponse.json({ success: true, data: files }, { status: 200 });
  } catch (error) {
    console.error('Error al obtener los archivos:', error);
    return NextResponse.json({ success: false, error: 'Error en el servidor' }, { status: 500 });
  }
}

// POST: Subir un nuevo archivo con manejo de nombres duplicados
export async function POST(req: Request) {
    try {
      const formData = await req.formData();
      const file = formData.get('file') as File;
  
      if (!file) {
        return NextResponse.json({ success: false, error: 'No se proporcionó ningún archivo' }, { status: 400 });
      }
  
      // Validar el tipo de archivo
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'video/mp4'];
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json({ success: false, error: 'Formato de archivo no permitido. Solo se permiten PNG, JPG, JPEG y MP4.' }, { status: 400 });
      }
  
      const fileBuffer = await file.arrayBuffer();
      const originalName = file.name.split('.').slice(0, -1).join('.') || 'archivo';
      const extension = file.name.split('.').pop() || '';
  
      let id = originalName;
      let count = 1;
  
      // Verificar si ya existe un archivo con el mismo nombre
      while (db.prepare('SELECT id_archivo FROM Galeria WHERE id_archivo = ?').get(id)) {
        id = `${originalName} (${count})`; // Agregar sufijo incremental
        count++;
      }
  
      const stmt = db.prepare(`
        INSERT INTO Galeria (id_archivo, archivo, extension)
        VALUES (?, ?, ?)
      `);
      stmt.run(id, Buffer.from(fileBuffer), extension);
  
      return NextResponse.json({ success: true, id }, { status: 201 });
    } catch (error) {
      console.error('Error al subir el archivo:', error);
      return NextResponse.json({ success: false, error: 'Error en el servidor' }, { status: 500 });
    }
  }

// PUT: Renombrar un archivo
export async function PUT(req: Request) {
  try {
    const { id_archivo, nuevoNombre } = await req.json();

    if (!id_archivo || !nuevoNombre) {
      return NextResponse.json({ success: false, error: 'Datos insuficientes' }, { status: 400 });
    }

    const stmt = db.prepare('UPDATE Galeria SET id_archivo = ? WHERE id_archivo = ?');
    stmt.run(nuevoNombre, id_archivo);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error al renombrar el archivo:', error);
    return NextResponse.json({ success: false, error: 'Error en el servidor' }, { status: 500 });
  }
}

// DELETE: Eliminar un archivo
export async function DELETE(req: Request) {
  try {
    const { id_archivo } = await req.json();

    const stmt = db.prepare('DELETE FROM Galeria WHERE id_archivo = ?');
    stmt.run(id_archivo);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error al eliminar el archivo:', error);
    return NextResponse.json({ success: false, error: 'Error en el servidor' }, { status: 500 });
  }
}

// GET: Descargar un archivo
export async function GET_DOWNLOAD(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID de archivo no proporcionado' }, { status: 400 });
    }

    const stmt = db.prepare('SELECT archivo, extension FROM Galeria WHERE id_archivo = ?');
    const file = stmt.get(id) as { archivo: Buffer, extension: string };

    if (!file) {
      return NextResponse.json({ success: false, error: 'Archivo no encontrado' }, { status: 404 });
    }

    return new Response(file.archivo, {
      headers: {
        'Content-Type': file.extension === 'mp4' ? 'video/mp4' : `image/${file.extension}`,
        'Content-Disposition': `attachment; filename="${id}.${file.extension}"`,
      },
    });
  } catch (error) {
    console.error('Error al descargar el archivo:', error);
    return NextResponse.json({ success: false, error: 'Error en el servidor' }, { status: 500 });
  }
}
