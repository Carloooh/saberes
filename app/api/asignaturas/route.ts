import { NextResponse } from 'next/server';
import db from '@/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const cursosIds = searchParams.get('cursos')?.split(',') || [];

    const asignaturas = db.prepare(`
      SELECT DISTINCT a.* 
      FROM Asignaturas asg
      JOIN Asignatura a ON asg.id_asignatura = a.id_asignatura
      WHERE asg.id_curso IN (${cursosIds.map(() => '?').join(',')})
    `).all(...cursosIds);

    return NextResponse.json(asignaturas);
  } catch (error) {
    console.error('Error al obtener asignaturas:', error);
    return NextResponse.json({ success: false, error: 'Error en el servidor' }, { status: 500 });
  }
}