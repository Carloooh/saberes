// import { NextResponse } from "next/server";
// import db from "@/db";
// import { sendVerificationCode } from "@/app/api/perfil/email";
// import bcrypt from "bcrypt";

// export async function POST(request: Request) {
//   try {
//     const { targetRut } = await request.json();

//     // Get admin info from cookies
//     const cookies = request.headers.get("cookie") || "";
//     const userSessionCookie = cookies
//       .split(";")
//       .find((c) => c.trim().startsWith("userSession="));

//     if (!userSessionCookie) {
//       return NextResponse.json(
//         { success: false, error: "No se encontró la sesión del usuario" },
//         { status: 401 }
//       );
//     }

//     let userSession;
//     try {
//       userSession = JSON.parse(
//         decodeURIComponent(userSessionCookie.split("=")[1])
//       );
//     } catch (error) {
//       console.error("Error al parsear la sesión del usuario:", error);
//       return NextResponse.json(
//         { success: false, error: "Sesión inválida" },
//         { status: 400 }
//       );
//     }

//     // Verify admin permissions
//     if (userSession.tipo_usuario !== "Administrador") {
//       return NextResponse.json(
//         {
//           success: false,
//           error: "No tienes permisos para realizar esta acción",
//         },
//         { status: 403 }
//       );
//     }

//     // Get admin email
//     const adminQuery = db.prepare(
//       "SELECT email, nombres FROM Usuario WHERE rut_usuario = ?"
//     );
//     const admin = adminQuery.get(userSession.rut_usuario) as {
//       email?: string;
//       nombres?: string;
//     };

//     if (!admin || !admin.email) {
//       return NextResponse.json(
//         {
//           success: false,
//           error: "No se pudo obtener la información del administrador",
//         },
//         { status: 404 }
//       );
//     }

//     // Generate verification code (6 digits)
//     const verificationCode = Math.floor(
//       100000 + Math.random() * 900000
//     ).toString();
//     const hashedCode = await bcrypt.hash(verificationCode, 10);

//     // Store code in database with expiration (15 minutes)
//     const expiresAt = new Date();
//     expiresAt.setMinutes(expiresAt.getMinutes() + 15);

//     // Update admin with temporary code
//     const updateStmt = db.prepare(`
//       UPDATE Usuario
//       SET codigo_temporal = ?,
//           codigo_temporal_expira = ?,
//           codigo_temporal_target = ?
//       WHERE rut_usuario = ?
//     `);

//     updateStmt.run(
//       hashedCode,
//       expiresAt.toISOString(),
//       targetRut,
//       userSession.rut_usuario
//     );

//     // Send verification code via email
//     await sendVerificationCode(admin.email, verificationCode, admin.nombres || "");

//     return NextResponse.json({ success: true });
//   } catch (error) {
//     console.error("Error al solicitar código de verificación:", error);
//     return NextResponse.json(
//       { success: false, error: "Error en el servidor" },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse, NextRequest } from "next/server";
import { Connection, Request, TYPES } from "tedious";
import config from "@/app/api/dbConfig";
import { sendVerificationCode } from "@/app/api/perfil/email";
import bcrypt from "bcrypt";

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

// Helper function to execute SQL updates
function executeSQLUpdate(
  connection: Connection,
  sql: string,
  parameters: { name: string; type: any; value: any }[] = []
): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = new Request(sql, (err) => {
      if (err) {
        return reject(err);
      }
      resolve();
    });

    parameters.forEach((param) => {
      request.addParameter(param.name, param.type, param.value);
    });

    connection.execSql(request);
  });
}

export async function POST(request: NextRequest) {
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
        const { targetRut } = await request.json();

        // Get admin info from cookies
        const cookies = request.headers.get("cookie") || "";
        const userSessionCookie = cookies
          .split(";")
          .find((c) => c.trim().startsWith("userSession="));

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
          userSession = JSON.parse(
            decodeURIComponent(userSessionCookie.split("=")[1])
          );
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

        // Verify admin permissions
        if (userSession.tipo_usuario !== "Administrador") {
          connection.close();
          return resolve(
            NextResponse.json(
              {
                success: false,
                error: "No tienes permisos para realizar esta acción",
              },
              { status: 403 }
            )
          );
        }

        // Get admin email
        const adminQuery = `
          SELECT email, nombres FROM Usuario WHERE rut_usuario = @rutUsuario
        `;

        const adminResults = await executeSQL(connection, adminQuery, [
          {
            name: "rutUsuario",
            type: TYPES.NVarChar,
            value: userSession.rut_usuario,
          },
        ]);

        if (adminResults.length === 0 || !adminResults[0].email) {
          connection.close();
          return resolve(
            NextResponse.json(
              {
                success: false,
                error: "No se pudo obtener la información del administrador",
              },
              { status: 404 }
            )
          );
        }

        const admin = adminResults[0];

        // Generate verification code (6 digits)
        const verificationCode = Math.floor(
          100000 + Math.random() * 900000
        ).toString();
        const hashedCode = await bcrypt.hash(verificationCode, 10);

        // Store code in database with expiration (15 minutes)
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 15);

        // Update admin with temporary code
        const updateStmt = `
          UPDATE Usuario 
          SET codigo_temporal = @hashedCode, 
              codigo_temporal_expira = @expiresAt, 
              codigo_temporal_target = @targetRut 
          WHERE rut_usuario = @rutUsuario
        `;

        await executeSQLUpdate(connection, updateStmt, [
          { name: "hashedCode", type: TYPES.NVarChar, value: hashedCode },
          {
            name: "expiresAt",
            type: TYPES.NVarChar,
            value: expiresAt.toISOString(),
          },
          { name: "targetRut", type: TYPES.NVarChar, value: targetRut },
          {
            name: "rutUsuario",
            type: TYPES.NVarChar,
            value: userSession.rut_usuario,
          },
        ]);

        // Send verification code via email
        await sendVerificationCode(
          admin.email,
          verificationCode,
          admin.nombres || ""
        );

        connection.close();
        return resolve(NextResponse.json({ success: true }));
      } catch (error) {
        console.error("Error al solicitar código de verificación:", error);
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
