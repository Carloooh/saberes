import { NextResponse } from 'next/server';
import db from '@/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID de archivo no proporcionado' }, { status: 400 });
    }

    // Obtener el archivo desde la base de datos
    const stmt = db.prepare('SELECT archivo, extension FROM Galeria WHERE id_archivo = ?');
    const file = stmt.get(id) as { archivo: Buffer, extension: string };

    if (!file) {
      return NextResponse.json({ success: false, error: 'Archivo no encontrado' }, { status: 404 });
    }

    // Devolver el archivo como una respuesta
    return new Response(file.archivo, {
      headers: {
        'Content-Type': file.extension === 'mp4' ? 'video/mp4' : `image/${file.extension}`,
        'Content-Disposition': `inline; filename="${id}.${file.extension}"`,
      },
    });
  } catch (error) {
    console.error('Error al descargar el archivo:', error);
    return NextResponse.json({ success: false, error: 'Error en el servidor' }, { status: 500 });
  }
}