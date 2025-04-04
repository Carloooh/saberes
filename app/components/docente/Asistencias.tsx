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
        setAsistencias(asistenciasMap);
      }
    } catch (error) {
      console.error("Error al obtener asistencias:", error);
      toast.error("Error al cargar asistencias");
    } finally {
      setLoading(false);
    }
  };

  const guardarAsistencia = async (rutEstudiante: string, estado: number) => {
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
          id_asignatura: asignaturaId
        }),
      });
  
      if (response.ok) {
        // Actualizar el estado local
        setAsistencias((prev) => ({
          ...prev,
          [rutEstudiante]: estado,
        }));
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
    <div className="container mx-auto px-4">
      <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Total Estudiantes</h3>
          <p className="text-3xl font-bold text-blue-600">
            {estudiantes.length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Días Registrados</h3>
          <p className="text-3xl font-bold text-blue-600">{dias.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Último Registro</h3>
          <p className="text-lg text-blue-600">
            {dias.length > 0
              ? format(
                  new Date(dias[0].fecha + "T00:00:00"),
                  "d 'de' MMMM 'de' yyyy",
                  {
                    locale: es,
                  }
                )
              : "Sin registros"}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Agregar Día</h3>
          <div className="flex gap-2">
            <input
              type="date"
              value={newFecha}
              onChange={(e) => setNewFecha(e.target.value)}
              className="border rounded px-3 py-2 flex-1"
            />
            <button
              onClick={agregarDia}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              disabled={!newFecha}
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seleccionar día para tomar asistencia
          </label>
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
              className="ml-4 mt-4 md:mt-0 px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
            >
              {deletingDay ? "Eliminando..." : "Eliminar día"}
            </button>
          )}
        </div>

        {selectedDia ? (
          estudiantes.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estudiante
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {estudiantes.map((estudiante) => (
                    <tr
                      key={estudiante.rut_usuario}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {estudiante.nombres} {estudiante.apellidos}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() =>
                              guardarAsistencia(estudiante.rut_usuario, 1)
                            }
                            className={`px-3 py-1 rounded transition-colors ${
                              asistencias[estudiante.rut_usuario] === 1
                                ? "bg-green-500 text-white"
                                : "bg-green-100 text-green-700 hover:bg-green-200"
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
                            className={`px-3 py-1 rounded transition-colors ${
                              asistencias[estudiante.rut_usuario] === 0
                                ? "bg-red-500 text-white"
                                : "bg-red-100 text-red-700 hover:bg-red-200"
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
                              guardarAsistencia(estudiante.rut_usuario, 2)
                            }
                            className={`px-3 py-1 rounded transition-colors ${
                              asistencias[estudiante.rut_usuario] === 2
                                ? "bg-yellow-500 text-white"
                                : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="w-full text-center py-4 text-gray-500">
              No hay estudiantes registrados en este curso.
            </div>
          )
        ) : (
          <div className="w-full text-center py-8 text-gray-500 bg-gray-50 rounded">
            Seleccione un día para tomar asistencia
          </div>
        )}
      </div>
    </div>
  );
}
