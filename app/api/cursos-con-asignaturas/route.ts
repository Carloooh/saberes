import { NextResponse } from 'next/server';
import db from '@/db';

export async function GET() {
  try {
    const cursos = db.prepare(`
      SELECT 
        c.id_curso, 
        c.nombre_curso,
        GROUP_CONCAT(a.id_asignatura) AS asignaturas_ids,
        GROUP_CONCAT(a.nombre_asignatura) AS asignaturas_nombres
      FROM Curso c
      LEFT JOIN Asignaturas asg ON c.id_curso = asg.id_curso
      LEFT JOIN Asignatura a ON asg.id_asignatura = a.id_asignatura
      GROUP BY c.id_curso
    `).all() as { id_curso: number, nombre_curso: string, asignaturas_ids: string, asignaturas_nombres: string }[];

    const formatted = cursos.sort((a, b) => a.id_curso - b.id_curso).map(curso => ({
      id_curso: curso.id_curso,
      nombre_curso: curso.nombre_curso,
      asignaturas: curso.asignaturas_ids 
        ? curso.asignaturas_ids.split(',').map((id: string, index: number) => ({
            id_asignatura: id,
            nombre_asignatura: curso.asignaturas_nombres.split(',')[index]
          }))
          .sort((a, b) => a.nombre_asignatura.localeCompare(b.nombre_asignatura))
        : []
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Error al obtener cursos:', error);
    return NextResponse.json({ success: false, error: 'Error en el servidor' }, { status: 500 });
  }
}