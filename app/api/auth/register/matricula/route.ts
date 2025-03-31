import { NextResponse } from "next/server";
import db from "@/db";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  try {
    // Extraemos los datos enviados vía FormData (no JSON)
    const formData = await req.formData();

    // Campos de Usuario y datos generales
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

    // Verificar si el usuario ya existe en la base de datos
    const checkStmt = db.prepare(`SELECT * FROM Usuario WHERE RUT_USUARIO = ?`);
    const existingUser = checkStmt.get(rut_usuario);
    if (existingUser) {
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
    db.exec("BEGIN TRANSACTION");

    try {
      // Insertar en la tabla Usuario
      const userStmt = db.prepare(`
        INSERT INTO Usuario (
          rut_usuario, rut_tipo, email, clave, nombres, apellidos,
          tipo_usuario, estado, sexo, nacionalidad, talla,
          fecha_nacimiento, direccion, comuna, sector, codigo_temporal
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      userStmt.run(
        rut_usuario,
        rut_tipo,
        email,
        hashedClave,
        nombres,
        apellidos,
        "Estudiante",
        "Matricula",
        sexo,
        nacionalidad,
        talla,
        formattedFechaNacimiento,
        direccion,
        comuna,
        sector,
        ""
      );

      // Insertar en CursosLink
      const cursoStmt = db.prepare(
        `INSERT INTO CursosAsignaturasLink (id_cursosasignaturaslink, rut_usuario, id_curso, id_asignatura) VALUES (?, ?, ?, ?)`
      );
      cursoStmt.run(uuidv4(), rut_usuario, id_curso, null);

      // Insertar en Matricula
      const id_matricula = uuidv4();
      const matriculaStmt = db.prepare(`
        INSERT INTO Matricula (
          id_matricula,
          rut_usuario,
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
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      matriculaStmt.run(
        id_matricula,
        rut_usuario,
        fechaFormateada,
        0,
        ultimo_establecimiento,
        ultimo_nivel_cursado,
        incidencia_academica,
        flag_apoyo_especial ? 1 : 0,
        apoyo_especial,
        consentimiento_apoyo_especial ? 1 : 0,
        razon_consentimiento_apoyo_especial,
        cert_nacimiento && cert_nacimiento.size > 0 ? 1 : 0,
        cert_carnet && cert_carnet.size > 0 ? 1 : 0,
        cert_estudios && cert_estudios.size > 0 ? 1 : 0,
        cert_rsh && cert_rsh.size > 0 ? 1 : 0,
        cert_diagnostico && cert_diagnostico.size > 0 ? 1 : 0,
        rezago
      );

      // Insertar archivos en Matricula_archivo
      const matriculaArchivoStmt = db.prepare(`
        INSERT INTO Matricula_archivo (id_documento, id_matricula, rut_usuario, titulo, documento, extension)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

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

          matriculaArchivoStmt.run(
            uuidv4(),
            id_matricula,
            rut_usuario,
            fileName,
            fileBuffer,
            fileExtension
          );
        }
      }

      // Insertar Info_apoderado
      const apoderadoStmt = db.prepare(`
        INSERT INTO Info_apoderado (
          id_apoderado,
          rut_usuario,
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
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      apoderadoStmt.run(
        uuidv4(),
        rut_usuario,
        nombres_apoderado1,
        apellidos_apoderado1,
        rut_apoderado1,
        tipo_rut_apoderado1,
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
      );

      // Insertar contacto_emergencia
      const contactoEmergenciaStmt = db.prepare(`
        INSERT INTO contacto_emergencia (
          id_contacto_emergencia,
          rut_usuario,
          nombres,
          apellidos,
          celular,
          vinculo
        ) VALUES (?, ?, ?, ?, ?, ?)
      `);
      contactoEmergenciaStmt.run(
        uuidv4(),
        rut_usuario,
        nombres_ce,
        apellidos_ce,
        celular_ce,
        vinculo_ce
      );

      // Insertar Info_medica
      const medicaStmt = db.prepare(`
        INSERT INTO Info_medica (
          id_info_medica,
          rut_usuario,
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
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      medicaStmt.run(
        uuidv4(),
        rut_usuario,
        flag_control_medico ? 1 : 0,
        flag_discapacidad ? 1 : 0,
        discapacidad,
        flag_necesidad_especial ? 1 : 0,
        necesidad_especial,
        flag_enfermedad ? 1 : 0,
        enfermedad,
        flag_medicamentos ? 1 : 0,
        medicamentos,
        flag_alergia ? 1 : 0,
        alergia,
        prevision_medica,
        servicio_emergencia
      );

      // Insertar Consentimiento
      const compromisosStmt = db.prepare(`
        INSERT INTO Consentimiento (
          id_consentimiento,
          rut_usuario,
          hitos,
          asistencia,
          seguro_beneficio,
          reuniones,
          apoyo_especial,
          sedes,
          multimedia,
          cumplimiento_compromisos,
          terminos_condiciones
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      compromisosStmt.run(
        uuidv4(),
        rut_usuario,
        hitos ? 1 : 0,
        asistencia ? 1 : 0,
        seguro_beneficio ? 1 : 0,
        reuniones ? 1 : 0,
        apoyo_especial_consent ? 1 : 0,
        sedes ? 1 : 0,
        multimedia ? 1 : 0,
        cumplimiento_compromisos ? 1 : 0,
        terminos_condiciones ? 1 : 0
      );

      db.exec("COMMIT");
      return NextResponse.json({ success: true }, { status: 201 });
    } catch (error) {
      db.exec("ROLLBACK");
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
