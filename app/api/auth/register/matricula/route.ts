import { NextResponse } from 'next/server';
import db from '@/db';
import bcrypt from 'bcrypt';

export async function POST(req: Request) {
  try {
    const { 
      rut_usuario, 
      ...userData 
    } = await req.json();

    const checkStmt = db.prepare(`SELECT * FROM Usuario WHERE RUT_USUARIO = ?`);
    const existingUser = checkStmt.get(userData.rut_usuario);
    if (existingUser) {
      return NextResponse.json({ success: false, error: 'La persona ya está registrada en la base de datos' }, { status: 400 });
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
        userData.rut_tipo,
        userData.email,
        hashedClave,
        userData.nombres,
        userData.apellidos,
        "Estudiante",
        "Matricula",
        userData.edad,
        userData.sexo,
        userData.nacionalidad,
        userData.talla,
        userData.fecha_nacimiento,
        userData.direccion,
        userData.comuna,
        userData.sector,
        ''
      );

    const matriculaStmt = db.prepare(`INSERT INTO Matricula () values ()`);
    const matriculaArchivoStmt = db.prepare(`INSERT INTO Matricula_archivo () values ()`);
    const apoderadoStmt = db.prepare(`INSERT INTO Info_apoderado () values ()`);
    const medicaStmt = db.prepare(`INSERT INTO Info_medica () values ()`);
    const compromisosStmt = db.prepare(`INSERT INTO Matricula () values ()`);

    matriculaStmt.run(rut_usuario);
    matriculaArchivoStmt.run();
    matriculaArchivoStmt.run();
    matriculaArchivoStmt.run();
    matriculaArchivoStmt.run();
    if (userData.cert_diagnostico) {
        matriculaArchivoStmt.run();
    }
    apoderadoStmt.run(rut_usuario);
    medicaStmt.run(rut_usuario);
    compromisosStmt.run(rut_usuario);

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