"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale/es";
import toast from "react-hot-toast";

interface Estudiante {
  rut_usuario: string;
  nombres: string;
  apellidos: string;
}

interface Asistencia {
  id_asistencia: string;
  rut_usuario: string;
  asistencia: number;
  justificacion?: string;
}

interface DiaAsistencia {
  id_dia: string;
  fecha: string;
}

interface AsistenciasProps {
  cursoId: string;
  asignaturaId: string;
}

export default function Asistencias({
  cursoId,
  asignaturaId,
}: AsistenciasProps) {
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [dias, setDias] = useState<DiaAsistencia[]>([]);
  const [selectedDia, setSelectedDia] = useState<string | null>(null);
  const [asistencias, setAsistencias] = useState<Record<string, number>>({});
  const [justificaciones, setJustificaciones] = useState<
    Record<string, string>
  >({});
  const [loading, setLoading] = useState(true);
  const [newFecha, setNewFecha] = useState("");
  const [savingAttendance, setSavingAttendance] = useState<string | null>(null);
  const [deletingDay, setDeletingDay] = useState(false);

  useEffect(() => {
    if (cursoId && asignaturaId) {
      fetchEstudiantes();
      fetchDias();
    }
  }, [cursoId, asignaturaId]);

  useEffect(() => {
    if (selectedDia) {
      fetchAsistencias(selectedDia);
    }
  }, [selectedDia]);

  const fetchEstudiantes = async () => {
    try {
      const response = await fetch(`/api/docente/estudiantes?curso=${cursoId}`);
      const data = await response.json();
      if (data.success) {
        setEstudiantes(data.estudiantes);
      }
    } catch (error) {
      console.error("Error al obtener estudiantes:", error);
      toast.error("Error al cargar estudiantes");
    }
  };

  const eliminarDia = async (diaId: string) => {
    if (!confirm("¿Está seguro de eliminar este día y todos sus registros?"))
      return;

    try {
      setDeletingDay(true);
      const response = await fetch(
        `/api/docente/dias-asistencia?dia=${diaId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setSelectedDia(null);
        fetchDias();
        toast.success("Día eliminado correctamente");
      }
    } catch (error) {
      console.error("Error al eliminar día:", error);
      toast.error("Error al eliminar día");
    } finally {
      setDeletingDay(false);
    }
  };

  const fetchDias = async () => {
    try {
      const response = await fetch(
        `/api/docente/dias-asistencia?curso=${cursoId}&asignatura=${asignaturaId}`
      );
      const data = await response.json();
      if (data.success) {
        setDias(data.dias);
      }
    } catch (error) {
      console.error("Error al obtener días de asistencia:", error);
      toast.error("Error al cargar días de asistencia");
    }
  };

  const fetchAsistencias = async (diaId: string) => {
    try {
      const response = await fetch(`/api/docente/asistencias?dia=${diaId}`);
      const data = await response.json();
      if (data.success) {
        const asistenciasMap = data.asistencias.reduce(
          (acc: Record<string, number>, curr: Asistencia) => {
            acc[curr.rut_usuario] = curr.asistencia;
            return acc;
          },
          {}
        );

        const justificacionesMap = data.asistencias.reduce(
          (acc: Record<string, string>, curr: Asistencia) => {
            if (curr.justificacion) {
              acc[curr.rut_usuario] = curr.justificacion;
            }
            return acc;
          },
          {}
        );

        setAsistencias(asistenciasMap);
        setJustificaciones(justificacionesMap);
      }
    } catch (error) {
      console.error("Error al obtener asistencias:", error);
      toast.error("Error al cargar asistencias");
    } finally {
      setLoading(false);
    }
  };

  const guardarAsistencia = async (
    rutEstudiante: string,
    estado: number,
    justificacion?: string
  ) => {
    try {
      setSavingAttendance(rutEstudiante);
      const response = await fetch("/api/docente/asistencias", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dia: selectedDia,
          rut_usuario: rutEstudiante,
          asistencia: estado,
          id_curso: cursoId,
          id_asignatura: asignaturaId,
          justificacion: estado === 2 ? justificacion : null,
        }),
      });

      if (response.ok) {
        // Actualizar el estado local
        setAsistencias((prev) => ({
          ...prev,
          [rutEstudiante]: estado,
        }));

        setJustificaciones((prev) => {
          const newJustificaciones = { ...prev };
          if (estado === 2 && justificacion) {
            newJustificaciones[rutEstudiante] = justificacion;
          } else {
            delete newJustificaciones[rutEstudiante];
          }
          return newJustificaciones;
        });

        toast.success("Asistencia guardada");
      } else {
        toast.error("Error al guardar asistencia");
      }
    } catch (error) {
      console.error("Error al guardar asistencia:", error);
      toast.error("Error al guardar asistencia");
    } finally {
      setSavingAttendance(null);
    }
  };

  // Reemplazar la función handleJustificacion existente con esta:
  const handleJustificacion = (rutEstudiante: string) => {
    // Marcar como justificado y dejar que el usuario edite la justificación en la tabla
    guardarAsistencia(rutEstudiante, 2, justificaciones[rutEstudiante] || "");
  };

  const agregarDia = async () => {
    if (!newFecha) {
      toast.error("Seleccione una fecha");
      return;
    }

    try {
      const response = await fetch("/api/docente/dias-asistencia", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          curso: cursoId,
          asignatura: asignaturaId,
          fecha: newFecha,
        }),
      });

      if (response.ok) {
        fetchDias();
        setNewFecha("");
        toast.success("Día agregado correctamente");
      } else {
        toast.error("Error al agregar día");
      }
    } catch (error) {
      console.error("Error al agregar día:", error);
      toast.error("Error al agregar día");
    }
  };

  return (
    <div className="container mx-auto px-4 max-w-6xl">
      <div className="mb-4 sm:mb-6 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow">
          <h3 className="text-sm sm:text-base font-semibold mb-1">
            Total Estudiantes
          </h3>
          <p className="text-xl sm:text-2xl font-bold text-blue-600">
            {estudiantes.length}
          </p>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow">
          <h3 className="text-sm sm:text-base font-semibold mb-1">
            Días Registrados
          </h3>
          <p className="text-xl sm:text-2xl font-bold text-blue-600">
            {dias.length}
          </p>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow">
          <h3 className="text-sm sm:text-base font-semibold mb-1">
            Último Registro
          </h3>
          <p className="text-sm sm:text-base text-blue-600 truncate">
            {dias.length > 0
              ? format(new Date(dias[0].fecha + "T00:00:00"), "d MMM yyyy", {
                  locale: es,
                })
              : "Sin registros"}
          </p>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow">
          <h3 className="text-sm sm:text-base font-semibold mb-1">
            Agregar Día
          </h3>
          <div className="flex gap-1 sm:gap-2">
            <input
              type="date"
              value={newFecha}
              onChange={(e) => setNewFecha(e.target.value)}
              className="border rounded px-2 py-1 text-sm flex-1"
            />
            <button
              onClick={agregarDia}
              className="px-2 py-1 sm:px-3 sm:py-2 border-2 border-blue-500 text-blue-500 bg-white rounded hover:bg-blue-500 hover:text-white disabled:opacity-50 transition-colors"
              disabled={!newFecha}
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-3 sm:p-6">
        <div className="mb-4 sm:mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seleccionar día para tomar asistencia
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={selectedDia || ""}
              onChange={(e) => setSelectedDia(e.target.value)}
              className="border rounded px-3 py-2 w-full md:w-64"
            >
              <option value="">Seleccione un día</option>
              {dias &&
                dias.map((dia) => (
                  <option key={dia.id_dia} value={dia.id_dia}>
                    {format(
                      new Date(dia.fecha + "T00:00:00"),
                      "d 'de' MMMM 'de' yyyy",
                      {
                        locale: es,
                      }
                    )}
                  </option>
                ))}
            </select>
            {selectedDia && (
              <button
                onClick={() => eliminarDia(selectedDia)}
                disabled={deletingDay}
                className="px-3 py-2 border-2 border-red-500 text-red-500 bg-white rounded hover:bg-red-500 hover:text-white disabled:opacity-50 transition-colors"
              >
                {deletingDay ? "Eliminando..." : "Eliminar día"}
              </button>
            )}
          </div>
        </div>

        {selectedDia ? (
          estudiantes.length > 0 ? (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <div className="overflow-hidden border border-gray-200 sm:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 sm:px-4 md:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estudiante
                        </th>
                        <th className="px-3 py-2 sm:px-4 md:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-3 py-2 sm:px-4 md:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                        <th className="px-3 py-2 sm:px-4 md:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Justificación
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {estudiantes.map((estudiante) => (
                        <tr
                          key={estudiante.rut_usuario}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-3 py-2 sm:px-4 md:px-6 sm:py-3 whitespace-normal sm:whitespace-nowrap">
                            <div className="text-xs sm:text-sm font-medium text-gray-900">
                              {estudiante.nombres} {estudiante.apellidos}
                            </div>
                          </td>
                          <td className="px-3 py-2 sm:px-4 md:px-6 sm:py-3 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                asistencias[estudiante.rut_usuario] === 1
                                  ? "bg-green-500 text-white"
                                  : asistencias[estudiante.rut_usuario] === 2
                                  ? "bg-yellow-500 text-white"
                                  : "bg-red-500 text-white"
                              }`}
                            >
                              {asistencias[estudiante.rut_usuario] === 1
                                ? "Presente"
                                : asistencias[estudiante.rut_usuario] === 2
                                ? "Justificado"
                                : "Ausente"}
                            </span>
                          </td>
                          <td className="px-3 py-2 sm:px-4 md:px-6 sm:py-3 whitespace-nowrap text-xs sm:text-sm font-medium">
                            <div className="flex gap-1 sm:gap-2">
                              <button
                                onClick={() =>
                                  guardarAsistencia(estudiante.rut_usuario, 1)
                                }
                                className={`px-2 sm:px-3 py-1 rounded transition-colors ${
                                  asistencias[estudiante.rut_usuario] === 1
                                    ? "bg-green-500 text-white border-2 border-green-500"
                                    : "bg-white text-green-700 border-2 border-green-500 hover:bg-green-500 hover:text-white"
                                }`}
                                disabled={
                                  savingAttendance === estudiante.rut_usuario
                                }
                              >
                                {savingAttendance === estudiante.rut_usuario
                                  ? "..."
                                  : "P"}
                              </button>
                              <button
                                onClick={() =>
                                  guardarAsistencia(estudiante.rut_usuario, 0)
                                }
                                className={`px-2 sm:px-3 py-1 rounded transition-colors ${
                                  asistencias[estudiante.rut_usuario] === 0
                                    ? "bg-red-500 text-white border-2 border-red-500"
                                    : "bg-white text-red-700 border-2 border-red-500 hover:bg-red-500 hover:text-white"
                                }`}
                                disabled={
                                  savingAttendance === estudiante.rut_usuario
                                }
                              >
                                {savingAttendance === estudiante.rut_usuario
                                  ? "..."
                                  : "A"}
                              </button>
                              <button
                                onClick={() =>
                                  handleJustificacion(estudiante.rut_usuario)
                                }
                                className={`px-2 sm:px-3 py-1 rounded transition-colors ${
                                  asistencias[estudiante.rut_usuario] === 2
                                    ? "bg-yellow-500 text-white border-2 border-yellow-500"
                                    : "bg-white text-yellow-700 border-2 border-yellow-500 hover:bg-yellow-500 hover:text-white"
                                }`}
                                disabled={
                                  savingAttendance === estudiante.rut_usuario
                                }
                              >
                                {savingAttendance === estudiante.rut_usuario
                                  ? "..."
                                  : "J"}
                              </button>
                            </div>
                          </td>
                          <td className="px-3 py-2 sm:px-4 md:px-6 sm:py-3 whitespace-normal text-xs sm:text-sm">
                            {asistencias[estudiante.rut_usuario] === 2 ? (
                              <div className="flex items-center">
                                <input
                                  type="text"
                                  value={
                                    justificaciones[estudiante.rut_usuario] ||
                                    ""
                                  }
                                  onChange={(e) => {
                                    const nuevaJustificacion = e.target.value;
                                    setJustificaciones((prev) => ({
                                      ...prev,
                                      [estudiante.rut_usuario]:
                                        nuevaJustificacion,
                                    }));
                                  }}
                                  onBlur={(e) => {
                                    guardarAsistencia(
                                      estudiante.rut_usuario,
                                      2,
                                      e.target.value
                                    );
                                  }}
                                  placeholder="Ingrese justificación"
                                  className="w-full border rounded px-2 py-1 text-sm"
                                />
                              </div>
                            ) : (
                              <span className="text-gray-400">No aplica</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full text-center py-4 text-gray-500">
              No hay estudiantes registrados en este curso.
            </div>
          )
        ) : (
          <div className="w-full text-center py-6 text-gray-500 bg-gray-50 rounded">
            Seleccione un día para tomar asistencia
          </div>
        )}
      </div>
    </div>
  );
}
