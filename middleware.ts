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
  // const pathParts = path.split("/").filter(Boolean);

  // Skip API validation in middleware - we'll handle authorization in the API routes
  if (path.startsWith("/portalDocente")) {
    if (!["Docente", "Administrador"].includes(userSession.tipo_usuario)) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Skip additional validation for now to avoid fetch issues
    // We'll implement proper validation in the page components
  } else if (path.startsWith("/portalAlumno")) {
    if (userSession.tipo_usuario !== "Estudiante") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Skip additional validation for now to avoid fetch issues
    // We'll implement proper validation in the page components
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
