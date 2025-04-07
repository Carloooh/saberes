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
    // Clear the invalid cookie
    const response = NextResponse.redirect(new URL("/", request.url));
    response.cookies.delete("userSession");
    return response;
  }

  // Ensure the session has the required fields
  if (!userSession || !userSession.tipo_usuario || !userSession.rut_usuario) {
    const response = NextResponse.redirect(new URL("/", request.url));
    response.cookies.delete("userSession");
    return response;
  }

  const path = request.nextUrl.pathname;
  const pathParts = path.split("/").filter(Boolean);

  if (path.startsWith("/portalDocente")) {
    if (!["Docente", "Administrador"].includes(userSession.tipo_usuario)) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (pathParts.length > 1) {
      // Pass the actual user type instead of "gestor"
      const validateResponse = await fetch(
        `${request.nextUrl.origin}/api/auth/middleware?path=${path}&userType=${userSession.tipo_usuario}&userId=${userSession.rut_usuario}`
      );
      const { isValid } = await validateResponse.json();

      if (!isValid) {
        return NextResponse.redirect(new URL("/portalDocente", request.url));
      }
    }
  } else if (path.startsWith("/portalAlumno")) {
    if (userSession.tipo_usuario !== "Estudiante") {
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
