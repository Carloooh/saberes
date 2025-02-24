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

export async function GET( req: Request ) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID no proporcionado" },
        { status: 400 }
      );
    }

    const query = db.prepare(`
      SELECT archivo, extension, titulo
      FROM Sede_archivo
      WHERE id_archivo = ?
    `);

    const archivo = query.get(id);

    if (!archivo) {
      return NextResponse.json(
        { success: false, error: "Archivo no encontrado" },
        { status: 404 }
      );
    }

    const mimeType = getMimeType(archivo.extension);

    return new NextResponse(archivo.archivo, {
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `inline; filename="${archivo.titulo}.${archivo.extension}"`,
      },
    });
  } catch (error) {
    console.error("Error fetching file:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener el archivo" },
      { status: 500 }
    );
  }
}