"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale/es";
import toast from "react-hot-toast";

interface Evaluacion {
  id_evaluacion: string;
  fecha: string;
  titulo: string;
}

interface Calificacion {
  id_evaluacion: string;
  nota: number;
}

interface Estudiante {
  rut_usuario: string;
  nombres: string;
  apellidos: string;
  calificaciones: Calificacion[];
}

interface CalificacionesProps {
  cursoId: string;
  asignaturaId: string;
}

export default function Calificaciones({
  cursoId,
  asignaturaId,
}: CalificacionesProps) {
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([]);
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [selectedEvaluacion, setSelectedEvaluacion] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [newEvaluacion, setNewEvaluacion] = useState({
    titulo: "",
    fecha: new Date().toISOString().split("T")[0],
  });
  const [loading, setLoading] = useState(true);
  const [savingGrade, setSavingGrade] = useState<string | null>(null);

  useEffect(() => {
    if (cursoId && asignaturaId) {
      fetchData();
    }
  }, [cursoId, asignaturaId]);

  const fetchData = async () => {
    try {
      const response = await fetch(
        `/api/docente/calificaciones?cursoId=${cursoId}&asignaturaId=${asignaturaId}`
      );
      const data = await response.json();
      if (data.success) {
        setEvaluaciones(data.data.evaluaciones);
        setEstudiantes(data.data.estudiantes);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvaluacion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/docente/calificaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newEvaluacion,
          id_asignatura: asignaturaId,
          cursoId: cursoId,
        }),
      });

      if (response.ok) {
        setShowModal(false);
        setNewEvaluacion({
          titulo: "",
          fecha: new Date().toISOString().split("T")[0],
        });
        fetchData();
        toast.success("Evaluación creada exitosamente");
      }
    } catch (error) {
      console.error("Error creating evaluation:", error);
      toast.error("Error al crear la evaluación");
    }
  };

  const handleUpdateNota = async (rut_estudiante: string, nota: number) => {
    if (!selectedEvaluacion) return;
    setSavingGrade(rut_estudiante);

    try {
      const response = await fetch("/api/docente/calificaciones", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_evaluacion: selectedEvaluacion,
          rut_estudiante,
          nota,
          id_curso: cursoId,
        }),
      });

      if (response.ok) {
        fetchData();
        toast.success("Calificación actualizada exitosamente");
      }
    } catch (error) {
      console.error("Error updating grade:", error);
      toast.error("Error al actualizar la calificación");
    } finally {
      setSavingGrade(null);
    }
  };

  const handleDeleteEvaluacion = async () => {
    if (
      !selectedEvaluacion ||
      !confirm("¿Está seguro de eliminar esta evaluación?")
    )
      return;

    try {
      const response = await fetch(
        `/api/docente/calificaciones?id=${selectedEvaluacion}`,
        { method: "DELETE" }
      );

      if (response.ok) {
        setSelectedEvaluacion("");
        fetchData();
        toast.success("Evaluación eliminada exitosamente");
      }
    } catch (error) {
      console.error("Error deleting evaluation:", error);
      toast.error("Error al eliminar la evaluación");
    }
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="container mx-auto px-4">
      <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Total Estudiantes</h3>
          <p className="text-3xl font-bold text-blue-600">
            {estudiantes.length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Evaluaciones</h3>
          <p className="text-3xl font-bold text-blue-600">
            {evaluaciones.length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Nueva Evaluación</h3>
          <button
            onClick={() => setShowModal(true)}
            className="w-full px-4 py-2 border-2 border-blue-500 text-blue-500 bg-white rounded hover:bg-blue-500 hover:text-white transition-colors"
          >
            Crear Evaluación
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seleccionar Evaluación
          </label>
          <div className="flex gap-4">
            <select
              value={selectedEvaluacion}
              onChange={(e) => setSelectedEvaluacion(e.target.value)}
              className="border rounded px-3 py-2 w-full md:w-64"
            >
              <option value="">Seleccione una evaluación</option>
              {evaluaciones.map((evaluacion) => (
                <option
                  key={evaluacion.id_evaluacion}
                  value={evaluacion.id_evaluacion}
                >
                  {evaluacion.titulo} (
                  {format(
                    new Date(evaluacion.fecha + "T00:00:00"),
                    "dd/MM/yyyy",
                    {
                      locale: es,
                    }
                  )}
                  )
                </option>
              ))}
            </select>
            {selectedEvaluacion && (
              <button
                onClick={handleDeleteEvaluacion}
                className="border-2 border-red-500 text-red-500 bg-white rounded p-1 hover:bg-red-500 hover:text-white transition-colors"
                title="Eliminar evaluación"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        {selectedEvaluacion && estudiantes.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Estudiante
                  </th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase w-32">
                    Calificación
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {estudiantes.map((estudiante) => {
                  const calificacion = estudiante.calificaciones.find(
                    (c) => c.id_evaluacion === selectedEvaluacion
                  );
                  return (
                    <tr
                      key={estudiante.rut_usuario}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-4 py-2">
                        {estudiante.nombres} {estudiante.apellidos}
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex justify-center items-center gap-2">
                          {/* <input
                            type="text"
                            className="w-20 text-center rounded border-gray-300"
                            defaultValue={
                              calificacion?.nota.toString().replace(".", ",") ||
                              "0,0"
                            }
                            disabled={savingGrade === estudiante.rut_usuario}
                            onChange={(e) => {
                              let value = e.target.value;
                              // Solo permitir números y una coma
                              value = value.replace(/[^\d,]/g, "");

                              // Asegurar que solo haya una coma
                              const commaCount = (value.match(/,/g) || [])
                                .length;
                              if (commaCount > 1) {
                                value = value.replace(/,/g, (match, index) =>
                                  index === value.indexOf(",") ? "," : ""
                                );
                              }

                              // Limitar a un decimal
                              if (value.includes(",")) {
                                const [whole, decimal] = value.split(",");
                                if (decimal && decimal.length > 1) {
                                  value = `${whole},${decimal[0]}`;
                                }
                              }

                              // Actualizar el valor
                              e.target.value = value;
                            }}
                            onBlur={(e) => {
                              let value = e.target.value;
                              if (!value.includes(",")) {
                                value += ",0";
                                e.target.value = value;
                              }
                              const nota = parseFloat(value.replace(",", "."));
                              if (!isNaN(nota) && nota >= 0.0 && nota <= 7.0) {
                                e.target.value = nota
                                  .toFixed(1)
                                  .replace(".", ",");
                              } else {
                                e.target.value =
                                  calificacion?.nota
                                    .toFixed(1)
                                    .replace(".", ",") || "0,0";
                              }
                            }}
                          />
                          <button
                            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                            onClick={() => {
                              const input = document.querySelector(
                                `input[data-rut="${estudiante.rut_usuario}"]`
                              ) as HTMLInputElement;
                              const nota = parseFloat(
                                input.value.replace(",", ".")
                              );
                              if (!isNaN(nota) && nota >= 0.0 && nota <= 7.0) {
                                handleUpdateNota(estudiante.rut_usuario, nota);
                              }
                            }}
                          >
                            Guardar
                          </button> */}
                          <input
                            type="number"
                            min="0.0"
                            max="7.0"
                            step="0.1"
                            className="w-20 text-center rounded border-gray-300"
                            defaultValue={
                              calificacion?.nota.toFixed(1) || "0.0"
                            }
                            disabled={savingGrade === estudiante.rut_usuario}
                            onChange={(e) => {
                              let value = e.target.value;
                              // Asegurar que siempre tenga un decimal
                              if (!value.includes(".")) {
                                value += ".0";
                                e.target.value = value;
                              }
                              // Limitar a un decimal
                              if (
                                value.includes(".") &&
                                value.split(".")[1].length > 1
                              ) {
                                value = Number(value).toFixed(1);
                                e.target.value = value;
                              }
                            }}
                            onBlur={(e) => {
                              const nota = parseFloat(e.target.value);
                              if (!isNaN(nota) && nota >= 0.0 && nota <= 7.0) {
                                handleUpdateNota(estudiante.rut_usuario, nota);
                              } else {
                                e.target.value =
                                  calificacion?.nota.toFixed(1) || "0.0";
                              }
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-sm">
            <h3 className="text-lg font-bold mb-4">Nueva Evaluación</h3>
            <form onSubmit={handleCreateEvaluacion} className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Título de la evaluación"
                  value={newEvaluacion.titulo}
                  onChange={(e) =>
                    setNewEvaluacion({
                      ...newEvaluacion,
                      titulo: e.target.value,
                    })
                  }
                  className="w-full rounded-md border-gray-300"
                  required
                />
              </div>
              <div>
                <input
                  type="date"
                  value={newEvaluacion.fecha}
                  onChange={(e) =>
                    setNewEvaluacion({
                      ...newEvaluacion,
                      fecha: e.target.value,
                    })
                  }
                  className="w-full rounded-md border-gray-300"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border-2 border-gray-500 text-gray-500 bg-white rounded hover:bg-gray-500 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border-2 border-blue-500 text-blue-500 bg-white rounded hover:bg-blue-500 hover:text-white transition-colors"
                >
                  Crear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
