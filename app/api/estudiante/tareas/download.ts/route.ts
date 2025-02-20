import { NextResponse } from "next/server";
import { cookies } from 'next/headers';
import db from "@/db";

function getMimeType(extension: string): string {
  const mimeTypes: { [key: string]: string } = {
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'txt': 'text/plain'
  };
  return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
}

export async function GET(request: Request) {
  try {
    // Get user session from cookies
    const cookieStore = await cookies();
    const userSessionCookie = cookieStore.get("userSession")?.value;
    if (!userSessionCookie) {
      return NextResponse.json(
        { success: false, error: "No session found" },
        { status: 401 }
      );
    }

    const userSession = JSON.parse(userSessionCookie);
    const rutEstudiante = userSession.rut_usuario;

    const { searchParams } = new URL(request.url);
    const archivoId = searchParams.get("id");
    const tipo = searchParams.get("tipo") || "tarea"; // "tarea" o "entrega"

    if (!archivoId) {
      return NextResponse.json(
        { success: false, error: "Falta el ID del archivo" },
        { status: 400 }
      );
    }

    let query;
    if (tipo === "tarea") {
      // For task files, verify the student has access to the task
      query = db.prepare(`
        SELECT ta.archivo, ta.extension, ta.titulo
        FROM Tarea_archivo ta
        JOIN Tareas t ON ta.id_tarea = t.id_tarea
        JOIN CursosAsignaturasLink cal ON t.id_asignatura = cal.id_asignatura
        WHERE ta.id_archivo = ? 
        AND cal.rut_usuario = ?
      `);
      const archivo = query.get(archivoId, rutEstudiante);
      if (!archivo) {
        return NextResponse.json(
          { success: false, error: "Archivo no encontrado o acceso no autorizado" },
          { status: 404 }
        );
      }
      return new NextResponse(archivo.archivo, {
        headers: {
          'Content-Type': getMimeType(archivo.extension),
          'Content-Disposition': `inline; filename="${archivo.titulo}.${archivo.extension}"`,
        },
      });
    } else {
      // For submission files, verify the student owns the submission
      query = db.prepare(`
        SELECT eta.archivo, eta.extension, eta.titulo
        FROM EntregaTarea_Archivo eta
        JOIN EntregaTarea et ON eta.id_entrega = et.id_entrega
        WHERE eta.id_archivo = ? 
        AND et.rut_estudiante = ?
      `);
      const archivo = query.get(archivoId, rutEstudiante);
      if (!archivo) {
        return NextResponse.json(
          { success: false, error: "Archivo no encontrado o acceso no autorizado" },
          { status: 404 }
        );
      }
      return new NextResponse(archivo.archivo, {
        headers: {
          'Content-Type': getMimeType(archivo.extension),
          'Content-Disposition': `inline; filename="${archivo.titulo}.${archivo.extension}"`,
        },
      });
    }
  } catch (error) {
    console.error("Error downloading file:", error);
    return NextResponse.json(
      { success: false, error: "Error al descargar el archivo" },
      { status: 500 }
    );
  }
}