import Database from 'better-sqlite3';
const db = new Database('db/database.sqlite', { verbose: console.log });
db.exec(`
  -- Tabla de usuarios (Estudiantes, Apoderados, Docentes)
CREATE TABLE Usuario (
    id_usuario TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    email TEXT NOT NULL,
    clave TEXT NOT NULL,
    tipo_usuario TEXT CHECK(tipo_usuario IN ('Estudiante', 'Apoderado', 'Docente', 'Profesor', 'Administrador')) NOT NULL,
    estado BOOLEAN NOT NULL,
    rut TEXT NOT NULL,
    hijos TEXT NULL, -- Array con los hijos (para apoderados e incluso docentes)
    cursos TEXT NULL, -- Array con los cursos (para docentes o estudiantes)
    asignaturas TEXT NULL -- Array con las asignaturas (para docentes)
);

-- Tabla de cursos
CREATE TABLE Curso (
    id_curso TEXT PRIMARY KEY,
    nombre TEXT NOT NULL
);

-- Tabla de asignaturas
CREATE TABLE Asignatura (
    id_asignatura TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    id_curso TEXT NOT NULL,
    FOREIGN KEY (id_curso) REFERENCES Curso(id_curso)
);

-- Tabla de materiales educativos
CREATE TABLE Material (
    id_material TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    archivo LONGBLOB,
    enlace TEXT NULL,
    id_asignatura TEXT NOT NULL,
    FOREIGN KEY (id_asignatura) REFERENCES Asignatura(id_asignatura)
);

-- Tabla de asistencia (registro por usuario y curso)
CREATE TABLE Asistencia (
    id_asistencia TEXT PRIMARY KEY,
    id_usuario TEXT NOT NULL,
    id_curso TEXT NOT NULL,
    asistencia TEXT NOT NULL, -- Array con registros de asistencia ["xx/xx/xxxx", lugar, true/false]
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario),
    FOREIGN KEY (id_curso) REFERENCES Curso(id_curso)
);

-- Tabla de calificaciones (registro por usuario y asignatura)
CREATE TABLE Calificacion (
    id_calificaciones TEXT PRIMARY KEY,
    id_usuario TEXT NOT NULL,
    id_asignatura TEXT NOT NULL,
    calificaciones TEXT NOT NULL, -- Array con registros de calificaciones ["prueba1", "xx/xx/xxxx", 7.0]
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario),
    FOREIGN KEY (id_asignatura) REFERENCES Asignatura(id_asignatura)
);

-- Tabla de anuncios
CREATE TABLE Anuncio (
    id_anuncio TEXT PRIMARY KEY,
    titulo TEXT NOT NULL,
    fecha DATETIME NOT NULL,
    contenido TEXT NOT NULL,
    archivo LONGBLOB,
    destacado BOOLEAN
);

-- Tabla de actividades
CREATE TABLE Actividad (
    id_actividad TEXT PRIMARY KEY,
    titulo TEXT NOT NULL,
    fecha DATETIME NOT NULL,
    contenido TEXT NOT NULL,
    archivo LONGBLOB,
    documento LONGBLOB
);

-- Tabla de galería (almacena imágenes/videos)
CREATE TABLE Galeria (
    id_archivo TEXT PRIMARY KEY,
    archivo LONGBLOB NOT NULL,
    extension TEXT NOT NULL
);

-- Tabla de información general
CREATE TABLE informacioninstitucional (
    id_informacion TEXT PRIMARY KEY,
    tipo TEXT NOT NULL,
    titulo TEXT,
    contenido TEXT NOT NULL
);

-- Tabla de sedes
CREATE TABLE sede (
    id_sede TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    direccion TEXT NOT NULL,
    url TEXT NOT NULL,
    imagen LONGBLOB
)
`);
console.log("Database schema created successfully.");


// DROP TABLE IF EXISTS Usuario;
// DROP TABLE IF EXISTS Curso;
// DROP TABLE IF EXISTS Asignatura;
// DROP TABLE IF EXISTS Material;
// DROP TABLE IF EXISTS Asistencia;
// DROP TABLE IF EXISTS Calificacion;
// DROP TABLE IF EXISTS Anuncio;
// DROP TABLE IF EXISTS Actividad;
// DROP TABLE IF EXISTS Galeria;
// DROP TABLE IF EXISTS informacioninstitucional;
// DROP TABLE IF EXISTS sede;