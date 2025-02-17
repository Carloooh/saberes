import { NextResponse } from 'next/server';
import db from '@/db';
import bcrypt from 'bcrypt';

export async function POST(req: Request) {
  try {
    const { 
      rut_usuario, 
      tipo_usuario,
      cursosAsignaturas = [],
      // cursos = [],
      // asignaturas = [],
      ...userData 
    } = await req.json();

    const checkStmt = db.prepare(`SELECT * FROM Usuario WHERE RUT_USUARIO = ?`);
    const existingUser = checkStmt.get(userData.rut_usuario);
    if (existingUser) {
      return NextResponse.json({ success: false, error: 'El usuario ya existe' }, { status: 400 });
    }

    const hashedClave = await bcrypt.hash(userData.clave, 10);

    db.exec('BEGIN TRANSACTION');

    try {
      // Insertar usuario
      const userStmt = db.prepare(`
        INSERT INTO Usuario (
          rut_usuario, rut_tipo, email, clave, nombres, apellidos, 
          tipo_usuario, estado, edad, sexo, nacionalidad, talla, 
          fecha_nacimiento, direccion, comuna, sector, codigo_temporal
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      userStmt.run(
        rut_usuario,
        userData.rut_tipo || '',
        userData.email,
        hashedClave,
        userData.nombres,
        userData.apellidos,
        tipo_usuario,
        0,
        userData.edad || null,
        userData.sexo || '',
        userData.nacionalidad || '',
        userData.talla || '',
        userData.fecha_nacimiento || '',
        userData.direccion || '',
        userData.comuna || '',
        userData.sector || '',
        userData.codigo_temporal || ''
      );

      // Insertar relaciones para Docente
      if (tipo_usuario === 'Docente') {
        const cursoStmt = db.prepare(`
          INSERT INTO CursosLink (rut_usuario, id_curso) VALUES (?, ?)
        `);
        
        const asignaturaStmt = db.prepare(`
          INSERT INTO AsignaturasLink (rut_usuario, id_asignatura) VALUES (?, ?)
        `);

        cursosAsignaturas.forEach(({ cursoId, asignaturas }: { cursoId: string, asignaturas: string[] }) => {
          cursoStmt.run(rut_usuario, cursoId);

          asignaturas.forEach((asignaturaId: string) => {
            asignaturaStmt.run(rut_usuario, asignaturaId);
          });
        });
        

      if (tipo_usuario === 'Administrador') {
        const allCursos = db.prepare(`SELECT id_curso FROM Curso`).all() as { id_curso: string }[];
        const allAsignaturas = db.prepare(`SELECT id_asignatura FROM Asignatura`).all() as { id_asignatura: string }[];

        const cursoStmt = db.prepare(`
          INSERT INTO CursosLink (rut_usuario, id_curso) VALUES (?, ?)
        `);

        const asignaturaStmt = db.prepare(`
          INSERT INTO AsignaturasLink (rut_usuario, id_asignatura) VALUES (?, ?)
        `);

        allCursos.forEach((curso: { id_curso: string }) => {
          cursoStmt.run(rut_usuario, curso.id_curso);
        });

        allAsignaturas.forEach((asignatura: { id_asignatura: string }) => {
          asignaturaStmt.run(rut_usuario, asignatura.id_asignatura);
        });
      }

      db.exec('COMMIT');
      return NextResponse.json({ success: true }, { status: 201 });

    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Error en el registro:', error);
    return NextResponse.json({ success: false, error: 'Error en el servidor' }, { status: 500 });
  }
}