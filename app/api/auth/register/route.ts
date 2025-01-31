// import db from '../../../db';
// import bcrypt from 'bcrypt';

// interface UserData {
//   id_usuario: string;
//   nombre: string;
//   email: string;
//   clave: string;
//   tipo_usuario: string;
//   estado: boolean;
//   rut: string;
//   hijos: string | null;
//   cursos: string | null;
//   asignaturas: string | null;
// }

// export async function registerUser(userData: UserData) {
//   const hashedClave = await bcrypt.hash(userData.clave, 10);
//   const stmt = db.prepare(`
//     INSERT INTO Usuario (id_usuario, nombre, email, clave, tipo_usuario, estado, rut, hijos, cursos, asignaturas)
//     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//   `);
//   try {
//     stmt.run(
//       userData.id_usuario,
//       userData.nombre,
//       userData.email,
//       hashedClave,
//       userData.tipo_usuario,
//       userData.estado,
//       userData.rut,
//       userData.hijos,
//       userData.cursos,
//       userData.asignaturas
//     );
//     return { success: true };
//   } catch (error) {
//     console.error(error);
//     return { success: false, error: 'User already exists or another error occurred' };
//   }
// }

// export async function loginUser(email: string, clave: string) {
//   const stmt = db.prepare(`SELECT * FROM Usuario WHERE email = ?`);
//   const user = stmt.get(email) as UserData;
//   if (user && await bcrypt.compare(clave, user.clave)) {
//     return { success: true, user: { ...user, clave: undefined } };
//   } else {
//     return { success: false, error: 'Invalid credentials' };
//   }
// }




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