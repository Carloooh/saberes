import { NextResponse } from "next/server";
import db from "@/db";
import { v4 as uuidv4 } from "uuid";

// GET: Obtener todos los cursos con sus asignaturas
export async function GET() {
  try {
    const stmt = db.prepare(`
      SELECT 
        c.id_curso,
        c.nombre_curso,
        GROUP_CONCAT(DISTINCT a.id_asignatura) as asignaturas_ids,
        GROUP_CONCAT(DISTINCT a.nombre_asignatura) as asignaturas_nombres
      FROM Curso c
      LEFT JOIN Asignaturas as_link ON c.id_curso = as_link.id_curso
      LEFT JOIN Asignatura a ON as_link.id_asignatura = a.id_asignatura
      GROUP BY c.id_curso
      ORDER BY c.nombre_curso
    `);

    const cursos = (stmt.all() as { 
      id_curso: string; 
      nombre_curso: string; 
      asignaturas_ids: string | null; 
      asignaturas_nombres: string | null; 
    }[]).map((curso) => ({
      id_curso: curso.id_curso,
      nombre_curso: curso.nombre_curso,
      asignaturas: curso.asignaturas_ids
        ? curso.asignaturas_ids.split(",").map((id: string, index: number) => ({
            id_asignatura: id,
            nombre_asignatura: curso.asignaturas_nombres!.split(",")[index],
          }))
        : [],
    }));
    // Get all available asignaturas
    const asignaturasStmt = db.prepare(
      "SELECT * FROM Asignatura ORDER BY nombre_asignatura"
    );
    const allAsignaturas = asignaturasStmt.all();

    return NextResponse.json({
      success: true,
      data: cursos,
      asignaturas: allAsignaturas,
    });
  } catch (error) {
    console.error("Error al obtener los cursos:", error);
    return NextResponse.json(
      { success: false, error: "Error en el servidor" },
      { status: 500 }
    );
  }
}

// POST: Crear nuevo curso
export async function POST(req: Request) {
  try {
    const { nombre_curso, asignaturas } = await req.json();

    const maxIdStmt = db.prepare(
      "SELECT MAX(CAST(id_curso AS INTEGER)) as maxId FROM Curso"
    );
    const { maxId } = maxIdStmt.get() as { maxId: number };
    const newId = (maxId || 0) + 1;

    db.transaction(() => {
      // Insert new course
      const insertCurso = db.prepare(
        "INSERT INTO Curso (id_curso, nombre_curso) VALUES (?, ?)"
      );
      insertCurso.run(newId.toString(), nombre_curso);

      // Insert course-subject relationships
      const insertAsignatura = db.prepare(
        "INSERT INTO Asignaturas (id_curso, id_asignatura) VALUES (?, ?)"
      );
      asignaturas.forEach((asignaturaId: string) => {
        insertAsignatura.run(newId.toString(), asignaturaId);
      });

      // Update administrators' links
      const getAdmins = db.prepare(
        `SELECT rut_usuario FROM Usuario WHERE tipo_usuario = 'Administrador'`
      );
      const insertAdminLink = db.prepare(`
          INSERT INTO CursosAsignaturasLink (id_cursosasignaturaslink, rut_usuario, id_curso, id_asignatura)
          VALUES (?, ?, ?, ?)
        `);

      // const admins = getAdmins.all();
      const admins = getAdmins.all() as { rut_usuario: string }[];
      admins.forEach((admin: { rut_usuario: string }) => {
        asignaturas.forEach((asignaturaId: string) => {
          insertAdminLink.run(
            uuidv4(),
            admin.rut_usuario,
            newId.toString(),
            asignaturaId
          );
        });
      });
    })();

    return NextResponse.json({ success: true, id: newId }, { status: 201 });
  } catch (error) {
    console.error("Error al crear el curso:", error);
    return NextResponse.json(
      { success: false, error: "Error en el servidor" },
      { status: 500 }
    );
  }
}

// PUT: Actualizar curso
export async function PUT(req: Request) {
  try {
    const { id_curso, nombre_curso, asignaturas } = await req.json();

    db.transaction(() => {
      // Update course name
      const updateCurso = db.prepare(
        "UPDATE Curso SET nombre_curso = ? WHERE id_curso = ?"
      );
      updateCurso.run(nombre_curso, id_curso);

      // Update course-subject relationships
      const deleteAsignaturas = db.prepare(
        "DELETE FROM Asignaturas WHERE id_curso = ?"
      );
      const insertAsignatura = db.prepare(
        "INSERT INTO Asignaturas (id_curso, id_asignatura) VALUES (?, ?)"
      );

      deleteAsignaturas.run(id_curso);
      asignaturas.forEach((asignaturaId: string) => {
        insertAsignatura.run(id_curso, asignaturaId);
      });

      // Update administrators' links
      const deleteAdminLinks = db.prepare(
        `DELETE FROM CursosAsignaturasLink WHERE id_curso = ? AND rut_usuario IN (SELECT rut_usuario FROM Usuario WHERE tipo_usuario = 'Administrador')`
      );
      const getAdmins = db.prepare(
        `SELECT rut_usuario FROM Usuario WHERE tipo_usuario = 'Administrador'`
      );
      const insertAdminLink = db.prepare(`
          INSERT INTO CursosAsignaturasLink (id_cursosasignaturaslink, rut_usuario, id_curso, id_asignatura)
          VALUES (?, ?, ?, ?)
        `);

      deleteAdminLinks.run(id_curso);

      // const admins = getAdmins.all();
      const admins = getAdmins.all() as { rut_usuario: string }[];
      admins.forEach((admin: { rut_usuario: string }) => {
        asignaturas.forEach((asignaturaId: string) => {
          insertAdminLink.run(
            uuidv4(),
            admin.rut_usuario,
            id_curso,
            asignaturaId
          );
        });
      });
    })();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al actualizar el curso:", error);
    return NextResponse.json(
      { success: false, error: "Error en el servidor" },
      { status: 500 }
    );
  }
}

// DELETE: Eliminar curso
export async function DELETE(req: Request) {
  try {
    const { id_curso } = await req.json();

    db.transaction(() => {
      // Delete associated records in CursosAsignaturasLink
      const deleteCursoLinks = db.prepare(
        "DELETE FROM CursosAsignaturasLink WHERE id_curso = ?"
      );
      deleteCursoLinks.run(id_curso);

      // Delete the course itself
      const deleteCurso = db.prepare("DELETE FROM Curso WHERE id_curso = ?");
      deleteCurso.run(id_curso);
    })();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al eliminar el curso:", error);
    return NextResponse.json(
      { success: false, error: "Error en el servidor" },
      { status: 500 }
    );
  }
}
