import { NextResponse } from 'next/server';
import db from '@/db';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  try {
    const { 
      rut_usuario, 
      tipo_usuario,
      cursosAsignaturas = [],
      ...userData 
    } = await req.json();

    const checkStmt = db.prepare(`SELECT * FROM Usuario WHERE RUT_USUARIO = ?`);
    const existingUser = checkStmt.get(rut_usuario);
    if (existingUser) {
      return NextResponse.json({ success: false, error: 'El usuario ya existe' }, { status: 400 });
    }

    const hashedClave = await bcrypt.hash(userData.clave, 10);

    db.exec('BEGIN TRANSACTION');

    try {
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

      if (tipo_usuario === 'Docente') {
        const stmt = db.prepare(`
          INSERT INTO CursosAsignaturasLink (id_cursosasignaturaslink, rut_usuario, id_curso, id_asignatura)
          VALUES (?, ?, ?, ?)
        `);

        cursosAsignaturas.forEach(({ cursoId, asignaturas }: { cursoId: string, asignaturas: string[] }) => {
          asignaturas.forEach((asignaturaId: string) => {
            stmt.run(uuidv4(), rut_usuario, cursoId, asignaturaId);
          });
        });
      } else if (tipo_usuario === 'Administrador') {
        const stmt = db.prepare(`
          INSERT INTO CursosAsignaturasLink (id_cursosasignaturaslink, rut_usuario, id_curso, id_asignatura)
          VALUES (?, ?, ?, ?)
        `);

        const allCursos = db.prepare(`SELECT id_curso FROM Curso`).all() as { id_curso: string }[];
        const allAsignaturas = db.prepare(`SELECT id_asignatura FROM Asignatura`).all() as { id_asignatura: string }[];

        allCursos.forEach((curso) => {
          allAsignaturas.forEach((asignatura) => {
            stmt.run(uuidv4(), rut_usuario, curso.id_curso, asignatura.id_asignatura);
          });
        });
      } else {
        db.exec('ROLLBACK');
        return NextResponse.json({ success: false, error: 'Error en los datos ingresados' }, { status: 500 })
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