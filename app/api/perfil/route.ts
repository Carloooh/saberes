import { NextResponse, NextRequest } from "next/server";
import db from "@/db";

export async function GET(request: NextRequest) {
  try {
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

    const queryUsuario = db.prepare("SELECT * FROM Usuario WHERE rut_usuario = ?");
    const usuario = queryUsuario.get(rutUsuario);

    if (!usuario) {
      return NextResponse.json(
        { success: false, error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    let perfilData = { ...usuario };

    if (tipoUsuario === "Estudiante") {
      // Obtener información específica del estudiante
      const queryMatricula = db.prepare(`
        SELECT * FROM Matricula WHERE rut_usuario = ?
      `);
      const matricula = queryMatricula.get(rutUsuario);

      const queryApoderado = db.prepare(`
        SELECT * FROM Info_apoderado WHERE rut_usuario = ?
      `);
      const apoderado = queryApoderado.get(rutUsuario);

      const queryInfoMedica = db.prepare(`
        SELECT * FROM Info_medica WHERE rut_usuario = ?
      `);
      const infoMedica = queryInfoMedica.get(rutUsuario);

      const queryArchivos = db.prepare(`
        SELECT * FROM Matricula_archivo WHERE rut_usuario = ?
      `);
      const archivos = queryArchivos.all(rutUsuario);

      perfilData = {
        ...perfilData,
        matricula,
        apoderado,
        infoMedica,
        archivos,
      };
    } else {
      // Obtener información para docentes y administradores
      const queryCursos = db.prepare(`
        SELECT c.* FROM Curso c
        INNER JOIN CursosLink cl ON c.id_curso = cl.id_curso
        WHERE cl.rut_usuario = ?
      `);
      const cursos = queryCursos.all(rutUsuario);

        

      const queryAsignaturas = db.prepare(`
        SELECT a.* FROM Asignatura a
        INNER JOIN AsignaturasLink al ON a.id_asignatura = al.id_asignatura
        WHERE al.rut_usuario = ?
      `);
      const asignaturas = queryAsignaturas.all(rutUsuario);

      perfilData = {
        ...perfilData,
        cursos,
        asignaturas,
      };
    }
    console.log(perfilData);
    return NextResponse.json({ success: true, data: perfilData });
  } catch (error) {
    console.error("Error al obtener el perfil del usuario:", error);
    return NextResponse.json(
      { success: false, error: "Error en el servidor" },
      { status: 500 }
    );
  }
}