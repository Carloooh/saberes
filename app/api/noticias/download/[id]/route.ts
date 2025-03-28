import { NextResponse } from "next/server";
import db from "@/db";

interface Archivo {
  archivo: Buffer;
  titulo: string;
  extension: string;
}

function getMimeType(extension: string): string {
  const mimeTypes: { [key: string]: string } = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    mp4: "video/mp4",
    webm: "video/webm",
  };
  return mimeTypes[extension.toLowerCase()] || "application/octet-stream";
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID no proporcionado" },
        { status: 400 }
      );
    }

    const query = db.prepare(`
      SELECT archivo, extension, titulo
      FROM Noticia_Archivo
      WHERE id_archivo = ?
    `);

    const archivo = query.get(id) as Archivo | null;

    if (!archivo) {
      return NextResponse.json(
        { success: false, error: "Archivo no encontrado" },
        { status: 404 }
      );
    }

    if (!archivo.archivo) {
      return NextResponse.json(
        { success: false, error: "Contenido del archivo no encontrado" },
        { status: 404 }
      );
    }

    const contentType = getMimeType(archivo.extension);

    return new NextResponse(archivo.archivo, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${archivo.titulo}.${archivo.extension}"`,
      },
    });
  } catch (error) {
    console.error("Error in download endpoint:", error);
    return NextResponse.json(
      { success: false, error: "Error al descargar el archivo" },
      { status: 500 }
    );
  }
}
