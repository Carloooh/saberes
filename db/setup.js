import Database from 'better-sqlite3';
const db = new Database('db/database.sqlite', { verbose: console.log });

try {
    db.exec("PRAGMA foreign_keys = OFF;");
  
    const deleteStatements = `
      DELETE FROM Actividad_archivo;
      DELETE FROM Actividad;
      DELETE FROM Asistencia;
      DELETE FROM Calificaciones;
      DELETE FROM Evaluaciones;
      DELETE FROM Material_archivo;
      DELETE FROM Material_educativo;
      DELETE FROM Matricula_archivo;
      DELETE FROM Matricula;
      DELETE FROM Noticia_Archivo;
      DELETE FROM Noticia;
      DELETE FROM Sede_archivo;
      DELETE FROM Sede;
      DELETE FROM Tarea_archivo;
      DELETE FROM Tareas;
      DELETE FROM CursosAsignaturasLink;
      DELETE FROM Asignaturas;
      DELETE FROM Asignatura;
      DELETE FROM Curso;
      DELETE FROM Contacto_emergencia;
      DELETE FROM Consentimiento;
      DELETE FROM Info_apoderado;
      DELETE FROM Info_medica;
      DELETE FROM Informacion_institucional;
      DELETE FROM Galeria;
      DELETE FROM Usuario;
    `;
  
    db.exec(deleteStatements);
  
    console.log("Datos eliminados correctamente.");
  } catch (error) {
    console.error("Error al eliminar datos:", error);
  } finally {
    db.exec("PRAGMA foreign_keys = ON;");
  
  }


db.exec(`

    CREATE TABLE IF NOT EXISTS Usuario (
        rut_usuario TEXT NOT NULL PRIMARY KEY,
        rut_tipo TEXT,
        email TEXT,
        clave TEXT NOT NULL,
        nombres TEXT NOT NULL,
        apellidos TEXT NOT NULL,
        tipo_usuario TEXT NOT NULL,
        estado TEXT NOT NULL,
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

    CREATE TABLE IF NOT EXISTS CursosAsignaturasLink (
        id_cursosasignaturaslink TEXT NOT NULL PRIMARY KEY,
        rut_usuario TEXT NOT NULL,
        id_curso TEXT NOT NULL,
        id_asignatura TEXT,
        FOREIGN KEY (rut_usuario) REFERENCES Usuario(rut_usuario),
        FOREIGN KEY (id_curso) REFERENCES Curso(id_curso),
        FOREIGN KEY (id_asignatura) REFERENCES Asignatura(id_asignatura)
    );

    CREATE TABLE IF NOT EXISTS Asignatura (
        id_asignatura TEXT NOT NULL PRIMARY KEY,
        nombre_asignatura TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS Asignaturas (
        id_curso TEXT NOT NULL,
        id_asignatura TEXT NOT NULL,
        PRIMARY KEY (id_curso, id_asignatura),
        FOREIGN KEY (id_curso) REFERENCES Curso(id_curso) ON DELETE CASCADE,
        FOREIGN KEY (id_asignatura) REFERENCES Asignatura(id_asignatura) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS Asistencia (
        id_asistencia TEXT NOT NULL,
        id_curso TEXT NOT NULL,
        rut_usuario TEXT NOT NULL,
        fecha TEXT NOT NULL,
        asistencia INTEGER NOT NULL,
        PRIMARY KEY (id_asistencia),
        FOREIGN KEY (rut_usuario, id_curso) REFERENCES CursosAsignaturasLink(rut_usuario, id_curso) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS Evaluaciones (
        id_evaluacion TEXT NOT NULL PRIMARY KEY,
        id_asignatura TEXT NOT NULL,
        fecha TEXT NOT NULL,
        titulo TEXT NOT NULL,
        FOREIGN KEY (id_asignatura) REFERENCES Asignatura(id_asignatura) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS Calificaciones (
        id_calificaciones TEXT NOT NULL PRIMARY KEY,
        id_evaluacion TEXT NOT NULL,
        rut_estudiante TEXT NOT NULL,
        nota REAL NOT NULL,
        FOREIGN KEY (id_evaluacion) REFERENCES Evaluaciones(id_evaluacion) ON DELETE CASCADE,
        FOREIGN KEY (rut_estudiante) REFERENCES Usuario(rut_usuario) ON DELETE CASCADE
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
        FOREIGN KEY (id_actividad) REFERENCES Actividad(id_actividad) ON DELETE CASCADE
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
        FOREIGN KEY (rut_usuario) REFERENCES Usuario(rut_usuario) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS Contacto_emergencia (
        id_contacto_emergencia TEXT NOT NULL,
        rut_usuario TEXT NOT NULL,
        nombres TEXT NOT NULL,
        apellidos TEXT NOT NULL,
        celular NUMERIC NOT NULL,
        vinculo TEXT NOT NULL,
        PRIMARY KEY (id_contacto_emergencia, rut_usuario),
        FOREIGN KEY (rut_usuario) REFERENCES Usuario(rut_usuario) ON DELETE CASCADE
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
        FOREIGN KEY (rut_usuario) REFERENCES Usuario(rut_usuario) ON DELETE CASCADE
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
        FOREIGN KEY (rut_usuario) REFERENCES Usuario(rut_usuario) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS Informacion_institucional (
        id_informacion TEXT NOT NULL PRIMARY KEY,
        tipo TEXT NOT NULL,
        titulo TEXT,
        contenido TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS Material_educativo (
        id_material TEXT NOT NULL,
        id_asignatura TEXT NOT NULL,
        titulo TEXT NOT NULL,
        descripcion TEXT NOT NULL,
        enlace TEXT,
        PRIMARY KEY (id_material, id_asignatura),
        FOREIGN KEY (id_asignatura) REFERENCES Asignatura(id_asignatura) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS Material_archivo (
        id_material_archivo TEXT NOT NULL,
        id_material TEXT NOT NULL,
        id_asignatura TEXT NOT NULL,
        titulo TEXT NOT NULL,
        archivo BLOB NOT NULL,
        extension TEXT NOT NULL,
        PRIMARY KEY (id_material_archivo, id_material, id_asignatura),
        FOREIGN KEY (id_material, id_asignatura) REFERENCES Material_educativo(id_material, id_asignatura) ON DELETE CASCADE
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
        cert_diagnostico INTEGER NOT NULL,
        rezago_escolar TEXT,
        PRIMARY KEY (id_matricula, rut_usuario),
        FOREIGN KEY (rut_usuario) REFERENCES Usuario(rut_usuario) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS Matricula_archivo (
        id_documento TEXT NOT NULL,
        id_matricula TEXT NOT NULL,
        rut_usuario TEXT NOT NULL,
        titulo TEXT NOT NULL,
        documento BLOB NOT NULL,
        extension TEXT NOT NULL,
        PRIMARY KEY (id_documento, id_matricula, rut_usuario),
        FOREIGN KEY (id_matricula, rut_usuario) REFERENCES Matricula(id_matricula, rut_usuario) ON DELETE CASCADE
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
        FOREIGN KEY (id_noticia) REFERENCES Noticia(id_noticia) ON DELETE CASCADE
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
        FOREIGN KEY (id_sede) REFERENCES Sede(id_sede) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS Tareas (
        id_tarea TEXT NOT NULL,
        id_asignatura TEXT NOT NULL,
        titulo TEXT NOT NULL,
        descripcion TEXT NOT NULL,
        PRIMARY KEY (id_tarea, id_asignatura),
        FOREIGN KEY (id_asignatura) REFERENCES Asignatura(id_asignatura) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS Tarea_archivo (
        id_archivo TEXT NOT NULL,
        id_tarea TEXT NOT NULL,
        id_asignatura TEXT NOT NULL,
        titulo TEXT NOT NULL,
        archivo BLOB NOT NULL,
        extension TEXT NOT NULL,
        PRIMARY KEY (id_archivo, id_tarea, id_asignatura),
        FOREIGN KEY (id_tarea, id_asignatura) REFERENCES Tareas(id_tarea, id_asignatura) ON DELETE CASCADE
    );

    INSERT INTO informacion_institucional (id_informacion, tipo, titulo, contenido) VALUES
    (1, 'vision', 'vision',  'Estudio, investigación e innovación en educación social, educativa y cultural, liderando un modelo alternativo en rendición de exámenes libres con un alto nivel de aprendizaje significativo y sostenido en el tiempo.'),
    (2, 'mision', 'mision', 'Conformar un equipo multidisciplinario con capacidades y herramientas dispuestas a la innovación en planificación, contenido y traspaso de la información de manera vinculante, generando la confianza y curiosidad del niño, niña y adolescente en su proceso de formación y accesos.');

    INSERT INTO curso (id_curso, nombre_curso) VALUES
    (1, '1° Básico'),
    (2, '2° Básico'),
    (3, '3° Básico'),
    (4, '4° Básico'),
    (5, '5° Básico'),
    (6, '6° Básico'),
    (7, '7° Básico'),
    (8, '8° Básico'),
    (9, '1° Medio'),
    (10, '2° Medio'),
    (11, '3° Medio');

    INSERT INTO asignatura (id_asignatura, nombre_asignatura) VALUES
    (1, 'Historia'),
    (2, 'Lenguaje'),
    (3, 'Ciencias'),
    (4, 'Inglés'),
    (5, 'Matemáticas'),
    (6, 'Ed. Física');

    INSERT INTO asignaturas (id_curso, id_asignatura) VALUES
    (1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6),
    (10, 1), (10, 2), (10, 3), (10, 4), (10, 5), (10, 6),
    (11, 1), (11, 2), (11, 3), (11, 4), (11, 5), (11, 6),
    (2, 1), (2, 2), (2, 3), (2, 4), (2, 5), (2, 6),
    (3, 1), (3, 2), (3, 3), (3, 4), (3, 5), (3, 6),
    (4, 1), (4, 2), (4, 3), (4, 4), (4, 5), (4, 6),
    (5, 1), (5, 2), (5, 3), (5, 4), (5, 5), (5, 6),
    (6, 1), (6, 2), (6, 3), (6, 4), (6, 5), (6, 6),
    (7, 1), (7, 2), (7, 3), (7, 4), (7, 5), (7, 6),
    (8, 1), (8, 2), (8, 3), (8, 4), (8, 5), (8, 6),
    (9, 1), (9, 2), (9, 3), (9, 4), (9, 5), (9, 6);

`);

db.exec(`
    CREATE INDEX IF NOT EXISTS idx_actividad_fecha ON Actividad(fecha);
    CREATE INDEX IF NOT EXISTS idx_actividad_titulo ON Actividad(titulo);

    CREATE INDEX IF NOT EXISTS idx_actividad_archivo_id_actividad ON Actividad_archivo(id_actividad);
    CREATE INDEX IF NOT EXISTS idx_actividad_archivo_titulo ON Actividad_archivo(titulo);
    CREATE INDEX IF NOT EXISTS idx_actividad_archivo_extension ON Actividad_archivo(extension);

    CREATE INDEX IF NOT EXISTS idx_asignatura_nombre ON Asignatura(nombre_asignatura);

    CREATE INDEX IF NOT EXISTS idx_asignaturas_id_curso ON Asignaturas(id_curso);

    CREATE INDEX IF NOT EXISTS idx_cursosasignaturas_link_id_rut_usuario ON CursosAsignaturasLink(rut_usuario);
    CREATE INDEX IF NOT EXISTS idx_cursosasignaturas_link_id_curso ON CursosAsignaturasLink(id_curso);
    CREATE INDEX IF NOT EXISTS idx_cursosasignaturas_link_id_asignatura ON CursosAsignaturasLink(id_asignatura);

    CREATE INDEX IF NOT EXISTS idx_asistencia_fecha ON Asistencia(fecha);

    CREATE INDEX IF NOT EXISTS idx_calificaciones_nota ON Calificaciones(nota);

    CREATE INDEX IF NOT EXISTS idx_consentimiento_rut_usuario ON Consentimiento(rut_usuario);

    CREATE INDEX IF NOT EXISTS idx_contacto_emergencia_rut_usuario ON Contacto_emergencia(rut_usuario);
    CREATE INDEX IF NOT EXISTS idx_contacto_emergencia_nombres ON Contacto_emergencia(nombres);
    CREATE INDEX IF NOT EXISTS idx_contacto_emergencia_apellidos ON Contacto_emergencia(apellidos);
    CREATE INDEX IF NOT EXISTS idx_contacto_emergencia_vinculo ON Contacto_emergencia(vinculo);

    CREATE INDEX IF NOT EXISTS idx_curso_nombre ON Curso(nombre_curso);

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