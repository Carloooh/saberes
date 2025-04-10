// "use client";

// import { useState, useEffect } from "react";
// import React from "react";
// import Material from "@/app/components/docente/Material";
// import Calificaciones from "@/app/components/docente/Calificaciones";
// import Tareas from "@/app/components/docente/Tareas";
// import Asistencias from "@/app/components/docente/Asistencias";
// import { useSearchParams } from "next/navigation";

// interface AsignaturaPageProps {
//   params: Promise<{
//     curso: string;
//     asignatura: string;
//   }>;
// }

// const AsignaturaPage = ({ params }: AsignaturaPageProps) => {
//   const [activeTab, setActiveTab] = useState<
//     "material" | "calificaciones" | "tareas" | "asistencias"
//   >("material");
//   const [curso, setCurso] = useState<string | null>(null);
//   const [asignatura, setAsignatura] = useState<string | null>(null);
//   const searchParams = useSearchParams();
//   const nombreCurso = searchParams.get("nombreCurso");
//   const nombreAsignatura = searchParams.get("nombre");

//   // const router = useRouter();

//   useEffect(() => {
//     params.then((resolvedParams) => {
//       setCurso(resolvedParams.curso);
//       setAsignatura(resolvedParams.asignatura);
//     });
//   }, [params]);

//   if (!curso || !asignatura) {
//     return (
//       <div className="flex justify-center items-center p-8">
//         <div className="text-gray-500">Cargando información asignatura...</div>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <h1 className="text-2xl font-bold mb-4">Curso: {nombreCurso || curso}</h1>
//       <h2 className="text-xl font-semibold mb-6">
//         {" "}
//         Asignatura: {nombreAsignatura || asignatura}{" "}
//       </h2>

//       {/* Pestañas */}
//       <div className="flex space-x-4 border-b mb-6">
//         <button
//           className={`py-2 px-4 ${
//             activeTab === "material"
//               ? "border-b-2 border-blue-500 text-blue-500"
//               : "text-gray-500"
//           }`}
//           onClick={() => setActiveTab("material")}
//         >
//           Materiales
//         </button>
//         <button
//           className={`py-2 px-4 ${
//             activeTab === "calificaciones"
//               ? "border-b-2 border-blue-500 text-blue-500"
//               : "text-gray-500"
//           }`}
//           onClick={() => setActiveTab("calificaciones")}
//         >
//           Calificaciones
//         </button>
//         <button
//           className={`py-2 px-4 ${
//             activeTab === "tareas"
//               ? "border-b-2 border-blue-500 text-blue-500"
//               : "text-gray-500"
//           }`}
//           onClick={() => setActiveTab("tareas")}
//         >
//           Tareas
//         </button>
//         <button
//           className={`py-2 px-4 ${
//             activeTab === "asistencias"
//               ? "border-b-2 border-blue-500 text-blue-500"
//               : "text-gray-500"
//           }`}
//           onClick={() => setActiveTab("asistencias")}
//         >
//           Asistencias
//         </button>
//       </div>

//       {/* Contenido de las pestañas */}
//       <div>
//         {activeTab === "material" && (
//           <Material cursoId={curso} asignaturaId={asignatura} />
//         )}
//         {activeTab === "calificaciones" && (
//           <Calificaciones cursoId={curso} asignaturaId={asignatura} />
//         )}
//         {activeTab === "tareas" && (
//           <Tareas cursoId={curso} asignaturaId={asignatura} />
//         )}
//         {activeTab === "asistencias" && (
//           <Asistencias cursoId={curso} asignaturaId={asignatura} />
//         )}
//       </div>
//     </div>
//   );
// };

// export default AsignaturaPage;

"use client";

import { useState, useEffect } from "react";
import React from "react";
import Material from "@/app/components/docente/Material";
import Calificaciones from "@/app/components/docente/Calificaciones";
import Tareas from "@/app/components/docente/Tareas";
import Asistencias from "@/app/components/docente/Asistencias";
import { useSearchParams } from "next/navigation";

interface AsignaturaPageProps {
  params: Promise<{
    curso: string;
    asignatura: string;
  }>;
}

const AsignaturaPage = ({ params }: AsignaturaPageProps) => {
  const [activeTab, setActiveTab] = useState<
    "material" | "calificaciones" | "tareas" | "asistencias"
  >("material");
  const [curso, setCurso] = useState<string | null>(null);
  const [asignatura, setAsignatura] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const nombreCurso = searchParams.get("nombreCurso");
  const nombreAsignatura = searchParams.get("nombre");

  // const router = useRouter();

  useEffect(() => {
    params.then((resolvedParams) => {
      setCurso(resolvedParams.curso);
      setAsignatura(resolvedParams.asignatura);
    });
  }, [params]);

  if (!curso || !asignatura) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-gray-500">Cargando información asignatura...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Curso: {nombreCurso || curso}</h1>
      <h2 className="text-xl font-semibold mb-6">
        Asignatura: {nombreAsignatura || asignatura}
      </h2>

      {/* Pestañas - Mejoradas para responsividad */}
      <div className="relative mb-6">
        <div className="flex overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 pb-2 border-b">
          <button
            className={`py-2 px-4 whitespace-nowrap flex-shrink-0 ${
              activeTab === "material"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("material")}
          >
            Materiales
          </button>
          <button
            className={`py-2 px-4 whitespace-nowrap flex-shrink-0 ${
              activeTab === "calificaciones"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("calificaciones")}
          >
            Calificaciones
          </button>
          <button
            className={`py-2 px-4 whitespace-nowrap flex-shrink-0 ${
              activeTab === "tareas"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("tareas")}
          >
            Tareas
          </button>
          <button
            className={`py-2 px-4 whitespace-nowrap flex-shrink-0 ${
              activeTab === "asistencias"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("asistencias")}
          >
            Asistencias
          </button>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white pointer-events-none"></div>
      </div>

      {/* Contenido de las pestañas */}
      <div>
        {activeTab === "material" && (
          <Material cursoId={curso} asignaturaId={asignatura} />
        )}
        {activeTab === "calificaciones" && (
          <Calificaciones cursoId={curso} asignaturaId={asignatura} />
        )}
        {activeTab === "tareas" && (
          <Tareas cursoId={curso} asignaturaId={asignatura} />
        )}
        {activeTab === "asistencias" && (
          <Asistencias cursoId={curso} asignaturaId={asignatura} />
        )}
      </div>
    </div>
  );
};

export default AsignaturaPage;
