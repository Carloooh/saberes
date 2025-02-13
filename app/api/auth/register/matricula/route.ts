import { NextResponse } from 'next/server';
import db from '@/db';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  try {
    const { 
      rut_usuario, 
      ...userData 
    } = await req.json();

    const checkStmt = db.prepare(`SELECT * FROM Usuario WHERE RUT_USUARIO = ?`);
    const existingUser = checkStmt.get(rut_usuario);
    if (existingUser) {
      return NextResponse.json({ success: false, error: 'La persona ya está registrada en la base de datos' }, { status: 400 });
    }

    const hashedClave = await bcrypt.hash(userData.clave, 10);

    const fechaActual: Date = new Date();

    const dia: number = fechaActual.getDate();
    const mes: number = fechaActual.getMonth() + 1;
    const año: number = fechaActual.getFullYear();

    const fechaFormateada: string = `${dia.toString().padStart(2, '0')}-${mes.toString().padStart(2, '0')}-${año}`;

    db.exec('BEGIN TRANSACTION');

    const formatDate = (dateString: string): string => {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0"); // Los meses empiezan en 0
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    };
    const formattedFechaNacimiento = formatDate(userData.fecha_nacimiento);

    const calculateAge = (dateString: string): number => {
      const today = new Date();
      const birthDate = new Date(dateString);
    
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDifference = today.getMonth() - birthDate.getMonth();
    
      // Ajustar si el cumpleaños aún no ha ocurrido este año
      if (
        monthDifference < 0 ||
        (monthDifference === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }
    
      return age;
    };

    const edad = calculateAge(userData.fecha_nacimiento);

    try {
      const userStmt = db.prepare(`
        INSERT INTO Usuario (
          rut_usuario, rut_tipo, email, clave, nombres, apellidos, 
          tipo_usuario, estado, edad, sexo, nacionalidad, talla, 
          fecha_nacimiento, direccion, comuna, sector, codigo_temporal
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      userStmt.run(
        rut_usuario,
        userData.rut_tipo,
        userData.email,
        hashedClave,
        userData.nombres,
        userData.apellidos,
        "Estudiante",
        "Matricula",
        edad,
        userData.sexo,
        userData.nacionalidad,
        userData.talla,
        formattedFechaNacimiento,
        userData.direccion,
        userData.comuna,
        userData.sector,
        ''
      );

    const cursoStmt = db.prepare(`INSERT INTO CursosLink (rut_usuario, id_curso) values(?, ?)`);

    cursoStmt.run(rut_usuario, userData.id_curso);
    
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
      )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

    const cert_nacimiento = userData.cert_nacimiento as File;
    const cert_carnet = userData.cert_carnet as File;
    const cert_estudios = userData.cert_estudios as File;
    const cert_rsh = userData.cert_rsh as File;
    const cert_diagnostico = userData.cert_diagnostico ? userData.cert_diagnostico as File : null;
    const id_matricula = uuidv4();
    const rezago = userData.rezago;
    matriculaStmt.run(
      id_matricula,
      rut_usuario, 
      fechaFormateada, 
      0, 
      userData.ultimo_establecimiento, 
      userData.ultimo_nivel_cursado,
      userData.incidencia_academica,
      userData.flag_apoyo_especial ? 1 : 0,
      userData.apoyo_especial,
      userData.consentimiento_apoyo_especial ? 1 : 0,
      userData.razon_consentimiento_apoyo_especial,
      cert_nacimiento ? 1 : 0,
      cert_carnet ? 1 : 0,
      cert_estudios ? 1 : 0,
      cert_rsh ? 1 : 0,
      cert_diagnostico ? 1 : 0,
      rezago
    );

    const matriculaArchivoStmt = db.prepare(`INSERT INTO Matricula_archivo (id_documento, id_matricula, rut_usuario, titulo, documento, extension) values (?, ?, ?, ?, ?, ?)`);
    
    if (cert_nacimiento.size > 0) {
      const cert_nacimientoBuffer = await cert_nacimiento.arrayBuffer();
      const cert_nacimientoNombre = cert_nacimiento.name.split('.').slice(0, -1).join('.') || 'archivo';
      const cert_nacimientoExtension = cert_nacimiento.name.split('.').pop() || '';
      matriculaArchivoStmt.run(uuidv4(), id_matricula, rut_usuario, cert_nacimientoNombre, Buffer.from(cert_nacimientoBuffer), cert_nacimientoExtension);
    }

    if (cert_carnet.size > 0) {    
    const cert_carnetBuffer = await cert_carnet.arrayBuffer();
    const cert_carnetNombre = cert_carnet.name.split('.').slice(0, -1).join('.') || 'archivo';
    const cert_carnetExtension = cert_carnet.name.split('.').pop() || '';
    matriculaArchivoStmt.run(uuidv4(), id_matricula, rut_usuario, cert_carnetNombre, Buffer.from(cert_carnetBuffer), cert_carnetExtension);
      }

      if (cert_estudios.size > 0) {
    const cert_estudiosBuffer = await cert_estudios.arrayBuffer();
    const cert_estudiosNombre = cert_estudios.name.split('.').slice(0, -1).join('.') || 'archivo';
    const cert_estudiosExtension = cert_estudios.name.split('.').pop() || '';
    matriculaArchivoStmt.run(uuidv4(), id_matricula, rut_usuario, cert_estudiosNombre, Buffer.from(cert_estudiosBuffer), cert_estudiosExtension);
        }

      if (cert_rsh.size > 0) {
    const cert_rshBuffer = await cert_rsh.arrayBuffer();
    const cert_rshNombre = cert_rsh.name.split('.').slice(0, -1).join('.') || 'archivo';
    const cert_rshExtension = cert_rsh.name.split('.').pop() || '';
    matriculaArchivoStmt.run(uuidv4(), id_matricula, rut_usuario, cert_rshNombre, Buffer.from(cert_rshBuffer), cert_rshExtension);
        }

    if (cert_diagnostico) {
      if (cert_diagnostico.size >0) {
        const cert_diagnosticoBuffer = await cert_diagnostico.arrayBuffer();
        const cert_diagnosticoNombre = cert_diagnostico.name.split('.').slice(0, -1).join('.') || 'archivo';
        const cert_diagnosticoExtension = cert_diagnostico.name.split('.').pop() || '';
        matriculaArchivoStmt.run(uuidv4(), id_matricula, rut_usuario, cert_diagnosticoNombre, Buffer.from(cert_diagnosticoBuffer), cert_diagnosticoExtension);
      }
    }

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
        celular_apoderado2)
      values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

    apoderadoStmt.run(
      uuidv4(), 
      rut_usuario, 
      userData.nombres_apoderado1, 
      userData.apellidos_apoderado1, 
      userData.rut_apoderado1, 
      userData.rut_tipo_apoderado1, 
      userData.nacionalidad_apoderado1, 
      userData.vinculo_apoderado1, 
      userData.celular_apoderado1,
      userData.email_apoderado1,
      userData.comuna_apoderado1,
      userData.direccion_apoderado1,
      userData.nucleo_familiar,
      userData.nombres_apoderado2,
      userData.apellidos_apoderado2,
      userData.celular_apoderado2
    );
    
    const contactoEmergenciaStmt = db.prepare(` 
      INSERT INTO contacto_emergencia (
        id_contacto_emergencia, 
        rut_usuario,
        nombres, 
        apellidos, 
        celular, 
        vinculo) 
      values (?, ?, ?, ?, ?, ?)`);
    
    contactoEmergenciaStmt.run(uuidv4(),rut_usuario, userData.nombres_ce, userData.apellidos_ce, userData.celular_ce, userData.vinculo_ce);

    const medicaStmt = db.prepare(`INSERT INTO Info_medica (id_info_medica, rut_usuario, flag_control_medico, flag_discapacidad, discapacidad, flag_necesidad_especial, necesidad_especial, flag_enfermedad, enfermedad, flag_medicamentos, medicamentos, flag_alergia, alergia, prevision_medica, servicio_emergencia)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    medicaStmt.run(
      uuidv4(),
      rut_usuario, 
      userData.flag_control_medico ? 1 : 0, 
      userData.flag_discapacidad ? 1 : 0,
      userData.discapacidad,
      userData.flag_necesidad_especial ? 1 : 0,
      userData.necesidad_especial,
      userData.flag_enfermedad ? 1 : 0,
      userData.enfermedad,
      userData.flag_medicamentos ? 1 : 0,
      userData.medicamentos,
      userData.flag_alergia ? 1 : 0,
      userData.alergia,
      userData.prevision_medica,
      userData.servicio_emergencia
    );

    const compromisosStmt = db.prepare(`INSERT INTO Consentimiento (
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
      terminos_condiciones ) values(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

    compromisosStmt.run(uuidv4(), 
      rut_usuario, 
      userData.hitos ? 1 : 0,
      userData.asistencia.hitos ? 1 : 0,
      userData.seguro_beneficio.hitos ? 1 : 0,
      userData.reuniones.hitos ? 1 : 0,
      userData.apoyo_especial.hitos ? 1 : 0,
      userData.sedes.hitos ? 1 : 0,
      userData.multimedia.hitos ? 1 : 0,
      userData.cumplimiento_compromisos.hitos ? 1 : 0,
      userData.terminos_condiciones.hitos ? 1 : 0
    );

      db.exec('COMMIT');
      return NextResponse.json({ success: true }, { status: 201 });

    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Error en el registro:', error);
    return NextResponse.json({ success: false, error: 'Error en el servidor' }, { status: 500 });
  }
}