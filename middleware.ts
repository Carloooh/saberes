// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";

// export async function middleware(request: NextRequest) {
//   // Obtener la cookie de sesión del usuario
//   const userSessionCookie = request.cookies.get("userSession")?.value;

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
//     if (!["Docente", "Administrador"].includes(userSession.tipo_usuario)) {
//       return NextResponse.redirect(new URL("/", request.url));
//     }
//   } else if (path.startsWith("/portalAdministrador")) {
//     if (userSession.tipo_usuario !== "Administrador") {
//       return NextResponse.redirect(new URL("/", request.url));
//     }
//   } else if (path.startsWith("/portalAlumno")) {
//     if (!["Estudiante"].includes(userSession.tipo_usuario)) {
//       return NextResponse.redirect(new URL("/", request.url));
//     }
//   } else if (path.startsWith("/perfil")) {
//     if (
//       !["Estudiante", "Docente", "Administrador"].includes(
//         userSession.tipo_usuario
//       )
//     ) {
//       return NextResponse.redirect(new URL("/", request.url));
//     }
//   }

//   return NextResponse.next();
// }

// // Configuración para aplicar el middleware solo a ciertas rutas
// export const config = {
//   matcher: [
//     "/portalDocente/:path*",
//     "/portalAdministrador/:path*",
//     "/portalAlumno/:path*",
//     "/perfil/:path*",
//   ],
// };
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const userSessionCookie = request.cookies.get("userSession")?.value;

  if (!userSessionCookie) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  let userSession;
  try {
    userSession = JSON.parse(userSessionCookie);
  } catch (error) {
    console.error("Error al parsear la sesión del usuario:", error);
    return NextResponse.redirect(new URL("/", request.url));
  }

  const path = request.nextUrl.pathname;
  const pathParts = path.split("/").filter(Boolean);

  if (path.startsWith("/portalDocente")) {
    if (!["Docente", "Administrador"].includes(userSession.tipo_usuario)) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (pathParts.length > 1) {
      const validateResponse = await fetch(
        `${request.nextUrl.origin}/api/auth/middleware?path=${path}&userType=gestor&userId=${userSession.rut_usuario}`
      );
      const { isValid } = await validateResponse.json();

      if (!isValid) {
        return NextResponse.redirect(new URL("/portalDocente", request.url));
      }
    }
  } else if (path.startsWith("/portalAlumno")) {
    if (!["Estudiante"].includes(userSession.tipo_usuario)) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (pathParts.length > 1) {
      const validateResponse = await fetch(
        `${request.nextUrl.origin}/api/auth/middleware?path=${path}&userType=estudiante&userId=${userSession.rut_usuario}`
      );
      const { isValid } = await validateResponse.json();

      if (!isValid) {
        return NextResponse.redirect(new URL("/portalAlumno", request.url));
      }
    }
  } else if (path.startsWith("/portalAdministrador")) {
    if (userSession.tipo_usuario !== "Administrador") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/portalDocente/:path*",
    "/portalAdministrador/:path*",
    "/portalAlumno/:path*",
    "/perfil/:path*",
  ],
};
