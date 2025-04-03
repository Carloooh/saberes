import { NextResponse, NextRequest } from "next/server";
import { Connection, Request, TYPES } from "tedious";
import config from "@/app/api/dbConfig";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { sendRegistrationNotification } from "@/app/api/perfil/email";
import { randomUUID } from "crypto";

// Función auxiliar para ejecutar una consulta SQL y obtener los resultados
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

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const {
      rut_usuario,
      tipo_usuario,
      cursosAsignaturas = [],
      ...userData
    } = await req.json();
    const id_user = randomUUID();
    // Hashear la clave
    const hashedClave = await bcrypt.hash(userData.clave, 10);

    // Crear y conectar la instancia de la base de datos
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

    // Iniciar la transacción
    await new Promise<void>((resolve, reject) => {
      connection.beginTransaction((err) => {
        if (err) {
          console.error("Error al iniciar la transacción:", err.message);
          return reject(err);
        }
        resolve();
      }, "Transaction");
    });

    // Verificar si el usuario ya existe
    const existingUsers = await executeSQL(
      connection,
      "SELECT * FROM Usuario WHERE RUT_USUARIO = @rut",
      [{ name: "rut", type: TYPES.NVarChar, value: rut_usuario }]
    );
    if (existingUsers.length > 0) {
      await new Promise<void>((resolve) => {
        connection.rollbackTransaction(() => resolve());
      });
      connection.close();
      return NextResponse.json(
        { success: false, error: "El usuario ya existe" },
        { status: 400 }
      );
    }

    // Insertar el usuario en la tabla
    const insertUserQuery = `
      INSERT INTO Usuario (
        id_user, rut_usuario, rut_tipo, email, clave, nombres, apellidos, 
        tipo_usuario, estado, sexo, nacionalidad, talla, 
        fecha_nacimiento, direccion, comuna, sector, codigo_temporal
      ) VALUES (
        @id_user, @rut_usuario, @rut_tipo, @email, @clave, @nombres, @apellidos, 
        @tipo_usuario, @estado, @sexo, @nacionalidad, @talla, 
        @fecha_nacimiento, @direccion, @comuna, @sector, @codigo_temporal
      )`;
    await executeSQL(connection, insertUserQuery, [
      { name: "id_user", type: TYPES.NVarChar, value: id_user },
      { name: "rut_usuario", type: TYPES.NVarChar, value: rut_usuario },
      {
        name: "rut_tipo",
        type: TYPES.NVarChar,
        value: userData.rut_tipo || "",
      },
      { name: "email", type: TYPES.NVarChar, value: userData.email },
      { name: "clave", type: TYPES.NVarChar, value: hashedClave },
      { name: "nombres", type: TYPES.NVarChar, value: userData.nombres },
      { name: "apellidos", type: TYPES.NVarChar, value: userData.apellidos },
      { name: "tipo_usuario", type: TYPES.NVarChar, value: tipo_usuario },
      { name: "estado", type: TYPES.NVarChar, value: "Pendiente" },
      { name: "sexo", type: TYPES.NVarChar, value: userData.sexo || "" },
      {
        name: "nacionalidad",
        type: TYPES.NVarChar,
        value: userData.nacionalidad || "",
      },
      { name: "talla", type: TYPES.NVarChar, value: userData.talla || "" },
      {
        name: "fecha_nacimiento",
        type: TYPES.NVarChar,
        value: userData.fecha_nacimiento || "",
      },
      {
        name: "direccion",
        type: TYPES.NVarChar,
        value: userData.direccion || "",
      },
      { name: "comuna", type: TYPES.NVarChar, value: userData.comuna || "" },
      { name: "sector", type: TYPES.NVarChar, value: userData.sector || "" },
      {
        name: "codigo_temporal",
        type: TYPES.NVarChar,
        value: userData.codigo_temporal || "",
      },
    ]);

    // Dependiendo del tipo de usuario, insertar en CursosAsignaturasLink
    if (tipo_usuario === "Docente") {
      for (const { cursoId, asignaturas } of cursosAsignaturas) {
        for (const asignaturaId of asignaturas) {
          const insertLinkQuery = `
            INSERT INTO CursosAsignaturasLink (
              id_cursosasignaturaslink, id_user, id_curso, id_asignatura
            ) VALUES (
              @id, @rut, @curso, @asignatura
            )`;
          await executeSQL(connection, insertLinkQuery, [
            { name: "id", type: TYPES.NVarChar, value: uuidv4() },
            { name: "rut", type: TYPES.NVarChar, value: id_user },
            { name: "curso", type: TYPES.NVarChar, value: cursoId },
            { name: "asignatura", type: TYPES.NVarChar, value: asignaturaId },
          ]);
        }
      }
    } else if (tipo_usuario === "Administrador") {
      const cursos = await executeSQL(connection, "SELECT id_curso FROM Curso");
      const asignaturas = await executeSQL(
        connection,
        "SELECT id_asignatura FROM Asignatura"
      );
      for (const curso of cursos) {
        for (const asignatura of asignaturas) {
          const insertLinkQuery = `
            INSERT INTO CursosAsignaturasLink (
              id_cursosasignaturaslink, id_user, id_curso, id_asignatura
            ) VALUES (
              @id, @rut, @curso, @asignatura
            )`;
          await executeSQL(connection, insertLinkQuery, [
            { name: "id", type: TYPES.NVarChar, value: uuidv4() },
            { name: "rut", type: TYPES.NVarChar, value: id_user },
            { name: "curso", type: TYPES.NVarChar, value: curso.id_curso },
            {
              name: "asignatura",
              type: TYPES.NVarChar,
              value: asignatura.id_asignatura,
            },
          ]);
        }
      }
    } else {
      await new Promise<void>((resolve) => {
        connection.rollbackTransaction(() => resolve());
      });
      connection.close();
      return NextResponse.json(
        { success: false, error: "Error en los datos ingresados" },
        { status: 500 }
      );
    }

    // Confirmar la transacción
    await new Promise<void>((resolve, reject) => {
      connection.commitTransaction((err) => {
        if (err) {
          console.error("Error al confirmar la transacción:", err.message);
          return reject(err);
        }
        resolve();
      });
    });
    connection.close();

    try {
      await sendRegistrationNotification(
        userData.email,
        `${userData.nombres} ${userData.apellidos}`
      );
    } catch (emailError) {
      console.error("Error al enviar correo de notificación:", emailError);
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Error en el registro:", error);
    return NextResponse.json(
      { success: false, error: "Error en el servidor" },
      { status: 500 }
    );
  }
}
