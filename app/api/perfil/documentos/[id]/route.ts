// import { NextResponse } from "next/server";
// import db from "@/db";

// interface Archivo {
//   documento: Buffer;
//   extension: string;
//   titulo: string;
// }

// export async function GET( request: Request) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const id = searchParams.get('id');

//     const query = db.prepare(`
//       SELECT documento, titulo, extension
//       FROM Matricula_archivo
//       WHERE id_documento = ?
//     `);
    
//     const documento = query.get(id) as Archivo | null;

//     if (!documento) {
//       return NextResponse.json(
//         { error: "Documento no encontrado" },
//         { status: 404 }
//       );
//     }

//     const fileName = `${documento.titulo}.${documento.extension}`;
//     const headers = new Headers();
//     headers.set('Content-Disposition', `attachment; filename="${fileName}"`);
//     headers.set('Content-Type', `application/${documento.extension}`);

//     const buffer = Buffer.from(documento.documento);

//     return new NextResponse(buffer, {
//       status: 200,
//       headers,
//     });
//   } catch (error) {
//     console.error("Error al obtener el documento:", error);
//     return NextResponse.json(
//       { error: "Error al obtener el documento" },
//       { status: 500 }
//     );
//   }
// }


import { NextResponse } from "next/server";
import db from "@/db";

interface Archivo {
  documento: Buffer;
  extension: string;
  titulo: string;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    const query = db.prepare(`
      SELECT documento, titulo, extension
      FROM Matricula_archivo
      WHERE id_documento = ?
    `);
    
    const documento = query.get(id) as Archivo | null;

    if (!documento) {
      return NextResponse.json(
        { error: "Documento no encontrado" },
        { status: 404 }
      );
    }

    const fileName = `${documento.titulo}.${documento.extension}`;
    const headers = new Headers();
    headers.set('Content-Disposition', `attachment; filename="${fileName}"`);
    headers.set('Content-Type', `application/${documento.extension}`);

    const buffer = Buffer.from(documento.documento);

    return new NextResponse(buffer, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Error al obtener el documento:", error);
    return NextResponse.json(
      { error: "Error al obtener el documento" },
      { status: 500 }
    );
  }
}
