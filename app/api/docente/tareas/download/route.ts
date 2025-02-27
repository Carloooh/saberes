import { NextResponse } from "next/server";
import db from "@/db";

function getMimeType(extension: string): string {
  const mimeTypes: { [key: string]: string } = {
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    txt: "text/plain",
  };
  return mimeTypes[extension.toLowerCase()] || "application/octet-stream";
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const archivoId = searchParams.get("id");
    const tipo = searchParams.get("tipo") || "tarea"; // "tarea" o "entrega"
    const id_tarea = searchParams.get("tareaId");
    const asignaturaId = searchParams.get("asignaturaId");
    const cursoId = searchParams.get("cursoId");

    if (!archivoId) {
      return NextResponse.json(
        { success: false, error: "Falta el ID del archivo" },
        { status: 400 }
      );
    }

    const query = db.prepare(`
      SELECT archivo, extension, titulo
      FROM ${tipo === "tarea" ? "Tarea_archivo" : "EntregaTarea_Archivo"}
      WHERE id_archivo = ? 
    `);
    // const archivo = query.get(archivoId, id_tarea, cursoId, asignaturaId);
    const archivo = query.get(archivoId);

    if (!archivo) {
      return NextResponse.json(
        { success: false, error: "Archivo no encontrado" },
        { status: 404 }
      );
    }

    return new NextResponse(archivo.archivo, {
      headers: {
        "Content-Type": getMimeType(archivo.extension),
        "Content-Disposition": `inline; filename="${archivo.titulo}.${archivo.extension}"`,
      },
    });
  } catch (error) {
    console.error("Error downloading file:", error);
    return NextResponse.json(
      { success: false, error: "Error al descargar el archivo" },
      { status: 500 }
    );
  }
}
