// import { NextResponse } from "next/server";
// import db from "@/db";

// interface Archivo {
//   archivo: Buffer;
//   extension: string;
//   titulo: string;
// }

// function getMimeType(extension: string): string {
//   const mimeTypes: { [key: string]: string } = {
//     jpg: "image/jpeg",
//     jpeg: "image/jpeg",
//     png: "image/png",
//     gif: "image/gif",
//     mp4: "video/mp4",
//     webm: "video/webm",
//   };
//   return mimeTypes[extension.toLowerCase()] || "application/octet-stream";
// }

// export async function GET( request: Request,  context: { params: { id: string } }) {
//   try {
//     // const { searchParams } = new URL(request.url);
//     // const id = searchParams.get("id");
//     const { id } = await context.params;
//     if (!id) {
//       return NextResponse.json(
//         { success: false, error: "ID no proporcionado" },
//         { status: 400 }
//       );
//     }

//     const query = db.prepare(`
//       SELECT archivo, extension, titulo
//       FROM Actividad_archivo
//       WHERE id_archivo = ?
//     `);

//     const archivo = query.get(id) as Archivo | null;

//     if (!archivo || !archivo.archivo) {
//       return NextResponse.json(
//         { success: false, error: "Archivo no encontrado" },
//         { status: 404 }
//       );
//     }

//     const contentType = getMimeType(archivo.extension);

//     return new NextResponse(archivo.archivo, {
//       headers: {
//         "Content-Type": contentType,
//         "Content-Disposition": `inline; filename="${archivo.titulo}.${archivo.extension}"`,
//       },
//     });
//   } catch (error) {
//     console.error("Error in download endpoint:", error);
//     return NextResponse.json(
//       { success: false, error: "Error al descargar el archivo" },
//       { status: 500 }
//     );
//   }
// }


import { NextResponse } from "next/server";
import db from "@/db";

interface Archivo {
  archivo: Buffer;
  extension: string;
  titulo: string;
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
    // Ahora context.params es awaitable:
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID no proporcionado" },
        { status: 400 }
      );
    }

    const query = db.prepare(`
      SELECT archivo, extension, titulo
      FROM Actividad_archivo
      WHERE id_archivo = ?
    `);

    const archivo = query.get(id) as Archivo | null;

    if (!archivo || !archivo.archivo) {
      return NextResponse.json(
        { success: false, error: "Archivo no encontrado" },
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
