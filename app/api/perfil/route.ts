import { NextResponse, NextRequest } from "next/server";
import db from "@/db";

interface Asignatura {
  id_asignatura: string;
  nombre_asignatura: string;
}

interface Curso {
  id_curso: string;
  nombre_curso: string;
  asignaturas: string;
}

interface CursoWithAsignaturas extends Omit<Curso, "asignaturas"> {
  asignaturas: Asignatura[];
}

interface MatriculaArchivo {
  id_documento: string;
  titulo: string;
  extension: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rut = searchParams.get("rut") ? searchParams.get("rut") : null;

    const userSessionCookie = request.cookies.get("userSession")?.value;
    if (!userSessionCookie) {
      return NextResponse.json(
        { success: false, error: "No se encontró la sesión del usuario" },
        { status: 401 }
      );
    }

    let userSession;
    try {
      userSession = JSON.parse(userSessionCookie);
    } catch (error) {
      console.error("Error al parsear la sesión del usuario:", error);
      return NextResponse.json(
        { success: false, error: "Sesión inválida" },
        { status: 400 }
      );
    }

    const rutUsuario = userSession.rut_usuario;
    const tipoUsuario = userSession.tipo_usuario;

    const queryUsuario = db.prepare(
      "SELECT * FROM Usuario WHERE rut_usuario = ?"
    );

    let usuario;
    // Determine which RUT to use for the query
    const targetRut = rut || rutUsuario;

    if (rut) {
      usuario = queryUsuario.get(rut);
    } else {
      usuario = queryUsuario.get(rutUsuario);
    }

    if (!usuario) {
      return NextResponse.json(
        { success: false, error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    let perfilData = { ...usuario };
    
    // Check if we're viewing a student profile (either our own or as admin/teacher)
    if (usuario.tipo_usuario === "Estudiante") {
      // Obtener información específica del estudiante
      const queryMatricula = db.prepare(`
        SELECT * FROM Matricula WHERE rut_usuario = ?
      `);
      const matricula = queryMatricula.get(targetRut);

      const queryCursoAlumnoId = db.prepare(`
        SELECT id_curso FROM CursosAsignaturasLink WHERE rut_usuario = ?
      `);

      const cursoAlumnoId = queryCursoAlumnoId.get(targetRut) as {
        id_curso: string;
      };

      let cursoAlumno = null;
      if (cursoAlumnoId) {
        const queryCursoAlumno = db.prepare(`
          SELECT nombre_curso FROM Curso WHERE id_curso = ?
        `);
        cursoAlumno = queryCursoAlumno.get(cursoAlumnoId.id_curso);
      }

      const queryApoderado = db.prepare(`
        SELECT * FROM Info_apoderado WHERE rut_usuario = ?
      `);
      const apoderado = queryApoderado.get(targetRut);

      const queryContactoEmergencia = db.prepare(`
        SELECT * FROM Contacto_emergencia WHERE rut_usuario = ?
      `);
      const contactoEmergencia = queryContactoEmergencia.get(targetRut);

      const queryInfoMedica = db.prepare(`
        SELECT * FROM Info_medica WHERE rut_usuario = ?
      `);
      const infoMedica = queryInfoMedica.get(targetRut);

      const queryArchivos = db.prepare(`
        SELECT * FROM Matricula_archivo WHERE rut_usuario = ?
      `);

      const archivos = queryArchivos.all(targetRut) as MatriculaArchivo[];
      const archivosFormateados = archivos.map((archivo) => ({
        id_documento: archivo.id_documento,
        titulo: archivo.titulo,
        extension: archivo.extension,
        downloadUrl: `/api/perfil/documentos/${archivo.id_documento}`,
      }));

      perfilData = {
        ...perfilData,
        matricula,
        apoderado,
        contactoEmergencia,
        infoMedica,
        archivos: archivosFormateados,
        cursoAlumno,
      };
    } else if (tipoUsuario === "Docente" || tipoUsuario === "Administrador") {
      // Get courses and subjects for teachers/admins
      const queryCursos = db.prepare(`
        SELECT DISTINCT c.*,
          (
            SELECT json_group_array(
              json_object(
                'id_asignatura', a.id_asignatura,
                'nombre_asignatura', a.nombre_asignatura
              )
            )
            FROM Asignatura a
            INNER JOIN CursosAsignaturasLink cal
            WHERE cal.id_curso = c.id_curso
            AND cal.rut_usuario = ?
            AND cal.id_asignatura = a.id_asignatura
            ORDER BY a.id_asignatura ASC
          ) as asignaturas
        FROM Curso c
        INNER JOIN CursosAsignaturasLink cl ON c.id_curso = cl.id_curso
        WHERE cl.rut_usuario = ?
        ORDER BY c.id_curso ASC
      `);

      const cursos = queryCursos.all(targetRut, targetRut).map(
        (curso: unknown): CursoWithAsignaturas => ({
          id_curso: (curso as Curso).id_curso,
          nombre_curso: (curso as Curso).nombre_curso,
          asignaturas: JSON.parse((curso as Curso).asignaturas || "[]"),
        })
      );

      perfilData = {
        ...perfilData,
        cursos,
      };
    }
    
    return NextResponse.json({ success: true, data: perfilData });
  } catch (error) {
    console.error("Error al obtener el perfil del usuario:", error);
    return NextResponse.json(
      { success: false, error: "Error en el servidor" },
      { status: 500 }
    );
  }
}
