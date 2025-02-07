import xlsx from 'xlsx';
import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

const db = new Database('db/database.sqlite', { verbose: console.log });
const workbook = xlsx.readFile('C:/Users/cazocar/Documents/proyectos/saberes_venv/saberes_nextjs/db/MATRICULAS2025.xlsx');
const sheetName = workbook.SheetNames[11];
const worksheet = workbook.Sheets[sheetName];

const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

for (let i = 1; i < 206 && i < data.length; i++) {
    const row = data[i];

    // Extraer datos

    // Usuario
    const nombres = row[6].toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    const apellidos = `${row[7].toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} ${row[8].toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}`;
    const rut_original = row[9] ? String(row[9]).toUpperCase() : '';
    const numeros = rut_original.replace(/[^0-9K]/g, '');
    let rut_usuario;

    if (!rut_original || !isNaN(Number(rut_original))) {
        const fullName = `${nombres}${apellidos}`;
        rut_usuario = fullName
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, '');
    } else if (rut_original.includes('-') || rut_original.includes('.')) {
        rut_usuario = numeros.slice(0, -1) + '-' + numeros.slice(-1);
    } else {
        const fullName = `${nombres}${apellidos}`;
        rut_usuario = fullName
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, '');
    }
    
    const email = row[51];
    const edad = "dato de relleno";
    const clave = `${nombres}${apellidos}`;
    const hashedClave = await bcrypt.hash(clave, 10);
    const tipo_usuario = "Estudiante";
    const estado = "dato de relleno";
    
    const sexo = "dato de relleno";
    const nacionalidad = "dato de relleno";
    const talla = "dato de relleno";
    const fecha_nacimiento = "dato de relleno";
    const direccion = "dato de relleno";
    const comuna = "dato de relleno";
    const sector = "dato de relleno";

    // Matricula
    const id_matricula = "dato de relleno";
    const estado_matricula = "dato de relleno";
    const ultimo_establecimiento = "dato de relleno";
    const ultimo_nivel_cursado = "dato de relleno";
    const incidencia_academica = "dato de relleno";
    const flag_apoyo_especial = "dato de relleno";
    const apoyo_especial = "dato de relleno";
    const consentimiento_apoyo_especial = "dato de relleno";
    const razon_consentimiento_apoyo_especial = "dato de relleno";
    const cert_nacimiento = "dato de relleno";
    const cert_carnet = "dato de relleno";
    const cert_estudios = "dato de relleno";
    const cert_rsh = "dato de relleno";
    const rezago_escolar = "dato de relleno";

    // Info_apoderado
    const id_apoderado = "dato de relleno";
    const nombres_apoderado1 = "dato de relleno";
    const apellidos_apoderado1 = "dato de relleno";
    const rut_apoderado1 = "dato de relleno";
    const nacionalidad_apoderado1 = "dato de relleno";
    const vinculo_apoderado1 = "dato de relleno";
    const celular_apoderado1 = "dato de relleno";
    const email_apoderado1 = "dato de relleno";
    const nucleo_familiar = "dato de relleno";
    const nombres_apoderado2 = "dato de relleno";
    const apellidos_apoderado2 = "dato de relleno";
    const celular_apoderado2 = "dato de relleno";
    const comuna_apoderado1 = "dato de relleno";
    const direccion_apoderado1 = "dato de relleno";

    // Info_medica
    const id_info_medica = "dato de relleno";
    const flag_control_medico = "dato de relleno";
    const flag_discapacidad = "dato de relleno";
    const discapacidad = "dato de relleno";
    const flag_necesidad_especial = "dato de relleno";
    const necesidad_especial = "dato de relleno";
    const flag_enfermedad = "dato de relleno";
    const enfermedad = "dato de relleno";
    const flag_medicamentos = "dato de relleno";
    const medicamentos = "dato de relleno";
    const flag_alergia = "dato de relleno";
    const alergia = "dato de relleno";
    const prevision_medica = "dato de relleno";
    const servicio_emergencia = "dato de relleno";

    // Consentimiento
    const id_consentimiento = "dato de relleno";
    const hitos = "dato de relleno";
    const asistencia = "dato de relleno";
    const seguro_beneficio = "dato de relleno";
    const reuniones = "dato de relleno";
    const apoyo_especial_consentimiento = "dato de relleno";
    const sedes = "dato de relleno";
    const multimedia = "dato de relleno";
    const cumplimiento_compromisos = "dato de relleno";
    const terminos_condiciones = "dato de relleno";

    // Contacto_emergencia
    const id_contacto_emergencia = "dato de relleno";
    const nombres_contacto = "dato de relleno";
    const apellidos_contacto = "dato de relleno";
    const celular_contacto = "dato de relleno";
    const vinculo_contacto = "dato de relleno";

    console.log(rut_usuario);

    // // Insertar en Usuario
    // const insertUsuario = db.prepare(`
    //     INSERT INTO Usuario (rut_usuario, email, clave, nombres, apellidos, tipo_usuario, estado, edad, sexo, nacionalidad, talla, fecha_nacimiento, direccion, comuna, sector)
    //     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    // `);
    // insertUsuario.run(rut_usuario, email, "clave123", nombres, apellidos, tipo_usuario, estado, edad, sexo, nacionalidad, talla, fecha_nacimiento, direccion, comuna, sector);

    // // Insertar en Matricula
    // const insertMatricula = db.prepare(`
    //     INSERT INTO Matricula (id_matricula, rut_usuario, estado, ultimo_establecimiento, ultimo_nivel_cursado, incidencia_academica, flag_apoyo_especial, apoyo_especial, consentimiento_apoyo_especial, razon_consentimiento_apoyo_especial, cert_nacimiento, cert_carnet, cert_estudios, cert_rsh, rezago_escolar)
    //     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    // `);
    // insertMatricula.run(uuidv4(), rut_usuario, 1, row[30], row[31], row[32], row[33] === "Sí" ? 1 : 0, row[34], row[35] === "Sí" ? 1 : 0, row[36], 1, 1, 1, 1, row[9]);

    // // Insertar en Info_apoderado
    // const insertApoderado = db.prepare(`
    //     INSERT INTO Info_apoderado (id_apoderado, rut_usuario, nombres_apoderado1, apellidos_apoderado1, rut_apoderado1, nacionalidad_apoderado1, vinculo_apoderado1, celular_apoderado1, email_apoderado1, nucleo_familiar, nombres_apoderado2, apellidos_apoderado2, celular_apoderado2, comuna_apoderado1, direccion_apoderado1)
    //     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    // `);
    // insertApoderado.run(uuidv4(), rut_usuario, row[37], "", row[38], row[39], row[40], row[41], row[42], row[43], row[44], "", row[45], row[46], row[47]);

    // // Insertar en Info_medica
    // const insertMedica = db.prepare(`
    //     INSERT INTO Info_medica (id_info_medica, rut_usuario, flag_control_medico, flag_discapacidad, discapacidad, flag_necesidad_especial, necesidad_especial, flag_enfermedad, enfermedad, flag_medicamentos, medicamentos, flag_alergia, alergia, prevision_medica, servicio_emergencia)
    //     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    // `);
    // insertMedica.run(uuidv4(), rut_usuario, row[15] === "Sí" ? 1 : 0, row[16] === "Sí" ? 1 : 0, row[17], row[18] === "Sí" ? 1 : 0, row[19], row[20] === "Sí" ? 1 : 0, row[21], row[22] === "Sí" ? 1 : 0, row[23], row[24] === "Sí" ? 1 : 0, row[25], row[26], row[27]);

    // // Insertar en Consentimiento
    // const insertConsentimiento = db.prepare(`
    //     INSERT INTO Consentimiento (id_consentimiento, rut_usuario, hitos, asistencia, seguro_beneficio, reuniones, apoyo_especial, sedes, multimedia, cumplimiento_compromisos, terminos_condiciones)
    //     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    // `);
    // insertConsentimiento.run(uuidv4(), rut_usuario, row[48] === "Sí" ? 1 : 0, row[49] === "Sí" ? 1 : 0, row[50] === "Sí" ? 1 : 0, row[51] === "Sí" ? 1 : 0, row[52] === "Sí" ? 1 : 0, row[53] === "Sí" ? 1 : 0, row[54] === "Sí" ? 1 : 0, row[55] === "Sí" ? 1 : 0, row[56] === "Sí" ? 1 : 0);

    // // Insertar en Contacto_emergencia
    // const insertEmergencia = db.prepare(`
    //     INSERT INTO Contacto_emergencia (id_contacto_emergencia, rut_usuario, nombres, apellidos, celular, vinculo)
    //     VALUES (?, ?, ?, ?, ?, ?)
    // `);
    // insertEmergencia.run(uuidv4(), rut_usuario, row[28], "", row[29], row[30]);
}

console.log("Población de base de datos completada.");
// db.close();
