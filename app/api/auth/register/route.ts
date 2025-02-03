import { NextResponse } from 'next/server';
import db from '@/db';
import bcrypt from 'bcrypt';


export async function POST(req: Request) {
  try {
    const { id_usuario, nombre, email, clave, tipo_usuario, estado, rut, hijos, cursos, asignaturas } =
      await req.json();

    const checkStmt = db.prepare(`SELECT * FROM Usuario WHERE email = ?`);
    const existingUser = checkStmt.get(email);
    if (existingUser) {
      return NextResponse.json({ success: false, error: 'El usuario ya existe' }, { status: 400 });
    }

    const hashedClave = await bcrypt.hash(clave, 10);

    const stmt = db.prepare(`
      INSERT INTO Usuario (id_usuario, nombre, email, clave, tipo_usuario, estado, rut, hijos, cursos, asignaturas)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    // stmt.run(id_usuario, nombre, email, hashedClave, tipo_usuario, estado, rut, hijos, cursos, asignaturas);
    stmt.run(
      id_usuario,
      nombre,
      email,
      hashedClave,
      tipo_usuario,
      estado ? 1 : 0, // Convertir booleano a 0 o 1
      rut,
      hijos ? JSON.stringify(hijos) : null, // Asegurar que sea string o null
      cursos ? JSON.stringify(cursos) : null,
      asignaturas ? JSON.stringify(asignaturas) : null
    );

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Error en el registro:', error);
    return NextResponse.json({ success: false, error: 'Error en el servidor' }, { status: 500 });
  }
}