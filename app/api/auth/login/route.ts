import { NextResponse } from 'next/server';
import db from '@/db';
import bcrypt from 'bcrypt';

interface UserData {
  id_usuario: string;
  nombre: string;
  email: string;
  clave?: string;
  tipo_usuario: string;
  estado: boolean;
  rut: string;
  hijos?: string;
  cursos?: string;
  asignaturas?: string;
}

export async function POST(req: Request) {
  try {
    const { email, clave } = await req.json();
    const stmt = db.prepare(`SELECT * FROM Usuario WHERE email = ?`);
    const user = stmt.get(email) as UserData;

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

    // Crear respuesta con cookie de sesión
    const response = NextResponse.json({ success: true, user }, { status: 200 });

    response.cookies.set({
      name: "userSession",
      value: JSON.stringify({ tipo_usuario: user.tipo_usuario }),
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