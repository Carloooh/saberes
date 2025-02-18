// import { NextResponse } from "next/server";
// import db from "@/db";

// export async function GET(
//   request: Request,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const id = params.id;

//     const query = db.prepare(`
//       SELECT documento, titulo, extension
//       FROM Matricula_archivo
//       WHERE id_documento = ?
//     `);
    
//     const documento = query.get(id);

//     if (!documento) {
//       return NextResponse.json(
//         { error: "Documento no encontrado" },
//         { status: 404 }
//       );
//     }

//     // Create response with proper headers for file download
//     const headers = new Headers();
//     headers.set('Content-Disposition', `attachment; filename=${documento.titulo}.${documento.extension}`);
//     headers.set('Content-Type', `application/${documento.extension}`);

//     return new NextResponse(documento.documento, {
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

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    const query = db.prepare(`
      SELECT documento, titulo, extension
      FROM Matricula_archivo
      WHERE id_documento = ?
    `);
    
    const documento = query.get(id);

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
