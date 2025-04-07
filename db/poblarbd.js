import xlsx from "xlsx";
import { Connection, Request, TYPES } from "tedious";
import { randomUUID } from "crypto";
import bcrypt from "bcrypt";

// Configuración de conexión a SQL Server
const config = {
  server: process.env.BD_HOST || "SRV-BDAPP.elquisco.cl",
  authentication: {
    type: "default",
    options: {
      userName: process.env.BD_USER || "5ab3res_w3b_app",
      password: process.env.BD_PASSWORD || "sab3re5_e1_-4948-ad76_Qu1sc0_w3b",
    },
  },
  options: {
    database: process.env.BD_NAME || "Saberes",
    encrypt: true,
    trustServerCertificate: true,
    cryptoCredentialsDetails: {
      minVersion: "TLSv1.2",
    },
  },
};

// Cargar el archivo Excel y seleccionar la hoja correspondiente
// const workbook = xlsx.readFile(
//   "C:/Users/cazocar/Documents/proyectos/saberes_venv/saberes/db/MATRICULAS2025.xlsx"
// );
const workbook = xlsx.readFile(
  "C:/Users/cazocar/Documents/proyectos/saberes_venv/saberes/db/MATRICULAS.xlsx"
);
const sheetName = workbook.SheetNames[12];
const worksheet = workbook.Sheets[sheetName];
const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

// Cargar la hoja de estudiantes retirados (hoja 11)
const retiradosSheetName = workbook.SheetNames[11];
const retiradosWorksheet = workbook.Sheets[retiradosSheetName];
const retiradosData = xlsx.utils.sheet_to_json(retiradosWorksheet, {
  header: 1,
});

// Crear un conjunto de RUTs de estudiantes retirados
const rutsRetirados = new Set();
for (let i = 1; i < retiradosData.length; i++) {
  const row = retiradosData[i];
  if (row && row[10]) {
    // Columna 10 (índice 9) contiene el RUT
    const rutOriginal = String(row[10]).toUpperCase();
    const numeros = rutOriginal.replace(/[^0-9K]/g, "");
    if (numeros.length > 1) {
      const rutFormateado = numeros.slice(0, -1) + "-" + numeros.slice(-1);
      rutsRetirados.add(rutFormateado);
    }
  }
}
console.log(
  `Se encontraron ${rutsRetirados.size} estudiantes retirados en la hoja 11`
);

// Función para conectarse a SQL Server
function connectDB() {
  return new Promise((resolve, reject) => {
    const connection = new Connection(config);
    connection.on("connect", (err) => {
      if (err) {
        console.error("Error al conectar a la base de datos:", err);
        return reject(err);
      }
      resolve(connection);
    });
    connection.connect();
  });
}

// Función para ejecutar una consulta parametrizada
function execQuery(connection, query, parameters = []) {
  return new Promise((resolve, reject) => {
    const request = new Request(query, (err, rowCount) => {
      if (err) return reject(err);
      resolve(rowCount);
    });
    parameters.forEach((param) => {
      request.addParameter(param.name, param.type, param.value);
    });
    connection.execSql(request);
  });
}

// Función para ejecutar una consulta que retorna una única fila
function querySingle(connection, query, parameters = []) {
  return new Promise((resolve, reject) => {
    let result = null;
    const request = new Request(query, (err) => {
      if (err) return reject(err);
      resolve(result);
    });
    parameters.forEach((param) => {
      request.addParameter(param.name, param.type, param.value);
    });
    request.on("row", (columns) => {
      const rowObj = {};
      columns.forEach((column) => {
        rowObj[column.metadata.colName] = column.value;
      });
      result = rowObj;
    });
    connection.execSql(request);
  });
}

// Funciones de utilidad
function quitarTildes(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function convertirFecha(numeroSerie) {
  const fechaBase = new Date(1899, 11, 30); // Fecha base de Excel
  const milisegundosPorDia = 24 * 60 * 60 * 1000;
  const fecha = new Date(
    fechaBase.getTime() + numeroSerie * milisegundosPorDia
  );
  const dia = String(fecha.getDate()).padStart(2, "0");
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const anio = fecha.getFullYear();
  return `${dia}-${mes}-${anio}`;
}

function formatField(text) {
  return text
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

async function run() {
  const connection = await connectDB();
  console.log("Conexión a la base de datos establecida.");

  try {
    // (Opcional) Limpiar las tablas si ya existen datos para evitar duplicados.
    const checkTableQuery = `SELECT COUNT(*) as count FROM Usuario`;
    const countResult = await querySingle(connection, checkTableQuery);
    if (countResult && countResult.count > 0) {
      console.log(
        `La tabla Usuario contiene ${countResult.count} registros. Limpiando tablas...`
      );
      // Eliminar en orden (las tablas secundarias primero)
      await execQuery(connection, `DELETE FROM Contacto_emergencia`);
      await execQuery(connection, `DELETE FROM Consentimiento`);
      await execQuery(connection, `DELETE FROM Info_medica`);
      await execQuery(connection, `DELETE FROM Info_apoderado`);
      await execQuery(connection, `DELETE FROM CursosAsignaturasLink`);
      await execQuery(connection, `DELETE FROM Matricula`);
      await execQuery(
        connection,
        `DELETE FROM Usuario WHERE tipo_usuario = 'Estudiante'`
      );
      console.log("Tablas limpiadas correctamente.");
    }

    // Recorremos las filas desde la 2 hasta la 205 o hasta el final de los datos
    for (let i = 1; i < 206 && i < data.length; i++) {
      const row = data[i];

      console.log(`Procesando fila ${i}...`);

      // Generar id_user para la tabla Usuario (clave primaria)
      const id_user = randomUUID();

      // Procesar nombres y apellidos
      const nombres = formatField(row[6]);
      const apellidos = formatField(row[7]) + " " + formatField(row[8]);

      // Procesar el campo RUT (ahora secundario)
      let rut = "";
      const rut_original = row[9] ? String(row[9]).toUpperCase() : "";
      const numeros = rut_original.replace(/[^0-9K]/g, "");
      if (
        rut_original &&
        (rut_original.includes("-") || rut_original.includes("."))
      ) {
        rut = numeros.slice(0, -1) + "-" + numeros.slice(-1);
      } else {
        // Si no hay RUT, se asigna la concatenación de nombres y apellidos en minúscula sin espacios
        rut = (nombres + apellidos).toLowerCase().replace(/\s+/g, "");
      }

      // Verificar si el RUT ya existe en la base de datos
      if (rut.includes("-")) {
        const checkRutQuery = `SELECT COUNT(*) as count FROM Usuario WHERE rut_usuario = @rut`;
        const rutExists = await querySingle(connection, checkRutQuery, [
          { name: "rut", type: TYPES.NVarChar, value: rut },
        ]);

        if (rutExists && rutExists.count > 0) {
          console.log(
            `El RUT ${rut} ya existe en la base de datos, saltando...`
          );
          continue;
        }
      }

      const rut_tipo = "";
      const email =
        row[51] === undefined ||
        row[51] === null ||
        String(row[51]).trim() === ""
          ? ""
          : typeof row[51] === "string" &&
            (row[51].includes("@") || row[51].includes("."))
          ? row[51].toLowerCase()
          : String(row[51]);
      const clave = randomUUID().replace(/-/g, "").slice(0, 10);
      const hashedClave = await bcrypt.hash(clave, 10);
      const tipo_usuario = "Estudiante";
      const estado = rutsRetirados.has(rut) ? "Inactiva" : "Activa";
      const sexo = row[10] || "";
      const nacionalidad = row[15] || "";
      const talla = row[13] ? String(row[13]) : "";
      const fecha_nacimiento = convertirFecha(row[16]);
      const direccion = row[19] ? formatField(row[19]) : "";
      const comuna = row[17] ? formatField(row[17]) : "";
      const sector = row[18] ? formatField(row[18]) : "";
      const codigo_temporal = "";

      // Inserción en la tabla Usuario (usando id_user como PK y rut como campo secundario)
      const insertUsuarioQuery = `
        INSERT INTO Usuario 
        (id_user, rut_usuario, rut_tipo, email, clave, nombres, apellidos, tipo_usuario, estado, sexo, nacionalidad, talla, fecha_nacimiento, direccion, comuna, sector, codigo_temporal)
        VALUES (@id_user, @rut_usuario, @rut_tipo, @email, @clave, @nombres, @apellidos, @tipo_usuario, @estado, @sexo, @nacionalidad, @talla, @fecha_nacimiento, @direccion, @comuna, @sector, @codigo_temporal)
      `;
      try {
        await execQuery(connection, insertUsuarioQuery, [
          { name: "id_user", type: TYPES.NVarChar, value: id_user },
          { name: "rut_usuario", type: TYPES.NVarChar, value: rut },
          { name: "rut_tipo", type: TYPES.NVarChar, value: rut_tipo },
          { name: "email", type: TYPES.NVarChar, value: email },
          { name: "clave", type: TYPES.NVarChar, value: hashedClave },
          { name: "nombres", type: TYPES.NVarChar, value: nombres },
          { name: "apellidos", type: TYPES.NVarChar, value: apellidos },
          { name: "tipo_usuario", type: TYPES.NVarChar, value: tipo_usuario },
          { name: "estado", type: TYPES.NVarChar, value: estado },
          { name: "sexo", type: TYPES.NVarChar, value: sexo },
          { name: "nacionalidad", type: TYPES.NVarChar, value: nacionalidad },
          { name: "talla", type: TYPES.NVarChar, value: talla },
          {
            name: "fecha_nacimiento",
            type: TYPES.NVarChar,
            value: fecha_nacimiento,
          },
          { name: "direccion", type: TYPES.NVarChar, value: direccion },
          { name: "comuna", type: TYPES.NVarChar, value: comuna },
          { name: "sector", type: TYPES.NVarChar, value: sector },
          {
            name: "codigo_temporal",
            type: TYPES.NVarChar,
            value: codigo_temporal,
          },
        ]);
        console.log(`Inserción en Usuario exitosa para fila ${i}`);
      } catch (error) {
        console.error(`Error al insertar en Usuario para fila ${i}:`, error);
        continue;
      }

      // ------------------------------
      // 2. Inserción en la tabla Matricula
      // ------------------------------
      const fecha_matricula = convertirFecha(row[0]);
      const estado_matricula = 1;
      const ultimo_establecimiento = row[36] ? formatField(row[36]) : "";
      const ultimo_nivel_cursado = row[37] ? row[37] : "";
      const incidencia_academica = row[38] ? formatField(row[38]) : "";
      const flag_apoyo_especial = row[39]
        ? quitarTildes(row[39].toLowerCase().trim()) === "si"
          ? 1
          : 0
        : 0;
      const apoyo_especial = row[40] ? formatField(row[40]) : "";
      const consentimiento_apoyo_especial = row[41]
        ? quitarTildes(row[41].toLowerCase().trim()) === "si"
          ? 1
          : 0
        : 0;
      const razon_consentimiento_apoyo_especial = row[42] ? row[42] : "";
      const cert_nacimiento = row[1]
        ? quitarTildes(row[1].toLowerCase().trim()) === "si"
          ? 1
          : 0
        : 0;
      const cert_carnet = row[2]
        ? quitarTildes(row[2].toLowerCase().trim()) === "si"
          ? 1
          : 0
        : 0;
      const cert_estudios = row[3]
        ? quitarTildes(row[3].toLowerCase().trim()) === "si"
          ? 1
          : 0
        : 0;
      const cert_rsh = row[4]
        ? quitarTildes(row[4].toLowerCase().trim()) === "si"
          ? 1
          : 0
        : 0;
      const cert_diagnostico = 0;
      const rezago_escolar = row[14] ? formatField(row[14]) : "";

      const insertMatriculaQuery = `
        INSERT INTO Matricula 
        (id_matricula, id_user, fecha_matricula, estado, ultimo_establecimiento, ultimo_nivel_cursado, incidencia_academica, flag_apoyo_especial, apoyo_especial, consentimiento_apoyo_especial, razon_consentimiento_apoyo_especial, cert_nacimiento, cert_carnet, cert_estudios, cert_rsh, cert_diagnostico, rezago_escolar)
        VALUES (@id_matricula, @id_user, @fecha_matricula, @estado, @ultimo_establecimiento, @ultimo_nivel_cursado, @incidencia_academica, @flag_apoyo_especial, @apoyo_especial, @consentimiento_apoyo_especial, @razon_consentimiento_apoyo_especial, @cert_nacimiento, @cert_carnet, @cert_estudios, @cert_rsh, @cert_diagnostico, @rezago_escolar)
      `;
      try {
        await execQuery(connection, insertMatriculaQuery, [
          { name: "id_matricula", type: TYPES.NVarChar, value: randomUUID() },
          { name: "id_user", type: TYPES.NVarChar, value: id_user },
          {
            name: "fecha_matricula",
            type: TYPES.NVarChar,
            value: fecha_matricula,
          },
          { name: "estado", type: TYPES.Int, value: estado_matricula },
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
            value: flag_apoyo_especial,
          },
          {
            name: "apoyo_especial",
            type: TYPES.NVarChar,
            value: apoyo_especial,
          },
          {
            name: "consentimiento_apoyo_especial",
            type: TYPES.Int,
            value: consentimiento_apoyo_especial,
          },
          {
            name: "razon_consentimiento_apoyo_especial",
            type: TYPES.NVarChar,
            value: razon_consentimiento_apoyo_especial,
          },
          { name: "cert_nacimiento", type: TYPES.Int, value: cert_nacimiento },
          { name: "cert_carnet", type: TYPES.Int, value: cert_carnet },
          { name: "cert_estudios", type: TYPES.Int, value: cert_estudios },
          { name: "cert_rsh", type: TYPES.Int, value: cert_rsh },
          {
            name: "cert_diagnostico",
            type: TYPES.Int,
            value: cert_diagnostico,
          },
          {
            name: "rezago_escolar",
            type: TYPES.NVarChar,
            value: rezago_escolar,
          },
        ]);
        console.log(`Inserción en Matricula exitosa para fila ${i}`);
      } catch (error) {
        console.error(`Error al insertar en Matricula para fila ${i}:`, error);
      }

      // ------------------------------
      // 3. Inserción en la tabla CursosAsignaturasLink
      // ------------------------------
      // Se asume que en row[11] viene el nombre del curso de ingreso
      const curso_ingreso = row[11];
      console.log(`Buscando curso: "${curso_ingreso}"`);
      const selectCursoQuery = `
        SELECT id_curso FROM Curso WHERE LOWER(nombre_curso) = LOWER(@curso_ingreso)
      `;
      const cursoRow = await querySingle(connection, selectCursoQuery, [
        { name: "curso_ingreso", type: TYPES.NVarChar, value: curso_ingreso },
      ]);
      console.log(`Resultado de búsqueda de curso:`, cursoRow);
      let id_curso = null;
      if (cursoRow && cursoRow.id_curso) {
        id_curso =
          typeof cursoRow.id_curso === "string"
            ? parseInt(cursoRow.id_curso, 10)
            : cursoRow.id_curso;
      }
      if (id_curso !== null) {
        const insertCursoLinkQuery = `
          INSERT INTO CursosAsignaturasLink (id_cursosasignaturaslink, id_user, id_curso)
          VALUES (@id_cursosasignaturaslink, @id_user, @id_curso)
        `;
        try {
          await execQuery(connection, insertCursoLinkQuery, [
            {
              name: "id_cursosasignaturaslink",
              type: TYPES.NVarChar,
              value: randomUUID(),
            },
            { name: "id_user", type: TYPES.NVarChar, value: id_user },
            { name: "id_curso", type: TYPES.Int, value: parseInt(id_curso) },
          ]);
          console.log(`Inserción en CursosAsignaturasLink exitosa`);
        } catch (error) {
          console.error(`Error al insertar en CursosAsignaturasLink:`, error);
        }
      } else {
        console.log(
          `No se encontró curso para: "${curso_ingreso}", saltando inserción en CursosAsignaturasLink`
        );
      }

      // ------------------------------
      // 4. Inserción en la tabla Info_apoderado
      // ------------------------------
      const nombres_apoderado1 = row[43] ? formatField(row[43]) : "";
      const apellidos_apoderado1 = ""; // no se dispone de datos
      let rut_apoderado1 = "";
      const rut_original_apoderado1 = row[9]
        ? String(row[9]).toUpperCase()
        : "";
      const numeros_apoderado1 = rut_original_apoderado1.replace(
        /[^0-9K]/g,
        ""
      );
      if (
        rut_original_apoderado1 &&
        (rut_original_apoderado1.includes("-") ||
          rut_original_apoderado1.includes("."))
      ) {
        rut_apoderado1 =
          numeros_apoderado1.slice(0, -1) + "-" + numeros_apoderado1.slice(-1);
      } else {
        rut_apoderado1 = nombres_apoderado1.toLowerCase().replace(/\s+/g, "");
      }
      const rut_tipo_apoderado1 = "";
      const nacionalidad_apoderado1 = row[45] || "";
      const vinculo_apoderado1 = row[46] ? formatField(row[46]) : "";
      // Se asigna 0 en caso de no tener valor
      const celular_apoderado1 =
        row[47] && row[47].toString().trim() !== "" && !isNaN(Number(row[47]))
          ? Number(row[47])
          : 0;
      const email_apoderado1 =
        row[51] === undefined ||
        row[51] === null ||
        String(row[51]).trim() === ""
          ? ""
          : typeof row[51] === "string" &&
            (row[51].includes("@") || row[51].includes("."))
          ? row[51].toLowerCase()
          : String(row[51]);
      const nucleo_familiar =
        row[48] && row[48].toString().trim() !== "" && !isNaN(Number(row[48]))
          ? Number(row[48])
          : 0;
      const nombres_apoderado2 = row[49] ? formatField(row[49]) : "";
      const apellidos_apoderado2 = "";
      const celular_apoderado2 =
        row[50] && row[50].toString().trim() !== "" && !isNaN(Number(row[50]))
          ? Number(row[50])
          : 0;
      const comuna_apoderado1 = row[52] ? formatField(row[52]) : "";
      const direccion_apoderado1 = row[53] ? formatField(row[53]) : "";

      const insertApoderadoQuery = `
        INSERT INTO Info_apoderado 
        (id_apoderado, id_user, rut_tipo_apoderado1, nombres_apoderado1, apellidos_apoderado1, rut_apoderado1, nacionalidad_apoderado1, vinculo_apoderado1, celular_apoderado1, email_apoderado1, nucleo_familiar, nombres_apoderado2, apellidos_apoderado2, celular_apoderado2, comuna_apoderado1, direccion_apoderado1)
        VALUES (@id_apoderado, @id_user, @rut_tipo_apoderado1, @nombres_apoderado1, @apellidos_apoderado1, @rut_apoderado1, @nacionalidad_apoderado1, @vinculo_apoderado1, @celular_apoderado1, @email_apoderado1, @nucleo_familiar, @nombres_apoderado2, @apellidos_apoderado2, @celular_apoderado2, @comuna_apoderado1, @direccion_apoderado1)
      `;
      try {
        await execQuery(connection, insertApoderadoQuery, [
          { name: "id_apoderado", type: TYPES.NVarChar, value: randomUUID() },
          { name: "id_user", type: TYPES.NVarChar, value: id_user },
          {
            name: "rut_tipo_apoderado1",
            type: TYPES.NVarChar,
            value: rut_tipo_apoderado1,
          },
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
            type: TYPES.BigInt,
            value: celular_apoderado1,
          },
          {
            name: "email_apoderado1",
            type: TYPES.NVarChar,
            value: email_apoderado1,
          },
          {
            name: "nucleo_familiar",
            type: TYPES.BigInt,
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
            type: TYPES.BigInt,
            value: celular_apoderado2,
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
        ]);
        console.log(`Inserción en Info_apoderado exitosa`);
      } catch (error) {
        console.error(`Error al insertar en Info_apoderado:`, error);
      }

      // ------------------------------
      // 5. Inserción en la tabla Info_medica
      // ------------------------------
      const flag_control_medico = row[20]
        ? quitarTildes(row[20].toLowerCase().trim()) === "si"
          ? 1
          : 0
        : 0;
      const flag_discapacidad = row[21]
        ? quitarTildes(row[21].toLowerCase().trim()) === "si"
          ? 1
          : 0
        : 0;
      const discapacidad = row[22] ? formatField(row[22]) : "";
      const flag_necesidad_especial = row[23]
        ? quitarTildes(row[23].toLowerCase().trim()) === "si"
          ? 1
          : 0
        : 0;
      const necesidad_especial = row[24] ? formatField(row[24]) : "";
      const flag_enfermedad = row[25]
        ? quitarTildes(row[25].toLowerCase().trim()) === "si"
          ? 1
          : 0
        : 0;
      const enfermedad = row[26] ? formatField(row[26]) : "";
      const flag_medicamentos = row[27]
        ? quitarTildes(row[27].toLowerCase().trim()) === "si"
          ? 1
          : 0
        : 0;
      const medicamentos = row[28] ? formatField(row[28]) : "";
      const flag_alergia = row[29]
        ? quitarTildes(row[29].toLowerCase().trim()) === "si"
          ? 1
          : 0
        : 0;
      const alergia = row[30] ? formatField(row[30]) : "";
      const prevision_medica = row[31] ? formatField(row[31]) : "";
      const servicio_emergencia = row[32] ? formatField(row[32]) : "";

      const insertMedicaQuery = `
        INSERT INTO Info_medica 
        (id_info_medica, id_user, flag_control_medico, flag_discapacidad, discapacidad, flag_necesidad_especial, necesidad_especial, flag_enfermedad, enfermedad, flag_medicamentos, medicamentos, flag_alergia, alergia, prevision_medica, servicio_emergencia)
        VALUES (@id_info_medica, @id_user, @flag_control_medico, @flag_discapacidad, @discapacidad, @flag_necesidad_especial, @necesidad_especial, @flag_enfermedad, @enfermedad, @flag_medicamentos, @medicamentos, @flag_alergia, @alergia, @prevision_medica, @servicio_emergencia)
      `;
      try {
        await execQuery(connection, insertMedicaQuery, [
          { name: "id_info_medica", type: TYPES.NVarChar, value: randomUUID() },
          { name: "id_user", type: TYPES.NVarChar, value: id_user },
          {
            name: "flag_control_medico",
            type: TYPES.Int,
            value: flag_control_medico,
          },
          {
            name: "flag_discapacidad",
            type: TYPES.Int,
            value: flag_discapacidad,
          },
          { name: "discapacidad", type: TYPES.NVarChar, value: discapacidad },
          {
            name: "flag_necesidad_especial",
            type: TYPES.Int,
            value: flag_necesidad_especial,
          },
          {
            name: "necesidad_especial",
            type: TYPES.NVarChar,
            value: necesidad_especial,
          },
          { name: "flag_enfermedad", type: TYPES.Int, value: flag_enfermedad },
          { name: "enfermedad", type: TYPES.NVarChar, value: enfermedad },
          {
            name: "flag_medicamentos",
            type: TYPES.Int,
            value: flag_medicamentos,
          },
          { name: "medicamentos", type: TYPES.NVarChar, value: medicamentos },
          { name: "flag_alergia", type: TYPES.Int, value: flag_alergia },
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
        ]);
        console.log(`Inserción en Info_medica exitosa`);
      } catch (error) {
        console.error(`Error al insertar en Info_medica:`, error);
      }

      // ------------------------------
      // 6. Inserción en la tabla Consentimiento
      // ------------------------------
      const hitos = "1";
      const asistencia = "1";
      const seguro_beneficio = "1";
      const reuniones = "1";
      const apoyo_especial_consentimiento = "1";
      const sedes = "1";
      const multimedia = "1";
      const cumplimiento_compromisos = "1";
      const terminos_condiciones = "1";

      const insertConsentimientoQuery = `
        INSERT INTO Consentimiento 
        (id_consentimiento, id_user, hitos, asistencia, seguro_beneficio, reuniones, apoyo_especial, sedes, multimedia, cumplimiento_compromisos, terminos_condiciones)
        VALUES (@id_consentimiento, @id_user, @hitos, @asistencia, @seguro_beneficio, @reuniones, @apoyo_especial, @sedes, @multimedia, @cumplimiento_compromisos, @terminos_condiciones)
      `;
      try {
        await execQuery(connection, insertConsentimientoQuery, [
          {
            name: "id_consentimiento",
            type: TYPES.NVarChar,
            value: randomUUID(),
          },
          { name: "id_user", type: TYPES.NVarChar, value: id_user },
          { name: "hitos", type: TYPES.NVarChar, value: hitos },
          { name: "asistencia", type: TYPES.NVarChar, value: asistencia },
          {
            name: "seguro_beneficio",
            type: TYPES.NVarChar,
            value: seguro_beneficio,
          },
          { name: "reuniones", type: TYPES.NVarChar, value: reuniones },
          {
            name: "apoyo_especial",
            type: TYPES.NVarChar,
            value: apoyo_especial_consentimiento,
          },
          { name: "sedes", type: TYPES.NVarChar, value: sedes },
          { name: "multimedia", type: TYPES.NVarChar, value: multimedia },
          {
            name: "cumplimiento_compromisos",
            type: TYPES.NVarChar,
            value: cumplimiento_compromisos,
          },
          {
            name: "terminos_condiciones",
            type: TYPES.NVarChar,
            value: terminos_condiciones,
          },
        ]);
        console.log(`Inserción en Consentimiento exitosa`);
      } catch (error) {
        console.error(`Error al insertar en Consentimiento:`, error);
      }

      // ------------------------------
      // 7. Inserción en la tabla Contacto_emergencia
      // ------------------------------
      const nombres_contacto = row[33] ? formatField(row[33]) : "";
      const apellidos_contacto = ""; // No se dispone de datos
      const celular_contacto =
        row[34] && row[34].toString().trim() !== "" && !isNaN(Number(row[34]))
          ? Number(row[34])
          : 0;
      const vinculo_contacto = row[35] ? formatField(row[35]) : "";

      const insertEmergenciaQuery = `
        INSERT INTO Contacto_emergencia 
        (id_contacto_emergencia, id_user, nombres, apellidos, celular, vinculo)
        VALUES (@id_contacto_emergencia, @id_user, @nombres, @apellidos, @celular, @vinculo)
      `;
      try {
        await execQuery(connection, insertEmergenciaQuery, [
          {
            name: "id_contacto_emergencia",
            type: TYPES.NVarChar,
            value: randomUUID(),
          },
          { name: "id_user", type: TYPES.NVarChar, value: id_user },
          { name: "nombres", type: TYPES.NVarChar, value: nombres_contacto },
          {
            name: "apellidos",
            type: TYPES.NVarChar,
            value: apellidos_contacto,
          },
          { name: "celular", type: TYPES.BigInt, value: celular_contacto },
          { name: "vinculo", type: TYPES.NVarChar, value: vinculo_contacto },
        ]);
        console.log(`Inserción en Contacto_emergencia exitosa`);
      } catch (error) {
        console.error(`Error al insertar en Contacto_emergencia:`, error);
      }
    }
    console.log("Población de la base de datos completada.");
  } catch (error) {
    console.error("Error durante la población de la base de datos:", error);
  } finally {
    if (connection) {
      connection.close();
    }
  }
}

run().then(() => {
  console.log("Script execution completed");
});
