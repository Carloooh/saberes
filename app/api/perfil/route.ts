// import { NextResponse, NextRequest } from "next/server";
// import db from "@/db";

// interface Asignatura {
//   id_asignatura: string;
//   nombre_asignatura: string;
// }

// interface Curso {
//   id_curso: string;
//   nombre_curso: string;
//   asignaturas: string;
// }

// interface CursoWithAsignaturas extends Omit<Curso, "asignaturas"> {
//   asignaturas: Asignatura[];
// }

// interface MatriculaArchivo {
//   id_documento: string;
//   titulo: string;
//   extension: string;
// }

// export async function GET(request: NextRequest) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const rut = searchParams.get("rut") ? searchParams.get("rut") : null;

//     const userSessionCookie = request.cookies.get("userSession")?.value;
//     if (!userSessionCookie) {
//       return NextResponse.json(
//         { success: false, error: "No se encontró la sesión del usuario" },
//         { status: 401 }
//       );
//     }

//     let userSession;
//     try {
//       userSession = JSON.parse(userSessionCookie);
//     } catch (error) {
//       console.error("Error al parsear la sesión del usuario:", error);
//       return NextResponse.json(
//         { success: false, error: "Sesión inválida" },
//         { status: 400 }
//       );
//     }

//     const rutUsuario = userSession.rut_usuario;
//     const tipoUsuario = userSession.tipo_usuario;

//     const queryUsuario = db.prepare(
//       "SELECT * FROM Usuario WHERE rut_usuario = ?"
//     );

//     let usuario: {
//       tipo_usuario: string;
//       rut_usuario: string;
//       [key: string]: any;
//     } | null;

//     // Determine which RUT to use for the query
//     const targetRut = rut || rutUsuario;

//     if (rut) {
//       usuario = queryUsuario.get(rut) as any;
//     } else {
//       usuario = queryUsuario.get(rutUsuario) as any;
//     }

//     if (!usuario) {
//       return NextResponse.json(
//         { success: false, error: "Usuario no encontrado" },
//         { status: 404 }
//       );
//     }

//     let perfilData = { ...usuario };

//     // Check if we're viewing a student profile (either our own or as admin/teacher)
//     if (usuario.tipo_usuario === "Estudiante") {
//       // Obtener información específica del estudiante
//       const queryMatricula = db.prepare(`
//         SELECT * FROM Matricula WHERE rut_usuario = ?
//       `);
//       const matricula = queryMatricula.get(targetRut);

//       const queryCursoAlumnoId = db.prepare(`
//         SELECT id_curso FROM CursosAsignaturasLink WHERE rut_usuario = ?
//       `);

//       const cursoAlumnoId = queryCursoAlumnoId.get(targetRut) as {
//         id_curso: string;
//       };

//       let cursoAlumno = null;
//       if (cursoAlumnoId) {
//         const queryCursoAlumno = db.prepare(`
//           SELECT nombre_curso FROM Curso WHERE id_curso = ?
//         `);
//         cursoAlumno = queryCursoAlumno.get(cursoAlumnoId.id_curso);
//       }

//       const queryApoderado = db.prepare(`
//         SELECT * FROM Info_apoderado WHERE rut_usuario = ?
//       `);
//       const apoderado = queryApoderado.get(targetRut);

//       const queryContactoEmergencia = db.prepare(`
//         SELECT * FROM Contacto_emergencia WHERE rut_usuario = ?
//       `);
//       const contactoEmergencia = queryContactoEmergencia.get(targetRut);

//       const queryInfoMedica = db.prepare(`
//         SELECT * FROM Info_medica WHERE rut_usuario = ?
//       `);
//       const infoMedica = queryInfoMedica.get(targetRut);

//       const queryArchivos = db.prepare(`
//         SELECT * FROM Matricula_archivo WHERE rut_usuario = ?
//       `);

//       const archivos = queryArchivos.all(targetRut) as MatriculaArchivo[];
//       const archivosFormateados = archivos.map((archivo) => ({
//         id_documento: archivo.id_documento,
//         titulo: archivo.titulo,
//         extension: archivo.extension,
//         downloadUrl: `/api/perfil/documentos/${archivo.id_documento}`,
//       }));

//       perfilData = {
//         ...perfilData,
//         matricula,
//         apoderado,
//         contactoEmergencia,
//         infoMedica,
//         archivos: archivosFormateados,
//         cursoAlumno,
//       };
//     } else if (tipoUsuario === "Docente" || tipoUsuario === "Administrador") {
//       // Get courses and subjects for teachers/admins
//       const queryCursos = db.prepare(`
//         SELECT DISTINCT c.*,
//           (
//             SELECT json_group_array(
//               json_object(
//                 'id_asignatura', a.id_asignatura,
//                 'nombre_asignatura', a.nombre_asignatura
//               )
//             )
//             FROM Asignatura a
//             INNER JOIN CursosAsignaturasLink cal
//             WHERE cal.id_curso = c.id_curso
//             AND cal.rut_usuario = ?
//             AND cal.id_asignatura = a.id_asignatura
//             ORDER BY a.id_asignatura ASC
//           ) as asignaturas
//         FROM Curso c
//         INNER JOIN CursosAsignaturasLink cl ON c.id_curso = cl.id_curso
//         WHERE cl.rut_usuario = ?
//         ORDER BY c.id_curso ASC
//       `);

//       const cursos = queryCursos.all(targetRut, targetRut).map(
//         (curso: unknown): CursoWithAsignaturas => ({
//           id_curso: (curso as Curso).id_curso,
//           nombre_curso: (curso as Curso).nombre_curso,
//           asignaturas: JSON.parse((curso as Curso).asignaturas || "[]"),
//         })
//       );

//       perfilData = {
//         ...perfilData,
//         cursos,
//       };
//     }

//     return NextResponse.json({ success: true, data: perfilData });
//   } catch (error) {
//     console.error("Error al obtener el perfil del usuario:", error);
//     return NextResponse.json(
//       { success: false, error: "Error en el servidor" },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse, NextRequest } from "next/server";
import { Connection, Request, TYPES } from "tedious";
import config from "@/app/api/dbConfig";

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

// Helper function to execute SQL queries and return results
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
      const row: { [key: string]: any } = {};
      columns.forEach((column) => {
        row[column.metadata.colName] = column.value;
      });
      results.push(row);
    });

    connection.execSql(request);
  });
}

export async function GET(request: NextRequest) {
  const connection = new Connection(config);

  return new Promise<NextResponse>((resolve, reject) => {
    connection.on("connect", async (err) => {
      if (err) {
        console.error("Error connecting to database:", err.message);
        connection.close();
        return resolve(
          NextResponse.json(
            { success: false, error: "Error al conectar a la base de datos" },
            { status: 500 }
          )
        );
      }

      try {
        const { searchParams } = new URL(request.url);
        const rut = searchParams.get("rut") ? searchParams.get("rut") : null;

        const userSessionCookie = request.cookies.get("userSession")?.value;
        if (!userSessionCookie) {
          connection.close();
          return resolve(
            NextResponse.json(
              { success: false, error: "No se encontró la sesión del usuario" },
              { status: 401 }
            )
          );
        }

        let userSession;
        try {
          userSession = JSON.parse(userSessionCookie);
        } catch (error) {
          console.error("Error al parsear la sesión del usuario:", error);
          connection.close();
          return resolve(
            NextResponse.json(
              { success: false, error: "Sesión inválida" },
              { status: 400 }
            )
          );
        }

        const rutUsuario = userSession.rut_usuario;
        const tipoUsuario = userSession.tipo_usuario;

        // Determine which RUT to use for the query
        const targetRut = rut || rutUsuario;

        // Get user information
        const queryUsuario = `
          SELECT * FROM Usuario WHERE rut_usuario = @rutUsuario
        `;

        const usuarioResults = await executeSQL(connection, queryUsuario, [
          { name: "rutUsuario", type: TYPES.NVarChar, value: targetRut },
        ]);

        if (usuarioResults.length === 0) {
          connection.close();
          return resolve(
            NextResponse.json(
              { success: false, error: "Usuario no encontrado" },
              { status: 404 }
            )
          );
        }

        const usuario = usuarioResults[0];
        let perfilData = { ...usuario };

        // Check if we're viewing a student profile (either our own or as admin/teacher)
        if (usuario.tipo_usuario === "Estudiante") {
          // Get student-specific information
          const queryMatricula = `
            SELECT * FROM Matricula WHERE id_user = @userId
          `;

          const matriculaResults = await executeSQL(
            connection,
            queryMatricula,
            [{ name: "userId", type: TYPES.NVarChar, value: usuario.id_user }]
          );

          const matricula =
            matriculaResults.length > 0 ? matriculaResults[0] : null;

          // Get student's course ID
          const queryCursoAlumnoId = `
            SELECT id_curso FROM CursosAsignaturasLink 
            WHERE id_user = @userId
          `;

          const cursoAlumnoIdResults = await executeSQL(
            connection,
            queryCursoAlumnoId,
            [{ name: "userId", type: TYPES.NVarChar, value: usuario.id_user }]
          );

          let cursoAlumno = null;
          if (cursoAlumnoIdResults.length > 0) {
            const cursoAlumnoId = cursoAlumnoIdResults[0];

            // Get course name
            const queryCursoAlumno = `
              SELECT nombre_curso FROM Curso WHERE id_curso = @idCurso
            `;

            const cursoAlumnoResults = await executeSQL(
              connection,
              queryCursoAlumno,
              [
                {
                  name: "idCurso",
                  type: TYPES.NVarChar,
                  value: cursoAlumnoId.id_curso,
                },
              ]
            );

            if (cursoAlumnoResults.length > 0) {
              cursoAlumno = cursoAlumnoResults[0];
            }
          }

          // Get guardian information
          const queryApoderado = `
            SELECT * FROM Info_apoderado WHERE id_user = @userId
          `;

          const apoderadoResults = await executeSQL(
            connection,
            queryApoderado,
            [{ name: "userId", type: TYPES.NVarChar, value: usuario.id_user }]
          );

          const apoderado =
            apoderadoResults.length > 0 ? apoderadoResults[0] : null;

          // Get emergency contact information
          const queryContactoEmergencia = `
            SELECT * FROM Contacto_emergencia WHERE id_user = @userId
          `;

          const contactoEmergenciaResults = await executeSQL(
            connection,
            queryContactoEmergencia,
            [{ name: "userId", type: TYPES.NVarChar, value: usuario.id_user }]
          );

          const contactoEmergencia =
            contactoEmergenciaResults.length > 0
              ? contactoEmergenciaResults[0]
              : null;

          // Get medical information
          const queryInfoMedica = `
            SELECT * FROM Info_medica WHERE id_user = @userId
          `;

          const infoMedicaResults = await executeSQL(
            connection,
            queryInfoMedica,
            [{ name: "userId", type: TYPES.NVarChar, value: usuario.id_user }]
          );

          const infoMedica =
            infoMedicaResults.length > 0 ? infoMedicaResults[0] : null;

          // Get enrollment documents
          const queryArchivos = `
            SELECT * FROM Matricula_archivo WHERE id_user = @userId
          `;

          const archivosResults = await executeSQL(connection, queryArchivos, [
            { name: "userId", type: TYPES.NVarChar, value: usuario.id_user },
          ]);

          const archivosFormateados = archivosResults.map((archivo) => ({
            id_documento: archivo.id_documento,
            titulo: archivo.titulo,
            extension: archivo.extension,
            tipo: archivo.tipo,
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
        } else if (
          tipoUsuario === "Docente" ||
          tipoUsuario === "Administrador"
        ) {
          // Get courses and subjects for teachers/admins
          // Get courses
          const queryCursos = `
            SELECT DISTINCT c.id_curso, c.nombre_curso
            FROM Curso c
            INNER JOIN CursosAsignaturasLink cl ON c.id_curso = cl.id_curso
            WHERE cl.id_user = @userId
            ORDER BY c.id_curso ASC
          `;

          const cursosResults = await executeSQL(connection, queryCursos, [
            { name: "userId", type: TYPES.NVarChar, value: usuario.id_user },
          ]);

          // For each course, get its subjects
          const cursos = [];
          for (const curso of cursosResults) {
            const queryAsignaturas = `
              SELECT a.id_asignatura, a.nombre_asignatura
              FROM Asignatura a
              INNER JOIN CursosAsignaturasLink cal ON a.id_asignatura = cal.id_asignatura
              WHERE cal.id_curso = @idCurso AND cal.id_user = @userId
              ORDER BY a.id_asignatura ASC
            `;

            const asignaturasResults = await executeSQL(
              connection,
              queryAsignaturas,
              [
                {
                  name: "idCurso",
                  type: TYPES.NVarChar,
                  value: curso.id_curso,
                },
                {
                  name: "userId",
                  type: TYPES.NVarChar,
                  value: usuario.id_user,
                },
              ]
            );

            cursos.push({
              id_curso: curso.id_curso,
              nombre_curso: curso.nombre_curso,
              asignaturas: asignaturasResults,
            });
          }

          perfilData = {
            ...perfilData,
            cursos,
          };
        }

        connection.close();
        return resolve(NextResponse.json({ success: true, data: perfilData }));
      } catch (error) {
        console.error("Error al obtener el perfil del usuario:", error);
        connection.close();
        return resolve(
          NextResponse.json(
            { success: false, error: "Error en el servidor" },
            { status: 500 }
          )
        );
      }
    });

    connection.connect();
  });
}
