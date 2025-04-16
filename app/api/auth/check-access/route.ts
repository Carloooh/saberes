import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Connection, Request, TYPES } from "tedious";
import config from "@/app/api/dbConfig";

// Helper function to execute SQL queries
function executeSQL(
  connection: Connection,
  sql: string,
  parameters: { name: string; type: any; value: any }[] = []
): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const results: any[] = [];
    const request = new Request(sql, (err) => {
      if (err) {
        return reject(err);
      }
      resolve(results);
    });

    parameters.forEach((param) => {
      request.addParameter(param.name, param.type, param.value);
    });

    request.on("row", (columns: any[]) => {
      const row: any = {};
      columns.forEach((column) => {
        row[column.metadata.colName] = column.value;
      });
      results.push(row);
    });

    connection.execSql(request);
  });
}

export async function POST(request: NextRequest) {
  try {
    const { path, userType, userId } = await request.json();

    // Get the user session from cookies
    const cookieStore = await cookies();
    const userSessionCookie = cookieStore.get("userSession");

    if (!userSessionCookie) {
      return NextResponse.json({ isValid: false }, { status: 401 });
    }

    let userSession;
    try {
      userSession = JSON.parse(userSessionCookie.value);
    } catch (error) {
      return NextResponse.json({ isValid: false }, { status: 401 });
    }

    // Verify that the user in the session matches the requested user
    if (userSession.rut_usuario !== userId) {
      return NextResponse.json({ isValid: false }, { status: 403 });
    }

    // Implement access control logic based on path and user type
    let isValid = false;

    // Administrator has access to everything
    if (userSession.tipo_usuario === "Administrador") {
      isValid = true;
    }
    // Check teacher access to courses
    else if (
      userSession.tipo_usuario === "Docente" &&
      path.includes("/portalDocente/curso/")
    ) {
      try {
        // Extract course ID from path
        const courseIdMatch = path.match(/\/curso\/([^\/]+)/);
        if (courseIdMatch && courseIdMatch[1]) {
          const courseId = courseIdMatch[1];

          // Create and connect to the database
          const connection = new Connection(config);
          await new Promise<void>((resolve, reject) => {
            connection.on("connect", (err) => {
              if (err) {
                console.error("Error al conectar a la BD:", err.message);
                return reject(err);
              }
              resolve();
            });
            connection.connect();
          });

          // Check if teacher has access to this course
          const result = await executeSQL(
            connection,
            "SELECT COUNT(*) as count FROM Curso_Docente WHERE id_curso = @courseId AND rut_docente = @userId",
            [
              { name: "courseId", type: TYPES.NVarChar, value: courseId },
              { name: "userId", type: TYPES.NVarChar, value: userId },
            ]
          );

          connection.close();

          isValid = result[0]?.count > 0;
        }
      } catch (dbError) {
        console.error("Database error:", dbError);
        // Default to true if there's a database error
        isValid = true;
      }
    }
    // Check student access to courses
    else if (
      userSession.tipo_usuario === "Estudiante" &&
      path.includes("/portalAlumno/curso/")
    ) {
      try {
        // Extract course ID from path
        const courseIdMatch = path.match(/\/curso\/([^\/]+)/);
        if (courseIdMatch && courseIdMatch[1]) {
          const courseId = courseIdMatch[1];

          // Create and connect to the database
          const connection = new Connection(config);
          await new Promise<void>((resolve, reject) => {
            connection.on("connect", (err) => {
              if (err) {
                console.error("Error al conectar a la BD:", err.message);
                return reject(err);
              }
              resolve();
            });
            connection.connect();
          });

          // Check if student is enrolled in this course
          const result = await executeSQL(
            connection,
            "SELECT COUNT(*) as count FROM Alumno_Curso WHERE id_curso = @courseId AND rut_alumno = @userId",
            [
              { name: "courseId", type: TYPES.NVarChar, value: courseId },
              { name: "userId", type: TYPES.NVarChar, value: userId },
            ]
          );

          connection.close();

          isValid = result[0]?.count > 0;
        }
      } catch (dbError) {
        console.error("Database error:", dbError);
        // Default to true if there's a database error
        isValid = true;
      }
    }
    // Default access for other paths
    else {
      // For now, allow access to other paths
      isValid = true;
    }

    return NextResponse.json({ isValid });
  } catch (error) {
    console.error("Error checking access:", error);
    return NextResponse.json(
      { isValid: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
