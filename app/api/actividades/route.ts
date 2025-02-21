import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import db from "@/db";

export async function GET() {
  try {
    const query = db.prepare(`
      SELECT a.*, GROUP_CONCAT(aa.id_archivo) as archivo_ids,
             GROUP_CONCAT(aa.titulo) as archivo_titulos,
             GROUP_CONCAT(aa.extension) as archivo_extensions
      FROM Actividad a
      LEFT JOIN Actividad_archivo aa ON a.id_actividad = aa.id_actividad
      GROUP BY a.id_actividad
      ORDER BY a.fecha DESC
    `);

    const actividades = query.all().map((actividad) => {
      const archivo_ids = actividad.archivo_ids
        ? actividad.archivo_ids.split(",")
        : [];
      const archivo_titulos = actividad.archivo_titulos
        ? actividad.archivo_titulos.split(",")
        : [];
      const archivo_extensions = actividad.archivo_extensions
        ? actividad.archivo_extensions.split(",")
        : [];

      const archivos = archivo_ids.map((id: string, index: number) => ({
        id_archivo: id,
        titulo: archivo_titulos[index],
        extension: archivo_extensions[index],
      }));

      delete actividad.archivo_ids;
      delete actividad.archivo_titulos;
      delete actividad.archivo_extensions;

      return {
        ...actividad,
        archivos,
      };
    });

    return NextResponse.json({ success: true, actividades });
  } catch (error) {
    console.error("Error fetching actividades:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener las actividades" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const titulo = formData.get("titulo") as string;
    const descripcion = formData.get("descripcion") as string;
    const fecha = formData.get("fecha") as string;
    const id_actividad = uuidv4();

    db.exec("BEGIN TRANSACTION");

    try {
      const insertActividad = db.prepare(`
        INSERT INTO Actividad (id_actividad, titulo, descripcion, fecha)
        VALUES (?, ?, ?, ?)
      `);
      insertActividad.run(id_actividad, titulo, descripcion, fecha);

      const insertArchivo = db.prepare(`
        INSERT INTO Actividad_archivo (id_archivo, id_actividad, titulo, archivo, extension)
        VALUES (?, ?, ?, ?, ?)
      `);

      const files = [];
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          files.push(value);
        }
      }

      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const extension = file.name.split(".").pop()?.toLowerCase() || "";
        const id_archivo = uuidv4();

        insertArchivo.run(
          id_archivo,
          id_actividad,
          file.name.split(".")[0],
          buffer,
          extension
        );
      }

      db.exec("COMMIT");
      return NextResponse.json({ success: true });
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("Error creating actividad:", error);
    return NextResponse.json(
      { success: false, error: "Error al crear la actividad" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const formData = await request.formData();
    const id_actividad = formData.get("id_actividad") as string;
    const titulo = formData.get("titulo") as string;
    const descripcion = formData.get("descripcion") as string;
    const fecha = formData.get("fecha") as string;
    const archivosAEliminar = formData.get("archivosAEliminar") as string;

    db.exec("BEGIN TRANSACTION");

    try {
      const updateActividad = db.prepare(`
        UPDATE Actividad
        SET titulo = ?, descripcion = ?, fecha = ?
        WHERE id_actividad = ?
      `);
      updateActividad.run(titulo, descripcion, fecha, id_actividad);

      if (archivosAEliminar) {
        const ids = JSON.parse(archivosAEliminar);
        const deleteArchivos = db.prepare(`
          DELETE FROM Actividad_archivo 
          WHERE id_archivo IN (${ids.map(() => "?").join(",")})
        `);
        deleteArchivos.run(...ids);
      }

      const files = [];
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          files.push(value);
        }
      }

      if (files.length > 0) {
        const insertArchivo = db.prepare(`
          INSERT INTO Actividad_archivo (id_archivo, id_actividad, titulo, archivo, extension)
          VALUES (?, ?, ?, ?, ?)
        `);

        for (const file of files) {
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const extension = file.name.split(".").pop()?.toLowerCase() || "";
          const id_archivo = uuidv4();

          insertArchivo.run(
            id_archivo,
            id_actividad,
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
    console.error("Error updating actividad:", error);
    return NextResponse.json(
      { success: false, error: "Error al actualizar la actividad" },
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
        { success: false, error: "ID no proporcionado" },
        { status: 400 }
      );
    }

    db.exec("BEGIN TRANSACTION");

    try {
      const deleteArchivos = db.prepare(
        "DELETE FROM Actividad_archivo WHERE id_actividad = ?"
      );
      const deleteActividad = db.prepare(
        "DELETE FROM Actividad WHERE id_actividad = ?"
      );

      deleteArchivos.run(id);
      deleteActividad.run(id);

      db.exec("COMMIT");
      return NextResponse.json({ success: true });
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("Error deleting actividad:", error);
    return NextResponse.json(
      { success: false, error: "Error al eliminar la actividad" },
      { status: 500 }
    );
  }
}
