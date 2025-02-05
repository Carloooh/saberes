// "use client"

// import { useState, useEffect } from 'react';
// import ProtectedRoute from "@/app/components/ProtectedRoute";

// interface Asignatura {
//   id: number;
//   nombre: string;
// }

// interface Curso {
//   id: number;
//   nombre: string;
// }

// interface UserSession {
//   tipo_usuario: string;
//   asignaturas: Asignatura[];
// }

// const cursos: Curso[] = [
//   { id: 1, nombre: "1ro Básico" },
//   { id: 2, nombre: "2do Básico" },
//   { id: 3, nombre: "3ro Básico" },
//   { id: 4, nombre: "4to Básico" },
//   { id: 5, nombre: "5to Básico" },
//   { id: 6, nombre: "6to Básico" },
//   { id: 7, nombre: "7mo Básico" },
//   { id: 8, nombre: "8vo Básico" }
// ];

// const PortalDocente = () => {
//   const [modalCurso, setModalCurso] = useState<Curso | null>(null);
//   const [userSession, setUserSession] = useState<UserSession | null>(null);

//   useEffect(() => {
//     const storedSession = localStorage.getItem("userSession");
//     if (storedSession) {
//       try {
//         const parsedSession = JSON.parse(storedSession);

//         if (typeof parsedSession.asignaturas === "string") {
//           parsedSession.asignaturas = parsedSession.asignaturas
//             .split(",") 
//             .map((nombre: string, index: number) => ({
//               id: index + 1,
//               nombre: nombre.trim(),
//             }));
//         } else {
//           parsedSession.asignaturas = [];
//         }

//         setUserSession(parsedSession);
//       } catch (error) {
//         console.error("Error al parsear userSession:", error);
//         localStorage.removeItem("userSession");
//       }
//     }
//   }, []);

//   const openModal = (curso: Curso) => {
//     setModalCurso(curso);
//   };

//   const closeModal = () => {
//     setModalCurso(null);
//   };

//   return (
//     <ProtectedRoute allowedRoles={["Docente", "Profesor", "Administrador"]}>
//       <div>
//         <div className="container mx-auto px-4 py-8">
//           <h1 className="text-3xl font-bold mb-6 text-gray-800">Portal Docente</h1>

//           <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
//             {cursos.map((curso) => (
//               <div
//                 key={curso.id}
//                 className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg"
//               >
//                 <div className="p-6">
//                   <h2 className="text-xl font-semibold mb-2 text-gray-800">{curso.nombre}</h2>
//                   <p className="text-gray-600 mb-4">
//                     {userSession?.asignaturas?.filter(asignatura => asignatura.id === curso.id).length} asignatura(s)
//                   </p>
//                   <button className="text-green-600 hover:text-green-800" title="Asistencia">
//                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
//                       </svg>
//                       Ver Asistencias
//                   </button>
//                   <button
//                     className="text-sm text-blue-600 hover:text-blue-800 font-medium transition duration-300 flex items-center"
//                     onClick={() => openModal(curso)}
//                   >
//                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
//                     </svg>
//                     Ver Asignaturas
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {modalCurso && (
//           <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
//             <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-lg bg-white">
//               <div className="mt-3">
//                 <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">
//                   Asignaturas de {modalCurso.nombre}
//                 </h3>
//                 <div className="mt-2 py-3">
//                   <ul className="space-y-2">
//                     {userSession?.asignaturas?.map((asignatura) => (
//                       <li key={asignatura.id}>
//                         <a
//                           href={`/portalDocente/${modalCurso.nombre.toLowerCase().replace(/ /g, '-')}/${asignatura.nombre.toLowerCase().replace(/ /g, '-')}`}
//                           className="block w-full text-left px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md transition duration-300 mb-2"
//                         >
//                           <div className="flex items-center">
//                             <span className="flex-grow">{asignatura.nombre}</span>
//                             <div className="flex space-x-2">
//                               <button className="text-blue-600 hover:text-blue-800" title="Material Educativo">
//                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
//                                 </svg>
//                               </button>
//                               <button className="text-yellow-600 hover:text-yellow-800" title="Calificaciones">
//                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
//                                 </svg>
//                               </button>
//                             </div>
//                           </div>
//                         </a>
//                       </li>
//                     ))}
//                   </ul>
//                 </div>
//                 <div className="mt-4">
//                   <button
//                     className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
//                     onClick={closeModal}
//                   >
//                     Cerrar
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </ProtectedRoute>
//   );
// };

// export default PortalDocente;
































"use client"

import { useState, useEffect } from 'react';
import ProtectedRoute from "@/app/components/ProtectedRoute";

interface Asignatura {
  id: number;
  nombre: string;
}

interface Curso {
  id: number;
  nombre: string;
}

interface UserSession {
  tipo_usuario: string;
  asignaturas: Asignatura[];
}

const cursos: Curso[] = [
  { id: 1, nombre: "1ro Básico" },
  { id: 2, nombre: "2do Básico" },
  { id: 3, nombre: "3ro Básico" },
  { id: 4, nombre: "4to Básico" },
  { id: 5, nombre: "5to Básico" },
  { id: 6, nombre: "6to Básico" },
  { id: 7, nombre: "7mo Básico" },
  { id: 8, nombre: "8vo Básico" }
];

const PortalDocente = () => {
  const [modalCurso, setModalCurso] = useState<Curso | null>(null);
  const [userSession, setUserSession] = useState<UserSession | null>(null);

  useEffect(() => {
    const storedSession = localStorage.getItem("userSession");
    if (storedSession) {
      try {
        const parsedSession = JSON.parse(storedSession);

        if (typeof parsedSession.asignaturas === "string") {
          parsedSession.asignaturas = parsedSession.asignaturas
            .split(",") 
            .map((nombre: string, index: number) => ({
              id: index + 1,
              nombre: nombre.trim(),
            }));
        } else {
          parsedSession.asignaturas = [];
        }

        setUserSession(parsedSession);
      } catch (error) {
        console.error("Error al parsear userSession:", error);
        localStorage.removeItem("userSession");
      }
    }
  }, []);

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
          <h1 className="text-3xl font-bold mb-6 text-gray-800">Portal Docente</h1>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {cursos.map((curso) => (
              <div
              key={curso.id}
              className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg"
            >
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-2 text-gray-800">{curso.nombre}</h2>
                <p className="text-gray-600 mb-4">
                  {userSession?.asignaturas?.filter(asignatura => asignatura.id === curso.id).length} asignatura(s)
                </p>
                <div className="flex space-x-4 justify-evenly">
                <a
                  href={`/portalDocente/${curso.nombre.toLowerCase().replace(/ /g, '-')}`}
                >
                  <button
                    className="text-sm text-green-600 hover:text-green-800 font-medium transition duration-300 flex items-center"
                    title="Asistencia"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Ver Asistencias
                  </button>
                </a>
                  <button
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium transition duration-300 flex items-center"
                    onClick={() => openModal(curso)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
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
                  Asignaturas de {modalCurso.nombre}
                </h3>
                <div className="mt-2 py-3">
                  <ul className="space-y-2">
                    {userSession?.asignaturas?.map((asignatura) => (
                      <li key={asignatura.id}>
                        <a
                          href={`/portalDocente/${modalCurso.nombre.toLowerCase().replace(/ /g, '-')}/${asignatura.nombre.toLowerCase().replace(/ /g, '-')}`}
                          className="block w-full text-left px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md transition duration-300 mb-2"
                        >
                          <div className="flex items-center">
                            <span className="flex-grow">{asignatura.nombre}</span>
                            <div className="flex space-x-2">
                              <button className="text-blue-600 hover:text-blue-800" title="Material Educativo">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                              </button>
                              <button className="text-yellow-600 hover:text-yellow-800" title="Calificaciones">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                </svg>
                              </button>
                            </div>
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