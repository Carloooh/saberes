// import Database from 'better-sqlite3';
// const db = new Database('db/database.sqlite', { verbose: console.log });

// function dropAllTables() {
//     const tables = db.prepare(`
//         SELECT name FROM sqlite_master 
//         WHERE type = 'table' AND name NOT LIKE 'sqlite_%'
//     `).all();

//     // Eliminar cada tabla
//     tables.forEach(table => {
//         db.prepare(`DROP TABLE IF EXISTS ${table.name}`).run();
//         console.log(`Tabla eliminada: ${table.name}`);
//     });
// }

// dropAllTables();

// db.exec(`
//     CREATE TABLE IF NOT EXISTS Actividad (
//         id_actividad TEXT NOT NULL PRIMARY KEY,
//         titulo TEXT NOT NULL,
//         descripcion TEXT NOT NULL,
//         fecha TEXT NOT NULL
//     );

//     CREATE TABLE IF NOT EXISTS Actividad_archivo (
//         id_archivo TEXT NOT NULL,
//         id_actividad TEXT NOT NULL,
//         titulo TEXT NOT NULL,
//         archivo BLOB NOT NULL,
//         extension TEXT NOT NULL,
//         PRIMARY KEY (id_archivo, id_actividad),
//         FOREIGN KEY (id_actividad) REFERENCES Actividad(id_actividad)
//     );

//     CREATE TABLE IF NOT EXISTS Asignatura (
//         id_asignatura TEXT NOT NULL PRIMARY KEY,
//         nombre_asignatura TEXT NOT NULL
//     );

//     CREATE TABLE IF NOT EXISTS Asignaturas (
//         id_asignatura TEXT NOT NULL,
//         id_curso TEXT NOT NULL,
//         rut_usuario TEXT NOT NULL,
//         PRIMARY KEY (id_asignatura, id_curso, rut_usuario),
//         FOREIGN KEY (id_asignatura) REFERENCES Asignatura(id_asignatura),
//         FOREIGN KEY (id_curso, rut_usuario) REFERENCES Curso(id_curso, rut_usuario)
//     );

//     CREATE TABLE IF NOT EXISTS AsignaturasLink (
//         rut_usuario TEXT NOT NULL PRIMARY KEY,
//         id_asignatura TEXT NOT NULL,
//         FOREIGN KEY (rut_usuario) REFERENCES Usuario(rut_usuario)
//     );

//     CREATE TABLE IF NOT EXISTS Asistencia (
//         id_asistencia TEXT NOT NULL,
//         id_curso TEXT NOT NULL,
//         rut_usuario TEXT NOT NULL,
//         fecha TEXT NOT NULL,
//         asistencia INTEGER NOT NULL,
//         PRIMARY KEY (id_asistencia, id_curso, rut_usuario),
//         FOREIGN KEY (id_curso, rut_usuario) REFERENCES Curso(id_curso, rut_usuario)
//     );

//     CREATE TABLE IF NOT EXISTS Calificaciones (
//         id_calificaciones TEXT NOT NULL,
//         id_evaluacion TEXT NOT NULL,
//         id_asignatura TEXT NOT NULL,
//         nota REAL NOT NULL,
//         PRIMARY KEY (id_calificaciones, id_evaluacion, id_asignatura),
//         FOREIGN KEY (id_evaluacion, id_asignatura) REFERENCES Evaluaciones(id_evaluacion, id_asignatura)
//     );

//     CREATE TABLE IF NOT EXISTS Consentimiento (
//         id_consentimiento TEXT NOT NULL,
//         rut_usuario TEXT NOT NULL,
//         hitos INTEGER NOT NULL,
//         asistencia INTEGER NOT NULL,
//         seguro_beneficio INTEGER NOT NULL,
//         reuniones INTEGER NOT NULL,
//         apoyo_especial INTEGER NOT NULL,
//         sedes INTEGER NOT NULL,
//         multimedia INTEGER NOT NULL,
//         cumplimiento_compromisos INTEGER NOT NULL,
//         terminos_condiciones INTEGER NOT NULL,
//         PRIMARY KEY (id_consentimiento, rut_usuario),
//         FOREIGN KEY (rut_usuario) REFERENCES Usuario(rut_usuario)
//     );

//     CREATE TABLE IF NOT EXISTS Contacto_emergencia (
//         id_contacto_emergencia TEXT NOT NULL,
//         rut_usuario TEXT NOT NULL,
//         nombres TEXT NOT NULL,
//         apellidos TEXT NOT NULL,
//         celular NUMERIC NOT NULL,
//         vinculo TEXT NOT NULL,
//         PRIMARY KEY (id_contacto_emergencia, rut_usuario),
//         FOREIGN KEY (rut_usuario) REFERENCES Usuario(rut_usuario)
//     );

//     CREATE TABLE IF NOT EXISTS Curso (
//         id_curso TEXT NOT NULL,
//         nombre_curso TEXT NOT NULL,
//         PRIMARY KEY (id_curso),
//     );

//     CREATE TABLE IF NOT EXISTS CursosLink (
//         rut_usuario TEXT NOT NULL PRIMARY KEY,
//         id_curso TEXT NOT NULL,
//         FOREIGN KEY (rut_usuario) REFERENCES Usuario(rut_usuario)
//     );

//     CREATE TABLE IF NOT EXISTS Evaluaciones (
//         id_evaluacion TEXT NOT NULL,
//         id_asignatura TEXT NOT NULL,
//         fecha TEXT NOT NULL,
//         titulo TEXT NOT NULL,
//         PRIMARY KEY (id_evaluacion, id_asignatura),
//         FOREIGN KEY (id_asignatura) REFERENCES Asignatura(id_asignatura)
//     );

//     CREATE TABLE IF NOT EXISTS Galeria (
//         id_archivo TEXT NOT NULL PRIMARY KEY,
//         titulo TEXT NOT NULL,
//         archivo BLOB NOT NULL,
//         extension TEXT NOT NULL
//     );

//     CREATE TABLE IF NOT EXISTS Info_apoderado (
//         id_apoderado TEXT NOT NULL,
//         rut_usuario TEXT NOT NULL,
//         nombres_apoderado1 TEXT NOT NULL,
//         apellidos_apoderado1 TEXT NOT NULL,
//         rut_apoderado1 TEXT NOT NULL,
//         rut_tipo_apoderado1 TEXT NOT NULL,
//         nacionalidad_apoderado1 TEXT NOT NULL,
//         vinculo_apoderado1 TEXT NOT NULL,
//         celular_apoderado1 NUMERIC NOT NULL,
//         email_apoderado1 TEXT NOT NULL,
//         nucleo_familiar NUMERIC NOT NULL,
//         nombres_apoderado2 TEXT,
//         apellidos_apoderado2 TEXT,
//         celular_apoderado2 NUMERIC NOT NULL,
//         comuna_apoderado1 TEXT NOT NULL,
//         direccion_apoderado1 TEXT NOT NULL,
//         PRIMARY KEY (id_apoderado, rut_usuario),
//         FOREIGN KEY (rut_usuario) REFERENCES Usuario(rut_usuario)
//     );

//     CREATE TABLE IF NOT EXISTS Info_medica (
//         id_info_medica TEXT NOT NULL,
//         rut_usuario TEXT NOT NULL,
//         flag_control_medico INTEGER NOT NULL,
//         flag_discapacidad INTEGER NOT NULL,
//         discapacidad TEXT,
//         flag_necesidad_especial INTEGER NOT NULL,
//         necesidad_especial TEXT,
//         flag_enfermedad INTEGER NOT NULL,
//         enfermedad TEXT,
//         flag_medicamentos INTEGER NOT NULL,
//         medicamentos TEXT,
//         flag_alergia INTEGER NOT NULL,
//         alergia TEXT,
//         prevision_medica TEXT NOT NULL,
//         servicio_emergencia TEXT NOT NULL,
//         PRIMARY KEY (id_info_medica, rut_usuario),
//         FOREIGN KEY (rut_usuario) REFERENCES Usuario(rut_usuario)
//     );

//     CREATE TABLE IF NOT EXISTS Informacion_institucional (
//         id_informacion TEXT NOT NULL PRIMARY KEY,
//         tipo TEXT NOT NULL,
//         titulo TEXT NOT NULL,
//         contenido TEXT NOT NULL
//     );

//     CREATE TABLE IF NOT EXISTS Material_archivo (
//         id_material_archivo TEXT NOT NULL,
//         id_material TEXT NOT NULL,
//         id_asignatura TEXT NOT NULL,
//         titulo TEXT NOT NULL,
//         archivo BLOB NOT NULL,
//         extension TEXT NOT NULL,
//         PRIMARY KEY (id_material_archivo, id_material, id_asignatura),
//         FOREIGN KEY (id_material, id_asignatura) REFERENCES Material_educativo(id_material, id_asignatura)
//     );

//     CREATE TABLE IF NOT EXISTS Material_educativo (
//         id_material TEXT NOT NULL,
//         id_asignatura TEXT NOT NULL,
//         titulo TEXT NOT NULL,
//         descripcion TEXT NOT NULL,
//         enlace TEXT,
//         PRIMARY KEY (id_material, id_asignatura),
//         FOREIGN KEY (id_asignatura) REFERENCES Asignatura(id_asignatura)
//     );

//     CREATE TABLE IF NOT EXISTS Matricula (
//         id_matricula TEXT NOT NULL,
//         rut_usuario TEXT NOT NULL,
//         fecha_matricula TEXT NOT NULL,
//         estado INTEGER NOT NULL,
//         ultimo_establecimiento TEXT NOT NULL,
//         ultimo_nivel_cursado TEXT NOT NULL,
//         incidencia_academica TEXT,
//         flag_apoyo_especial INTEGER NOT NULL,
//         apoyo_especial TEXT,
//         consentimiento_apoyo_especial INTEGER,
//         razon_consentimiento_apoyo_especial TEXT,
//         cert_nacimiento INTEGER NOT NULL,
//         cert_carnet INTEGER NOT NULL,
//         cert_estudios INTEGER NOT NULL,
//         cert_rsh INTEGER NOT NULL,
//         rezago_escolar TEXT NOT NULL,
//         PRIMARY KEY (id_matricula, rut_usuario),
//         FOREIGN KEY (rut_usuario) REFERENCES Usuario(rut_usuario)
//     );

//     CREATE TABLE IF NOT EXISTS Matricula_archivo (
//         id_documento TEXT NOT NULL,
//         id_matricula TEXT NOT NULL,
//         rut_usuario TEXT NOT NULL,
//         titulo TEXT NOT NULL,
//         documento BLOB NOT NULL,
//         extension TEXT NOT NULL,
//         PRIMARY KEY (id_documento, id_matricula, rut_usuario),
//         FOREIGN KEY (id_matricula, rut_usuario) REFERENCES Matricula(id_matricula, rut_usuario)
//     );

//     CREATE TABLE IF NOT EXISTS Noticia (
//         id_noticia TEXT NOT NULL PRIMARY KEY,
//         titulo TEXT NOT NULL,
//         contenido TEXT NOT NULL,
//         destacado INTEGER NOT NULL,
//         fecha TEXT NOT NULL
//     );

//     CREATE TABLE IF NOT EXISTS Noticia_Archivo (
//         id_archivo TEXT NOT NULL,
//         id_noticia TEXT NOT NULL,
//         titulo TEXT NOT NULL,
//         archivo BLOB NOT NULL,
//         extension TEXT NOT NULL,
//         PRIMARY KEY (id_archivo, id_noticia),
//         FOREIGN KEY (id_noticia) REFERENCES Noticia(id_noticia)
//     );

//     CREATE TABLE IF NOT EXISTS Sede (
//         id_sede TEXT NOT NULL PRIMARY KEY,
//         nombre TEXT NOT NULL,
//         direccion TEXT NOT NULL,
//         url TEXT NOT NULL
//     );

//     CREATE TABLE IF NOT EXISTS Sede_archivo (
//         id_archivo TEXT NOT NULL,
//         id_sede TEXT NOT NULL,
//         titulo TEXT NOT NULL,
//         archivo BLOB NOT NULL,
//         extension TEXT NOT NULL,
//         PRIMARY KEY (id_archivo, id_sede),
//         FOREIGN KEY (id_sede) REFERENCES Sede(id_sede)
//     );

//     CREATE TABLE IF NOT EXISTS Tarea_archivo (
//         id_archivo TEXT NOT NULL,
//         id_tarea TEXT NOT NULL,
//         id_asignatura TEXT NOT NULL,
//         titulo TEXT NOT NULL,
//         archivo BLOB NOT NULL,
//         extension TEXT NOT NULL,
//         PRIMARY KEY (id_archivo, id_tarea, id_asignatura),
//         FOREIGN KEY (id_tarea, id_asignatura) REFERENCES Tareas(id_tarea, id_asignatura)
//     );

//     CREATE TABLE IF NOT EXISTS Tareas (
//         id_tarea TEXT NOT NULL,
//         id_asignatura TEXT NOT NULL,
//         titulo TEXT NOT NULL,
//         descripcion TEXT NOT NULL,
//         PRIMARY KEY (id_tarea, id_asignatura),
//         FOREIGN KEY (id_asignatura) REFERENCES Asignatura(id_asignatura)
//     );

//     CREATE TABLE IF NOT EXISTS Usuario (
//         rut_usuario TEXT NOT NULL PRIMARY KEY,
//         rut_tipo TEXT,
//         email TEXT,
//         clave TEXT NOT NULL,
//         nombres TEXT NOT NULL,
//         apellidos TEXT NOT NULL,
//         tipo_usuario TEXT NOT NULL,
//         estado INTEGER NOT NULL,
//         edad NUMERIC,
//         sexo TEXT,
//         nacionalidad TEXT ,
//         talla TEXT,
//         fecha_nacimiento TEXT,
//         direccion TEXT,
//         comuna TEXT,
//         sector TEXT,
//         codigo_temporal TEXT
//     );
// `);

// db.exec(`
//     CREATE INDEX IF NOT EXISTS idx_actividad_fecha ON Actividad(fecha);
//     CREATE INDEX IF NOT EXISTS idx_actividad_titulo ON Actividad(titulo);

//     CREATE INDEX IF NOT EXISTS idx_actividad_archivo_id_actividad ON Actividad_archivo(id_actividad);
//     CREATE INDEX IF NOT EXISTS idx_actividad_archivo_titulo ON Actividad_archivo(titulo);
//     CREATE INDEX IF NOT EXISTS idx_actividad_archivo_extension ON Actividad_archivo(extension);

//     CREATE INDEX IF NOT EXISTS idx_asignatura_nombre ON Asignatura(nombre_asignatura);

//     CREATE INDEX IF NOT EXISTS idx_asignaturas_id_curso ON Asignaturas(id_curso);
//     CREATE INDEX IF NOT EXISTS idx_asignaturas_rut_usuario ON Asignaturas(rut_usuario);

//     CREATE INDEX IF NOT EXISTS idx_asignaturas_link_id_asignatura ON AsignaturasLink(id_asignatura);

//     CREATE INDEX IF NOT EXISTS idx_asistencia_id_curso ON Asistencia(id_curso);
//     CREATE INDEX IF NOT EXISTS idx_asistencia_rut_usuario ON Asistencia(rut_usuario);
//     CREATE INDEX IF NOT EXISTS idx_asistencia_fecha ON Asistencia(fecha);

//     CREATE INDEX IF NOT EXISTS idx_calificaciones_id_evaluacion ON Calificaciones(id_evaluacion);
//     CREATE INDEX IF NOT EXISTS idx_calificaciones_id_asignatura ON Calificaciones(id_asignatura);
//     CREATE INDEX IF NOT EXISTS idx_calificaciones_nota ON Calificaciones(nota);

//     CREATE INDEX IF NOT EXISTS idx_consentimiento_rut_usuario ON Consentimiento(rut_usuario);

//     CREATE INDEX IF NOT EXISTS idx_contacto_emergencia_rut_usuario ON Contacto_emergencia(rut_usuario);
//     CREATE INDEX IF NOT EXISTS idx_contacto_emergencia_nombres ON Contacto_emergencia(nombres);
//     CREATE INDEX IF NOT EXISTS idx_contacto_emergencia_apellidos ON Contacto_emergencia(apellidos);
//     CREATE INDEX IF NOT EXISTS idx_contacto_emergencia_vinculo ON Contacto_emergencia(vinculo);

//     CREATE INDEX IF NOT EXISTS idx_curso_nombre ON Curso(nombre_curso);

//     CREATE INDEX IF NOT EXISTS idx_cursos_link_id_curso ON CursosLink(id_curso);

//     CREATE INDEX IF NOT EXISTS idx_evaluaciones_id_asignatura ON Evaluaciones(id_asignatura);
//     CREATE INDEX IF NOT EXISTS idx_evaluaciones_fecha ON Evaluaciones(fecha);
//     CREATE INDEX IF NOT EXISTS idx_evaluaciones_titulo ON Evaluaciones(titulo);

//     CREATE INDEX IF NOT EXISTS idx_galeria_titulo ON Galeria(titulo);
//     CREATE INDEX IF NOT EXISTS idx_galeria_extension ON Galeria(extension);

//     CREATE INDEX IF NOT EXISTS idx_info_apoderado_rut_usuario ON Info_apoderado(rut_usuario);
//     CREATE INDEX IF NOT EXISTS idx_info_apoderado_nombres ON Info_apoderado(nombres_apoderado1);
//     CREATE INDEX IF NOT EXISTS idx_info_apoderado_apellidos ON Info_apoderado(apellidos_apoderado1);
//     CREATE INDEX IF NOT EXISTS idx_info_apoderado_rut_apoderado ON Info_apoderado(rut_apoderado1);
//     CREATE INDEX IF NOT EXISTS idx_info_apoderado_celular ON Info_apoderado(celular_apoderado1);

//     CREATE INDEX IF NOT EXISTS idx_info_medica_rut_usuario ON Info_medica(rut_usuario);

//     CREATE INDEX IF NOT EXISTS idx_informacion_institucional_titulo ON Informacion_institucional(titulo);
//     CREATE INDEX IF NOT EXISTS idx_informacion_institucional_tipo ON Informacion_institucional(tipo);

//     CREATE INDEX IF NOT EXISTS idx_material_archivo_id_material ON Material_archivo(id_material);
//     CREATE INDEX IF NOT EXISTS idx_material_archivo_id_asignatura ON Material_archivo(id_asignatura);
//     CREATE INDEX IF NOT EXISTS idx_material_archivo_titulo ON Material_archivo(titulo);
//     CREATE INDEX IF NOT EXISTS idx_material_archivo_extension ON Material_archivo(extension);

//     CREATE INDEX IF NOT EXISTS idx_material_educativo_id_asignatura ON Material_educativo(id_asignatura);
//     CREATE INDEX IF NOT EXISTS idx_material_educativo_titulo ON Material_educativo(titulo);

//     CREATE INDEX IF NOT EXISTS idx_matricula_rut_usuario ON Matricula(rut_usuario);
//     CREATE INDEX IF NOT EXISTS idx_matricula_estado ON Matricula(estado);

//     CREATE INDEX IF NOT EXISTS idx_matricula_archivo_id_matricula ON Matricula_archivo(id_matricula);
//     CREATE INDEX IF NOT EXISTS idx_matricula_archivo_rut_usuario ON Matricula_archivo(rut_usuario);
//     CREATE INDEX IF NOT EXISTS idx_matricula_archivo_titulo ON Matricula_archivo(titulo);
//     CREATE INDEX IF NOT EXISTS idx_matricula_archivo_extension ON Matricula_archivo(extension);

//     CREATE INDEX IF NOT EXISTS idx_noticia_titulo ON Noticia(titulo);
//     CREATE INDEX IF NOT EXISTS idx_noticia_fecha ON Noticia(fecha);
//     CREATE INDEX IF NOT EXISTS idx_noticia_destacado ON Noticia(destacado);

//     CREATE INDEX IF NOT EXISTS idx_noticia_archivo_id_noticia ON Noticia_Archivo(id_noticia);
//     CREATE INDEX IF NOT EXISTS idx_noticia_archivo_titulo ON Noticia_Archivo(titulo);
//     CREATE INDEX IF NOT EXISTS idx_noticia_archivo_extension ON Noticia_Archivo(extension);

//     CREATE INDEX IF NOT EXISTS idx_sede_nombre ON Sede(nombre);
//     CREATE INDEX IF NOT EXISTS idx_sede_direccion ON Sede(direccion);

//     CREATE INDEX IF NOT EXISTS idx_sede_archivo_id_sede ON Sede_archivo(id_sede);
//     CREATE INDEX IF NOT EXISTS idx_sede_archivo_titulo ON Sede_archivo(titulo);
//     CREATE INDEX IF NOT EXISTS idx_sede_archivo_extension ON Sede_archivo(extension);

//     CREATE INDEX IF NOT EXISTS idx_tarea_archivo_id_tarea ON Tarea_archivo(id_tarea);
//     CREATE INDEX IF NOT EXISTS idx_tarea_archivo_id_asignatura ON Tarea_archivo(id_asignatura);
//     CREATE INDEX IF NOT EXISTS idx_tarea_archivo_titulo ON Tarea_archivo(titulo);
//     CREATE INDEX IF NOT EXISTS idx_tarea_archivo_extension ON Tarea_archivo(extension);

//     CREATE INDEX IF NOT EXISTS idx_tareas_id_asignatura ON Tareas(id_asignatura);
//     CREATE INDEX IF NOT EXISTS idx_tareas_titulo ON Tareas(titulo);

//     CREATE INDEX IF NOT EXISTS idx_usuario_email ON Usuario(email);
//     CREATE INDEX IF NOT EXISTS idx_usuario_nombres ON Usuario(nombres);
//     CREATE INDEX IF NOT EXISTS idx_usuario_apellidos ON Usuario(apellidos);
//     CREATE INDEX IF NOT EXISTS idx_usuario_tipo_usuario ON Usuario(tipo_usuario);
//     CREATE INDEX IF NOT EXISTS idx_usuario_estado ON Usuario(estado);
//     CREATE INDEX IF NOT EXISTS idx_usuario_edad ON Usuario(edad);
//     CREATE INDEX IF NOT EXISTS idx_usuario_sexo ON Usuario(sexo);
//     CREATE INDEX IF NOT EXISTS idx_usuario_nacionalidad ON Usuario(nacionalidad);
//     CREATE INDEX IF NOT EXISTS idx_usuario_fecha_nacimiento ON Usuario(fecha_nacimiento);
//     CREATE INDEX IF NOT EXISTS idx_usuario_comuna ON Usuario(comuna);
// `);


// console.log("Database schema created successfully.");

















import Database from 'better-sqlite3';
const db = new Database('db/database.sqlite', { verbose: console.log });

function dropAllTables() {
    db.exec('PRAGMA foreign_keys = OFF;');

    const tables = db.prepare(`
        SELECT name FROM sqlite_master 
        WHERE type = 'table' AND name NOT LIKE 'sqlite_%'
        ORDER BY name DESC
    `).all();

    // Eliminar cada tabla
    tables.forEach(table => {
        db.prepare(`DROP TABLE IF EXISTS ${table.name}`).run();
        console.log(`Tabla eliminada: ${table.name}`);
    });

    // Reactivar claves foráneas
    db.exec('PRAGMA foreign_keys = ON;');
}

dropAllTables();

db.exec(`
    CREATE TABLE IF NOT EXISTS Usuario (
        rut_usuario TEXT NOT NULL PRIMARY KEY,
        rut_tipo TEXT,
        email TEXT,
        clave TEXT NOT NULL,
        nombres TEXT NOT NULL,
        apellidos TEXT NOT NULL,
        tipo_usuario TEXT NOT NULL,
        estado INTEGER NOT NULL,
        edad NUMERIC,
        sexo TEXT,
        nacionalidad TEXT,
        talla TEXT,
        fecha_nacimiento TEXT,
        direccion TEXT,
        comuna TEXT,
        sector TEXT,
        codigo_temporal TEXT
    );

    CREATE TABLE IF NOT EXISTS Curso (
        id_curso TEXT NOT NULL PRIMARY KEY,
        nombre_curso TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS CursosLink (
        rut_usuario TEXT NOT NULL,
        id_curso TEXT NOT NULL,
        PRIMARY KEY (rut_usuario, id_curso),
        FOREIGN KEY (rut_usuario) REFERENCES Usuario(rut_usuario),
        FOREIGN KEY (id_curso) REFERENCES Curso(id_curso)
    );

    CREATE TABLE IF NOT EXISTS Asignatura (
        id_asignatura TEXT NOT NULL PRIMARY KEY,
        nombre_asignatura TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS AsignaturasLink (
        rut_usuario TEXT NOT NULL,
        id_asignatura TEXT NOT NULL,
        PRIMARY KEY (rut_usuario, id_asignatura),
        FOREIGN KEY (rut_usuario) REFERENCES Usuario(rut_usuario),
        FOREIGN KEY (id_asignatura) REFERENCES Asignatura(id_asignatura)
    );

    CREATE TABLE IF NOT EXISTS Asignaturas (
        id_curso TEXT NOT NULL,
        id_asignatura TEXT NOT NULL,
        PRIMARY KEY (id_curso, id_asignatura),
        FOREIGN KEY (id_curso) REFERENCES Curso(id_curso),
        FOREIGN KEY (id_asignatura) REFERENCES Asignatura(id_asignatura)
    );

    CREATE TABLE IF NOT EXISTS Asistencia (
        id_asistencia TEXT NOT NULL,
        id_curso TEXT NOT NULL,
        rut_usuario TEXT NOT NULL,
        fecha TEXT NOT NULL,
        asistencia INTEGER NOT NULL,
        PRIMARY KEY (id_asistencia),
        FOREIGN KEY (rut_usuario, id_curso) REFERENCES CursosLink(rut_usuario, id_curso)
    );

    CREATE TABLE IF NOT EXISTS Evaluaciones (
        id_evaluacion TEXT NOT NULL PRIMARY KEY,
        id_asignatura TEXT NOT NULL,
        fecha TEXT NOT NULL,
        titulo TEXT NOT NULL,
        FOREIGN KEY (id_asignatura) REFERENCES Asignatura(id_asignatura)
    );

    CREATE TABLE IF NOT EXISTS Calificaciones (
        id_calificaciones TEXT NOT NULL PRIMARY KEY,
        id_evaluacion TEXT NOT NULL,
        rut_estudiante TEXT NOT NULL,
        nota REAL NOT NULL,
        FOREIGN KEY (id_evaluacion) REFERENCES Evaluaciones(id_evaluacion),
        FOREIGN KEY (rut_estudiante) REFERENCES Usuario(rut_usuario)
    );

    CREATE TABLE IF NOT EXISTS Actividad (
        id_actividad TEXT NOT NULL PRIMARY KEY,
        titulo TEXT NOT NULL,
        descripcion TEXT NOT NULL,
        fecha TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS Actividad_archivo (
        id_archivo TEXT NOT NULL,
        id_actividad TEXT NOT NULL,
        titulo TEXT NOT NULL,
        archivo BLOB NOT NULL,
        extension TEXT NOT NULL,
        PRIMARY KEY (id_archivo, id_actividad),
        FOREIGN KEY (id_actividad) REFERENCES Actividad(id_actividad)
    );

    CREATE TABLE IF NOT EXISTS Consentimiento (
        id_consentimiento TEXT NOT NULL,
        rut_usuario TEXT NOT NULL,
        hitos INTEGER NOT NULL,
        asistencia INTEGER NOT NULL,
        seguro_beneficio INTEGER NOT NULL,
        reuniones INTEGER NOT NULL,
        apoyo_especial INTEGER NOT NULL,
        sedes INTEGER NOT NULL,
        multimedia INTEGER NOT NULL,
        cumplimiento_compromisos INTEGER NOT NULL,
        terminos_condiciones INTEGER NOT NULL,
        PRIMARY KEY (id_consentimiento, rut_usuario),
        FOREIGN KEY (rut_usuario) REFERENCES Usuario(rut_usuario)
    );

    CREATE TABLE IF NOT EXISTS Contacto_emergencia (
        id_contacto_emergencia TEXT NOT NULL,
        rut_usuario TEXT NOT NULL,
        nombres TEXT NOT NULL,
        apellidos TEXT NOT NULL,
        celular NUMERIC NOT NULL,
        vinculo TEXT NOT NULL,
        PRIMARY KEY (id_contacto_emergencia, rut_usuario),
        FOREIGN KEY (rut_usuario) REFERENCES Usuario(rut_usuario)
    );

    CREATE TABLE IF NOT EXISTS Galeria (
        id_archivo TEXT NOT NULL PRIMARY KEY,
        titulo TEXT NOT NULL,
        archivo BLOB NOT NULL,
        extension TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS Info_apoderado (
        id_apoderado TEXT NOT NULL,
        rut_usuario TEXT NOT NULL,
        nombres_apoderado1 TEXT NOT NULL,
        apellidos_apoderado1 TEXT NOT NULL,
        rut_apoderado1 TEXT NOT NULL,
        rut_tipo_apoderado1 TEXT NOT NULL,
        nacionalidad_apoderado1 TEXT NOT NULL,
        vinculo_apoderado1 TEXT NOT NULL,
        celular_apoderado1 NUMERIC NOT NULL,
        email_apoderado1 TEXT NOT NULL,
        nucleo_familiar NUMERIC NOT NULL,
        nombres_apoderado2 TEXT,
        apellidos_apoderado2 TEXT,
        celular_apoderado2 NUMERIC NOT NULL,
        comuna_apoderado1 TEXT NOT NULL,
        direccion_apoderado1 TEXT NOT NULL,
        PRIMARY KEY (id_apoderado, rut_usuario),
        FOREIGN KEY (rut_usuario) REFERENCES Usuario(rut_usuario)
    );

    CREATE TABLE IF NOT EXISTS Info_medica (
        id_info_medica TEXT NOT NULL,
        rut_usuario TEXT NOT NULL,
        flag_control_medico INTEGER NOT NULL,
        flag_discapacidad INTEGER NOT NULL,
        discapacidad TEXT,
        flag_necesidad_especial INTEGER NOT NULL,
        necesidad_especial TEXT,
        flag_enfermedad INTEGER NOT NULL,
        enfermedad TEXT,
        flag_medicamentos INTEGER NOT NULL,
        medicamentos TEXT,
        flag_alergia INTEGER NOT NULL,
        alergia TEXT,
        prevision_medica TEXT NOT NULL,
        servicio_emergencia TEXT NOT NULL,
        PRIMARY KEY (id_info_medica, rut_usuario),
        FOREIGN KEY (rut_usuario) REFERENCES Usuario(rut_usuario)
    );

    CREATE TABLE IF NOT EXISTS Informacion_institucional (
        id_informacion TEXT NOT NULL PRIMARY KEY,
        tipo TEXT NOT NULL,
        titulo TEXT NOT NULL,
        contenido TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS Material_educativo (
        id_material TEXT NOT NULL,
        id_asignatura TEXT NOT NULL,
        titulo TEXT NOT NULL,
        descripcion TEXT NOT NULL,
        enlace TEXT,
        PRIMARY KEY (id_material, id_asignatura),
        FOREIGN KEY (id_asignatura) REFERENCES Asignatura(id_asignatura)
    );

    CREATE TABLE IF NOT EXISTS Material_archivo (
        id_material_archivo TEXT NOT NULL,
        id_material TEXT NOT NULL,
        id_asignatura TEXT NOT NULL,
        titulo TEXT NOT NULL,
        archivo BLOB NOT NULL,
        extension TEXT NOT NULL,
        PRIMARY KEY (id_material_archivo, id_material, id_asignatura),
        FOREIGN KEY (id_material, id_asignatura) REFERENCES Material_educativo(id_material, id_asignatura)
    );

    CREATE TABLE IF NOT EXISTS Matricula (
        id_matricula TEXT NOT NULL,
        rut_usuario TEXT NOT NULL,
        fecha_matricula TEXT NOT NULL,
        estado INTEGER NOT NULL,
        ultimo_establecimiento TEXT NOT NULL,
        ultimo_nivel_cursado TEXT NOT NULL,
        incidencia_academica TEXT,
        flag_apoyo_especial INTEGER NOT NULL,
        apoyo_especial TEXT,
        consentimiento_apoyo_especial INTEGER,
        razon_consentimiento_apoyo_especial TEXT,
        cert_nacimiento INTEGER NOT NULL,
        cert_carnet INTEGER NOT NULL,
        cert_estudios INTEGER NOT NULL,
        cert_rsh INTEGER NOT NULL,
        rezago_escolar TEXT NOT NULL,
        PRIMARY KEY (id_matricula, rut_usuario),
        FOREIGN KEY (rut_usuario) REFERENCES Usuario(rut_usuario)
    );

    CREATE TABLE IF NOT EXISTS Matricula_archivo (
        id_documento TEXT NOT NULL,
        id_matricula TEXT NOT NULL,
        rut_usuario TEXT NOT NULL,
        titulo TEXT NOT NULL,
        documento BLOB NOT NULL,
        extension TEXT NOT NULL,
        PRIMARY KEY (id_documento, id_matricula, rut_usuario),
        FOREIGN KEY (id_matricula, rut_usuario) REFERENCES Matricula(id_matricula, rut_usuario)
    );

    CREATE TABLE IF NOT EXISTS Noticia (
        id_noticia TEXT NOT NULL PRIMARY KEY,
        titulo TEXT NOT NULL,
        contenido TEXT NOT NULL,
        destacado INTEGER NOT NULL,
        fecha TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS Noticia_Archivo (
        id_archivo TEXT NOT NULL,
        id_noticia TEXT NOT NULL,
        titulo TEXT NOT NULL,
        archivo BLOB NOT NULL,
        extension TEXT NOT NULL,
        PRIMARY KEY (id_archivo, id_noticia),
        FOREIGN KEY (id_noticia) REFERENCES Noticia(id_noticia)
    );

    CREATE TABLE IF NOT EXISTS Sede (
        id_sede TEXT NOT NULL PRIMARY KEY,
        nombre TEXT NOT NULL,
        direccion TEXT NOT NULL,
        url TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS Sede_archivo (
        id_archivo TEXT NOT NULL,
        id_sede TEXT NOT NULL,
        titulo TEXT NOT NULL,
        archivo BLOB NOT NULL,
        extension TEXT NOT NULL,
        PRIMARY KEY (id_archivo, id_sede),
        FOREIGN KEY (id_sede) REFERENCES Sede(id_sede)
    );

    CREATE TABLE IF NOT EXISTS Tareas (
        id_tarea TEXT NOT NULL,
        id_asignatura TEXT NOT NULL,
        titulo TEXT NOT NULL,
        descripcion TEXT NOT NULL,
        PRIMARY KEY (id_tarea, id_asignatura),
        FOREIGN KEY (id_asignatura) REFERENCES Asignatura(id_asignatura)
    );

    CREATE TABLE IF NOT EXISTS Tarea_archivo (
        id_archivo TEXT NOT NULL,
        id_tarea TEXT NOT NULL,
        id_asignatura TEXT NOT NULL,
        titulo TEXT NOT NULL,
        archivo BLOB NOT NULL,
        extension TEXT NOT NULL,
        PRIMARY KEY (id_archivo, id_tarea, id_asignatura),
        FOREIGN KEY (id_tarea, id_asignatura) REFERENCES Tareas(id_tarea, id_asignatura)
    );
`);

db.exec(`
    CREATE INDEX IF NOT EXISTS idx_actividad_fecha ON Actividad(fecha);
    CREATE INDEX IF NOT EXISTS idx_actividad_titulo ON Actividad(titulo);

    CREATE INDEX IF NOT EXISTS idx_actividad_archivo_id_actividad ON Actividad_archivo(id_actividad);
    CREATE INDEX IF NOT EXISTS idx_actividad_archivo_titulo ON Actividad_archivo(titulo);
    CREATE INDEX IF NOT EXISTS idx_actividad_archivo_extension ON Actividad_archivo(extension);

    CREATE INDEX IF NOT EXISTS idx_asignatura_nombre ON Asignatura(nombre_asignatura);

    CREATE INDEX IF NOT EXISTS idx_asignaturas_id_curso ON Asignaturas(id_curso);

    CREATE INDEX IF NOT EXISTS idx_asignaturas_link_id_asignatura ON AsignaturasLink(id_asignatura);

    CREATE INDEX IF NOT EXISTS idx_asistencia_fecha ON Asistencia(fecha);

    CREATE INDEX IF NOT EXISTS idx_calificaciones_nota ON Calificaciones(nota);

    CREATE INDEX IF NOT EXISTS idx_consentimiento_rut_usuario ON Consentimiento(rut_usuario);

    CREATE INDEX IF NOT EXISTS idx_contacto_emergencia_rut_usuario ON Contacto_emergencia(rut_usuario);
    CREATE INDEX IF NOT EXISTS idx_contacto_emergencia_nombres ON Contacto_emergencia(nombres);
    CREATE INDEX IF NOT EXISTS idx_contacto_emergencia_apellidos ON Contacto_emergencia(apellidos);
    CREATE INDEX IF NOT EXISTS idx_contacto_emergencia_vinculo ON Contacto_emergencia(vinculo);

    CREATE INDEX IF NOT EXISTS idx_curso_nombre ON Curso(nombre_curso);

    CREATE INDEX IF NOT EXISTS idx_cursos_link_id_curso ON CursosLink(id_curso);

    CREATE INDEX IF NOT EXISTS idx_evaluaciones_fecha ON Evaluaciones(fecha);
    CREATE INDEX IF NOT EXISTS idx_evaluaciones_titulo ON Evaluaciones(titulo);

    CREATE INDEX IF NOT EXISTS idx_galeria_titulo ON Galeria(titulo);
    CREATE INDEX IF NOT EXISTS idx_galeria_extension ON Galeria(extension);

    CREATE INDEX IF NOT EXISTS idx_info_apoderado_rut_usuario ON Info_apoderado(rut_usuario);
    CREATE INDEX IF NOT EXISTS idx_info_apoderado_nombres ON Info_apoderado(nombres_apoderado1);
    CREATE INDEX IF NOT EXISTS idx_info_apoderado_apellidos ON Info_apoderado(apellidos_apoderado1);

    CREATE INDEX IF NOT EXISTS idx_info_medica_rut_usuario ON Info_medica(rut_usuario);

    CREATE INDEX IF NOT EXISTS idx_informacion_institucional_titulo ON Informacion_institucional(titulo);

    CREATE INDEX IF NOT EXISTS idx_material_archivo_id_material ON Material_archivo(id_material);
    CREATE INDEX IF NOT EXISTS idx_material_archivo_titulo ON Material_archivo(titulo);

    CREATE INDEX IF NOT EXISTS idx_material_educativo_titulo ON Material_educativo(titulo);

    CREATE INDEX IF NOT EXISTS idx_matricula_estado ON Matricula(estado);

    CREATE INDEX IF NOT EXISTS idx_matricula_archivo_titulo ON Matricula_archivo(titulo);

    CREATE INDEX IF NOT EXISTS idx_noticia_fecha ON Noticia(fecha);
    CREATE INDEX IF NOT EXISTS idx_noticia_destacado ON Noticia(destacado);

    CREATE INDEX IF NOT EXISTS idx_noticia_archivo_id_noticia ON Noticia_Archivo(id_noticia);

    CREATE INDEX IF NOT EXISTS idx_sede_nombre ON Sede(nombre);

    CREATE INDEX IF NOT EXISTS idx_sede_archivo_id_sede ON Sede_archivo(id_sede);

    CREATE INDEX IF NOT EXISTS idx_tarea_archivo_titulo ON Tarea_archivo(titulo);

    CREATE INDEX IF NOT EXISTS idx_tareas_titulo ON Tareas(titulo);

    CREATE INDEX IF NOT EXISTS idx_usuario_email ON Usuario(email);
    CREATE INDEX IF NOT EXISTS idx_usuario_tipo_usuario ON Usuario(tipo_usuario);
`);


console.log("Database schema created successfully.");