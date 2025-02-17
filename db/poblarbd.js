import xlsx from 'xlsx';
import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

const db = new Database('db/database.sqlite', { verbose: console.log });
const workbook = xlsx.readFile('C:/Users/cazocar/Documents/proyectos/saberes_venv/saberes_nextjs/db/MATRICULAS2025.xlsx');
const sheetName = workbook.SheetNames[11];
const worksheet = workbook.Sheets[sheetName];

const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

for (let i = 1; i < 205 && i < data.length; i++) {
    const row = data[i];

    function quitarTildes(str) {
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }

    function convertirFecha(numeroSerie) {
        const fechaBase = new Date(1899, 11, 30); // Fecha base de Excel (30 de diciembre de 1899)
        const milisegundosPorDia = 24 * 60 * 60 * 1000; // Milisegundos en un día
    
        // Calcular la fecha sumando los días al número de serie
        const fecha = new Date(fechaBase.getTime() + numeroSerie * milisegundosPorDia);
    
        // Formatear la fecha como "dd-mm-yyyy"
        const dia = String(fecha.getDate()).padStart(2, '0');
        const mes = String(fecha.getMonth() + 1).padStart(2, '0'); // Los meses en JavaScript son base 0
        const anio = fecha.getFullYear();
    
        return `${dia}-${mes}-${anio}`;
    }

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
    const rut_tipo = "";
    const email =    
    row[51] === undefined || row[51] === null || String(row[51]).trim() === ""
    ? "" // Caso 1: undefined, null o cadena vacía
    : typeof row[51] === "string" && (row[51].includes('@') || row[51].includes('.'))
        ? row[51].toLowerCase() // Caso 2: Es un email (convertir a minúsculas)
        : String(row[51]);
    const edad = row[12];
    const clave = uuidv4().replace(/-/g, '').slice(0, 10);
    const hashedClave = await bcrypt.hash(clave, 10);
    const tipo_usuario = "Estudiante";
    const estado = "Activa";
    const sexo = row[10];
    const nacionalidad = row[15];
    const talla = row[13];
    const fecha_nacimiento = convertirFecha(row[16]);
    const direccion = row[19].toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    const comuna = row[17].toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    const sector = row[18] ? row[18].toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : "";
    const codigo_temporal = "";
    
    // Insertar en Usuario
    const insertUsuario = db.prepare(`
        INSERT INTO Usuario (rut_usuario, rut_tipo, email, clave, nombres, apellidos, tipo_usuario, estado, edad, sexo, nacionalidad, talla, fecha_nacimiento, direccion, comuna, sector, codigo_temporal)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertUsuario.run(rut_usuario, rut_tipo, email, hashedClave, nombres, apellidos, tipo_usuario, estado, edad, sexo, nacionalidad, talla, fecha_nacimiento, direccion, comuna, sector, codigo_temporal);


    // Matricula
    const fecha_matricula = convertirFecha(row[0]);
    const estado_matricula = 1;
    const ultimo_establecimiento =  row[36] ? row[36].toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : "";
    const ultimo_nivel_cursado = row[37] ? row[37] : "";
    const incidencia_academica = row[38] ? row[38].toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : "";
    const flag_apoyo_especial = row[39] ? quitarTildes(row[39].toLowerCase().trim()) === "si" ? 1 : 0 : 0;
    const apoyo_especial = row[40] ? row[40].toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : "";
    const consentimiento_apoyo_especial = row[41] ? quitarTildes(row[41].toLowerCase().trim()) === "si" ? 1 : 0 : 0;
    const razon_consentimiento_apoyo_especial = row[42] ? row[42] : "";
    const cert_nacimiento = row[1] ? quitarTildes(row[1].toLowerCase().trim()) === "si" ? 1 : 0 : 0;
    const cert_carnet = row[2] ? quitarTildes(row[2].toLowerCase().trim()) === "si" ? 1 : 0 : 0;
    const cert_estudios = row[3] ? quitarTildes(row[3].toLowerCase().trim()) === "si" ? 1 : 0 : 0;
    const cert_rsh = row[4] ? quitarTildes(row[4].toLowerCase().trim()) === "si" ? 1 : 0 : 0;
    const cert_diagnostico = 0;
    const rezago_escolar = row[14] ? row[14].toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : "";
    const curso_ingreso = row[11];
    

    // Insertar en Matricula
    const insertMatricula = db.prepare(`
        INSERT INTO Matricula (id_matricula, rut_usuario, fecha_matricula, estado, ultimo_establecimiento, ultimo_nivel_cursado, incidencia_academica, flag_apoyo_especial, apoyo_especial, consentimiento_apoyo_especial, razon_consentimiento_apoyo_especial, cert_nacimiento, cert_carnet, cert_estudios, cert_rsh, cert_diagnostico, rezago_escolar)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertMatricula.run(uuidv4(), rut_usuario, fecha_matricula, estado_matricula, ultimo_establecimiento, ultimo_nivel_cursado, incidencia_academica, flag_apoyo_especial, apoyo_especial, consentimiento_apoyo_especial, razon_consentimiento_apoyo_especial, cert_nacimiento, cert_carnet, cert_estudios, cert_rsh, cert_diagnostico, rezago_escolar);

    // insertar en Curso
    const insertCurso = db.prepare(`
        INSERT INTO CursoAsignaturasLink (rut_usuario, id_curso, id_asignatura)
        VALUES (?, ?, ?)
    `);
    
    const curso = db.prepare(`
        SELECT 
          id_curso
        FROM Curso
        WHERE nombre_curso = ${curso_ingreso}
      `).all();

    insertCurso.run(rut_usuario, curso, null);

    // Info_apoderado
    const nombres_apoderado1 = row[43].toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    const apellidos_apoderado1 = "";
    const rut_original_apoderado1 = row[9] ? String(row[9]).toUpperCase() : '';
    const numeros_apoderado1 = rut_original_apoderado1.replace(/[^0-9K]/g, '');
    let rut_apoderado1;

    if (!rut_original_apoderado1 || !isNaN(Number(rut_original_apoderado1))) {
        const fullName = `${nombres_apoderado1}`;
        rut_apoderado1 = fullName
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, '');
    } else if (rut_original_apoderado1.includes('-') || rut_original_apoderado1.includes('.')) {
        rut_apoderado1 = numeros_apoderado1.slice(0, -1) + '-' + numeros_apoderado1.slice(-1);
    } else {
        const fullName = `${nombres_apoderado1}`;
        rut_apoderado1 = fullName
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, '');
    }
    const rut_tipo_apoderado1 = "";
    const nacionalidad_apoderado1 = row[45];
    const vinculo_apoderado1 = row[46].toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    const celular_apoderado1 = row[47];
    // const email_apoderado1 = row[51] ? row[51].toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : "";
    const email_apoderado1 = 
    row[51] === undefined || row[51] === null || String(row[51]).trim() === ""
        ? "" // Caso 1: undefined, null o cadena vacía
        : typeof row[51] === "string" && (row[51].includes('@') || row[51].includes('.'))
            ? row[51].toLowerCase() // Caso 2: Es un email (convertir a minúsculas)
            : String(row[51]);
    const nucleo_familiar = row[48];
    const nombres_apoderado2 = row[49] ? row[49].toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : "";
    const apellidos_apoderado2 = "";
    const celular_apoderado2 = row[50] ? row[50] : "";
    const comuna_apoderado1 = row[52] ? row[52].toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : "";
    const direccion_apoderado1 = row[53] ? row[53].toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : "";

    // Insertar en Info_apoderado
    const insertApoderado = db.prepare(`
        INSERT INTO Info_apoderado (id_apoderado, rut_usuario, rut_tipo_apoderado1, nombres_apoderado1, apellidos_apoderado1, rut_apoderado1, nacionalidad_apoderado1, vinculo_apoderado1, celular_apoderado1, email_apoderado1, nucleo_familiar, nombres_apoderado2, apellidos_apoderado2, celular_apoderado2, comuna_apoderado1, direccion_apoderado1)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertApoderado.run(uuidv4(), rut_usuario, rut_tipo_apoderado1, nombres_apoderado1, apellidos_apoderado1, rut_apoderado1, nacionalidad_apoderado1, vinculo_apoderado1, celular_apoderado1, email_apoderado1, nucleo_familiar, nombres_apoderado2, apellidos_apoderado2, celular_apoderado2, comuna_apoderado1, direccion_apoderado1);

    // Info_medica
    const flag_control_medico = row[20] ? quitarTildes(row[20].toLowerCase().trim()) === "si" ? 1 : 0 : 0;
    const flag_discapacidad = row[21] ? quitarTildes(row[21].toLowerCase().trim()) === "si" ? 1 : 0 : 0;
    const discapacidad = row[22] ? row[22].toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : "";
    const flag_necesidad_especial = row[23] ? quitarTildes(row[23].toLowerCase().trim()) === "si" ? 1 : 0 : 0;
    const necesidad_especial = row[24] ? row[24].toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : "";
    const flag_enfermedad = row[25] ? quitarTildes(row[25].toLowerCase().trim()) === "si" ? 1 : 0 : 0;
    const enfermedad = row[26] ? row[26].toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : "";
    const flag_medicamentos = row[27] ? quitarTildes(row[27].toLowerCase().trim()) === "si" ? 1 : 0 : 0;
    const medicamentos = row[28] ? row[28].toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : "";
    const flag_alergia = row[29] ? quitarTildes(row[29].toLowerCase().trim()) === "si" ? 1 : 0 : 0;
    const alergia = row[30] ? row[30].toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : "";
    const prevision_medica = row[31] ? row[31].toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : "";
    const servicio_emergencia = row[32] ? row[32].toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : "";

// Insertar en Info_medica
    const insertMedica = db.prepare(`
        INSERT INTO Info_medica (id_info_medica, rut_usuario, flag_control_medico, flag_discapacidad, discapacidad, flag_necesidad_especial, necesidad_especial, flag_enfermedad, enfermedad, flag_medicamentos, medicamentos, flag_alergia, alergia, prevision_medica, servicio_emergencia)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertMedica.run(uuidv4(), rut_usuario, flag_control_medico, flag_discapacidad, discapacidad, flag_necesidad_especial, necesidad_especial, flag_enfermedad, enfermedad, flag_medicamentos, medicamentos, flag_alergia, alergia, prevision_medica, servicio_emergencia);


    // Consentimiento
    const hitos = "dato de relleno";
    const asistencia = "dato de relleno";
    const seguro_beneficio = "dato de relleno";
    const reuniones = "dato de relleno";
    const apoyo_especial_consentimiento = "dato de relleno";
    const sedes = "dato de relleno";
    const multimedia = "dato de relleno";
    const cumplimiento_compromisos = "dato de relleno";
    const terminos_condiciones = "dato de relleno";

   // Insertar en Consentimiento
    const insertConsentimiento = db.prepare(`
        INSERT INTO Consentimiento (id_consentimiento, rut_usuario, hitos, asistencia, seguro_beneficio, reuniones, apoyo_especial, sedes, multimedia, cumplimiento_compromisos, terminos_condiciones)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertConsentimiento.run(uuidv4(), rut_usuario, hitos, asistencia, seguro_beneficio, reuniones, apoyo_especial_consentimiento, sedes, multimedia, cumplimiento_compromisos, terminos_condiciones);


    // Contacto_emergencia
    const nombres_contacto = row[33] ? row[33].toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : "";
    const apellidos_contacto = "";
    const celular_contacto = row[34] ? row[34] : "";
    const vinculo_contacto = row[35] ? row[35].toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : "";
 
    // Insertar en Contacto_emergencia
    const insertEmergencia = db.prepare(`
        INSERT INTO Contacto_emergencia (id_contacto_emergencia, rut_usuario, nombres, apellidos, celular, vinculo)
        VALUES (?, ?, ?, ?, ?, ?)
    `);
    insertEmergencia.run(uuidv4(), rut_usuario, nombres_contacto, apellidos_contacto, celular_contacto, vinculo_contacto);
}

console.log("Población de base de datos completada.");
