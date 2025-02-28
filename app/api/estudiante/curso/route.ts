import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import db from "@/db";

interface Asignatura {
  id_asignatura: string;
  nombre_asignatura: string;
}

interface CursoResult {
  id_curso: string;
  nombre_curso: string;
  asignaturas: string;
}

interface CursoResponse {
  cursoAlumno: {
    id_curso: string;
    nombre_curso: string;
  };
  asignaturas: Asignatura[];
}

export async function GET(request: NextRequest) {
    try {
      const userSessionCookie = request.cookies.get("userSession")?.value;
      if (!userSessionCookie) {
        return NextResponse.json(
          { success: false, error: "No session found" },
          { status: 401 }
        );
      }
  
      const userSession = JSON.parse(userSessionCookie);
      const rutUsuario = userSession.rut_usuario;
  
      // First get the student's course and its subjects
      const queryCurso = db.prepare(`
        SELECT 
          c.id_curso,
          c.nombre_curso,
          json_group_array(
            json_object(
              'id_asignatura', a.id_asignatura,
              'nombre_asignatura', a.nombre_asignatura
            )
          ) as asignaturas
        FROM CursosAsignaturasLink cal
        JOIN Curso c ON cal.id_curso = c.id_curso
        JOIN Asignaturas asig ON c.id_curso = asig.id_curso
        JOIN Asignatura a ON asig.id_asignatura = a.id_asignatura
        WHERE cal.rut_usuario = ?
        GROUP BY c.id_curso, c.nombre_curso
      `);
  
      const result = queryCurso.get(rutUsuario) as CursoResult;;

      if (!result) {
        return NextResponse.json(
          { success: false, error: "No course found" },
          { status: 404 }
        );
      }
  
      // Parse asignaturas JSON string and ensure it's an array
      let asignaturas: Asignatura[] = [];
      try {
        asignaturas = JSON.parse(result.asignaturas || '[]').filter(
          (a: Asignatura) => a.id_asignatura !== null && a.nombre_asignatura !== null
        );
      } catch (error) {
        console.error("Error parsing asignaturas:", error);
        asignaturas = [];
      }

      const response: CursoResponse = {
        cursoAlumno: {
          id_curso: result.id_curso,
          nombre_curso: result.nombre_curso
        },
        asignaturas
      };

      return NextResponse.json({
        success: true,
        data: response
      });
      // return NextResponse.json({
      //   success: true,
      //   data: {
      //     cursoAlumno: {
      //       id_curso: result.id_curso,
      //       nombre_curso: result.nombre_curso
      //     },
      //     asignaturas
      //   }
      // });
    } catch (error) {
      console.error("Error fetching student course:", error);
      return NextResponse.json(
        { success: false, error: "Server error" },
        { status: 500 }
      );
    }
}