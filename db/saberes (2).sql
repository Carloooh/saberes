---------------------------------------------------------------------
-- CREACIÓN DE TABLAS Y CONSTRAINTS (CLAVES, FOREIGN KEYS CON CASCADE)
---------------------------------------------------------------------

-- Tabla: Usuario
IF OBJECT_ID(N'dbo.Usuario', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Usuario (
        id_user           NVARCHAR(100) NOT NULL PRIMARY KEY,
		rut_usuario          NVARCHAR(100) NOT NULL,
        rut_tipo              NVARCHAR(255) NULL,
        email                 NVARCHAR(255) NULL,
        clave                 NVARCHAR(255) NOT NULL,
        nombres               NVARCHAR(255) NOT NULL,
        apellidos             NVARCHAR(255) NOT NULL,
        tipo_usuario          NVARCHAR(255) NOT NULL,
        estado                NVARCHAR(255) NOT NULL,
        sexo                  NVARCHAR(255) NULL,
        nacionalidad          NVARCHAR(255) NULL,
        talla                 NVARCHAR(255) NULL,
        fecha_nacimiento      NVARCHAR(255) NULL,
        direccion             NVARCHAR(255) NULL,
        comuna                NVARCHAR(255) NULL,
        sector                NVARCHAR(255) NULL,
        codigo_temporal       NVARCHAR(255) NULL,
        codigo_temporal_expira NVARCHAR(255) NULL,
        codigo_temporal_target NVARCHAR(255) NULL
    );
END
GO

-- Tabla: Curso
IF OBJECT_ID(N'dbo.Curso', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Curso (
        id_curso      NVARCHAR(100) NOT NULL PRIMARY KEY,
        nombre_curso  NVARCHAR(255) NOT NULL
    );
END
GO

-- Tabla: Asignatura
IF OBJECT_ID(N'dbo.Asignatura', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Asignatura (
        id_asignatura      NVARCHAR(100) NOT NULL PRIMARY KEY,
        nombre_asignatura  NVARCHAR(255) NOT NULL
    );
END
GO

-- Tabla: Asignaturas (relación muchos a muchos entre Curso y Asignatura)
IF OBJECT_ID(N'dbo.Asignaturas', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Asignaturas (
        id_curso      NVARCHAR(100) NOT NULL,
        id_asignatura NVARCHAR(100) NOT NULL,
        CONSTRAINT PK_Asignaturas PRIMARY KEY (id_curso, id_asignatura),
        CONSTRAINT FK_Asignaturas_Curso FOREIGN KEY (id_curso)
            REFERENCES dbo.Curso(id_curso) ON DELETE CASCADE,
        CONSTRAINT FK_Asignaturas_Asignatura FOREIGN KEY (id_asignatura)
            REFERENCES dbo.Asignatura(id_asignatura) ON DELETE CASCADE
    );
END
GO

-- Tabla: CursosAsignaturasLink
IF OBJECT_ID(N'dbo.CursosAsignaturasLink', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.CursosAsignaturasLink (
        id_cursosasignaturaslink NVARCHAR(100) NOT NULL PRIMARY KEY,
        id_user              NVARCHAR(100) NOT NULL,
        id_curso                 NVARCHAR(100) NOT NULL,
        id_asignatura            NVARCHAR(100) NULL,
        CONSTRAINT FK_CursosAsignaturasLink_Usuario FOREIGN KEY (id_user)
            REFERENCES dbo.Usuario(id_user) ON DELETE CASCADE,
        CONSTRAINT FK_CursosAsignaturasLink_Curso FOREIGN KEY (id_curso)
            REFERENCES dbo.Curso(id_curso) ON DELETE CASCADE,
        CONSTRAINT FK_CursosAsignaturasLink_Asignatura FOREIGN KEY (id_asignatura)
            REFERENCES dbo.Asignatura(id_asignatura) ON DELETE CASCADE
    );
END
GO

-- Tabla: DiasAsistencia
IF OBJECT_ID(N'dbo.DiasAsistencia', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.DiasAsistencia (
        id_dia         NVARCHAR(100) NOT NULL,
        id_curso       NVARCHAR(100) NOT NULL,
        id_asignatura  NVARCHAR(100) NOT NULL,
        fecha          NVARCHAR(255) NOT NULL,
        CONSTRAINT PK_DiasAsistencia PRIMARY KEY (id_dia, id_curso, id_asignatura),
        CONSTRAINT FK_DiasAsistencia_Curso FOREIGN KEY (id_curso)
            REFERENCES dbo.Curso(id_curso) ON DELETE CASCADE,
        CONSTRAINT FK_DiasAsistencia_Asignatura FOREIGN KEY (id_asignatura)
            REFERENCES dbo.Asignatura(id_asignatura) ON DELETE CASCADE
    );
END
GO

-- Tabla: Asistencia
IF OBJECT_ID(N'dbo.Asistencia', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Asistencia (
        id_asistencia NVARCHAR(100) NOT NULL PRIMARY KEY,
        id_dia        NVARCHAR(100) NOT NULL,
        id_curso      NVARCHAR(100) NOT NULL,
        id_asignatura NVARCHAR(100) NOT NULL,
        id_user   NVARCHAR(100) NOT NULL,
        asistencia    INT NOT NULL,
        CONSTRAINT FK_Asistencia_DiasAsistencia FOREIGN KEY (id_dia, id_curso, id_asignatura)
            REFERENCES dbo.DiasAsistencia(id_dia, id_curso, id_asignatura) ON DELETE CASCADE,
        CONSTRAINT FK_Asistencia_Usuario FOREIGN KEY (id_user)
            REFERENCES dbo.Usuario(id_user) ON DELETE CASCADE
    );
END
GO

-- Tabla: Evaluaciones
IF OBJECT_ID(N'dbo.Evaluaciones', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Evaluaciones (
        id_evaluacion NVARCHAR(100) NOT NULL PRIMARY KEY,
        id_curso      NVARCHAR(100) NOT NULL,
        id_asignatura NVARCHAR(100) NOT NULL,
        fecha         NVARCHAR(255) NOT NULL,
        titulo        NVARCHAR(255) NOT NULL,
        CONSTRAINT FK_Evaluaciones_Asignaturas FOREIGN KEY (id_curso, id_asignatura)
            REFERENCES dbo.Asignaturas(id_curso, id_asignatura) ON DELETE CASCADE
    );
END
GO

-- Tabla: Calificaciones
IF OBJECT_ID(N'dbo.Calificaciones', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Calificaciones (
        id_calificacion NVARCHAR(100) NOT NULL PRIMARY KEY,
        id_evaluacion   NVARCHAR(100) NOT NULL,
        id_user  NVARCHAR(100) NOT NULL,
        nota            FLOAT NOT NULL,
        CONSTRAINT FK_Calificaciones_Evaluaciones FOREIGN KEY (id_evaluacion)
            REFERENCES dbo.Evaluaciones(id_evaluacion) ON DELETE CASCADE,
        CONSTRAINT FK_Calificaciones_Usuario FOREIGN KEY (id_user)
            REFERENCES dbo.Usuario(id_user) ON DELETE CASCADE
    );
END
GO

-- Tabla: Actividad
IF OBJECT_ID(N'dbo.Actividad', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Actividad (
        id_actividad NVARCHAR(100) NOT NULL PRIMARY KEY,
        titulo       NVARCHAR(255) NOT NULL,
        descripcion  NVARCHAR(MAX) NOT NULL,
        fecha        NVARCHAR(255) NOT NULL
    );
END
GO

-- Tabla: Actividad_archivo
IF OBJECT_ID(N'dbo.Actividad_archivo', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Actividad_archivo (
        id_archivo  NVARCHAR(100) NOT NULL,
        id_actividad NVARCHAR(100) NOT NULL,
        titulo      NVARCHAR(255) NOT NULL,
        archivo     VARBINARY(MAX) NOT NULL,
        extension   NVARCHAR(100) NOT NULL,
        CONSTRAINT PK_Actividad_archivo PRIMARY KEY (id_archivo, id_actividad),
        CONSTRAINT FK_Actividad_archivo_Actividad FOREIGN KEY (id_actividad)
            REFERENCES dbo.Actividad(id_actividad) ON DELETE CASCADE
    );
END
GO

-- Tabla: Consentimiento
IF OBJECT_ID(N'dbo.Consentimiento', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Consentimiento (
        id_consentimiento         NVARCHAR(100) NOT NULL,
        id_user               NVARCHAR(100) NOT NULL,
        hitos                     INT NOT NULL,
        asistencia                INT NOT NULL,
        seguro_beneficio          INT NOT NULL,
        reuniones                 INT NOT NULL,
        apoyo_especial            INT NOT NULL,
        sedes                     INT NOT NULL,
        multimedia                INT NOT NULL,
        cumplimiento_compromisos  INT NOT NULL,
        terminos_condiciones      INT NOT NULL,
        CONSTRAINT PK_Consentimiento PRIMARY KEY (id_consentimiento, id_user),
        CONSTRAINT FK_Consentimiento_Usuario FOREIGN KEY (id_user)
            REFERENCES dbo.Usuario(id_user) ON DELETE CASCADE
    );
END
GO

-- Tabla: Contacto_emergencia
IF OBJECT_ID(N'dbo.Contacto_emergencia', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Contacto_emergencia (
        id_contacto_emergencia NVARCHAR(100) NOT NULL,
        id_user            NVARCHAR(100) NOT NULL,
        nombres                NVARCHAR(255) NOT NULL,
        apellidos              NVARCHAR(255) NOT NULL,
        celular                BIGINT NOT NULL,
        vinculo                NVARCHAR(255) NOT NULL,
        CONSTRAINT PK_Contacto_emergencia PRIMARY KEY (id_contacto_emergencia, id_user),
        CONSTRAINT FK_Contacto_emergencia_Usuario FOREIGN KEY (id_user)
            REFERENCES dbo.Usuario(id_user) ON DELETE CASCADE
    );
END
GO

-- Tabla: Galeria
IF OBJECT_ID(N'dbo.Galeria', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Galeria (
        id_archivo NVARCHAR(100) NOT NULL PRIMARY KEY,
        titulo     NVARCHAR(255) NOT NULL,
        archivo    VARBINARY(MAX) NOT NULL,
        extension  NVARCHAR(100) NOT NULL
    );
END
GO

-- Tabla: Info_apoderado
IF OBJECT_ID(N'dbo.Info_apoderado', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Info_apoderado (
        id_apoderado             NVARCHAR(100) NOT NULL,
        id_user              NVARCHAR(100) NOT NULL,
        nombres_apoderado1       NVARCHAR(255) NOT NULL,
        apellidos_apoderado1     NVARCHAR(255) NOT NULL,
        rut_apoderado1           NVARCHAR(100) NOT NULL,
        rut_tipo_apoderado1      NVARCHAR(100) NOT NULL,
        nacionalidad_apoderado1  NVARCHAR(255) NOT NULL,
        vinculo_apoderado1       NVARCHAR(255) NOT NULL,
        celular_apoderado1       BIGINT NOT NULL,
        email_apoderado1         NVARCHAR(255) NOT NULL,
        nucleo_familiar          INT NOT NULL,
        nombres_apoderado2       NVARCHAR(255) NULL,
        apellidos_apoderado2     NVARCHAR(255) NULL,
        celular_apoderado2       BIGINT NOT NULL,
        comuna_apoderado1        NVARCHAR(255) NOT NULL,
        direccion_apoderado1     NVARCHAR(255) NOT NULL,
        CONSTRAINT PK_Info_apoderado PRIMARY KEY (id_apoderado, id_user),
        CONSTRAINT FK_Info_apoderado_Usuario FOREIGN KEY (id_user)
            REFERENCES dbo.Usuario(id_user) ON DELETE CASCADE
    );
END
GO

-- Tabla: Info_medica
IF OBJECT_ID(N'dbo.Info_medica', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Info_medica (
        id_info_medica      NVARCHAR(100) NOT NULL,
        id_user         NVARCHAR(100) NOT NULL,
        flag_control_medico INT NOT NULL,
        flag_discapacidad   INT NOT NULL,
        discapacidad        NVARCHAR(255) NULL,
        flag_necesidad_especial INT NOT NULL,
        necesidad_especial  NVARCHAR(255) NULL,
        flag_enfermedad     INT NOT NULL,
        enfermedad          NVARCHAR(255) NULL,
        flag_medicamentos   INT NOT NULL,
        medicamentos        NVARCHAR(255) NULL,
        flag_alergia        INT NOT NULL,
        alergia             NVARCHAR(255) NULL,
        prevision_medica    NVARCHAR(255) NOT NULL,
        servicio_emergencia NVARCHAR(255) NOT NULL,
        CONSTRAINT PK_Info_medica PRIMARY KEY (id_info_medica, id_user),
        CONSTRAINT FK_Info_medica_Usuario FOREIGN KEY (id_user)
            REFERENCES dbo.Usuario(id_user) ON DELETE CASCADE
    );
END
GO

-- Tabla: Informacion_institucional
IF OBJECT_ID(N'dbo.Informacion_institucional', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Informacion_institucional (
        id_informacion NVARCHAR(100) NOT NULL PRIMARY KEY,
        tipo           NVARCHAR(255) NOT NULL,
        titulo         NVARCHAR(255) NULL,
        contenido      NVARCHAR(MAX) NOT NULL
    );
END
GO

-- Tabla: Material_educativo
IF OBJECT_ID(N'dbo.Material_educativo', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Material_educativo (
        id_material   NVARCHAR(100) NOT NULL,
        id_curso      NVARCHAR(100) NOT NULL,
        id_asignatura NVARCHAR(100) NOT NULL,
        titulo        NVARCHAR(255) NOT NULL,
        descripcion   NVARCHAR(MAX) NOT NULL,
        fecha         NVARCHAR(255) NOT NULL,
        enlace        NVARCHAR(255) NULL,
        CONSTRAINT PK_Material_educativo PRIMARY KEY (id_material, id_curso, id_asignatura),
        CONSTRAINT FK_Material_educativo_Asignaturas FOREIGN KEY (id_curso, id_asignatura)
            REFERENCES dbo.Asignaturas(id_curso, id_asignatura) ON DELETE CASCADE
    );
END
GO

-- Tabla: Material_archivo
IF OBJECT_ID(N'dbo.Material_archivo', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Material_archivo (
        id_material_archivo NVARCHAR(100) NOT NULL,
        id_material         NVARCHAR(100) NOT NULL,
        id_curso            NVARCHAR(100) NOT NULL,
        id_asignatura       NVARCHAR(100) NOT NULL,
        titulo              NVARCHAR(255) NOT NULL,
        archivo             VARBINARY(MAX) NOT NULL,
        extension           NVARCHAR(100) NOT NULL,
        CONSTRAINT PK_Material_archivo PRIMARY KEY (id_material_archivo, id_material, id_curso, id_asignatura),
        CONSTRAINT FK_Material_archivo_Material_educativo FOREIGN KEY (id_material, id_curso, id_asignatura)
            REFERENCES dbo.Material_educativo(id_material, id_curso, id_asignatura) ON DELETE CASCADE
    );
END
GO

-- Tabla: Matricula
IF OBJECT_ID(N'dbo.Matricula', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Matricula (
        id_matricula                 NVARCHAR(100) NOT NULL,
        id_user                  NVARCHAR(100) NOT NULL,
        fecha_matricula              NVARCHAR(255) NOT NULL,
        estado                       INT NOT NULL,
        ultimo_establecimiento       NVARCHAR(255) NOT NULL,
        ultimo_nivel_cursado         NVARCHAR(255) NOT NULL,
        incidencia_academica         NVARCHAR(255) NULL,
        flag_apoyo_especial          INT NOT NULL,
        apoyo_especial               NVARCHAR(255) NULL,
        consentimiento_apoyo_especial INT NULL,
        razon_consentimiento_apoyo_especial NVARCHAR(255) NULL,
        cert_nacimiento              INT NOT NULL,
        cert_carnet                  INT NOT NULL,
        cert_estudios                INT NOT NULL,
        cert_rsh                     INT NOT NULL,
        cert_diagnostico             INT NOT NULL,
        rezago_escolar               NVARCHAR(255) NULL,
        CONSTRAINT PK_Matricula PRIMARY KEY (id_matricula, id_user),
        CONSTRAINT FK_Matricula_Usuario FOREIGN KEY (id_user)
            REFERENCES dbo.Usuario(id_user) ON DELETE CASCADE
    );
END
GO

-- Tabla: Matricula_archivo
IF OBJECT_ID(N'dbo.Matricula_archivo', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Matricula_archivo (
        id_documento NVARCHAR(100) NOT NULL,
        id_matricula NVARCHAR(100) NOT NULL,
        id_user  NVARCHAR(100) NOT NULL,
        titulo       NVARCHAR(255) NOT NULL,
        documento    VARBINARY(MAX) NOT NULL,
        extension    NVARCHAR(100) NOT NULL,
tipo NVARCHAR(100) NOT NULL,
        CONSTRAINT PK_Matricula_archivo PRIMARY KEY (id_documento, id_matricula, id_user),
        CONSTRAINT FK_Matricula_archivo_Matricula FOREIGN KEY (id_matricula, id_user)
            REFERENCES dbo.Matricula(id_matricula, id_user) ON DELETE CASCADE
    );
END
GO

-- Tabla: Noticia
IF OBJECT_ID(N'dbo.Noticia', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Noticia (
        id_noticia NVARCHAR(100) NOT NULL PRIMARY KEY,
        titulo     NVARCHAR(255) NOT NULL,
        contenido  NVARCHAR(MAX) NOT NULL,
        destacado  INT NOT NULL,
        fecha      NVARCHAR(255) NOT NULL
    );
END
GO

-- Tabla: Noticia_Archivo
IF OBJECT_ID(N'dbo.Noticia_Archivo', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Noticia_Archivo (
        id_archivo NVARCHAR(100) NOT NULL,
        id_noticia NVARCHAR(100) NOT NULL,
        titulo     NVARCHAR(255) NOT NULL,
        archivo    VARBINARY(MAX) NOT NULL,
        extension  NVARCHAR(100) NOT NULL,
        CONSTRAINT PK_Noticia_Archivo PRIMARY KEY (id_archivo, id_noticia),
        CONSTRAINT FK_Noticia_Archivo_Noticia FOREIGN KEY (id_noticia)
            REFERENCES dbo.Noticia(id_noticia) ON DELETE CASCADE
    );
END
GO

-- Tabla: Sede
IF OBJECT_ID(N'dbo.Sede', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Sede (
        id_sede   NVARCHAR(100) NOT NULL PRIMARY KEY,
        nombre    NVARCHAR(255) NOT NULL,
        direccion NVARCHAR(255) NOT NULL,
        url       NVARCHAR(255) NOT NULL,
        url_iframe NVARCHAR(255) NOT NULL,
        cursos    NVARCHAR(255) NOT NULL
    );
END
GO

-- Tabla: Sede_archivo
IF OBJECT_ID(N'dbo.Sede_archivo', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Sede_archivo (
        id_archivo NVARCHAR(100) NOT NULL,
        id_sede    NVARCHAR(100) NOT NULL,
        titulo     NVARCHAR(255) NOT NULL,
        archivo    VARBINARY(MAX) NOT NULL,
        extension  NVARCHAR(100) NOT NULL,
        CONSTRAINT PK_Sede_archivo PRIMARY KEY (id_archivo, id_sede),
        CONSTRAINT FK_Sede_archivo_Sede FOREIGN KEY (id_sede)
            REFERENCES dbo.Sede(id_sede) ON DELETE CASCADE
    );
END
GO

-- Tabla: Tareas
IF OBJECT_ID(N'dbo.Tareas', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Tareas (
        id_tarea    NVARCHAR(100) NOT NULL,
        id_curso    NVARCHAR(100) NOT NULL,
        id_asignatura NVARCHAR(100) NOT NULL,
        titulo      NVARCHAR(255) NOT NULL,
        descripcion NVARCHAR(MAX) NOT NULL,
        fecha       NVARCHAR(255) NOT NULL,
        CONSTRAINT PK_Tareas PRIMARY KEY (id_tarea, id_curso, id_asignatura),
        CONSTRAINT FK_Tareas_Asignaturas FOREIGN KEY (id_curso, id_asignatura)
            REFERENCES dbo.Asignaturas(id_curso, id_asignatura) ON DELETE CASCADE
    );
END
GO

-- Tabla: Tarea_archivo
IF OBJECT_ID(N'dbo.Tarea_archivo', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Tarea_archivo (
        id_archivo  NVARCHAR(100) NOT NULL,
        id_tarea    NVARCHAR(100) NOT NULL,
        id_curso    NVARCHAR(100) NOT NULL,
        id_asignatura NVARCHAR(100) NOT NULL,
        titulo      NVARCHAR(255) NOT NULL,
        archivo     VARBINARY(MAX) NOT NULL,
        extension   NVARCHAR(100) NOT NULL,
        CONSTRAINT PK_Tarea_archivo PRIMARY KEY (id_archivo, id_tarea, id_curso, id_asignatura),
        CONSTRAINT FK_Tarea_archivo_Tareas FOREIGN KEY (id_tarea, id_curso, id_asignatura)
            REFERENCES dbo.Tareas(id_tarea, id_curso, id_asignatura) ON DELETE CASCADE
    );
END
GO

-- Tabla: EntregaTarea
IF OBJECT_ID(N'dbo.EntregaTarea', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.EntregaTarea (
        id_entrega   NVARCHAR(100) NOT NULL PRIMARY KEY,
        id_tarea     NVARCHAR(100) NOT NULL,
        id_curso     NVARCHAR(100) NOT NULL,
        id_asignatura NVARCHAR(100) NOT NULL,
        id_user NVARCHAR(100) NOT NULL,
        fecha_entrega NVARCHAR(255) NOT NULL,
        comentario   NVARCHAR(MAX) NULL,
        estado       NVARCHAR(255) NOT NULL CONSTRAINT DF_EntregaTarea_estado DEFAULT ('pendiente'),
        CONSTRAINT FK_EntregaTarea_Tareas FOREIGN KEY (id_tarea, id_curso, id_asignatura)
            REFERENCES dbo.Tareas(id_tarea, id_curso, id_asignatura) ON DELETE CASCADE,
        CONSTRAINT FK_EntregaTarea_Usuario FOREIGN KEY (id_user)
            REFERENCES dbo.Usuario(id_user) ON DELETE CASCADE
    );
END
GO

-- Tabla: EntregaTarea_Archivo
IF OBJECT_ID(N'dbo.EntregaTarea_Archivo', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.EntregaTarea_Archivo (
        id_archivo NVARCHAR(100) NOT NULL,
        id_entrega NVARCHAR(100) NOT NULL,
        titulo     NVARCHAR(255) NOT NULL,
        archivo    VARBINARY(MAX) NOT NULL,
        extension  NVARCHAR(100) NOT NULL,
        CONSTRAINT PK_EntregaTarea_Archivo PRIMARY KEY (id_archivo, id_entrega),
        CONSTRAINT FK_EntregaTarea_Archivo_EntregaTarea FOREIGN KEY (id_entrega)
            REFERENCES dbo.EntregaTarea(id_entrega) ON DELETE CASCADE
    );
END
GO

---------------------------------------------------------------------
-- INSERCIONES DE DATOS INICIALES
---------------------------------------------------------------------

-- Insertar datos en Informacion_institucional
INSERT INTO dbo.Informacion_institucional (id_informacion, tipo, titulo, contenido)
VALUES
    (N'1', N'vision', N'vision', N'Estudio, investigación e innovación en educación social, educativa y cultural, liderando un modelo alternativo en rendición de exámenes libres con un alto nivel de aprendizaje significativo y sostenido en el tiempo.'),
    (N'2', N'mision', N'mision', N'Conformar un equipo multidisciplinario con capacidades y herramientas dispuestas a la innovación en planificación, contenido y traspaso de la información de manera vinculante, generando la confianza y curiosidad del niño, niña y adolescente en su proceso de formación y accesos.');
GO

-- Insertar datos en Curso
INSERT INTO dbo.Curso (id_curso, nombre_curso)
VALUES
    (N'1', N'1° Básico'),
    (N'2', N'2° Básico'),
    (N'3', N'3° Básico'),
    (N'4', N'4° Básico'),
    (N'5', N'5° Básico'),
    (N'6', N'6° Básico'),
    (N'7', N'7° Básico'),
    (N'8', N'8° Básico'),
    (N'9', N'1° Medio'),
    (N'10', N'2° Medio'),
    (N'11', N'3° Medio');
GO

-- Insertar datos en Asignatura
INSERT INTO dbo.Asignatura (id_asignatura, nombre_asignatura)
VALUES
    (N'1', N'Historia'),
    (N'2', N'Lenguaje'),
    (N'3', N'Ciencias'),
    (N'4', N'Inglés'),
    (N'5', N'Matemáticas'),
    (N'6', N'Ed. Física');
GO

-- Insertar datos en Asignaturas
INSERT INTO dbo.Asignaturas (id_curso, id_asignatura)
VALUES
    (N'1', N'1'), (N'1', N'2'), (N'1', N'3'), (N'1', N'4'), (N'1', N'5'), (N'1', N'6'),
    (N'10', N'1'), (N'10', N'2'), (N'10', N'3'), (N'10', N'4'), (N'10', N'5'), (N'10', N'6'),
    (N'11', N'1'), (N'11', N'2'), (N'11', N'3'), (N'11', N'4'), (N'11', N'5'), (N'11', N'6'),
    (N'2', N'1'), (N'2', N'2'), (N'2', N'3'), (N'2', N'4'), (N'2', N'5'), (N'2', N'6'),
    (N'3', N'1'), (N'3', N'2'), (N'3', N'3'), (N'3', N'4'), (N'3', N'5'), (N'3', N'6'),
    (N'4', N'1'), (N'4', N'2'), (N'4', N'3'), (N'4', N'4'), (N'4', N'5'), (N'4', N'6'),
    (N'5', N'1'), (N'5', N'2'), (N'5', N'3'), (N'5', N'4'), (N'5', N'5'), (N'5', N'6'),
    (N'6', N'1'), (N'6', N'2'), (N'6', N'3'), (N'6', N'4'), (N'6', N'5'), (N'6', N'6'),
    (N'7', N'1'), (N'7', N'2'), (N'7', N'3'), (N'7', N'4'), (N'7', N'5'), (N'7', N'6'),
    (N'8', N'1'), (N'8', N'2'), (N'8', N'3'), (N'8', N'4'), (N'8', N'5'), (N'8', N'6'),
    (N'9', N'1'), (N'9', N'2'), (N'9', N'3'), (N'9', N'4'), (N'9', N'5'), (N'9', N'6');
GO

---------------------------------------------------------------------
-- CREACIÓN DE ÍNDICES ADICIONALES
---------------------------------------------------------------------

-- Índices para Actividad
CREATE INDEX idx_actividad_fecha ON dbo.Actividad(fecha);
CREATE INDEX idx_actividad_titulo ON dbo.Actividad(titulo);
GO

-- Índices para Actividad_archivo
CREATE INDEX idx_actividad_archivo_id_actividad ON dbo.Actividad_archivo(id_actividad);
CREATE INDEX idx_actividad_archivo_titulo ON dbo.Actividad_archivo(titulo);
CREATE INDEX idx_actividad_archivo_extension ON dbo.Actividad_archivo(extension);
GO

-- Índice para Asignatura
CREATE INDEX idx_asignatura_nombre ON dbo.Asignatura(nombre_asignatura);
GO

-- Índice para Asignaturas
CREATE INDEX idx_asignaturas_id_curso ON dbo.Asignaturas(id_curso);
GO

-- Índices para CursosAsignaturasLink
CREATE INDEX idx_cursosasignaturas_link_id_id_user ON dbo.CursosAsignaturasLink(id_user);
CREATE INDEX idx_cursosasignaturas_link_id_curso ON dbo.CursosAsignaturasLink(id_curso);
CREATE INDEX idx_cursosasignaturas_link_id_asignatura ON dbo.CursosAsignaturasLink(id_asignatura);
GO

-- Índice para Calificaciones
CREATE INDEX idx_calificaciones_nota ON dbo.Calificaciones(nota);
GO

-- Índice para Consentimiento
CREATE INDEX idx_consentimiento_id_user ON dbo.Consentimiento(id_user);
GO

-- Índices para Contacto_emergencia
CREATE INDEX idx_contacto_emergencia_id_user ON dbo.Contacto_emergencia(id_user);
CREATE INDEX idx_contacto_emergencia_nombres ON dbo.Contacto_emergencia(nombres);
CREATE INDEX idx_contacto_emergencia_apellidos ON dbo.Contacto_emergencia(apellidos);
CREATE INDEX idx_contacto_emergencia_vinculo ON dbo.Contacto_emergencia(vinculo);
GO

-- Índice para Curso
CREATE INDEX idx_curso_nombre ON dbo.Curso(nombre_curso);
GO

-- Índices para Evaluaciones
CREATE INDEX idx_evaluaciones_fecha ON dbo.Evaluaciones(fecha);
CREATE INDEX idx_evaluaciones_titulo ON dbo.Evaluaciones(titulo);
GO

-- Índices para Galeria
CREATE INDEX idx_galeria_titulo ON dbo.Galeria(titulo);
CREATE INDEX idx_galeria_extension ON dbo.Galeria(extension);
GO

-- Índices para Info_apoderado
CREATE INDEX idx_info_apoderado_id_user ON dbo.Info_apoderado(id_user);
CREATE INDEX idx_info_apoderado_nombres ON dbo.Info_apoderado(nombres_apoderado1);
CREATE INDEX idx_info_apoderado_apellidos ON dbo.Info_apoderado(apellidos_apoderado1);
GO

-- Índice para Info_medica
CREATE INDEX idx_info_medica_id_user ON dbo.Info_medica(id_user);
GO

-- Índice para Informacion_institucional
CREATE INDEX idx_informacion_institucional_titulo ON dbo.Informacion_institucional(titulo);
GO

-- Índices para Material_archivo
CREATE INDEX idx_material_archivo_id_material ON dbo.Material_archivo(id_material);
CREATE INDEX idx_material_archivo_titulo ON dbo.Material_archivo(titulo);
GO

-- Índice para Material_educativo
CREATE INDEX idx_material_educativo_titulo ON dbo.Material_educativo(titulo);
GO

-- Índice para Matricula
CREATE INDEX idx_matricula_estado ON dbo.Matricula(estado);
GO

-- Índice para Matricula_archivo
CREATE INDEX idx_matricula_archivo_titulo ON dbo.Matricula_archivo(titulo);
GO

-- Índices para Noticia
CREATE INDEX idx_noticia_fecha ON dbo.Noticia(fecha);
CREATE INDEX idx_noticia_destacado ON dbo.Noticia(destacado);
GO

-- Índice para Noticia_Archivo
CREATE INDEX idx_noticia_archivo_id_noticia ON dbo.Noticia_Archivo(id_noticia);
GO

-- Índice para Sede
CREATE INDEX idx_sede_nombre ON dbo.Sede(nombre);
GO

-- Índice para Sede_archivo
CREATE INDEX idx_sede_archivo_id_sede ON dbo.Sede_archivo(id_sede);
GO

-- Índices para Tarea_archivo
CREATE INDEX idx_tarea_archivo_titulo ON dbo.Tarea_archivo(titulo);
GO

-- Índice para Tareas
CREATE INDEX idx_tareas_titulo ON dbo.Tareas(titulo);
GO

-- Índices para EntregaTarea
CREATE INDEX idx_entregatarea_id_tarea ON dbo.EntregaTarea(id_tarea);
CREATE INDEX idx_entregatarea_id_user ON dbo.EntregaTarea(id_user);
CREATE INDEX idx_entregatarea_estado ON dbo.EntregaTarea(estado);
CREATE INDEX idx_entregatarea_tarea_estudiante ON dbo.EntregaTarea(id_tarea, id_user);
GO

-- Índice para Usuario
CREATE INDEX idx_usuario_email ON dbo.Usuario(email);
CREATE INDEX idx_usuario_tipo_usuario ON dbo.Usuario(tipo_usuario);
GO





-- Limpieza BBDD

DELETE FROM EntregaTarea_Archivo;
DELETE FROM EntregaTarea;
DELETE FROM Tarea_archivo;
DELETE FROM Tareas;
DELETE FROM Actividad_archivo;
DELETE FROM Actividad;
DELETE FROM Asistencia;
DELETE FROM DiasAsistencia;
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

DROP TABLE EntregaTarea_Archivo;
DROP TABLE EntregaTarea;
DROP TABLE Tarea_archivo;
DROP TABLE Tareas;
DROP TABLE Actividad_archivo;
DROP TABLE Actividad;
DROP TABLE Asistencia;
DROP TABLE DiasAsistencia;
DROP TABLE Calificaciones;
DROP TABLE Evaluaciones;
DROP TABLE Material_archivo;
DROP TABLE Material_educativo;
DROP TABLE Matricula_archivo;
DROP TABLE Matricula;
DROP TABLE Noticia_Archivo;
DROP TABLE Noticia;
DROP TABLE Sede_archivo;
DROP TABLE Sede;
DROP TABLE CursosAsignaturasLink;
DROP TABLE Asignaturas;
DROP TABLE Asignatura;
DROP TABLE Curso;
DROP TABLE Contacto_emergencia;
DROP TABLE Consentimiento;
DROP TABLE Info_apoderado;
DROP TABLE Info_medica;
DROP TABLE Informacion_institucional;
DROP TABLE Galeria;
DROP TABLE Usuario;

UPDATE Usuario
SET estado = 'Activa'
WHERE rut_usuario = '20477343-2';