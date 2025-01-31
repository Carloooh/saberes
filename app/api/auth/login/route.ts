// import { NextResponse } from 'next/server';
// import db from '@/db';
// import bcrypt from 'bcrypt';

// interface UserData {
//   id_usuario: string;
//   nombre: string;
//   email: string;
//   clave?: string;
//   tipo_usuario: string;
//   estado: boolean;
//   rut: string;
//   hijos?: string;
//   cursos?: string;
//   asignaturas?: string;
// }

// export async function POST(req: Request) {
//     try {
//       const { email, clave } = await req.json();
//       const stmt = db.prepare(`SELECT * FROM Usuario WHERE email = ?`);
//       const user = stmt.get(email) as UserData;
//       if (!user) {
//         return NextResponse.json({ success: false, error: 'Usuario no encontrado' }, { status: 404 });
//       }
  
//       if (!user.clave || typeof user.clave !== 'string') {
//         console.error('Error: clave inválida o no encontrada para el usuario', email);
//         return NextResponse.json({ success: false, error: 'Error en la autenticación' }, { status: 500 });
//       }
  
//       const isPasswordValid = await bcrypt.compare(clave, user.clave);
//       if (!isPasswordValid) {
//         return NextResponse.json({ success: false, error: 'Credenciales incorrectas' }, { status: 401 });
//       }
  
//       delete user.clave;
//       return NextResponse.json({ success: true, user }, { status: 200 });
//     } catch (error) {
//       console.error('Error en el login:', error);
//       return NextResponse.json({ success: false, error: 'Error en el servidor' }, { status: 500 });
//     }
//   }














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
















// import { NextResponse } from 'next/server';
// import db from '@/db';
// import bcrypt from 'bcrypt';
// import { serialize } from 'cookie';

// interface UserData {
//   id_usuario: string;
//   nombre: string;
//   email: string;
//   clave?: string;
//   tipo_usuario: string;
//   estado: boolean;
//   rut: string;
//   hijos?: string;
//   cursos?: string;
//   asignaturas?: string;
// }

// export async function POST(req: Request) {
//   try {
//     const { email, clave } = await req.json();

//     // Buscar al usuario en la base de datos
//     const stmt = db.prepare(`SELECT * FROM Usuario WHERE email = ?`);
//     const user = stmt.get(email) as UserData;

//     // Verificar si el usuario existe
//     if (!user) {
//       return NextResponse.json({ success: false, error: 'Usuario no encontrado' }, { status: 404 });
//     }

//     // Verificar si la clave existe y es válida
//     if (!user.clave || typeof user.clave !== 'string') {
//       console.error('Error: clave inválida o no encontrada para el usuario', email);
//       return NextResponse.json({ success: false, error: 'Error en la autenticación' }, { status: 500 });
//     }

//     // Comparar la contraseña proporcionada con el hash almacenado
//     const isPasswordValid = await bcrypt.compare(clave, user.clave);
//     if (!isPasswordValid) {
//       return NextResponse.json({ success: false, error: 'Credenciales incorrectas' }, { status: 401 });
//     }

//     // Eliminar la clave del objeto de usuario antes de devolverlo
//     delete user.clave;

//     // Crear una cookie segura para la sesión del usuario
//     const cookie = serialize('userSession', JSON.stringify(user), {
//       httpOnly: true, // La cookie no será accesible desde JavaScript
//       secure: process.env.NODE_ENV === 'production', // Solo enviar la cookie a través de HTTPS en producción
//       sameSite: 'strict', // Prevenir ataques CSRF
//       path: '/', // La cookie estará disponible en todas las rutas
//       maxAge: 60 * 60 * 24, // Duración de la cookie (1 día)
//     });

//     // Devolver la respuesta con la cookie establecida
//     return new Response(JSON.stringify({ success: true, user }), {
//       status: 200,
//       headers: { 'Set-Cookie': cookie },
//     });
//   } catch (error) {
//     console.error('Error en el login:', error);
//     return NextResponse.json({ success: false, error: 'Error en el servidor' }, { status: 500 });
//   }
// }