"use client";
import React, { useEffect, useState } from "react";

interface UserSession {
  rut_usuario: string;
  tipo_usuario: string;
}

interface Asignatura {
  id_asignatura: string;
  nombre_asignatura: string;
}

interface Curso {
  id_curso: string;
  nombre_curso: string;
  asignaturas: Asignatura[];
}

interface UserProfile {
  rut_usuario: string;
  rut_tipo: string;
  nombres: string;
  apellidos: string;
  email: string;
  tipo_usuario: string;
  fecha_nacimiento: string;
  nacionalidad: string;
  talla: string;
  direccion: string;
  comuna: string;
  sector: string;
  sexo: string;

  cursoAlumno?: {
    nombre_curso: string;
  };

  matricula?: {
    fecha_matricula: string;
    ultimo_establecimiento: string;
    ultimo_nivel_cursado: string;
    incidencia_academica: string;
    flag_apoyo_especial: string;
    apoyo_especial: string;
    consentimiento_apoyo_especial: string;
    razon_consentimiento_apoyo_especial: string;
    rezago_escolar: string;
  };
  apoderado?: {
    nombres_apoderado1: string;
    apellidos_apoderado1: string;
    rut_apoderado1: string;
    rut_tipo_apoderado1: string;
    nacionalidad_apoderado1: string;
    vinculo_apoderado1: string;
    celular_apoderado1: string;
    email_apoderado1: string;
    comuna_apoderado1: string;
    direccion_apoderado1: string;
    nucleo_familiar: string;
    nombres_apoderado2: string;
    apellidos_apoderado2: string;
    celular_apoderado2: string;
  };
  contactoEmergencia?: {
    nombres: string;
    apellidos: string;
    celular: string;
    vinculo: string;
  };
  infoMedica?: {
    flag_control_medico: string;
    flag_discapacidad: string;
    discapacidad: string;
    flag_necesidad_especial: string;
    necesidad_especial: string;
    flag_enfermedad: string;
    enfermedad: string;
    flag_medicamentos: string;
    medicamentos: string;
    flag_alergia: string;
    alergia: string;
    prevision_medica: string;
    servicio_emergencia: string;
  };
  archivos?: Array<{
    id_documento: string;
    titulo: string;
    extension: string;
    downloadUrl: string;
  }>;
  // Campos específicos para docentes/administradores
  cursos?: Curso[];
}

const Perfil: React.FC = () => {
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedSession = localStorage.getItem("userSession");
    if (storedSession) {
      try {
        const parsedSession = JSON.parse(storedSession);
        setUserSession(parsedSession);
      } catch (error) {
        console.error("Error al parsear userSession:", error);
        localStorage.removeItem("userSession");
      }
    }
  }, []);

  const calculateAge = (dateString: string): number => {
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  useEffect(() => {
    if (userSession) {
      const fetchUserProfile = async () => {
        try {
          const response = await fetch("/api/perfil", {
            method: "GET",
          });

          if (!response.ok) {
            throw new Error("Error al obtener el perfil del usuario");
          }

          const data = await response.json();
          if (data.success) {
            setUserData(data.data);
          } else {
            console.error(data.error);
          }
        } catch (error) {
          console.error("Error al cargar el perfil:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchUserProfile();
    }
  }, [userSession]);

  if (loading) {
    return (
      <div>
        <div className="flex justify-center items-center p-8">
          <div className="text-gray-500">Cargando datos del estudiante...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 w-full">
      <div className="mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Perfil de Usuario</h1>

        {userData ? (
          <div className="space-y-6">
            {/* Información básica para todos los usuarios */}
            <div className="border-b pb-4">
              <h2 className="text-xl font-semibold mb-3">
                Información Personal
              </h2>
              <p>
                <span className="font-medium">Nombre:</span> {userData.nombres}{" "}
                {userData.apellidos}
              </p>
              <p>
                <span className="font-medium">Email:</span> {userData.email}
              </p>
              <p>
                <span className="font-medium">RUT:</span> {userData.rut_usuario}
              </p>
              <p>
                <span className="font-medium">Tipo:</span> {userData.rut_tipo}
              </p>
              <p>
                <span className="font-medium">Sexo:</span> {userData.sexo}
              </p>
              <p>
                <span className="font-medium">Fecha de nacimiento:</span>{" "}
                {userData.fecha_nacimiento}
              </p>
              <p>
                <span className="font-medium">Edad:</span>{" "}
                {userData?.fecha_nacimiento
                  ? `${calculateAge(userData.fecha_nacimiento)} años`
                  : "No disponible"}
              </p>
              <p>
                <span className="font-medium">Nacionalidad:</span>{" "}
                {userData.nacionalidad}
              </p>
              <p>
                <span className="font-medium">Talla:</span>{" "}
                {userData.talla ? userData.talla : "No disponible"}
              </p>

              <p>
                <span className="font-medium">Dirección:</span>{" "}
                {userData.direccion}
              </p>
              <p>
                <span className="font-medium">Comuna:</span> {userData.comuna}
              </p>
              <p>
                <span className="font-medium">Sector:</span> {userData.sector}
              </p>
            </div>

            {/* Información específica para estudiantes */}
            {userSession?.tipo_usuario === "Estudiante" && (
              <>
                {/* Sección de Familiar */}
                {userData.apoderado && (
                  <div className="border-b pb-4">
                    <h2 className="text-xl font-semibold mb-3">
                      Información Familiar
                    </h2>
                    <p>
                      <span className="font-medium">
                        Núcleo familiar (cantidad):{" "}
                      </span>{" "}
                      {userData.apoderado.nucleo_familiar}
                    </p>
                    <h3 className="text-lg pt-2 mb-2">Apoderado principal</h3>
                    <p>
                      <span className="font-medium">Nombre:</span>{" "}
                      {userData.apoderado.nombres_apoderado1}{" "}
                      {userData.apoderado.apellidos_apoderado1}
                    </p>
                    <p>
                      <span className="font-medium">RUT:</span>{" "}
                      {userData.apoderado.rut_apoderado1}
                    </p>
                    <p>
                      <span className="font-medium">Tipo: </span>
                      {userData.apoderado.rut_tipo_apoderado1}
                    </p>
                    <p>
                      <span className="font-medium">Contacto:</span>{" "}
                      {userData.apoderado.celular_apoderado1}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span>{" "}
                      {userData.apoderado.email_apoderado1}
                    </p>
                    <p>
                      <span className="font-medium">Vinculo:</span>
                      {userData.apoderado.vinculo_apoderado1}
                    </p>
                    <p>
                      <span className="font-medium">Comuna:</span>{" "}
                      {userData.apoderado.comuna_apoderado1}
                    </p>
                    <p>
                      <span className="font-medium">Dirección:</span>{" "}
                      {userData.apoderado.direccion_apoderado1}
                    </p>
                    <p>
                      <span className="font-medium">Nacionalidad:</span>{" "}
                      {userData.apoderado.nacionalidad_apoderado1}
                    </p>
                    <h3 className="text-lg pt-2 mb-2">Apoderado secundario</h3>
                    <p>
                      <span className="font-medium">Nombre:</span>{" "}
                      {userData.apoderado.nombres_apoderado2}{" "}
                      {userData.apoderado.apellidos_apoderado2}
                    </p>
                    <p>
                      <span className="font-medium">Celular:</span>{" "}
                      {userData.apoderado.celular_apoderado2}
                    </p>
                  </div>
                )}

                {/* Sección de Contacto Emergencia */}
                {userData.apoderado && (
                  <div className="border-b pb-4">
                    <h2 className="text-xl font-semibold mb-3">
                      Contacto de emergencia
                    </h2>
                    <p>
                      <span className="font-medium">Nombre:</span>{" "}
                      {userData.contactoEmergencia?.nombres}{" "}
                      {userData.contactoEmergencia?.apellidos}
                    </p>
                    <p>
                      <span className="font-medium">Celular:</span>{" "}
                      {userData.contactoEmergencia?.celular}
                    </p>
                    <p>
                      <span className="font-medium">Vinculo:</span>{" "}
                      {userData.contactoEmergencia?.vinculo}
                    </p>
                  </div>
                )}

                {/* Sección Médica */}
                {userData.infoMedica && (
                  <div className="border-b pb-4">
                    <h2 className="text-xl font-semibold mb-3">
                      Información Médica
                    </h2>
                    <p>
                      <span className="font-medium">
                        Estado control médico:
                      </span>{" "}
                      {userData.infoMedica.flag_control_medico === "1"
                        ? "Atrasado"
                        : "Al día"}
                    </p>
                    <p>
                      <span className="font-medium">
                        ¿Tiene alguna discapacidad discapacidad?:
                      </span>{" "}
                      {userData.infoMedica.flag_discapacidad === "1"
                        ? "No"
                        : "Si"}
                    </p>
                    <p>
                      <span className="font-medium">Discapacidad:</span>{" "}
                      {userData.infoMedica.discapacidad
                        ? userData.infoMedica.discapacidad
                        : "No aplica"}
                    </p>
                    <p>
                      <span className="font-medium">
                        ¿Tiene alguna necesidad especial?:
                      </span>{" "}
                      {userData.infoMedica.flag_necesidad_especial === "1"
                        ? "Si"
                        : "No"}
                    </p>
                    <p>
                      <span className="font-medium">Necesidad especial:</span>{" "}
                      {userData.infoMedica.necesidad_especial
                        ? userData.infoMedica.necesidad_especial
                        : "No aplica"}
                    </p>

                    <p>
                      <span className="font-medium">
                        ¿Posee alguna enfermedad?:
                      </span>{" "}
                      {userData.infoMedica.flag_enfermedad === "1"
                        ? "Si"
                        : "No"}
                    </p>
                    <p>
                      <span className="font-medium">Enfermedad:</span>{" "}
                      {userData.infoMedica.enfermedad
                        ? userData.infoMedica.enfermedad
                        : "No aplica"}
                    </p>
                    <p>
                      <span className="font-medium">
                        ¿Utiliza medicamentos?:
                      </span>{" "}
                      {userData.infoMedica.flag_medicamentos === "1"
                        ? "Si"
                        : "No"}
                    </p>
                    <p>
                      <span className="font-medium">Medicamentos:</span>{" "}
                      {userData.infoMedica.medicamentos
                        ? userData.infoMedica.medicamentos
                        : "No aplica"}
                    </p>
                    <p>
                      <span className="font-medium">
                        ¿Posee alguna alergia?:
                      </span>{" "}
                      {userData.infoMedica.flag_alergia === "1" ? "Si" : "No"}
                    </p>
                    <p>
                      <span className="font-medium">Alergia:</span>{" "}
                      {userData.infoMedica.alergia
                        ? userData.infoMedica.alergia
                        : "No aplica"}
                    </p>
                    <p>
                      <span className="font-medium">Previsión:</span>{" "}
                      {userData.infoMedica.prevision_medica}
                    </p>
                    <p>
                      <span className="font-medium">
                        Servicio de Emergencia:
                      </span>{" "}
                      {userData.infoMedica.servicio_emergencia}
                    </p>
                  </div>
                )}

                {/* Sección de Matrícula */}
                {userData.matricula && (
                  <div className="border-b pb-4">
                    <h2 className="text-xl font-semibold mb-3">
                      Información de Matrícula
                    </h2>
                    <p>
                      <span className="font-medium">Curso alumno:</span>{" "}
                      {userData.cursoAlumno?.nombre_curso}
                    </p>
                    <p>
                      <span className="font-medium">Fecha de matricula:</span>{" "}
                      {userData.matricula.fecha_matricula}
                    </p>
                    <p>
                      <span className="font-medium">
                        Último establecimiento educacional:
                      </span>{" "}
                      {userData.matricula.ultimo_establecimiento}
                    </p>
                    <p>
                      <span className="font-medium">Último nivel cursado:</span>{" "}
                      {userData.matricula.ultimo_nivel_cursado}
                    </p>
                    <p>
                      <span className="font-medium">Incidencia académica:</span>{" "}
                      {userData.matricula.incidencia_academica}
                    </p>
                    <p>
                      <span className="font-medium">
                        Requiere apoyo especial:
                      </span>{" "}
                      {userData.matricula.flag_apoyo_especial === "1"
                        ? "Si"
                        : "No"}
                    </p>
                    <p>
                      <span className="font-medium">Apoyo especial:</span>{" "}
                      {userData.matricula.apoyo_especial
                        ? userData.matricula.apoyo_especial
                        : "No aplica"}
                    </p>
                    <p>
                      <span className="font-medium">
                        Consentimiento de apoyo especial:
                      </span>{" "}
                      {userData.matricula.consentimiento_apoyo_especial === "1"
                        ? "Aceptado"
                        : "No aceptado"}
                    </p>
                    <p>
                      <span className="font-medium">
                        Razón del consentimiento de apoyo especial:
                      </span>{" "}
                      {userData.matricula.razon_consentimiento_apoyo_especial}
                    </p>
                    <p>
                      <span className="font-medium">Rezago escolar:</span>{" "}
                      {userData.matricula.rezago_escolar}
                    </p>
                  </div>
                )}

                {/* Sección de Documentos */}
                {userData.archivos && userData.archivos.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold mb-3">Documentos</h2>
                    <div className="space-y-2">
                      {userData.archivos.map((archivo, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded"
                        >
                          <span className="flex items-center">
                            <svg
                              className="w-5 h-5 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                            {archivo.titulo}.{archivo.extension}
                          </span>
                          <a
                            href={archivo.downloadUrl}
                            download
                            className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:underline flex items-center"
                          >
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                              />
                            </svg>
                            Descargar
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Información específica para docentes y administradores */}
            {(userSession?.tipo_usuario === "Docente" ||
              userSession?.tipo_usuario === "Administrador") && (
              <div>
                <h2 className="text-xl font-semibold mb-3">
                  Cursos y Asignaturas Asignadas
                </h2>
                <div className="space-y-4">
                  {userData.cursos?.map((curso, index) => (
                    <div key={index} className="border-b pb-4">
                      <h3 className="text-lg font-medium mb-2">
                        {curso.nombre_curso}
                      </h3>
                      <ul className="list-disc pl-5">
                        {curso.asignaturas.map((asignatura, idx) => (
                          <li key={idx}>{asignatura.nombre_asignatura}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-red-500">
            No se pudo cargar el perfil del usuario.
          </p>
        )}
      </div>
    </div>
  );
};

export default Perfil;
