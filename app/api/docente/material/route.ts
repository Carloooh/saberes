// import { NextResponse } from "next/server";
// import db from "@/db";

// export async function GET(request: Request) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const asignaturaId = searchParams.get("asignaturaId");

//     if (!asignaturaId) {
//       return NextResponse.json(
//         { success: false, error: "Falta el ID de la asignatura" },
//         { status: 400 }
//       );
//     }

//     const query = db.prepare(`
//       SELECT m.*, ma.extension
//       FROM Material_educativo m
//       LEFT JOIN Material_archivo ma ON m.id_material = ma.id_material
//       WHERE m.id_asignatura = ?
//     `);
//     const materiales = query.all(asignaturaId);

//     return NextResponse.json({ success: true, materiales });
//   } catch (error) {
//     console.error("Error fetching materials:", error);
//     return NextResponse.json(
//       { success: false, error: "Error fetching materials" },
//       { status: 500 }
//     );
//   }
// }

// export async function POST(request: Request) {
//   try {
//     const formData = await request.formData();
//     const titulo = formData.get("titulo") as string;
//     const descripcion = formData.get("descripcion") as string;
//     const id_asignatura = formData.get("id_asignatura") as string;
//     const enlace = formData.get("enlace") as string;
//     const archivo = formData.get("archivo") as File;

//     if (!titulo || !descripcion || !id_asignatura) {
//       return NextResponse.json(
//         { success: false, error: "Faltan campos requeridos" },
//         { status: 400 }
//       );
//     }

//     const id_material = `${id_asignatura}-${Date.now()}`;

//     db.exec('BEGIN TRANSACTION');

//     try {
//       // Insertar material educativo
//       const fecha = new Date().toISOString().split('T')[0];
//       const insertMaterial = db.prepare(`
//         INSERT INTO Material_educativo (id_material, id_asignatura, titulo, descripcion, fecha, enlace)
//         VALUES (?, ?, ?, ?, ?, ?)
//       `);
//       insertMaterial.run(id_material, id_asignatura, titulo, descripcion, fecha, enlace);

//       // Si hay archivo, procesarlo
//       if (archivo) {
//         const arrayBuffer = await archivo.arrayBuffer();
//         const buffer = Buffer.from(arrayBuffer);
//         const extension = archivo.name.split('.').pop();

//         const insertArchivo = db.prepare(`
//           INSERT INTO Material_archivo (id_material_archivo, id_material, id_asignatura, titulo, archivo, extension)
//           VALUES (?, ?, ?, ?, ?, ?)
//         `);
//         insertArchivo.run(
//           `${id_material}-archivo`,
//           id_material,
//           id_asignatura,
//           titulo,
//           buffer,
//           extension
//         );
//       }

//       db.exec('COMMIT');
//       return NextResponse.json({ success: true });
//     } catch (error) {
//       db.exec('ROLLBACK');
//       throw error;
//     }
//   } catch (error) {
//     console.error("Error creating material:", error);
//     return NextResponse.json(
//       { success: false, error: "Error creating material" },
//       { status: 500 }
//     );
//   }
// }

// export async function PUT(request: Request) {
//   try {
//     const formData = await request.formData();
//     const id_material = formData.get("id_material") as string;
//     const titulo = formData.get("titulo") as string;
//     const descripcion = formData.get("descripcion") as string;
//     const enlace = formData.get("enlace") as string;
//     const archivo = formData.get("archivo") as File;

//     if (!id_material || !titulo || !descripcion) {
//       return NextResponse.json(
//         { success: false, error: "Faltan campos requeridos" },
//         { status: 400 }
//       );
//     }

//     db.exec('BEGIN TRANSACTION');

//     try {
//       // Actualizar material educativo
//       const updateMaterial = db.prepare(`
//         UPDATE Material_educativo
//         SET titulo = ?, descripcion = ?, enlace = ?
//         WHERE id_material = ?
//       `);
//       updateMaterial.run(titulo, descripcion, enlace, id_material);

//       // Si hay nuevo archivo
//       if (archivo) {
//         const arrayBuffer = await archivo.arrayBuffer();
//         const buffer = Buffer.from(arrayBuffer);
//         const extension = archivo.name.split('.').pop();

//         // Eliminar archivo anterior si existe
//         const deleteArchivo = db.prepare(`
//           DELETE FROM Material_archivo WHERE id_material = ?
//         `);
//         deleteArchivo.run(id_material);

//         // Insertar nuevo archivo
//         const insertArchivo = db.prepare(`
//           INSERT INTO Material_archivo (id_material_archivo, id_material, id_asignatura, titulo, archivo, extension)
//           VALUES (?, ?, ?, ?, ?, ?)
//         `);
//         insertArchivo.run(
//           `${id_material}-archivo`,
//           id_material,
//           formData.get("id_asignatura"),
//           titulo,
//           buffer,
//           extension
//         );
//       }

//       db.exec('COMMIT');
//       return NextResponse.json({ success: true });
//     } catch (error) {
//       db.exec('ROLLBACK');
//       throw error;
//     }
//   } catch (error) {
//     console.error("Error updating material:", error);
//     return NextResponse.json(
//       { success: false, error: "Error updating material" },
//       { status: 500 }
//     );
//   }
// }

// export async function DELETE(request: Request) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const id = searchParams.get("id");

//     if (!id) {
//       return NextResponse.json(
//         { success: false, error: "Falta el ID del material" },
//         { status: 400 }
//       );
//     }

//     db.exec('BEGIN TRANSACTION');

//     try {
//       // Eliminar archivos asociados
//       const deleteArchivos = db.prepare(`
//         DELETE FROM Material_archivo WHERE id_material = ?
//       `);
//       deleteArchivos.run(id);

//       // Eliminar material
//       const deleteMaterial = db.prepare(`
//         DELETE FROM Material_educativo WHERE id_material = ?
//       `);
//       deleteMaterial.run(id);

//       db.exec('COMMIT');
//       return NextResponse.json({ success: true });
//     } catch (error) {
//       db.exec('ROLLBACK');
//       throw error;
//     }
//   } catch (error) {
//     console.error("Error deleting material:", error);
//     return NextResponse.json(
//       { success: false, error: "Error deleting material" },
//       { status: 500 }
//     );
//   }
// }





import { NextResponse } from "next/server";
import db from "@/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const asignaturaId = searchParams.get("asignaturaId");

    if (!asignaturaId) {
      return NextResponse.json(
        { success: false, error: "Falta el ID de la asignatura" },
        { status: 400 }
      );
    }

    const query = db.prepare(`
      SELECT 
        m.*,
        json_group_array(
          json_object(
            'id_material_archivo', ma.id_material_archivo,
            'titulo', ma.titulo,
            'extension', ma.extension
          )
        ) as archivos
      FROM Material_educativo m
      LEFT JOIN Material_archivo ma ON m.id_material = ma.id_material
      WHERE m.id_asignatura = ?
      GROUP BY m.id_material
    `);
    const materiales = query.all(asignaturaId);

    // Parse the JSON string to actual array
    materiales.forEach(material => {
      material.archivos = JSON.parse(material.archivos).filter(a => a.id_material_archivo);
    });

    return NextResponse.json({ success: true, materiales });
  } catch (error) {
    console.error("Error fetching materials:", error);
    return NextResponse.json(
      { success: false, error: "Error fetching materials" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const titulo = formData.get("titulo") as string;
    const descripcion = formData.get("descripcion") as string;
    const id_asignatura = formData.get("id_asignatura") as string;
    const enlace = formData.get("enlace") as string;

    if (!titulo || !descripcion || !id_asignatura) {
      return NextResponse.json(
        { success: false, error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    const id_material = `${id_asignatura}-${Date.now()}`;

    db.exec('BEGIN TRANSACTION');

    try {
      const fecha = new Date().toISOString().split('T')[0];
      const insertMaterial = db.prepare(`
        INSERT INTO Material_educativo (id_material, id_asignatura, titulo, descripcion, fecha, enlace)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      insertMaterial.run(id_material, id_asignatura, titulo, descripcion, fecha, enlace);

      // Process multiple files
      const files = Object.keys(Object.fromEntries(formData))
        .filter(key => key.startsWith('archivo-'))
        .map(key => formData.get(key) as File);

      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const extension = file.name.split('.').pop();
        const id_material_archivo = `${id_material}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        const insertArchivo = db.prepare(`
          INSERT INTO Material_archivo (id_material_archivo, id_material, id_asignatura, titulo, archivo, extension)
          VALUES (?, ?, ?, ?, ?, ?)
        `);
        insertArchivo.run(
          id_material_archivo,
          id_material,
          id_asignatura,
          file.name.split('.')[0],
          buffer,
          extension
        );
      }

      db.exec('COMMIT');
      return NextResponse.json({ success: true });
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error("Error creating material:", error);
    return NextResponse.json(
      { success: false, error: "Error creating material" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const formData = await request.formData();
    const id_material = formData.get("id_material") as string;
    const titulo = formData.get("titulo") as string;
    const descripcion = formData.get("descripcion") as string;
    const enlace = formData.get("enlace") as string;

    if (!id_material || !titulo || !descripcion) {
      return NextResponse.json(
        { success: false, error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    db.exec('BEGIN TRANSACTION');

    try {
      const updateMaterial = db.prepare(`
        UPDATE Material_educativo
        SET titulo = ?, descripcion = ?, enlace = ?
        WHERE id_material = ?
      `);
      updateMaterial.run(titulo, descripcion, enlace, id_material);

      // Process multiple files
      const files = Object.keys(Object.fromEntries(formData))
        .filter(key => key.startsWith('archivo-'))
        .map(key => formData.get(key) as File);

      if (files.length > 0) {
        // Delete existing files only if new files are being uploaded
        const deleteArchivo = db.prepare(`
          DELETE FROM Material_archivo WHERE id_material = ?
        `);
        deleteArchivo.run(id_material);

        // Insert new files
        for (const file of files) {
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const extension = file.name.split('.').pop();
          const id_material_archivo = `${id_material}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

          const insertArchivo = db.prepare(`
            INSERT INTO Material_archivo (id_material_archivo, id_material, id_asignatura, titulo, archivo, extension)
            VALUES (?, ?, ?, ?, ?, ?)
          `);
          insertArchivo.run(
            id_material_archivo,
            id_material,
            formData.get("id_asignatura"),
            file.name.split('.')[0],
            buffer,
            extension
          );
        }
      }

      db.exec('COMMIT');
      return NextResponse.json({ success: true });
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error("Error updating material:", error);
    return NextResponse.json(
      { success: false, error: "Error updating material" },
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
        { success: false, error: "Falta el ID del material" },
        { status: 400 }
      );
    }

    db.exec('BEGIN TRANSACTION');

    try {
      const deleteArchivos = db.prepare(`
        DELETE FROM Material_archivo WHERE id_material = ?
      `);
      deleteArchivos.run(id);

      const deleteMaterial = db.prepare(`
        DELETE FROM Material_educativo WHERE id_material = ?
      `);
      deleteMaterial.run(id);

      db.exec('COMMIT');
      return NextResponse.json({ success: true });
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error("Error deleting material:", error);
    return NextResponse.json(
      { success: false, error: "Error deleting material" },
      { status: 500 }
    );
  }
}