import { NextResponse, NextRequest } from "next/server";
import { Connection, Request, TYPES } from "tedious";
import config from "@/app/api/dbConfig";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { randomUUID } from "crypto";
import { sendRegistrationNotification } from "@/app/api/perfil/email";

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

// Helper function to execute SQL statements without returning results
async function executeSQLStatement(
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

export async function POST(req: NextRequest) {
  try {
    // Extraemos los datos enviados vía FormData (no JSON)
    const formData = await req.formData();

    // Campos de Usuario y datos generales
    const id_user = randomUUID();
    const rut_usuario = formData.get("rut_usuario") as string;
    const rut_tipo = formData.get("rut_tipo") as string;
    const email = formData.get("email") as string;
    const clave = formData.get("clave") as string;
    const nombres = formData.get("nombres") as string;
    const apellidos = formData.get("apellidos") as string;
    const fecha_nacimiento = formData.get("fecha_nacimiento") as string;
    const sexo = formData.get("sexo") as string;
    const nacionalidad = formData.get("nacionalidad") as string;
    const talla = formData.get("talla") as string;
    const direccion = formData.get("direccion") as string;
    const comuna = formData.get("comuna") as string;
    const sector = formData.get("sector") as string;

    // Campos académicos
    const id_curso = formData.get("id_curso") as string;
    const ultimo_establecimiento = formData.get(
      "ultimo_establecimiento"
    ) as string;
    const ultimo_nivel_cursado = formData.get("ultimo_nivel_cursado") as string;
    const incidencia_academica = formData.get("incidencia_academica") as string;
    const flag_apoyo_especial = formData.get("flag_apoyo_especial") === "1";
    const apoyo_especial = formData.get("apoyo_especial") as string;
    const consentimiento_apoyo_especial =
      formData.get("consentimiento_apoyo_especial") === "1";
    const razon_consentimiento_apoyo_especial = formData.get(
      "razon_consentimiento_apoyo_especial"
    ) as string;
    const rezago = formData.get("rezago") as string;

    // Archivos (se reciben como File)
    const cert_nacimiento = formData.get("cert_nacimiento") as File;
    const cert_carnet = formData.get("cert_carnet") as File;
    const cert_estudios = formData.get("cert_estudios") as File;
    const cert_rsh = formData.get("cert_rsh") as File;
    // cert_diagnostico es opcional
    const cert_diagnostico = formData.get("cert_diagnostico") as File | null;

    // Campos de Info Apoderado
    const nombres_apoderado1 = formData.get("nombres_apoderado1") as string;
    const apellidos_apoderado1 = formData.get("apellidos_apoderado1") as string;
    const rut_apoderado1 = formData.get("rut_apoderado1") as string;
    const tipo_rut_apoderado1 = formData.get("tipo_rut_apoderado1") as string;
    const nacionalidad_apoderado1 = formData.get(
      "nacionalidad_apoderado1"
    ) as string;
    const vinculo_apoderado1 = formData.get("vinculo_apoderado1") as string;
    const celular_apoderado1 = formData.get("celular_apoderado1") as string;
    const email_apoderado1 = formData.get("email_apoderado1") as string;
    const comuna_apoderado1 = formData.get("comuna_apoderado1") as string;
    const direccion_apoderado1 = formData.get("direccion_apoderado1") as string;
    const nucleo_familiar = formData.get("nucleo_familiar") as string;
    const nombres_apoderado2 = formData.get("nombres_apoderado2") as string;
    const apellidos_apoderado2 = formData.get("apellidos_apoderado2") as string;
    const celular_apoderado2 = formData.get("celular_apoderado2") as string;

    // Campos de Contacto de Emergencia
    const nombres_ce = formData.get("nombres_contacto") as string;
    const apellidos_ce = formData.get("apellidos_contacto") as string;
    const celular_ce = formData.get("celular_contacto") as string;
    const vinculo_ce = formData.get("vinculo_contacto") as string;

    // Campos de Información Médica
    const flag_control_medico = formData.get("flag_control_medico") === "1";
    const flag_discapacidad = formData.get("flag_discapacidad") === "1";
    const discapacidad = formData.get("discapacidad") as string;
    const flag_necesidad_especial =
      formData.get("flag_necesidad_especial") === "1";
    const necesidad_especial = formData.get("necesidad_especial") as string;
    const flag_enfermedad = formData.get("flag_enfermedad") === "1";
    const enfermedad = formData.get("enfermedad") as string;
    const flag_medicamentos = formData.get("flag_medicamentos") === "1";
    const medicamentos = formData.get("medicamentos") as string;
    const flag_alergia = formData.get("flag_alergia") === "1";
    const alergia = formData.get("alergia") as string;
    const prevision_medica = formData.get("prevision_medica") as string;
    const servicio_emergencia = formData.get("servicio_emergencia") as string;

    // Campos de Consentimiento (se esperan valores "1" para true)
    const hitos = formData.get("hitos") === "1";
    const asistencia = formData.get("asistencia") === "1";
    const seguro_beneficio = formData.get("seguro_beneficio") === "1";
    const reuniones = formData.get("reuniones") === "1";
    // Se usa un campo distinto para el consentimiento de apoyo especial en este bloque
    const apoyo_especial_consent =
      formData.get("compromiso_apoyo_especial") === "1";
    const sedes = formData.get("sedes") === "1";
    const multimedia = formData.get("multimedia") === "1";
    const cumplimiento_compromisos =
      formData.get("cumplimiento_compromisos") === "1";
    const terminos_condiciones = formData.get("terminos_condiciones") === "1";

    const extendedTimeoutConfig = {
      ...config,
      options: {
        ...config.options,
        requestTimeout: 120000,
        connectTimeout: 60000,
      },
    };

    // Crear y conectar a la base de datos
    const connection = new Connection(extendedTimeoutConfig);
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

    try {
      // Verificar si el usuario ya existe en la base de datos
      const existingUsers = await executeSQL(
        connection,
        "SELECT * FROM Usuario WHERE RUT_USUARIO = @rut",
        [{ name: "rut", type: TYPES.NVarChar, value: rut_usuario }]
      );

      if (existingUsers.length > 0) {
        connection.close();
        return NextResponse.json(
          {
            success: false,
            error: "La persona ya está registrada en la base de datos",
          },
          { status: 400 }
        );
      }

      // Hashear la clave del usuario
      const hashedClave = await bcrypt.hash(clave, 10);

      // Función para formatear fechas a "DD-MM-YYYY"
      const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
      };

      const formattedFechaNacimiento = formatDate(fecha_nacimiento);
      const currentDate = new Date();
      const fechaFormateada = `${String(currentDate.getDate()).padStart(
        2,
        "0"
      )}-${String(currentDate.getMonth() + 1).padStart(
        2,
        "0"
      )}-${currentDate.getFullYear()}`;

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

      try {
        // Insertar en la tabla Usuario
        await executeSQLStatement(
          connection,
          `
          INSERT INTO Usuario (
            id_user, rut_usuario, rut_tipo, email, clave, nombres, apellidos,
            tipo_usuario, estado, sexo, nacionalidad, talla,
            fecha_nacimiento, direccion, comuna, sector, codigo_temporal
          ) VALUES (
            @id_user, @rut_usuario, @rut_tipo, @email, @clave, @nombres, @apellidos,
            @tipo_usuario, @estado, @sexo, @nacionalidad, @talla,
            @fecha_nacimiento, @direccion, @comuna, @sector, @codigo_temporal
          )
          `,
          [
            { name: "id_user", type: TYPES.NVarChar, value: id_user },
            { name: "rut_usuario", type: TYPES.NVarChar, value: rut_usuario },
            { name: "rut_tipo", type: TYPES.NVarChar, value: rut_tipo },
            { name: "email", type: TYPES.NVarChar, value: email },
            { name: "clave", type: TYPES.NVarChar, value: hashedClave },
            { name: "nombres", type: TYPES.NVarChar, value: nombres },
            { name: "apellidos", type: TYPES.NVarChar, value: apellidos },
            { name: "tipo_usuario", type: TYPES.NVarChar, value: "Estudiante" },
            { name: "estado", type: TYPES.NVarChar, value: "Matricula" },
            { name: "sexo", type: TYPES.NVarChar, value: sexo },
            { name: "nacionalidad", type: TYPES.NVarChar, value: nacionalidad },
            { name: "talla", type: TYPES.NVarChar, value: talla },
            {
              name: "fecha_nacimiento",
              type: TYPES.NVarChar,
              value: formattedFechaNacimiento,
            },
            { name: "direccion", type: TYPES.NVarChar, value: direccion },
            { name: "comuna", type: TYPES.NVarChar, value: comuna },
            { name: "sector", type: TYPES.NVarChar, value: sector },
            { name: "codigo_temporal", type: TYPES.NVarChar, value: "" },
          ]
        );

        // Insertar en CursosLink
        const cursoLinkId = uuidv4();
        await executeSQLStatement(
          connection,
          `
          INSERT INTO CursosAsignaturasLink (
            id_cursosasignaturaslink, id_user, id_curso, id_asignatura
          ) VALUES (
            @id, @id_user, @id_curso, @id_asignatura
          )
          `,
          [
            { name: "id", type: TYPES.NVarChar, value: cursoLinkId },
            { name: "id_user", type: TYPES.NVarChar, value: id_user },
            { name: "id_curso", type: TYPES.NVarChar, value: id_curso },
            { name: "id_asignatura", type: TYPES.NVarChar, value: null },
          ]
        );

        // Insertar en Matricula
        const id_matricula = uuidv4();
        await executeSQLStatement(
          connection,
          `
          INSERT INTO Matricula (
            id_matricula,
            id_user,
            fecha_matricula,
            estado,
            ultimo_establecimiento,
            ultimo_nivel_cursado,
            incidencia_academica,
            flag_apoyo_especial,
            apoyo_especial,
            consentimiento_apoyo_especial,
            razon_consentimiento_apoyo_especial,
            cert_nacimiento,
            cert_carnet,
            cert_estudios,
            cert_rsh,
            cert_diagnostico,
            rezago_escolar
          ) VALUES (
            @id_matricula,
            @id_user,
            @fecha_matricula,
            @estado,
            @ultimo_establecimiento,
            @ultimo_nivel_cursado,
            @incidencia_academica,
            @flag_apoyo_especial,
            @apoyo_especial,
            @consentimiento_apoyo_especial,
            @razon_consentimiento_apoyo_especial,
            @cert_nacimiento,
            @cert_carnet,
            @cert_estudios,
            @cert_rsh,
            @cert_diagnostico,
            @rezago_escolar
          )
          `,
          [
            { name: "id_matricula", type: TYPES.NVarChar, value: id_matricula },
            { name: "id_user", type: TYPES.NVarChar, value: id_user },
            {
              name: "fecha_matricula",
              type: TYPES.NVarChar,
              value: fechaFormateada,
            },
            { name: "estado", type: TYPES.Int, value: 0 },
            {
              name: "ultimo_establecimiento",
              type: TYPES.NVarChar,
              value: ultimo_establecimiento,
            },
            {
              name: "ultimo_nivel_cursado",
              type: TYPES.NVarChar,
              value: ultimo_nivel_cursado,
            },
            {
              name: "incidencia_academica",
              type: TYPES.NVarChar,
              value: incidencia_academica,
            },
            {
              name: "flag_apoyo_especial",
              type: TYPES.Int,
              value: flag_apoyo_especial ? 1 : 0,
            },
            {
              name: "apoyo_especial",
              type: TYPES.NVarChar,
              value: apoyo_especial,
            },
            {
              name: "consentimiento_apoyo_especial",
              type: TYPES.Int,
              value: consentimiento_apoyo_especial ? 1 : 0,
            },
            {
              name: "razon_consentimiento_apoyo_especial",
              type: TYPES.NVarChar,
              value: razon_consentimiento_apoyo_especial,
            },
            {
              name: "cert_nacimiento",
              type: TYPES.Int,
              value: cert_nacimiento && cert_nacimiento.size > 0 ? 1 : 0,
            },
            {
              name: "cert_carnet",
              type: TYPES.Int,
              value: cert_carnet && cert_carnet.size > 0 ? 1 : 0,
            },
            {
              name: "cert_estudios",
              type: TYPES.Int,
              value: cert_estudios && cert_estudios.size > 0 ? 1 : 0,
            },
            {
              name: "cert_rsh",
              type: TYPES.Int,
              value: cert_rsh && cert_rsh.size > 0 ? 1 : 0,
            },
            {
              name: "cert_diagnostico",
              type: TYPES.Int,
              value: cert_diagnostico && cert_diagnostico.size > 0 ? 1 : 0,
            },
            { name: "rezago_escolar", type: TYPES.NVarChar, value: rezago },
          ]
        );

        // Definir nombres específicos para cada tipo de documento
        const documentTypes = {
          cert_nacimiento: "Certificado de Nacimiento",
          cert_carnet: "Fotocopia Carnet",
          cert_estudios: "Certificado de Estudios",
          cert_rsh: "Registro Social de Hogares",
          cert_diagnostico: "Certificado de Diagnóstico",
        };

        // Mapeo de archivos con sus tipos
        const fileMapping = [
          { field: cert_nacimiento, type: "cert_nacimiento" },
          { field: cert_carnet, type: "cert_carnet" },
          { field: cert_estudios, type: "cert_estudios" },
          { field: cert_rsh, type: "cert_rsh" },
          { field: cert_diagnostico, type: "cert_diagnostico" },
        ];

        // Se recorren los archivos disponibles con sus tipos específicos
        for (const fileInfo of fileMapping) {
          const file = fileInfo.field;
          const fileType = fileInfo.type;

          if (file && file.size > 0) {
            const fileBuffer = Buffer.from(await file.arrayBuffer());
            // Usar el nombre específico del tipo de documento
            const fileName = `${
              documentTypes[fileType as keyof typeof documentTypes]
            }_${rut_usuario}`;
            const fileExtension = file.name.split(".").pop() || "";

            await executeSQLStatement(
              connection,
              `
              INSERT INTO Matricula_archivo (
                id_documento, id_matricula, id_user, titulo, documento, extension, tipo
              ) VALUES (
                @id_documento, @id_matricula, @id_user, @titulo, @documento, @extension, @tipo
              )
              `,
              [
                { name: "id_documento", type: TYPES.NVarChar, value: uuidv4() },
                {
                  name: "id_matricula",
                  type: TYPES.NVarChar,
                  value: id_matricula,
                },
                { name: "id_user", type: TYPES.NVarChar, value: id_user },
                { name: "titulo", type: TYPES.NVarChar, value: fileName },
                { name: "documento", type: TYPES.VarBinary, value: fileBuffer },
                {
                  name: "extension",
                  type: TYPES.NVarChar,
                  value: fileExtension,
                },
                { name: "tipo", type: TYPES.NVarChar, value: fileType },
              ]
            );
          }
        }

        // Insertar Info_apoderado
        await executeSQLStatement(
          connection,
          `
          INSERT INTO Info_apoderado (
            id_apoderado,
            id_user,
            nombres_apoderado1,
            apellidos_apoderado1,
            rut_apoderado1,
            rut_tipo_apoderado1,
            nacionalidad_apoderado1,
            vinculo_apoderado1,
            celular_apoderado1,
            email_apoderado1,
            comuna_apoderado1,
            direccion_apoderado1,
            nucleo_familiar,
            nombres_apoderado2,
            apellidos_apoderado2,
            celular_apoderado2
          ) VALUES (
            @id_apoderado,
            @id_user,
            @nombres_apoderado1,
            @apellidos_apoderado1,
            @rut_apoderado1,
            @rut_tipo_apoderado1,
            @nacionalidad_apoderado1,
            @vinculo_apoderado1,
            @celular_apoderado1,
            @email_apoderado1,
            @comuna_apoderado1,
            @direccion_apoderado1,
            @nucleo_familiar,
            @nombres_apoderado2,
            @apellidos_apoderado2,
            @celular_apoderado2
          )
          `,
          [
            { name: "id_apoderado", type: TYPES.NVarChar, value: uuidv4() },
            { name: "id_user", type: TYPES.NVarChar, value: id_user },
            {
              name: "nombres_apoderado1",
              type: TYPES.NVarChar,
              value: nombres_apoderado1,
            },
            {
              name: "apellidos_apoderado1",
              type: TYPES.NVarChar,
              value: apellidos_apoderado1,
            },
            {
              name: "rut_apoderado1",
              type: TYPES.NVarChar,
              value: rut_apoderado1,
            },
            {
              name: "rut_tipo_apoderado1",
              type: TYPES.NVarChar,
              value: tipo_rut_apoderado1,
            },
            {
              name: "nacionalidad_apoderado1",
              type: TYPES.NVarChar,
              value: nacionalidad_apoderado1,
            },
            {
              name: "vinculo_apoderado1",
              type: TYPES.NVarChar,
              value: vinculo_apoderado1,
            },
            {
              name: "celular_apoderado1",
              type: TYPES.NVarChar,
              value: celular_apoderado1,
            },
            {
              name: "email_apoderado1",
              type: TYPES.NVarChar,
              value: email_apoderado1,
            },
            {
              name: "comuna_apoderado1",
              type: TYPES.NVarChar,
              value: comuna_apoderado1,
            },
            {
              name: "direccion_apoderado1",
              type: TYPES.NVarChar,
              value: direccion_apoderado1,
            },
            {
              name: "nucleo_familiar",
              type: TYPES.NVarChar,
              value: nucleo_familiar,
            },
            {
              name: "nombres_apoderado2",
              type: TYPES.NVarChar,
              value: nombres_apoderado2,
            },
            {
              name: "apellidos_apoderado2",
              type: TYPES.NVarChar,
              value: apellidos_apoderado2,
            },
            {
              name: "celular_apoderado2",
              type: TYPES.NVarChar,
              value: celular_apoderado2,
            },
          ]
        );

        // Insertar contacto_emergencia
        await executeSQLStatement(
          connection,
          `
          INSERT INTO contacto_emergencia (
            id_contacto_emergencia,
            id_user,
            nombres,
            apellidos,
            celular,
            vinculo
          ) VALUES (
            @id_contacto_emergencia,
            @id_user,
            @nombres,
            @apellidos,
            @celular,
            @vinculo
          )
          `,
          [
            {
              name: "id_contacto_emergencia",
              type: TYPES.NVarChar,
              value: uuidv4(),
            },
            { name: "id_user", type: TYPES.NVarChar, value: id_user },
            { name: "nombres", type: TYPES.NVarChar, value: nombres_ce },
            { name: "apellidos", type: TYPES.NVarChar, value: apellidos_ce },
            { name: "celular", type: TYPES.NVarChar, value: celular_ce },
            { name: "vinculo", type: TYPES.NVarChar, value: vinculo_ce },
          ]
        );

        // Insertar Info_medica
        await executeSQLStatement(
          connection,
          `
          INSERT INTO Info_medica (
            id_info_medica,
            id_user,
            flag_control_medico,
            flag_discapacidad,
            discapacidad,
            flag_necesidad_especial,
            necesidad_especial,
            flag_enfermedad,
            enfermedad,
            flag_medicamentos,
            medicamentos,
            flag_alergia,
            alergia,
            prevision_medica,
            servicio_emergencia
          ) VALUES (
            @id_info_medica,
            @id_user,
            @flag_control_medico,
            @flag_discapacidad,
            @discapacidad,
            @flag_necesidad_especial,
            @necesidad_especial,
            @flag_enfermedad,
            @enfermedad,
            @flag_medicamentos,
            @medicamentos,
            @flag_alergia,
            @alergia,
            @prevision_medica,
            @servicio_emergencia
          )
          `,
          [
            { name: "id_info_medica", type: TYPES.NVarChar, value: uuidv4() },
            { name: "id_user", type: TYPES.NVarChar, value: id_user },
            {
              name: "flag_control_medico",
              type: TYPES.Int,
              value: flag_control_medico ? 1 : 0,
            },
            {
              name: "flag_discapacidad",
              type: TYPES.Int,
              value: flag_discapacidad ? 1 : 0,
            },
            { name: "discapacidad", type: TYPES.NVarChar, value: discapacidad },
            {
              name: "flag_necesidad_especial",
              type: TYPES.Int,
              value: flag_necesidad_especial ? 1 : 0,
            },
            {
              name: "necesidad_especial",
              type: TYPES.NVarChar,
              value: necesidad_especial,
            },
            {
              name: "flag_enfermedad",
              type: TYPES.Int,
              value: flag_enfermedad ? 1 : 0,
            },
            { name: "enfermedad", type: TYPES.NVarChar, value: enfermedad },
            {
              name: "flag_medicamentos",
              type: TYPES.Int,
              value: flag_medicamentos ? 1 : 0,
            },
            { name: "medicamentos", type: TYPES.NVarChar, value: medicamentos },
            {
              name: "flag_alergia",
              type: TYPES.Int,
              value: flag_alergia ? 1 : 0,
            },
            { name: "alergia", type: TYPES.NVarChar, value: alergia },
            {
              name: "prevision_medica",
              type: TYPES.NVarChar,
              value: prevision_medica,
            },
            {
              name: "servicio_emergencia",
              type: TYPES.NVarChar,
              value: servicio_emergencia,
            },
          ]
        );

        // Insertar Consentimiento
        await executeSQLStatement(
          connection,
          `
          INSERT INTO Consentimiento (
            id_consentimiento,
            id_user,
            hitos,
            asistencia,
            seguro_beneficio,
            reuniones,
            apoyo_especial,
            sedes,
            multimedia,
            cumplimiento_compromisos,
            terminos_condiciones
          ) VALUES (
            @id_consentimiento,
            @id_user,
            @hitos,
            @asistencia,
            @seguro_beneficio,
            @reuniones,
            @apoyo_especial,
            @sedes,
            @multimedia,
            @cumplimiento_compromisos,
            @terminos_condiciones
          )
          `,
          [
            {
              name: "id_consentimiento",
              type: TYPES.NVarChar,
              value: uuidv4(),
            },
            { name: "id_user", type: TYPES.NVarChar, value: id_user },
            { name: "hitos", type: TYPES.Int, value: hitos ? 1 : 0 },
            { name: "asistencia", type: TYPES.Int, value: asistencia ? 1 : 0 },
            {
              name: "seguro_beneficio",
              type: TYPES.Int,
              value: seguro_beneficio ? 1 : 0,
            },
            { name: "reuniones", type: TYPES.Int, value: reuniones ? 1 : 0 },
            {
              name: "apoyo_especial",
              type: TYPES.Int,
              value: apoyo_especial_consent ? 1 : 0,
            },
            { name: "sedes", type: TYPES.Int, value: sedes ? 1 : 0 },
            { name: "multimedia", type: TYPES.Int, value: multimedia ? 1 : 0 },
            {
              name: "cumplimiento_compromisos",
              type: TYPES.Int,
              value: cumplimiento_compromisos ? 1 : 0,
            },
            {
              name: "terminos_condiciones",
              type: TYPES.Int,
              value: terminos_condiciones ? 1 : 0,
            },
          ]
        );

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

        try {
          await sendRegistrationNotification(email, `${nombres} ${apellidos}`);
        } catch (emailError) {
          console.error("Error al enviar correo de notificación:", emailError);
        }

        connection.close();
        return NextResponse.json({ success: true }, { status: 201 });
      } catch (error) {
        // Revertir la transacción en caso de error
        await new Promise<void>((resolve) => {
          connection.rollbackTransaction(() => resolve());
        });
        connection.close();
        throw error;
      }
    } catch (error) {
      connection.close();
      throw error;
    }
  } catch (error) {
    console.error("Error en el registro:", error);
    return NextResponse.json(
      { success: false, error: "Error en el servidor" },
      { status: 500 }
    );
  }
}
