"use client";
import { useState, useEffect } from "react";
import React from "react";

import { useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";

interface AsignaturaEstudiante {
  id_asignatura: string;
  nombre_asignatura: string;
  promedio: number | null;
  porcentaje_asistencia: number | null;
}

interface Estudiante {
  rut_usuario: string;
  nombres: string;
  apellidos: string;
  promedio_general: number | null;
  porcentaje_asistencia: number | null;
  asignaturas?: AsignaturaEstudiante[];
}

interface AsignaturaResumen {
  id_asignatura: string;
  nombre_asignatura: string;
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
  const [asignaturas, setAsignaturas] = useState<AsignaturaResumen[]>([]);
  const [loading, setLoading] = useState(true);
  const [curso, setCurso] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const nombreCurso = searchParams.get("nombreCurso");
  const [cursoInfo, setCursoInfo] = useState<CursoInfo | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [enlaceGrupo, setEnlaceGrupo] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [expandedEstudiante, setExpandedEstudiante] = useState<string | null>(
    null
  );
  const [showAsignaturas, setShowAsignaturas] = useState(true);

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
        setEnlaceGrupo(data.curso.enlace_grupo_wsp || "");
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
        setAsignaturas(data.asignaturas || []);
      }
    } catch (error) {
      console.error("Error al obtener estudiantes:", error);
      toast.error("Error al cargar los datos de los estudiantes");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEnlace = async () => {
    if (!curso) return;

    setIsSaving(true);
    try {
      const response = await fetch("/api/curso", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_curso: curso,
          nombre_curso: cursoInfo?.nombre_curso || "",
          enlace_grupo_wsp: enlaceGrupo,
          asignaturas: [], // Mantenemos las asignaturas existentes
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Enlace de grupo actualizado correctamente");
        setIsEditing(false);
        // Actualizar la información del curso
        if (cursoInfo) {
          setCursoInfo({
            ...cursoInfo,
            enlace_grupo_wsp: enlaceGrupo,
          });
        }
      } else {
        toast.error("Error al actualizar el enlace del grupo");
      }
    } catch (error) {
      console.error("Error al actualizar el enlace:", error);
      toast.error("Error al actualizar el enlace del grupo");
    } finally {
      setIsSaving(false);
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

  const toggleEstudiante = (rut: string) => {
    if (expandedEstudiante === rut) {
      setExpandedEstudiante(null);
    } else {
      setExpandedEstudiante(rut);
    }
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

      {/* Sección de Grupo de WhatsApp */}
      <div className="mb-6 bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
        <h2 className="text-xl font-semibold mb-2 text-blue-700">
          Grupo de WhatsApp
        </h2>
        {isEditing ? (
          <div className="flex flex-col space-y-3">
            <input
              type="text"
              value={enlaceGrupo}
              onChange={(e) => setEnlaceGrupo(e.target.value)}
              placeholder="https://chat.whatsapp.com/..."
              className="border rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <div className="flex space-x-2">
              <button
                onClick={handleSaveEnlace}
                disabled={isSaving}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors duration-200 flex items-center justify-center"
              >
                {isSaving ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Guardando...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                    Guardar
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEnlaceGrupo(cursoInfo?.enlace_grupo_wsp || "");
                }}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded transition-colors duration-200 flex items-center justify-center"
              >
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center">
            {cursoInfo?.enlace_grupo_wsp ? (
              <>
                <a
                  href={cursoInfo.enlace_grupo_wsp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-800 flex items-center mr-3 transition-colors duration-200 sm:text-sm md:text-lg"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Enlace grupo
                </a>
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-md text-sm font-medium flex items-center transition-colors duration-200"
                >
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    ></path>
                  </svg>
                  Editar
                </button>
              </>
            ) : (
              <>
                <span className="text-gray-500 mr-3">
                  No hay grupo de WhatsApp asociado a este curso
                </span>
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1 rounded-md text-sm font-medium flex items-center transition-colors duration-200"
                >
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    ></path>
                  </svg>
                  Agregar
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Sección de Estadísticas Generales */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">
          Estadísticas Generales
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-lg shadow border-t-4 border-blue-500">
            <h3 className="text-lg font-semibold mb-2">Total Estudiantes</h3>
            <p className="text-3xl font-bold text-blue-600">
              {estudiantes.length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border-t-4 border-green-500">
            <h3 className="text-lg font-semibold mb-2">
              Promedio General Curso
            </h3>
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
          <div className="bg-white p-6 rounded-lg shadow border-t-4 border-yellow-500">
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
      </div>

      {/* Sección de Resumen por Asignatura */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">
          Detalle por Asignatura
        </h2>
        <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
          <div
            className="flex items-center justify-between p-4 bg-indigo-50 border-b border-indigo-200 cursor-pointer"
            onClick={() => setShowAsignaturas(!showAsignaturas)}
          >
            <h2 className="text-lg font-medium text-indigo-800">
              Resumen por Asignatura
            </h2>
            <button className="text-indigo-600 hover:text-indigo-800">
              {showAsignaturas ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 15l7-7 7 7"
                  ></path>
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              )}
            </button>
          </div>

          {showAsignaturas && (
            <div className="p-6">
              {asignaturas.length > 0 ? (
                <div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Asignatura
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Promedio
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Asistencia
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {asignaturas.map((asignatura) => (
                          <tr
                            key={asignatura.id_asignatura}
                            className="hover:bg-gray-50"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {asignatura.nombre_asignatura}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              {asignatura.promedio_general !== null ? (
                                <span
                                  className={`px-2 py-1 rounded-full text-xs ${
                                    asignatura.promedio_general >= 4
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {asignatura.promedio_general.toFixed(1)}
                                </span>
                              ) : (
                                <span className="text-xs text-gray-500">
                                  Sin notas
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              {asignatura.porcentaje_asistencia !== null ? (
                                <span
                                  className={`px-2 py-1 rounded-full text-xs ${
                                    asignatura.porcentaje_asistencia >= 85
                                      ? "bg-green-100 text-green-800"
                                      : asignatura.porcentaje_asistencia >= 75
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {asignatura.porcentaje_asistencia.toFixed(1)}%
                                </span>
                              ) : (
                                <span className="text-xs text-gray-500">
                                  Sin registros
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-4">
                  No hay asignaturas registradas para este curso
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sección de Listado de Estudiantes */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">
          Listado de Estudiantes
        </h2>
        <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
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
                  <React.Fragment key={estudiante.rut_usuario}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {estudiante.nombres} {estudiante.apellidos}
                            </div>
                            <div className="text-sm text-gray-500">
                              {estudiante.rut_usuario}
                            </div>
                          </div>
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
                          <span className="text-xs text-gray-500">
                            Sin notas
                          </span>
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
                        <div className="flex items-center justify-center space-x-3">
                          <button
                            onClick={() =>
                              toggleEstudiante(estudiante.rut_usuario)
                            }
                            className="text-indigo-600 hover:text-indigo-900 focus:outline-none flex items-center"
                            title="Ver detalle de asignaturas"
                          >
                            <span className="mr-1 text-xs">Ver detalle</span>
                            {expandedEstudiante === estudiante.rut_usuario ? (
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M5 15l7-7 7 7"
                                ></path>
                              </svg>
                            ) : (
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M19 9l-7 7-7-7"
                                ></path>
                              </svg>
                            )}
                          </button>
                          <a
                            href={`/perfil/${estudiante.rut_usuario}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 hover:underline text-xs"
                          >
                            Ver perfil
                          </a>
                        </div>
                      </td>
                    </tr>
                    {expandedEstudiante === estudiante.rut_usuario &&
                      estudiante.asignaturas &&
                      estudiante.asignaturas.length > 0 && (
                        <tr>
                          <td colSpan={4} className="px-6 py-1 bg-gray-50">
                            <div className="border-t border-gray-200 pt-1">
                              <h4 className="text-sm font-medium text-gray-900 mb-2">
                                Detalle por Asignatura
                              </h4>
                              <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                  <thead className="bg-gray-100">
                                    <tr>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Asignatura
                                      </th>
                                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Promedio
                                      </th>
                                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Asistencia
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-gray-200">
                                    {estudiante.asignaturas.map(
                                      (asignatura) => (
                                        <tr
                                          key={asignatura.id_asignatura}
                                          className="hover:bg-gray-50"
                                        >
                                          <td className="px-4 py-2 whitespace-nowrap">
                                            <div className="text-xs font-medium text-gray-900">
                                              {asignatura.nombre_asignatura}
                                            </div>
                                          </td>
                                          <td className="px-4 py-2 whitespace-nowrap text-center">
                                            {asignatura.promedio !== null ? (
                                              <span
                                                className={`px-2 py-1 rounded-full text-xs ${
                                                  asignatura.promedio >= 4
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-red-100 text-red-800"
                                                }`}
                                              >
                                                {asignatura.promedio.toFixed(1)}
                                              </span>
                                            ) : (
                                              <span className="text-xs text-gray-500">
                                                Sin notas
                                              </span>
                                            )}
                                          </td>
                                          <td className="px-4 py-2 whitespace-nowrap text-center">
                                            {asignatura.porcentaje_asistencia !==
                                            null ? (
                                              <span
                                                className={`px-2 py-1 rounded-full text-xs ${
                                                  asignatura.porcentaje_asistencia >=
                                                  85
                                                    ? "bg-green-100 text-green-800"
                                                    : asignatura.porcentaje_asistencia >=
                                                      75
                                                    ? "bg-yellow-100 text-yellow-800"
                                                    : "bg-red-100 text-red-800"
                                                }`}
                                              >
                                                {asignatura.porcentaje_asistencia.toFixed(
                                                  1
                                                )}
                                                %
                                              </span>
                                            ) : (
                                              <span className="text-xs text-gray-500">
                                                Sin registros
                                              </span>
                                            )}
                                          </td>
                                        </tr>
                                      )
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortalDocentePage;
