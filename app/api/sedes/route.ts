import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import db from "@/db";

export async function GET() {
  try {
    const query = db.prepare(`
      SELECT s.*, GROUP_CONCAT(sa.id_archivo) as archivo_ids,
             GROUP_CONCAT(sa.titulo) as archivo_titulos,
             GROUP_CONCAT(sa.extension) as archivo_extensions
      FROM Sede s
      LEFT JOIN Sede_archivo sa ON s.id_sede = sa.id_sede
      GROUP BY s.id_sede
      ORDER BY s.nombre ASC
    `);

    const sedes = query.all().map((sede) => {
      const archivo_ids = sede.archivo_ids ? sede.archivo_ids.split(",") : [];
      const archivo_titulos = sede.archivo_titulos
        ? sede.archivo_titulos.split(",")
        : [];
      const archivo_extensions = sede.archivo_extensions
        ? sede.archivo_extensions.split(",")
        : [];

      const archivos = archivo_ids.map((id: string, index: number) => ({
        id_archivo: id,
        titulo: archivo_titulos[index],
        extension: archivo_extensions[index],
      }));

      delete sede.archivo_ids;
      delete sede.archivo_titulos;
      delete sede.archivo_extensions;

      return {
        ...sede,
        cursos: sede.cursos ? JSON.parse(sede.cursos) : [],
        archivos: archivo_ids[0] ? archivos : [],
      };
    });

    return NextResponse.json({ success: true, data: sedes });
  } catch (error) {
    console.error("Error fetching sedes:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener las sedes" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const nombre = formData.get("nombre") as string;
    const direccion = formData.get("direccion") as string;
    const url = formData.get("url") as string;
    const url_iframe = formData.get("url_iframe") as string;
    const cursos = formData.get("cursos") as string;

    const id_sede = uuidv4();

    db.exec("BEGIN TRANSACTION");

    try {
      const insertSede = db.prepare(`
        INSERT INTO Sede (id_sede, nombre, direccion, url, url_iframe, cursos)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      insertSede.run(id_sede, nombre, direccion, url, url_iframe, cursos);

      const files = Object.keys(Object.fromEntries(formData))
        .filter((key) => key.startsWith("archivo-"))
        .map((key) => formData.get(key) as File);

      if (files.length > 0) {
        const insertArchivo = db.prepare(`
          INSERT INTO Sede_archivo (id_archivo, id_sede, titulo, archivo, extension)
          VALUES (?, ?, ?, ?, ?)
        `);

        for (const file of files) {
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const extension = file.name.split(".").pop() || "";
          const id_archivo = uuidv4();

          insertArchivo.run(
            id_archivo,
            id_sede,
            file.name.split(".")[0],
            buffer,
            extension
          );
        }
      }

      db.exec("COMMIT");
      return NextResponse.json({ success: true, id: id_sede });
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("Error creating sede:", error);
    return NextResponse.json(
      { success: false, error: "Error al crear la sede" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const formData = await request.formData();
    const id_sede = formData.get("id_sede") as string;
    const nombre = formData.get("nombre") as string;
    const direccion = formData.get("direccion") as string;
    const url = formData.get("url") as string;
    const url_iframe = formData.get("url_iframe") as string;
    const cursos = formData.get("cursos") as string;
    const archivosAEliminar = formData.get("archivosAEliminar") as string;

    db.exec("BEGIN TRANSACTION");

    try {
      const updateSede = db.prepare(`
        UPDATE Sede
        SET nombre = ?, direccion = ?, url = ?, url_iframe = ?, cursos = ?
        WHERE id_sede = ?
      `);
      updateSede.run(nombre, direccion, url, url_iframe, cursos, id_sede);

      if (archivosAEliminar) {
        const ids = JSON.parse(archivosAEliminar);
        const deleteArchivos = db.prepare(`
          DELETE FROM Sede_archivo 
          WHERE id_archivo IN (${ids.map(() => "?").join(",")})
        `);
        deleteArchivos.run(...ids);
      }

      const files = Object.keys(Object.fromEntries(formData))
        .filter((key) => key.startsWith("archivo-"))
        .map((key) => formData.get(key) as File);

      if (files.length > 0) {
        const insertArchivo = db.prepare(`
          INSERT INTO Sede_archivo 
          (id_archivo, id_sede, titulo, archivo, extension)
          VALUES (?, ?, ?, ?, ?)
        `);

        for (const file of files) {
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const extension = file.name.split(".").pop() || "";
          const id_archivo = uuidv4();

          insertArchivo.run(
            id_archivo,
            id_sede,
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
    console.error("Error updating sede:", error);
    return NextResponse.json(
      { success: false, error: "Error al actualizar la sede" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { id_sede } = await request.json();

    db.exec("BEGIN TRANSACTION");

    try {
      const deleteArchivos = db.prepare(`
        DELETE FROM Sede_archivo WHERE id_sede = ?
      `);
      deleteArchivos.run(id_sede);

      const deleteSede = db.prepare(`
        DELETE FROM Sede WHERE id_sede = ?
      `);
      deleteSede.run(id_sede);

      db.exec("COMMIT");
      return NextResponse.json({ success: true });
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("Error deleting sede:", error);
    return NextResponse.json(
      { success: false, error: "Error al eliminar la sede" },
      { status: 500 }
    );
  }
}