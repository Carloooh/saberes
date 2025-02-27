"use client";
import { useState, useEffect } from "react";
import ProtectedRoute from "@/app/components/ProtectedRoute";

interface Asignatura {
  id_asignatura: string;
  nombre_asignatura: string;
}

interface Curso {
  id_curso: string;
  nombre_curso: string;
  asignaturas: Asignatura[];
}

interface UserSession {
  rut_usuario: string;
  tipo_usuario: string;
}

const PortalDocente = () => {
  const [modalCurso, setModalCurso] = useState<Curso | null>(null);
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [cursosDocente, setCursosDocente] = useState<Curso[]>([]);

  useEffect(() => {
    const storedSession = localStorage.getItem("userSession");
    if (storedSession) {
      try {
        const parsedSession = JSON.parse(storedSession);
        setUserSession(parsedSession);
        fetchCursosDocente(parsedSession.rut_usuario);
      } catch (error) {
        console.error("Error al parsear userSession:", error);
        localStorage.removeItem("userSession");
      }
    }
  }, []);

  const fetchCursosDocente = async (rutDocente: string) => {
    try {
      const response = await fetch(`/api/docente/cursos?rut=${rutDocente}`);
      const data = await response.json();
      if (data.success) {
        setCursosDocente(data.cursos);
      }
    } catch (error) {
      console.error("Error al obtener cursos:", error);
    }
  };

  const openModal = (curso: Curso) => {
    setModalCurso(curso);
  };

  const closeModal = () => {
    setModalCurso(null);
  };

  return (
    <ProtectedRoute allowedRoles={["Docente", "Profesor", "Administrador"]}>
      <div>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6 text-gray-800">
            Portal Docente
          </h1>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {cursosDocente.map((curso) => (
              <div
                key={curso.id_curso}
                className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg"
              >
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-2 text-gray-800">
                    {curso.nombre_curso}
                  </h2>
                  <p className="text-gray-600 mb-4">
                    {curso.asignaturas.length} asignatura(s)
                  </p>
                  <div className="flex space-x-4 justify-evenly">
                    {/* <a href={`/portalDocente/${curso.id_curso}`}> */}
                    <a
                      href={`/portalDocente/${
                        curso.id_curso
                      }?nombreCurso=${encodeURIComponent(curso.nombre_curso)}`}
                    >
                      <button
                        className="text-sm text-green-600 hover:text-green-800 font-medium transition duration-300 flex items-center"
                        title="Asistencia"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                        Ver Asistencias
                      </button>
                    </a>
                    <button
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium transition duration-300 flex items-center"
                      onClick={() => openModal(curso)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                      Ver Asignaturas
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {modalCurso && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-lg bg-white">
              <div className="mt-3">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">
                  Asignaturas de {modalCurso.nombre_curso}
                </h3>
                <div className="mt-2 py-3">
                  <ul className="space-y-2">
                    {modalCurso.asignaturas.map((asignatura) => (
                      <li key={asignatura.id_asignatura}>
                        {/* <a
                          href={`/portalDocente/${modalCurso.id_curso}/${asignatura.id_asignatura}`}
                          className="block w-full text-left px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md transition duration-300 mb-2"
                        > */}
                        <a
                          href={`/portalDocente/${modalCurso.id_curso}/${
                            asignatura.id_asignatura
                          }?nombre=${encodeURIComponent(
                            asignatura.nombre_asignatura
                          )}&nombreCurso=${encodeURIComponent(
                            modalCurso.nombre_curso
                          )}`}
                          className="block w-full text-left px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md transition duration-300 mb-2"
                        >
                          <div className="flex items-center">
                            <span className="flex-grow">
                              {asignatura.nombre_asignatura}
                            </span>
                          </div>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-4">
                  <button
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
                    onClick={closeModal}
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default PortalDocente;
