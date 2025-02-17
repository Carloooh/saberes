import { NextResponse } from 'next/server';
import db from '@/db';
import bcrypt from 'bcrypt';

interface UserData {
  rut_usuario: string;
  rut_tipo: string;
  email: string;
  clave: string;
  nombres: string;
  apellidos: string;
  tipo_usuario: string;
  estado: boolean;
  edad?: number;
  sexo?: string;
  nacionalidad?: string;
  talla?: string;
  fecha_nacimiento?: string;
  direccion?: string;
  comuna?: string;
  sector?: string;
  codigo_temporal?: string;
}


export async function POST(req: Request) {
  try {
    const { rut_usuario, clave } = await req.json();
    const stmt = db.prepare(`SELECT * FROM Usuario WHERE rut_usuario = ?`);
    const user = stmt.get(rut_usuario) as UserData;

    if (!user) {
      return NextResponse.json({ success: false, error: 'Usuario no encontrado' }, { status: 404 });
    }

    if (!user.clave || typeof user.clave !== 'string') {
      return NextResponse.json({ success: false, error: 'Error en la autenticación' }, { status: 500 });
    }

    const isPasswordValid = await bcrypt.compare(clave, user.clave);
    if (!isPasswordValid) {
      return NextResponse.json({ success: false, error: 'Credenciales incorrectas' }, { status: 401 });
    }

    delete user.clave;
    delete user.edad;
    delete user.sexo;
    delete user.nacionalidad;
    delete user.talla;
    delete user.fecha_nacimiento;
    delete user.direccion;
    delete user.comuna;
    delete user.sector;
    delete user.codigo_temporal;
    delete user.rut_tipo;

    // Crear respuesta con cookie de sesión
    const response = NextResponse.json({ success: true, user }, { status: 200 });

    response.cookies.set({
      name: "userSession",
      value: JSON.stringify({ rut_usuario: user.rut_usuario, tipo_usuario: user.tipo_usuario }),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 día
    });

    return response;
  } catch (error) {
    console.error('Error en el login:', error);
    return NextResponse.json({ success: false, error: 'Error en el servidor' }, { status: 500 });
  }
}