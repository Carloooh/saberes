import { NextResponse } from 'next/server';
import db from '@/db';
import bcrypt from 'bcrypt';


export async function POST(req: Request) {
  try {
    const { rut_usuario, rut_tipo, email, clave, nombres, apellidos, tipo_usuario, estado, edad, sexo, nacionalidad, talla, fecha_nacimiento, direccion, comuna, sector, codigo_temporal } =
      await req.json();

    const checkStmt = db.prepare(`SELECT * FROM Usuario WHERE email = ?`);
    const existingUser = checkStmt.get(email);
    if (existingUser) {
      return NextResponse.json({ success: false, error: 'El usuario ya existe' }, { status: 400 });
    }

    const hashedClave = await bcrypt.hash(clave, 10);

    const stmt = db.prepare(`
      INSERT INTO Usuario (rut_usuario, rut_tipo, email, clave, nombres, apellidos, tipo_usuario, estado, edad, sexo, nacionalidad, talla, fecha_nacimiento, direccion, comuna, sector, codigo_temporal)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      rut_usuario,
      rut_tipo,
      email,
      hashedClave,
      nombres,
      apellidos,
      tipo_usuario,
      estado ? 1 : 0,
      edad,
      sexo,
      nacionalidad,
      talla,
      fecha_nacimiento,
      direccion,
      comuna,
      sector,
      codigo_temporal
    );
    

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Error en el registro:', error);
    return NextResponse.json({ success: false, error: 'Error en el servidor' }, { status: 500 });
  }
}