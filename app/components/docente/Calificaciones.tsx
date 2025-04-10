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
  // Estado para manejar los inputs de calificación de cada estudiante
  const [gradeInputs, setGradeInputs] = useState<{ [rut: string]: string }>({});

  useEffect(() => {
    if (cursoId && asignaturaId) {
      fetchData();
    }
  }, [cursoId, asignaturaId]);

  // Cada vez que se cambia la evaluación seleccionada o la lista de estudiantes,
  // actualizamos los valores de los inputs de calificación.
  useEffect(() => {
    if (selectedEvaluacion) {
      const newGradeInputs: { [rut: string]: string } = {};
      estudiantes.forEach((estudiante) => {
        const calificacion = estudiante.calificaciones.find(
          (c) => c.id_evaluacion === selectedEvaluacion
        );
        newGradeInputs[estudiante.rut_usuario] =
          calificacion?.nota.toFixed(1) || "0.0";
      });
      setGradeInputs(newGradeInputs);
    }
  }, [selectedEvaluacion, estudiantes]);

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

  // Función para transformar una cadena de dos dígitos sin separador a formato decimal
  const formatInputValue = (value: string): string => {
    // Si no contiene punto ni coma y tiene exactamente 2 dígitos, insertar el punto entre ellos
    if (/^\d{2}$/.test(value)) {
      return value[0] + "." + value[1];
    }
    // Si contiene coma, la transformamos a punto para parsear
    return value.replace(",", ".");
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="container mx-auto px-4">
      <div className="mb-4 sm:mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white p-3 sm:p-4 rounded-lg shadow col-span-1 sm:col-span-2">
            <div className="flex justify-between">
              <div className="flex-1">
                <h3 className="text-xs sm:text-sm font-semibold mb-1">Total Estudiantes</h3>
                <p className="text-lg sm:text-xl font-bold text-blue-600">
                  {estudiantes.length}
                </p>
              </div>
              <div className="flex-1">
                <h3 className="text-xs sm:text-sm font-semibold mb-1">Evaluaciones</h3>
                <p className="text-lg sm:text-xl font-bold text-blue-600">
                  {evaluaciones.length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-3 sm:p-4 rounded-lg shadow">
            <button
              onClick={() => setShowModal(true)}
              className="w-full px-2 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm border-2 border-blue-500 text-blue-500 bg-white rounded hover:bg-blue-500 hover:text-white transition-colors"
            >
              Nueva Evaluación
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-3 sm:p-6">
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
                          <input
                            type="number"
                            min="0"
                            max="7"
                            step="0.1"
                            className="w-20 text-center rounded border-gray-300"
                            value={
                              gradeInputs[estudiante.rut_usuario] ??
                              (calificacion?.nota.toFixed(1) || "0.0")
                            }
                            disabled={savingGrade === estudiante.rut_usuario}
                            onChange={(e) => {
                              let { value } = e.target;
                              // Si el usuario escribe dos dígitos sin separador, se transforma
                              if (/^\d{2}$/.test(value)) {
                                value = value[0] + "." + value[1];
                                e.target.value = value;
                              }
                              setGradeInputs((prev) => ({
                                ...prev,
                                [estudiante.rut_usuario]: value,
                              }));
                            }}
                            onBlur={(e) => {
                              let { value } = e.target;
                              // Si no contiene punto ni coma y tiene 2 dígitos, lo transformamos
                              if (/^\d{2}$/.test(value)) {
                                value = value[0] + "." + value[1];
                                setGradeInputs((prev) => ({
                                  ...prev,
                                  [estudiante.rut_usuario]: value,
                                }));
                              }
                              const formattedValue = formatInputValue(value);
                              const nota = parseFloat(formattedValue);
                              if (!isNaN(nota) && nota >= 0 && nota <= 7) {
                                handleUpdateNota(
                                  estudiante.rut_usuario,
                                  parseFloat(nota.toFixed(1))
                                );
                              } else {
                                setGradeInputs((prev) => ({
                                  ...prev,
                                  [estudiante.rut_usuario]:
                                    calificacion?.nota.toFixed(1) || "0.0",
                                }));
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.currentTarget.blur();
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
