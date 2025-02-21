import { NextResponse } from "next/server";
import db from "@/db";

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
  { params }: { params: { id: string } }
) {
  try {
    if (!params.id) {
      return NextResponse.json(
        { success: false, error: "ID no proporcionado" },
        { status: 400 }
      );
    }

    // Log for debugging
    console.log("Fetching file with ID:", params.id);

    const query = db.prepare(`
      SELECT archivo, extension, titulo
      FROM Noticia_Archivo
      WHERE id_archivo = ?
    `);

    const archivo = query.get(params.id);

    // Log for debugging
    console.log("Query result:", archivo ? "File found" : "File not found");

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

    // Log for debugging
    console.log("Serving file with content type:", contentType);

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
