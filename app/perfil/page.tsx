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
  nombres: string;
  apellidos: string;
  email: string;
  tipo_usuario: string;
  // Campos específicos para estudiantes
  matricula?: {
    fecha_matricula: string;
    ultimo_establecimiento: string;
    ultimo_nivel_cursado: string;
    // ... otros campos de matrícula
  };
  apoderado?: {
    nombres_apoderado1: string;
    apellidos_apoderado1: string;
    rut_apoderado1: string;
    celular_apoderado1: string;
    email_apoderado1: string;
    // ... otros campos de apoderado
  };
  infoMedica?: {
    prevision_medica: string;
    servicio_emergencia: string;
    // ... otros campos médicos
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
    return <div>Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
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
            </div>

            {/* Información específica para estudiantes */}
            {userSession?.tipo_usuario === "Estudiante" && (
              <>
                {/* Sección de Matrícula */}
                {userData.matricula && (
                  <div className="border-b pb-4">
                    <h2 className="text-xl font-semibold mb-3">
                      Información de Matrícula
                    </h2>
                    <p>
                      <span className="font-medium">Fecha:</span>{" "}
                      {userData.matricula.fecha_matricula}
                    </p>
                    <p>
                      <span className="font-medium">
                        Último Establecimiento:
                      </span>{" "}
                      {userData.matricula.ultimo_establecimiento}
                    </p>
                    <p>
                      <span className="font-medium">Último Nivel:</span>{" "}
                      {userData.matricula.ultimo_nivel_cursado}
                    </p>
                  </div>
                )}

                {/* Sección de Apoderado */}
                {userData.apoderado && (
                  <div className="border-b pb-4">
                    <h2 className="text-xl font-semibold mb-3">
                      Información del Apoderado
                    </h2>
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
                      <span className="font-medium">Contacto:</span>{" "}
                      {userData.apoderado.celular_apoderado1}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span>{" "}
                      {userData.apoderado.email_apoderado1}
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
