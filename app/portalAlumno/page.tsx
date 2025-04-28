"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/app/components/ProtectedRoute";

interface Asignatura {
  id_asignatura: string;
  nombre_asignatura: string;
}

interface AsignaturaResumen {
  id_asignatura: string;
  nombre_asignatura: string;
  promedio_calificaciones: number | null;
  porcentaje_asistencia: number | null;
  tiene_evaluaciones: boolean;
  tiene_asistencia: boolean;
}

interface UserData {
  cursoAlumno: {
    id_curso: string;
    nombre_curso: string;
    enlace_grupo_wsp: string;
  };
}

const PortalAlumno = () => {
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  const [resumenAsignaturas, setResumenAsignaturas] = useState<
    AsignaturaResumen[]
  >([]);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [promedioGeneral, setPromedioGeneral] = useState<number | null>(null);
  const [asistenciaGeneral, setAsistenciaGeneral] = useState<number | null>(
    null
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cursoResponse = await fetch("/api/estudiante/curso");
        const cursoData = await cursoResponse.json();

        if (cursoData.success) {
          setUserData({
            cursoAlumno: {
              id_curso: cursoData.data.cursoAlumno.id_curso,
              nombre_curso: cursoData.data.cursoAlumno.nombre_curso,
              enlace_grupo_wsp:
                cursoData.data.cursoAlumno.enlace_grupo_wsp || "",
            },
          });

          const asignaturasData = cursoData.data.asignaturas || [];
          setAsignaturas(asignaturasData);

          if (asignaturasData.length > 0) {
            const resumenPromises = asignaturasData.map(
              async (asignatura: Asignatura) => {
                const asistenciaResponse = await fetch(
                  `/api/estudiante/asistencia/resumen?cursoId=${cursoData.data.cursoAlumno.id_curso}&asignaturaId=${asignatura.id_asignatura}`
                );
                const asistenciaData = await asistenciaResponse.json();

                const calificacionesResponse = await fetch(
                  `/api/estudiante/calificaciones/resumen?asignaturaId=${asignatura.id_asignatura}`
                );
                const calificacionesData = await calificacionesResponse.json();

                return {
                  id_asignatura: asignatura.id_asignatura,
                  nombre_asignatura: asignatura.nombre_asignatura,
                  promedio_calificaciones: calificacionesData.success
                    ? calificacionesData.promedio
                    : null,
                  porcentaje_asistencia: asistenciaData.success
                    ? asistenciaData.porcentaje
                    : null,
                  tiene_evaluaciones:
                    calificacionesData.success &&
                    calificacionesData.tieneEvaluaciones,
                  tiene_asistencia:
                    asistenciaData.success && asistenciaData.tieneRegistros,
                };
              }
            );

            const resumenData = await Promise.all(resumenPromises);
            setResumenAsignaturas(resumenData);

            // Calculate overall averages only from subjects with data
            const asignaturasConNotas = resumenData.filter(
              (asignatura) =>
                asignatura.tiene_evaluaciones &&
                asignatura.promedio_calificaciones !== null
            );

            const asignaturasConAsistencia = resumenData.filter(
              (asignatura) =>
                asignatura.tiene_asistencia &&
                asignatura.porcentaje_asistencia !== null
            );

            if (asignaturasConNotas.length > 0) {
              const sumaPromedios = asignaturasConNotas.reduce(
                (sum, asignatura) =>
                  sum + (asignatura.promedio_calificaciones || 0),
                0
              );
              setPromedioGeneral(sumaPromedios / asignaturasConNotas.length);
            }

            if (asignaturasConAsistencia.length > 0) {
              const sumaAsistencias = asignaturasConAsistencia.reduce(
                (sum, asignatura) =>
                  sum + (asignatura.porcentaje_asistencia || 0),
                0
              );
              setAsistenciaGeneral(
                sumaAsistencias / asignaturasConAsistencia.length
              );
            }
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-gray-500">Cargando información del curso...</div>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["Estudiante", "Apoderado"]}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Portal del Alumno</h1>
        {userData && (
          <div className="mb-6">
            <h2 className="text-xl mb-2">
              Curso: {userData.cursoAlumno.nombre_curso}
            </h2>
            {userData.cursoAlumno.enlace_grupo_wsp ? (
              <div className="mt-2">
                <a
                  href={userData.cursoAlumno.enlace_grupo_wsp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-green-600 hover:text-green-800 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-1"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Grupo de WhatsApp del curso
                </a>
              </div>
            ) : (
              <div className="mt-2 text-gray-500 text-sm italic">
                No hay grupo de WhatsApp asociado a este curso
              </div>
            )}
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Mis Asignaturas</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {asignaturas.map((asignatura) => (
              <div
                className="bg-white p-4 rounded-lg shadow"
                key={asignatura.id_asignatura}
              >
                <h3 className="font-semibold">
                  {asignatura.nombre_asignatura}
                </h3>
                <a
                  href={`/portalAlumno/${
                    asignatura.id_asignatura
                  }?nombre=${encodeURIComponent(
                    asignatura.nombre_asignatura
                  )}&cursoId=${userData?.cursoAlumno.id_curso}`}
                  className="text-blue-600 hover:underline text-sm"
                >
                  Ver asignatura
                </a>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Resumen Académico</h2>
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Asignatura
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Promedio Calificaciones
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Porcentaje Asistencia
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {resumenAsignaturas.map((asignatura) => (
                  <tr key={asignatura.id_asignatura}>
                    <td className="px-4 sm:px-6 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {asignatura.nombre_asignatura}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-center">
                      {asignatura.tiene_evaluaciones ? (
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            (asignatura.promedio_calificaciones || 0) >= 4
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {asignatura.promedio_calificaciones !== null
                            ? asignatura.promedio_calificaciones.toFixed(1)
                            : "0.0"}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500">
                          Sin evaluaciones
                        </span>
                      )}
                    </td>
                    <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-center">
                      {asignatura.tiene_asistencia ? (
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            (asignatura.porcentaje_asistencia || 0) >= 85
                              ? "bg-green-100 text-green-800"
                              : (asignatura.porcentaje_asistencia || 0) >= 75
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {asignatura.porcentaje_asistencia !== null
                            ? asignatura.porcentaje_asistencia.toFixed(1)
                            : "0.0"}
                          %
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500">
                          Sin registros
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-50 font-semibold">
                  <td className="px-4 sm:px-6 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      PROMEDIO GENERAL
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-center">
                    {promedioGeneral !== null ? (
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-bold ${
                          promedioGeneral >= 4
                            ? "bg-green-200 text-green-800"
                            : "bg-red-200 text-red-800"
                        }`}
                      >
                        {promedioGeneral.toFixed(1)}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-500">Sin datos</span>
                    )}
                  </td>
                  <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-center">
                    {asistenciaGeneral !== null ? (
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-bold ${
                          asistenciaGeneral >= 85
                            ? "bg-green-200 text-green-800"
                            : asistenciaGeneral >= 75
                            ? "bg-yellow-200 text-yellow-800"
                            : "bg-red-200 text-red-800"
                        }`}
                      >
                        {asistenciaGeneral.toFixed(1)}%
                      </span>
                    ) : (
                      <span className="text-sm text-gray-500">Sin datos</span>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default PortalAlumno;
