import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import db from "@/db";

// Define interfaces for the database results
interface Estudiante {
  rut_usuario: string;
  nombres: string;
  apellidos: string;
}

interface Asignatura {
  id_asignatura: string;
}

interface Nota {
  nota: number;
}

interface Asistencia {
  presentes: number;
  total: number;
}

interface EstudianteResumen {
  rut_usuario: string;
  nombres: string;
  apellidos: string;
  promedio_general: number | null;
  porcentaje_asistencia: number | null;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cursoId = searchParams.get("cursoId");

    if (!cursoId) {
      return NextResponse.json(
        { success: false, error: "Falta el ID del curso" },
        { status: 400 }
      );
    }

    // Get all students in the course with their basic info
    const queryEstudiantes = db.prepare(`
      SELECT DISTINCT 
        u.rut_usuario,
        u.nombres,
        u.apellidos
      FROM Usuario u
      JOIN CursosAsignaturasLink cal ON u.rut_usuario = cal.rut_usuario
      WHERE cal.id_curso = ? AND u.tipo_usuario = 'Estudiante'
    `);

    const estudiantes = queryEstudiantes.all(cursoId) as Estudiante[];

    // For each student, get their grades and attendance for each subject
    const estudiantesResumen = await Promise.all(
      estudiantes.map(async (estudiante: Estudiante) => {
        // Get all subjects for this course
        const queryAsignaturas = db.prepare(`
          SELECT id_asignatura
          FROM Asignaturas
          WHERE id_curso = ?
        `);
        const asignaturas = queryAsignaturas.all(cursoId) as Asignatura[];

        // Calculate averages across all subjects
        let sumaPromedios = 0;
        let contadorPromedios = 0;
        let sumaAsistencias = 0;
        let contadorAsistencias = 0;

        // Get grades and attendance for each subject
        for (const asignatura of asignaturas) {
          // Get grades
          const queryNotas = db.prepare(`
            SELECT c.nota
            FROM Calificaciones c
            JOIN Evaluaciones e ON c.id_evaluacion = e.id_evaluacion
            WHERE c.rut_estudiante = ? AND e.id_asignatura = ? AND e.id_curso = ?
          `);
          const notas = queryNotas.all(
            estudiante.rut_usuario,
            asignatura.id_asignatura,
            cursoId
          ) as Nota[];

          const notasValidas = notas.filter(
            (nota: Nota) => nota.nota !== null && nota.nota > 0
          );

          if (notasValidas.length > 0) {
            const promedio =
              notasValidas.reduce(
                (sum: number, nota: Nota) => sum + nota.nota,
                0
              ) / notasValidas.length;
            sumaPromedios += promedio;
            contadorPromedios++;
          }

          // Get attendance
          const queryAsistencia = db.prepare(`
            SELECT 
              COUNT(CASE WHEN a.asistencia IN (1, 2) THEN 1 END) as presentes,
              COUNT(*) as total
            FROM DiasAsistencia d
            LEFT JOIN Asistencia a ON d.id_dia = a.id_dia AND a.rut_usuario = ?
            WHERE d.id_curso = ? AND d.id_asignatura = ?
          `);

          const asistencia = queryAsistencia.get(
            estudiante.rut_usuario,
            cursoId,
            asignatura.id_asignatura
          ) as Asistencia;

          if (asistencia && asistencia.total > 0) {
            const porcentaje = (asistencia.presentes / asistencia.total) * 100;
            sumaAsistencias += porcentaje;
            contadorAsistencias++;
          }
        }

        const estudianteResumen: EstudianteResumen = {
          rut_usuario: estudiante.rut_usuario,
          nombres: estudiante.nombres,
          apellidos: estudiante.apellidos,
          promedio_general:
            contadorPromedios > 0 ? sumaPromedios / contadorPromedios : null,
          porcentaje_asistencia:
            contadorAsistencias > 0
              ? sumaAsistencias / contadorAsistencias
              : null,
        };

        return estudianteResumen;
      })
    );

    return NextResponse.json({
      success: true,
      estudiantes: estudiantesResumen,
    });
  } catch (error) {
    console.error("Error fetching student summaries:", error);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
