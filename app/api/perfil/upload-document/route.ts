import { NextResponse, NextRequest } from "next/server";
import { Connection, Request, TYPES } from "tedious";
import config from "@/app/api/dbConfig";
import { v4 as uuidv4 } from "uuid";

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
        // Get form data
        const formData = await request.formData();
        const file = formData.get("file") as File;
        const fileType = formData.get("fileType") as string;
        const customFileName = formData.get("customFileName") as string;
        const targetRut = formData.get("targetRut") as string;

        if (!file || !fileType || !targetRut) {
          connection.close();
          return resolve(
            NextResponse.json(
              { success: false, error: "Datos incompletos" },
              { status: 400 }
            )
          );
        }

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

        // Get user ID from RUT
        const userQuery = `
          SELECT id_user FROM Usuario WHERE rut_usuario = @targetRut
        `;

        const userResults = await executeSQL(connection, userQuery, [
          { name: "targetRut", type: TYPES.NVarChar, value: targetRut },
        ]);

        if (userResults.length === 0) {
          connection.close();
          return resolve(
            NextResponse.json(
              { success: false, error: "Usuario no encontrado" },
              { status: 404 }
            )
          );
        }

        const userId = userResults[0].id_user;

        // Get matricula ID for the user
        const matriculaQuery = `
          SELECT id_matricula FROM Matricula WHERE id_user = @userId
        `;

        const matriculaResults = await executeSQL(connection, matriculaQuery, [
          { name: "userId", type: TYPES.NVarChar, value: userId },
        ]);

        if (matriculaResults.length === 0) {
          connection.close();
          return resolve(
            NextResponse.json(
              { success: false, error: "Matrícula no encontrada" },
              { status: 404 }
            )
          );
        }

        const matriculaId = matriculaResults[0].id_matricula;

        // Check if a document of this type already exists
        const existingDocQuery = `
          SELECT id_documento FROM Matricula_archivo 
          WHERE id_user = @userId AND tipo = @fileType
        `;

        const existingDocResults = await executeSQL(
          connection,
          existingDocQuery,
          [
            { name: "userId", type: TYPES.NVarChar, value: userId },
            { name: "fileType", type: TYPES.NVarChar, value: fileType },
          ]
        );

        // Prepare file data
        const fileBuffer = Buffer.from(await file.arrayBuffer());
        const fileExtension = file.name.split(".").pop() || "";

        // Define file type names
        const fileTypeNames = {
          cert_nacimiento: "Certificado de Nacimiento",
          cert_carnet: "Fotocopia Carnet",
          cert_estudios: "Certificado de Estudios",
          cert_rsh: "Registro Social de Hogares",
          cert_diagnostico: "Certificado de Diagnóstico",
        };

        // Create file name
        const fileName = customFileName
          ? customFileName
          : `${
              fileTypeNames[fileType as keyof typeof fileTypeNames]
            }_${targetRut}`;

        if (existingDocResults.length > 0) {
          // Update existing document
          const documentId = existingDocResults[0].id_documento;

          const updateDocQuery = `
            UPDATE Matricula_archivo 
            SET titulo = @titulo, 
                documento = @documento, 
                extension = @extension 
            WHERE id_documento = @documentId
          `;

          await executeSQLUpdate(connection, updateDocQuery, [
            { name: "titulo", type: TYPES.NVarChar, value: fileName },
            { name: "documento", type: TYPES.VarBinary, value: fileBuffer },
            { name: "extension", type: TYPES.NVarChar, value: fileExtension },
            { name: "documentId", type: TYPES.NVarChar, value: documentId },
          ]);

          // Update the corresponding flag in Matricula table
          const updateMatriculaQuery = `
            UPDATE Matricula 
            SET ${fileType} = 1 
            WHERE id_matricula = @matriculaId
          `;

          await executeSQLUpdate(connection, updateMatriculaQuery, [
            { name: "matriculaId", type: TYPES.NVarChar, value: matriculaId },
          ]);
        } else {
          // Insert new document
          const insertDocQuery = `
            INSERT INTO Matricula_archivo (
              id_documento, id_matricula, id_user, titulo, documento, extension, tipo
            ) VALUES (
              @id_documento, @id_matricula, @id_user, @titulo, @documento, @extension, @tipo
            )
          `;

          await executeSQLUpdate(connection, insertDocQuery, [
            { name: "id_documento", type: TYPES.NVarChar, value: uuidv4() },
            { name: "id_matricula", type: TYPES.NVarChar, value: matriculaId },
            { name: "id_user", type: TYPES.NVarChar, value: userId },
            { name: "titulo", type: TYPES.NVarChar, value: fileName },
            { name: "documento", type: TYPES.VarBinary, value: fileBuffer },
            { name: "extension", type: TYPES.NVarChar, value: fileExtension },
            { name: "tipo", type: TYPES.NVarChar, value: fileType },
          ]);

          // Update the corresponding flag in Matricula table
          const updateMatriculaQuery = `
            UPDATE Matricula 
            SET ${fileType} = 1 
            WHERE id_matricula = @matriculaId
          `;

          await executeSQLUpdate(connection, updateMatriculaQuery, [
            { name: "matriculaId", type: TYPES.NVarChar, value: matriculaId },
          ]);
        }

        connection.close();
        return resolve(
          NextResponse.json({
            success: true,
            message: "Archivo subido correctamente",
          })
        );
      } catch (error) {
        console.error("Error al subir documento:", error);
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
