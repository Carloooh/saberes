// "use client";
// import { useState, useEffect } from "react";
// import { useSearchParams } from "next/navigation";
// import { toast } from "react-hot-toast";

// interface Estudiante {
//   rut_usuario: string;
//   nombres: string;
//   apellidos: string;
//   promedio_general: number | null;
//   porcentaje_asistencia: number | null;
// }

// const PortalDocentePage = ({
//   params,
// }: {
//   params: Promise<{ curso: string }>;
// }) => {
//   const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [curso, setCurso] = useState<string | null>(null);
//   const searchParams = useSearchParams();
//   const nombreCurso = searchParams.get("nombreCurso");

//   useEffect(() => {
//     params.then((resolvedParams) => {
//       setCurso(resolvedParams.curso);
//     });
//   }, [params]);

//   useEffect(() => {
//     if (curso) {
//       fetchEstudiantes();
//     }
//   }, [curso]);

//   const fetchEstudiantes = async () => {
//     try {
//       const response = await fetch(
//         `/api/docente/estudiantes/resumen?cursoId=${curso}`
//       );
//       const data = await response.json();
//       if (data.success) {
//         setEstudiantes(data.estudiantes);
//       }
//     } catch (error) {
//       console.error("Error al obtener estudiantes:", error);
//       toast.error("Error al cargar los datos de los estudiantes");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center p-8">
//         <div className="text-gray-500">Cargando información del curso...</div>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <h1 className="text-2xl font-bold mb-6">
//         Curso: {nombreCurso || "Curso"}
//       </h1>

//       <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
//         <div className="bg-white p-6 rounded-lg shadow">
//           <h3 className="text-lg font-semibold mb-2">Total Estudiantes</h3>
//           <p className="text-3xl font-bold text-blue-600">
//             {estudiantes.length}
//           </p>
//         </div>
//         <div className="bg-white p-6 rounded-lg shadow">
//           <h3 className="text-lg font-semibold mb-2">Promedio General Curso</h3>
//           <p className="text-3xl font-bold text-blue-600">
//             {estudiantes.length > 0
//               ? (
//                   estudiantes.reduce(
//                     (sum, est) => sum + (est.promedio_general || 0),
//                     0
//                   ) / estudiantes.length
//                 ).toFixed(1)
//               : "Sin datos"}
//           </p>
//         </div>
//         <div className="bg-white p-6 rounded-lg shadow">
//           <h3 className="text-lg font-semibold mb-2">
//             Asistencia General Curso
//           </h3>
//           <p className="text-3xl font-bold text-blue-600">
//             {estudiantes.length > 0
//               ? (
//                   estudiantes.reduce(
//                     (sum, est) => sum + (est.porcentaje_asistencia || 0),
//                     0
//                   ) / estudiantes.length
//                 ).toFixed(1) + "%"
//               : "Sin datos"}
//           </p>
//         </div>
//       </div>

//       <div className="bg-white rounded-lg shadow overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Estudiante
//                 </th>
//                 <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Promedio General
//                 </th>
//                 <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Asistencia
//                 </th>
//                 <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Acciones
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {estudiantes.map((estudiante) => (
//                 <tr key={estudiante.rut_usuario} className="hover:bg-gray-50">
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="text-sm font-medium text-gray-900">
//                       {estudiante.nombres} {estudiante.apellidos}
//                     </div>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-center">
//                     {estudiante.promedio_general !== null ? (
//                       <span
//                         className={`px-2 py-1 rounded-full text-xs ${
//                           estudiante.promedio_general >= 4
//                             ? "bg-green-100 text-green-800"
//                             : "bg-red-100 text-red-800"
//                         }`}
//                       >
//                         {estudiante.promedio_general.toFixed(1)}
//                       </span>
//                     ) : (
//                       <span className="text-xs text-gray-500">Sin notas</span>
//                     )}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-center">
//                     {estudiante.porcentaje_asistencia !== null ? (
//                       <span
//                         className={`px-2 py-1 rounded-full text-xs ${
//                           estudiante.porcentaje_asistencia >= 85
//                             ? "bg-green-100 text-green-800"
//                             : estudiante.porcentaje_asistencia >= 75
//                             ? "bg-yellow-100 text-yellow-800"
//                             : "bg-red-100 text-red-800"
//                         }`}
//                       >
//                         {estudiante.porcentaje_asistencia.toFixed(1)}%
//                       </span>
//                     ) : (
//                       <span className="text-xs text-gray-500">
//                         Sin registros
//                       </span>
//                     )}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-center">
//                     <a
//                       href={`/perfil/${estudiante.rut_usuario}`}
//                       className="text-blue-600 hover:text-blue-800 hover:underline"
//                     >
//                       Ver perfil
//                     </a>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PortalDocentePage;

"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";

interface Estudiante {
  rut_usuario: string;
  nombres: string;
  apellidos: string;
  promedio_general: number | null;
  porcentaje_asistencia: number | null;
}

const PortalDocentePage = ({
  params,
}: {
  params: Promise<{ curso: string }>;
}) => {
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [loading, setLoading] = useState(true);
  const [curso, setCurso] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const nombreCurso = searchParams.get("nombreCurso");

  useEffect(() => {
    params.then((resolvedParams) => {
      setCurso(resolvedParams.curso);
    });
  }, [params]);

  useEffect(() => {
    if (curso) {
      fetchEstudiantes();
    }
  }, [curso]);

  const fetchEstudiantes = async () => {
    try {
      const response = await fetch(
        `/api/docente/estudiantes/resumen?cursoId=${curso}`
      );
      const data = await response.json();
      if (data.success) {
        setEstudiantes(data.estudiantes);
      }
    } catch (error) {
      console.error("Error al obtener estudiantes:", error);
      toast.error("Error al cargar los datos de los estudiantes");
    } finally {
      setLoading(false);
    }
  };

  const calculateCourseAverages = () => {
    const validGrades = estudiantes.filter(
      (est) => est.promedio_general !== null
    );
    const validAttendance = estudiantes.filter(
      (est) => est.porcentaje_asistencia !== null
    );

    const promedioGeneral =
      validGrades.length > 0
        ? validGrades.reduce(
            (sum, est) => sum + (est.promedio_general || 0),
            0
          ) / validGrades.length
        : null;

    const asistenciaGeneral =
      validAttendance.length > 0
        ? validAttendance.reduce(
            (sum, est) => sum + (est.porcentaje_asistencia || 0),
            0
          ) / validAttendance.length
        : null;

    return { promedioGeneral, asistenciaGeneral };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-gray-500">Cargando información del curso...</div>
      </div>
    );
  }

  const { promedioGeneral, asistenciaGeneral } = calculateCourseAverages();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        Curso: {nombreCurso || "Curso"}
      </h1>

      <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Total Estudiantes</h3>
          <p className="text-3xl font-bold text-blue-600">
            {estudiantes.length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Promedio General Curso</h3>
          <p
            className={`text-3xl font-bold ${
              promedioGeneral !== null
                ? promedioGeneral >= 4
                  ? "text-green-600"
                  : "text-red-600"
                : "text-gray-500"
            }`}
          >
            {promedioGeneral !== null
              ? promedioGeneral.toFixed(1)
              : "Sin datos"}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">
            Asistencia General Curso
          </h3>
          <p
            className={`text-3xl font-bold ${
              asistenciaGeneral !== null
                ? asistenciaGeneral >= 85
                  ? "text-green-600"
                  : asistenciaGeneral >= 75
                  ? "text-yellow-600"
                  : "text-red-600"
                : "text-gray-500"
            }`}
          >
            {asistenciaGeneral !== null
              ? asistenciaGeneral.toFixed(1) + "%"
              : "Sin datos"}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estudiante
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Promedio General
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Asistencia
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {estudiantes.map((estudiante) => (
                <tr key={estudiante.rut_usuario} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {estudiante.nombres} {estudiante.apellidos}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {estudiante.promedio_general !== null ? (
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          estudiante.promedio_general >= 4
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {estudiante.promedio_general.toFixed(1)}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-500">Sin notas</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {estudiante.porcentaje_asistencia !== null ? (
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          estudiante.porcentaje_asistencia >= 85
                            ? "bg-green-100 text-green-800"
                            : estudiante.porcentaje_asistencia >= 75
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {estudiante.porcentaje_asistencia.toFixed(1)}%
                      </span>
                    ) : (
                      <span className="text-xs text-gray-500">
                        Sin registros
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <a
                      href={`/perfil/${estudiante.rut_usuario}`}
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      Ver perfil
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PortalDocentePage;
