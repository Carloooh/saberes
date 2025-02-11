import { NextResponse } from 'next/server';
import db from '@/db';

export async function GET() {
  try {
    const cursos = db.prepare('SELECT * FROM Curso').all();
    return NextResponse.json(cursos);
  } catch (error) {
    console.error('Error al obtener cursos:', error);
    return NextResponse.json({ success: false, error: 'Error en el servidor' }, { status: 500 });
  }
}