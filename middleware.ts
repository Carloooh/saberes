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