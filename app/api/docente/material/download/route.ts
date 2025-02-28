import { NextResponse } from "next/server";
import db from "@/db";

interface Archivo {
  extension: string;
  archivo: Buffer;
  titulo: string;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const archivoId = searchParams.get("id");
    // const asignaturaId = searchParams.get("asignaturaId");
    // const cursoId = searchParams.get("cursoId");

    if (!archivoId) {
      return NextResponse.json(
        { success: false, error: "Falta el ID del archivo" },
        { status: 400 }
      );
    }

    const query = db.prepare(`
      SELECT archivo, extension, titulo
      FROM Material_archivo
      WHERE id_material_archivo = ?
    `);
    const material = query.get(archivoId) as Archivo | null;

    if (!material) {
      return NextResponse.json(
        { success: false, error: "Archivo no encontrado" },
        { status: 404 }
      );
    }

    const buffer = Buffer.from(material.archivo);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": getMimeType(material.extension),
        "Content-Disposition": `inline; filename="${material.titulo}.${material.extension}"`,
      },
    });
  } catch (error) {
    console.error("Error downloading file:", error);
    return NextResponse.json(
      { success: false, error: "Error downloading file" },
      { status: 500 }
    );
  }
}

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
    mp3: "audio/mpeg",
    mp4: "video/mp4",
  };

  return mimeTypes[extension.toLowerCase()] || "application/octet-stream";
}
