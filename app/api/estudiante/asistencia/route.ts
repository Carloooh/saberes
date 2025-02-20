import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import db from "@/db";

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
  
      const query = db.prepare(`
        SELECT 
          d.id_dia,
          d.fecha,
          CASE 
            WHEN a.asistencia = 1 THEN 'Presente'
            WHEN a.asistencia = 2 THEN 'Justificado'
            ELSE 'Ausente'
          END as estado
        FROM CursosAsignaturasLink cal
        JOIN DiasAsistencia d ON cal.id_curso = d.id_curso
        LEFT JOIN Asistencia a ON d.id_dia = a.id_dia AND a.rut_usuario = cal.rut_usuario
        WHERE cal.rut_usuario = ?
        GROUP BY d.id_dia
        ORDER BY d.fecha DESC
      `);
  
      const asistencias = query.all(rutUsuario).map(row => ({
        id_dia: row.id_dia,
        fecha: row.fecha,
        estado: row.estado || 'Ausente' // Ensure we always have a estado
      }));
  
      // Ensure we have valid dates and estados
      const validAsistencias = asistencias.filter(a => 
        a.fecha && 
        ['Presente', 'Ausente', 'Justificado'].includes(a.estado)
      );

      return NextResponse.json({
        success: true,
        data: validAsistencias
      });
    } catch (error) {
      console.error("Error fetching student attendance:", error);
      return NextResponse.json(
        { success: false, error: "Server error" },
        { status: 500 }
      );
    }
  }