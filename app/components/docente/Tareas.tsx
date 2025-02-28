"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale/es";

interface Archivo {
  id_archivo: string;
  titulo: string;
  extension: string;
}

interface ArchivoEntrega extends Archivo {
  downloadUrl?: string;
}

interface Entrega {
  id_entrega: string;
  rut_estudiante: string;
  nombres: string;
  apellidos: string;
  estado: "pendiente" | "entregada" | "revisada";
  fecha_entrega: string | null;
  comentario: string | null;
  archivos_entrega: ArchivoEntrega[];
}

interface Tarea {
  id_tarea: string;
  id_asignatura: string;
  titulo: string;
  descripcion: string;
  fecha: string;
  archivos: Archivo[];
  // Las entregas se traerán mediante el endpoint específico, no aquí.
}

interface TareasProps {
  cursoId: string;
  asignaturaId: string;
}

interface Estudiante {
  rut_usuario: string;
  nombres: string;
  apellidos: string;
}

export default function Tareas({ cursoId, asignaturaId }: TareasProps) {
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [loading, setLoading] = useState(true);
  // Almacenamos las entregas por cada tarea (clave: id_tarea)
  const [entregas, setEntregas] = useState<{ [key: string]: Entrega[] }>({});
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [selectedEntrega, setSelectedEntrega] = useState<string | null>(null);
  const [expandedTarea, setExpandedTarea] = useState<string | null>(null);
  const [showNewTareaForm, setShowNewTareaForm] = useState(false);
  const [newTarea, setNewTarea] = useState({
    titulo: "",
    descripcion: "",
    archivos: [] as File[],
  });

  const formatDate = (dateString: string) => {
    return format(new Date(dateString + "T00:00:00"), "d 'de' MMMM, yyyy", {
      locale: es,
    });
  };

  const fetchTareas = async () => {
    try {
      const response = await fetch(
        `/api/docente/tareas?cursoId=${cursoId}&asignaturaId=${asignaturaId}`
      );
      const data = await response.json();
      if (data.success) {
        setTareas(data.tareas);
      }
    } catch (error) {
      console.error("Error fetching tareas:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEstudiantes = async () => {
    try {
      const response = await fetch(
        `/api/docente/estudiantes?curso=${cursoId}&asignatura=${asignaturaId}`
      );
      const data = await response.json();
      if (data.success) {
        setEstudiantes(data.estudiantes);
      }
    } catch (error) {
      console.error("Error al obtener estudiantes:", error);
    }
  };

  // Llama al endpoint específico para obtener las entregas de una tarea
  const fetchEntregas = async (id_tarea: string, id_asignatura: string) => {
    try {
      const response = await fetch(
        `/api/docente/tareas/${id_tarea}/entregas?id_asignatura=${id_asignatura}&cursoId=${cursoId}`
      );
      const data = await response.json();
      if (data.success) {
        setEntregas((prev) => ({ ...prev, [id_tarea]: data.entregas }));
      }
    } catch (error) {
      console.error("Error fetching entregas:", error);
    }
  };

  useEffect(() => {
    fetchTareas();
  }, [asignaturaId, cursoId]);

  useEffect(() => {
    fetchEstudiantes();
  }, [cursoId, asignaturaId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setNewTarea((prev) => ({
        ...prev,
        archivos: Array.from(files),
      }));
    }
  };
  // const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   if (e.target.files) {
  //     setNewTarea((prev) => ({
  //       ...prev,
  //       archivos: Array.from(e.target.files),
  //     }));
  //   }
  // };

  const handleUpdateStatus = async (
    id_entrega: string,
    estado: string,
    id_tarea: string,
    id_asignatura: string
  ) => {
    try {
      const response = await fetch("/api/docente/tareas", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id_entrega, estado, cursoId: cursoId }),
      });
      if (response.ok) {
        // Actualizamos las entregas para esta tarea
        fetchEntregas(id_tarea, id_asignatura);
      }
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("titulo", newTarea.titulo);
    formData.append("descripcion", newTarea.descripcion);
    formData.append("id_asignatura", asignaturaId);
    formData.append("cursoId", cursoId);
    for (let i = 0; i < newTarea.archivos.length; i++) {
      formData.append("archivos", newTarea.archivos[i]);
    }
    try {
      const response = await fetch("/api/docente/tareas", {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        setNewTarea({ titulo: "", descripcion: "", archivos: [] });
        setShowNewTareaForm(false);
        fetchTareas();
      }
    } catch (error) {
      console.error("Error creating tarea:", error);
    }
  };

  const handleDeleteTarea = async (id_tarea: string, id_asignatura: string) => {
    try {
      const response = await fetch("/api/docente/tareas", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_tarea, id_asignatura, cursoId: cursoId }),
      });
      if (response.ok) {
        fetchTareas();
      }
    } catch (error) {
      console.error("Error deleting tarea:", error);
    }
  };

  // Cuando se expande una tarea, se trae la información de sus entregas
  const handleExpandTarea = (tarea: Tarea) => {
    if (expandedTarea === tarea.id_tarea) {
      setExpandedTarea(null);
    } else {
      setExpandedTarea(tarea.id_tarea);
      fetchEntregas(tarea.id_tarea, tarea.id_asignatura);
    }
  };

  // Busca la entrega de un estudiante en la tarea actual
  const getEntregaForStudent = (id_tarea: string, rutEstudiante: string) => {
    const lista = entregas[id_tarea] || [];
    return lista.find((e) => e.rut_estudiante === rutEstudiante);
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Tareas</h2>
        <button
          onClick={() => setShowNewTareaForm(!showNewTareaForm)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {showNewTareaForm ? "Cancelar" : "Nueva Tarea"}
        </button>
      </div>

      {showNewTareaForm && (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 bg-white p-4 rounded shadow"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Título
            </label>
            <input
              type="text"
              value={newTarea.titulo}
              onChange={(e) =>
                setNewTarea((prev) => ({ ...prev, titulo: e.target.value }))
              }
              className="mt-1 block w-full rounded border-gray-300 shadow-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Descripción
            </label>
            <textarea
              value={newTarea.descripcion}
              onChange={(e) =>
                setNewTarea((prev) => ({
                  ...prev,
                  descripcion: e.target.value,
                }))
              }
              className="mt-1 block w-full rounded border-gray-300 shadow-sm"
              rows={4}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Archivos
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              multiple
              className="mt-1 block w-full"
            />
            {newTarea.archivos.length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-gray-600">Archivos seleccionados:</p>
                <ul className="list-disc pl-5">
                  {newTarea.archivos.map((file, index) => (
                    <li key={index} className="text-sm text-gray-600">
                      {file.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Crear Tarea
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {tareas.map((tarea) => (
          <div key={tarea.id_tarea} className="bg-white rounded shadow">
            <div className="p-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">{tarea.titulo}</h3>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">
                    {formatDate(tarea.fecha)}
                  </span>
                  <button
                    onClick={() =>
                      handleDeleteTarea(tarea.id_tarea, tarea.id_asignatura)
                    }
                    className="text-red-500 hover:text-red-600"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
              <p className="text-gray-600 mt-2">{tarea.descripcion}</p>

              {tarea.archivos.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700">
                    Archivos de la tarea:
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tarea.archivos.map((archivo) => (
                      <a
                        key={archivo.id_archivo}
                        href={`/api/docente/tareas/download?id=${archivo.id_archivo}&tipo=tarea`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm hover:bg-blue-100"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        {archivo.titulo}.{archivo.extension}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => handleExpandTarea(tarea)}
                className="mt-4 text-sm text-blue-600 hover:text-blue-800"
              >
                {expandedTarea === tarea.id_tarea
                  ? "Ocultar entregas"
                  : "Ver entregas"}
              </button>
            </div>

            {expandedTarea === tarea.id_tarea && (
              <div className="border-t">
                <div className="p-4">
                  <h4 className="font-medium text-gray-900 mb-4">
                    Entregas de estudiantes
                  </h4>
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
                            Fecha Entrega
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {estudiantes.map((estudiante) => {
                          const entrega = getEntregaForStudent(
                            tarea.id_tarea,
                            estudiante.rut_usuario
                          );
                          return (
                            <React.Fragment key={estudiante.rut_usuario}>
                              <tr className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">
                                    {estudiante.nombres} {estudiante.apellidos}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span
                                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                      entrega?.estado === "entregada"
                                        ? "bg-green-100 text-green-800"
                                        : entrega?.estado === "revisada"
                                        ? "bg-blue-100 text-blue-800"
                                        : "bg-yellow-100 text-yellow-800"
                                    }`}
                                  >
                                    {entrega?.estado || "pendiente"}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {entrega?.fecha_entrega
                                    ? formatDate(entrega.fecha_entrega)
                                    : "-"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  <button
                                    onClick={() =>
                                      setSelectedEntrega(
                                        selectedEntrega ===
                                          estudiante.rut_usuario
                                          ? null
                                          : estudiante.rut_usuario
                                      )
                                    }
                                    className="text-blue-600 hover:text-blue-900"
                                  >
                                    {selectedEntrega === estudiante.rut_usuario
                                      ? "Ocultar detalles"
                                      : "Ver detalles"}
                                  </button>
                                </td>
                              </tr>
                              {selectedEntrega === estudiante.rut_usuario && (
                                <tr>
                                  <td
                                    colSpan={4}
                                    className="px-6 py-4 bg-gray-50"
                                  >
                                    <div className="space-y-4">
                                      {entrega ? (
                                        <>
                                          {entrega.comentario && (
                                            <div>
                                              <h6 className="text-sm font-medium text-gray-700">
                                                Comentario del estudiante:
                                              </h6>
                                              <p className="mt-1 text-sm text-gray-600">
                                                {entrega.comentario}
                                              </p>
                                            </div>
                                          )}
                                          {entrega.archivos_entrega?.length >
                                            0 && (
                                            <div>
                                              <h6 className="text-sm font-medium text-gray-700">
                                                Archivos entregados:
                                              </h6>
                                              <div className="mt-2 flex flex-wrap gap-2">
                                                {entrega.archivos_entrega.map(
                                                  (archivo) => (
                                                    <a
                                                      key={archivo.id_archivo}
                                                      href={`/api/docente/tareas/download?id=${archivo.id_archivo}&tipo=entrega`}
                                                      target="_blank"
                                                      rel="noopener noreferrer"
                                                      className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200"
                                                    >
                                                      <svg
                                                        className="w-4 h-4"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                      >
                                                        <path
                                                          strokeLinecap="round"
                                                          strokeLinejoin="round"
                                                          strokeWidth={2}
                                                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                        />
                                                      </svg>
                                                      {archivo.titulo}.
                                                      {archivo.extension}
                                                    </a>
                                                  )
                                                )}
                                              </div>
                                            </div>
                                          )}
                                          {entrega &&
                                            entrega.estado == "entregada" && (
                                              <button
                                                onClick={() =>
                                                  handleUpdateStatus(
                                                    entrega.id_entrega,
                                                    "revisada",
                                                    tarea.id_tarea,
                                                    tarea.id_asignatura
                                                  )
                                                }
                                                className="mt-2 bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                                              >
                                                Marcar como revisada
                                              </button>
                                            )}
                                        </>
                                      ) : (
                                        <p className="text-sm text-gray-500">
                                          No hay entrega registrada
                                        </p>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
