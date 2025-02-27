import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import db from "@/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const destacado = searchParams.get("destacado");

  try {
    let query = db.prepare(`
      SELECT n.*, GROUP_CONCAT(na.id_archivo) as archivo_ids,
             GROUP_CONCAT(na.titulo) as archivo_titulos,
             GROUP_CONCAT(na.extension) as archivo_extensions
      FROM Noticia n
      LEFT JOIN Noticia_Archivo na ON n.id_noticia = na.id_noticia
      GROUP BY n.id_noticia
      ORDER BY n.fecha DESC
    `);
    if (destacado) {
      query = db.prepare(`
        SELECT n.*, GROUP_CONCAT(na.id_archivo) as archivo_ids,
               GROUP_CONCAT(na.titulo) as archivo_titulos,
               GROUP_CONCAT(na.extension) as archivo_extensions
        FROM Noticia n
        LEFT JOIN Noticia_Archivo na ON n.id_noticia = na.id_noticia
        WHERE n.destacado = '1'
        GROUP BY n.id_noticia
        ORDER BY n.fecha DESC
      `);
    }

    const noticias = query.all().map((noticia) => {
      const archivo_ids = noticia.archivo_ids
        ? noticia.archivo_ids.split(",")
        : [];
      const archivo_titulos = noticia.archivo_titulos
        ? noticia.archivo_titulos.split(",")
        : [];
      const archivo_extensions = noticia.archivo_extensions
        ? noticia.archivo_extensions.split(",")
        : [];

      const archivos = archivo_ids.map((id: string, index: number) => ({
        id_archivo: id,
        titulo: archivo_titulos[index],
        extension: archivo_extensions[index],
      }));

      delete noticia.archivo_ids;
      delete noticia.archivo_titulos;
      delete noticia.archivo_extensions;

      return {
        ...noticia,
        archivos,
      };
    });

    return NextResponse.json({ success: true, noticias });
  } catch (error) {
    console.error("Error fetching noticias:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener las noticias" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const titulo = formData.get("titulo") as string;
    const contenido = formData.get("contenido") as string;
    const destacado = formData.get("destacado") === "1" ? 1 : 0;

    const id_noticia = uuidv4();
    const fecha = new Date().toISOString();

    db.exec("BEGIN TRANSACTION");

    try {
      const insertNoticia = db.prepare(`
        INSERT INTO Noticia (id_noticia, titulo, contenido, destacado, fecha)
        VALUES (?, ?, ?, ?, ?)
      `);
      insertNoticia.run(id_noticia, titulo, contenido, destacado, fecha);

      // Process multiple files
      const files = Object.keys(Object.fromEntries(formData))
        .filter((key) => key.startsWith("archivo-"))
        .map((key) => formData.get(key) as File);

      if (files.length > 0) {
        const insertArchivo = db.prepare(`
          INSERT INTO Noticia_Archivo (id_archivo, id_noticia, titulo, archivo, extension)
          VALUES (?, ?, ?, ?, ?)
        `);

        for (const file of files) {
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const extension = file.name.split(".").pop() || "";
          const id_archivo = uuidv4();

          insertArchivo.run(
            id_archivo,
            id_noticia,
            file.name.split(".")[0],
            buffer,
            extension
          );
        }
      }

      db.exec("COMMIT");
      return NextResponse.json({ success: true });
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("Error creating noticia:", error);
    return NextResponse.json(
      { success: false, error: "Error al crear la noticia" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const formData = await request.formData();
    const id_noticia = formData.get("id_noticia") as string;
    const titulo = formData.get("titulo") as string;
    const contenido = formData.get("contenido") as string;
    const destacado = formData.get("destacado") === "1" ? 1 : 0;
    const archivosAEliminar = formData.get("archivosAEliminar") as string;

    db.exec("BEGIN TRANSACTION");

    try {
      // Actualizar noticia
      const updateNoticia = db.prepare(`
        UPDATE Noticia
        SET titulo = ?, contenido = ?, destacado = ?
        WHERE id_noticia = ?
      `);
      updateNoticia.run(titulo, contenido, destacado, id_noticia);

      // Eliminar archivos específicos si existen
      if (archivosAEliminar) {
        const ids = JSON.parse(archivosAEliminar);
        const deleteArchivos = db.prepare(`
          DELETE FROM Noticia_Archivo 
          WHERE id_archivo IN (${ids.map(() => "?").join(",")})
        `);
        deleteArchivos.run(...ids);
      }

      // Procesar nuevos archivos
      const files = Object.keys(Object.fromEntries(formData))
        .filter((key) => key.startsWith("archivo-"))
        .map((key) => formData.get(key) as File);

      if (files.length > 0) {
        const insertArchivo = db.prepare(`
          INSERT INTO Noticia_Archivo 
          (id_archivo, id_noticia, titulo, archivo, extension)
          VALUES (?, ?, ?, ?, ?)
        `);

        for (const file of files) {
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const extension = file.name.split(".").pop() || "";
          const id_archivo = uuidv4();

          insertArchivo.run(
            id_archivo,
            id_noticia,
            file.name.split(".")[0],
            buffer,
            extension
          );
        }
      }

      db.exec("COMMIT");
      return NextResponse.json({ success: true });
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("Error updating noticia:", error);
    return NextResponse.json(
      { success: false, error: "Error al actualizar la noticia" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID de noticia no proporcionado" },
        { status: 400 }
      );
    }

    db.exec("BEGIN TRANSACTION");

    try {
      // Delete associated files first
      const deleteArchivos = db.prepare(`
        DELETE FROM Noticia_Archivo WHERE id_noticia = ?
      `);
      deleteArchivos.run(id);

      // Then delete the noticia
      const deleteNoticia = db.prepare(`
        DELETE FROM Noticia WHERE id_noticia = ?
      `);
      deleteNoticia.run(id);

      db.exec("COMMIT");
      return NextResponse.json({ success: true });
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("Error deleting noticia:", error);
    return NextResponse.json(
      { success: false, error: "Error al eliminar la noticia" },
      { status: 500 }
    );
  }
}
