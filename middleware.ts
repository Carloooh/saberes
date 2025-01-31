// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";

// export async function middleware(request: NextRequest) {
//   // Obtener la cookie de sesión del usuario
//   const userSessionCookie = request.cookies.get("userSession")?.value;

//   console(userSessionCookie);
//   // Si no hay una sesión activa, redirigir al inicio
//   if (!userSessionCookie) {
//     return NextResponse.redirect(new URL("/", request.url));
//   }

//   // Parsear la sesión del usuario
//   let userSession;
//   try {
//     userSession = JSON.parse(userSessionCookie);
//   } catch (error) {
//     console.error("Error al parsear la sesión del usuario:", error);
//     return NextResponse.redirect(new URL("/", request.url));
//   }

//   // Verificar el rol del usuario según la ruta
//   const path = request.nextUrl.pathname;

//   if (path.startsWith("/portalDocente")) {
//     // Solo Docente, Profesor y Administrador pueden acceder
//     if (!["Docente", "Profesor", "Administrador"].includes(userSession.tipo_usuario)) {
//       return NextResponse.redirect(new URL("/", request.url));
//     }
//   } else if (path.startsWith("/portalAdministrador")) {
//     // Solo Administrador puede acceder
//     if (userSession.tipo_usuario !== "Administrador") {
//       return NextResponse.redirect(new URL("/", request.url));
//     }
//   } else if (path.startsWith("/portalAlumno")) {
//     // Solo Estudiante y Apoderado pueden acceder
//     if (!["Estudiante", "Apoderado"].includes(userSession.tipo_usuario)) {
//       return NextResponse.redirect(new URL("/", request.url));
//     }
//   }

//   // Permitir continuar si el usuario tiene acceso
//   return NextResponse.next();
// }

// // Configuración para aplicar el middleware solo a ciertas rutas
// export const config = {
//   matcher: ["/portalDocente/:path*", "/portalAdministrador/:path*", "/portalAlumno/:path*"],
// };






import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Obtener la cookie de sesión del usuario
  const userSessionCookie = request.cookies.get("userSession")?.value;

  console.log("Middleware - userSessionCookie:", userSessionCookie);

  // Si no hay una sesión activa, redirigir al inicio
  if (!userSessionCookie) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Parsear la sesión del usuario
  let userSession;
  try {
    userSession = JSON.parse(userSessionCookie);
  } catch (error) {
    console.error("Error al parsear la sesión del usuario:", error);
    return NextResponse.redirect(new URL("/", request.url));
  }

  console.log("Middleware - userSession:", userSession);

  // Verificar el rol del usuario según la ruta
  const path = request.nextUrl.pathname;

  if (path.startsWith("/portalDocente")) {
    if (!["Docente", "Profesor", "Administrador"].includes(userSession.tipo_usuario)) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  } else if (path.startsWith("/portalAdministrador")) {
    if (userSession.tipo_usuario !== "Administrador") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  } else if (path.startsWith("/portalAlumno")) {
    if (!["Estudiante", "Apoderado"].includes(userSession.tipo_usuario)) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

// Configuración para aplicar el middleware solo a ciertas rutas
export const config = {
  matcher: ["/portalDocente/:path*", "/portalAdministrador/:path*", "/portalAlumno/:path*"],
};




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
//   try {
//     const { email, clave } = await req.json();
//     const stmt = db.prepare(`SELECT * FROM Usuario WHERE email = ?`);
//     const user = stmt.get(email) as UserData;

//     if (!user) {
//       return NextResponse.json({ success: false, error: 'Usuario no encontrado' }, { status: 404 });
//     }

//     if (!user.clave || typeof user.clave !== 'string') {
//       return NextResponse.json({ success: false, error: 'Error en la autenticación' }, { status: 500 });
//     }

//     const isPasswordValid = await bcrypt.compare(clave, user.clave);
//     if (!isPasswordValid) {
//       return NextResponse.json({ success: false, error: 'Credenciales incorrectas' }, { status: 401 });
//     }

//     delete user.clave;

//     // Crear respuesta con cookie de sesión
//     const response = NextResponse.json({ success: true, user }, { status: 200 });

//     response.cookies.set({
//       name: "userSession",
//       value: JSON.stringify({ tipo_usuario: user.tipo_usuario }),
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       path: "/",
//       maxAge: 60 * 60 * 24, // 1 día
//     });

//     return response;
//   } catch (error) {
//     console.error('Error en el login:', error);
//     return NextResponse.json({ success: false, error: 'Error en el servidor' }, { status: 500 });
//   }
// }

