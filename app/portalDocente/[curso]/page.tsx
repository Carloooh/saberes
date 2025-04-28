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

interface CursoInfo {
  id_curso: string;
  nombre_curso: string;
  enlace_grupo_wsp: string;
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
  const [cursoInfo, setCursoInfo] = useState<CursoInfo | null>(null);

  useEffect(() => {
    params.then((resolvedParams) => {
      setCurso(resolvedParams.curso);
    });
  }, [params]);

  useEffect(() => {
    if (curso) {
      fetchEstudiantes();
      fetchCursoInfo();
    }
  }, [curso]);

  const fetchCursoInfo = async () => {
    try {
      const response = await fetch(`/api/curso?cursoId=${curso}`);
      const data = await response.json();
      if (data.success) {
        setCursoInfo(data.curso);
      }
    } catch (error) {
      console.error("Error al obtener información del curso:", error);
    }
  };

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

      {cursoInfo?.enlace_grupo_wsp ? (
        <a
          href={cursoInfo.enlace_grupo_wsp}
          target="_blank"
          rel="noopener noreferrer"
          className="text-green-600 hover:text-green-800 flex items-center mb-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Grupo de WhatsApp
        </a>
      ) : (
        <span className="text-gray-500 mb-2">
          No hay grupo de WhatsApp asociado a este curso
        </span>
      )}

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
