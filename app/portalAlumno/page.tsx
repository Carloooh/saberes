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
          <h2 className="text-xl mb-6">
            Curso: {userData.cursoAlumno.nombre_curso}
          </h2>
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
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Asignatura
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Promedio Calificaciones
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Porcentaje Asistencia
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {resumenAsignaturas.map((asignatura) => (
                  <tr key={asignatura.id_asignatura}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {asignatura.nombre_asignatura}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
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
                    <td className="px-6 py-4 whitespace-nowrap text-center">
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      PROMEDIO GENERAL
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
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
                  <td className="px-6 py-4 whitespace-nowrap text-center">
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
