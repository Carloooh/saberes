import { NextResponse } from "next/server";
import db from "@/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get("path");
    const userType = searchParams.get("userType");
    const userId = searchParams.get("userId");

    if (!path || !userType || !userId) {
      return NextResponse.json({ isValid: false });
    }

    const pathParts = path.split("/").filter(Boolean);

    if (userType === "gestor") {
      const cursoId = pathParts[1];

      // Validate course exists and teacher is assigned to it
      const courseQuery = db.prepare(`
        SELECT 1 
        FROM CursosAsignaturasLink
        WHERE id_curso = ? 
        AND rut_usuario = ?
      `);
      const courseExists = courseQuery.get(cursoId, userId);

      if (!courseExists) {
        return NextResponse.json({ isValid: false });
      }

      // If there's an asignatura ID, validate it belongs to the course
      if (pathParts.length > 2) {
        const asignaturaId = pathParts[2];
        const asignaturaQuery = db.prepare(`
          SELECT 1 
          FROM CursosAsignaturasLink cal
          JOIN Asignaturas a ON a.id_curso = cal.id_curso
          WHERE cal.id_curso = ? 
          AND a.id_asignatura = ?
          AND cal.rut_usuario = ?
          AND cal.id_asignatura = ?
        `);
        const asignaturaExists = asignaturaQuery.get(
          cursoId,
          asignaturaId,
          userId,
          asignaturaId
        );

        return NextResponse.json({ isValid: !!asignaturaExists });
      }

      return NextResponse.json({ isValid: true });
    } else if (userType === "estudiante") {
      const asignaturaId = pathParts[1];

      // Check if student's course has this asignatura
      const asignaturaQuery = db.prepare(`
        SELECT 1 
        FROM CursosAsignaturasLink cal
        JOIN Asignaturas a ON a.id_curso = cal.id_curso
        WHERE cal.rut_usuario = ?
        AND a.id_asignatura = ?
      `);

      const asignaturaExists = asignaturaQuery.get(userId, asignaturaId);
      return NextResponse.json({ isValid: !!asignaturaExists });
    }

    return NextResponse.json({ isValid: false });
  } catch (error) {
    console.error("Error validating route:", error);
    return NextResponse.json({ isValid: false });
  }
}
