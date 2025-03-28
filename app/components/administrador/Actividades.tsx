"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import toast from "react-hot-toast";

interface Archivo {
  id_archivo: string;
  titulo: string;
  extension: string;
  tipo: "carrusel" | "adjunto";
}

interface Actividad {
  id_actividad: string;
  titulo: string;
  descripcion: string;
  fecha: string;
  archivos?: Archivo[];
}

const Actividades: React.FC = () => {
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    titulo: "",
    descripcion: "",
    fecha: "",
    imagenesCarrusel: [] as File[],
    archivosAdjuntos: [] as File[],
  });
  const [editingActividadId, setEditingActividadId] = useState<string | null>(
    null
  );
  const [editingFormData, setEditingFormData] = useState({
    titulo: "",
    descripcion: "",
    fecha: "",
    imagenesCarruselToAdd: [] as File[],
    archivosAdjuntosToAdd: [] as File[],
    archivosToDelete: [] as string[],
  });

  useEffect(() => {
    fetchActividades();
  }, []);

  const fetchActividades = async () => {
    try {
      const response = await fetch("/api/actividades");
      const data = await response.json();
      if (data.success) {
        setActividades(data.actividades);
      }
    } catch (error) {
      console.error("Error fetching actividades:", error);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = new FormData();
    form.append("titulo", createFormData.titulo);
    form.append("descripcion", createFormData.descripcion);
    form.append("fecha", createFormData.fecha);

    createFormData.imagenesCarrusel.forEach((file, index) => {
      form.append(`carrusel-${index}`, file);
    });

    createFormData.archivosAdjuntos.forEach((file, index) => {
      form.append(`adjunto-${index}`, file);
    });

    try {
      const response = await fetch("/api/actividades", {
        method: "POST",
        body: form,
      });
      const data = await response.json();
      if (data.success) {
        setCreateFormData({
          titulo: "",
          descripcion: "",
          fecha: new Date().toISOString().split("T")[0],
          imagenesCarrusel: [],
          archivosAdjuntos: [],
        });
        setShowCreateForm(false);
        fetchActividades();
      }
    } catch (error) {
      console.error("Error creating actividad:", error);
    }
  };

  const handleInlineUpdate = async (id: string) => {
    const form = new FormData();
    form.append("id_actividad", id);
    form.append("titulo", editingFormData.titulo);
    form.append("descripcion", editingFormData.descripcion);
    form.append("fecha", editingFormData.fecha);

    if (editingFormData.archivosToDelete.length > 0) {
      form.append(
        "archivosAEliminar",
        JSON.stringify(editingFormData.archivosToDelete)
      );
    }

    editingFormData.imagenesCarruselToAdd.forEach((file, index) => {
      form.append(`carrusel-${index}`, file);
    });

    editingFormData.archivosAdjuntosToAdd.forEach((file, index) => {
      form.append(`adjunto-${index}`, file);
    });

    try {
      const response = await fetch("/api/actividades", {
        method: "PUT",
        body: form,
      });
      const data = await response.json();
      if (data.success) {
        setEditingActividadId(null);
        setEditingFormData({
          titulo: "",
          descripcion: "",
          fecha: "",
          imagenesCarruselToAdd: [],
          archivosAdjuntosToAdd: [],
          archivosToDelete: [],
        });
        fetchActividades();
      }
    } catch (error) {
      console.error("Error updating actividad:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta actividad?")) return;
    try {
      const response = await fetch(`/api/actividades?id=${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.success) {
        fetchActividades();
      }
    } catch (error) {
      console.error("Error deleting actividad:", error);
    }
  };

  const startInlineEdit = (actividad: Actividad) => {
    setEditingActividadId(actividad.id_actividad);
    setEditingFormData({
      titulo: actividad.titulo,
      descripcion: actividad.descripcion,
      fecha: actividad.fecha,
      imagenesCarruselToAdd: [],
      archivosAdjuntosToAdd: [],
      archivosToDelete: [],
    });
  };

  const cancelInlineEdit = () => {
    setEditingActividadId(null);
    setEditingFormData({
      titulo: "",
      descripcion: "",
      fecha: "",
      imagenesCarruselToAdd: [],
      archivosAdjuntosToAdd: [],
      archivosToDelete: [],
    });
  };

  const isImageFile = (extension: string) => {
    const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp"];
    return imageExtensions.includes(extension.toLowerCase());
  };

  return (
    <div className="bg-white shadow sm:rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-medium text-gray-900">
          Gestión de Actividades
        </h1>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="inline-flex items-center px-4 py-2 border border-indigo-600 text-sm font-medium rounded-md shadow-sm text-indigo-600 bg-white hover:bg-indigo-600 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {showCreateForm ? (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Cancelar
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              Nueva Actividad
            </>
          )}
        </button>
      </div>

      {showCreateForm && (
        <div className="mb-6 p-6 border rounded-lg shadow-sm bg-gray-50">
          <h2 className="text-lg font-medium mb-4">Crear Actividad</h2>
          <form onSubmit={handleCreateSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={createFormData.titulo}
                  onChange={(e) =>
                    setCreateFormData({
                      ...createFormData,
                      titulo: e.target.value,
                    })
                  }
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={createFormData.fecha}
                  onChange={(e) =>
                    setCreateFormData({
                      ...createFormData,
                      fecha: e.target.value,
                    })
                  }
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={createFormData.descripcion}
                  onChange={(e) =>
                    setCreateFormData({
                      ...createFormData,
                      descripcion: e.target.value,
                    })
                  }
                  rows={4}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Imágenes para el carrusel
                </label>
                <input
                  type="file"
                  multiple
                  onChange={(e) =>
                    setCreateFormData({
                      ...createFormData,
                      imagenesCarrusel: Array.from(e.target.files || []),
                    })
                  }
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-medium
                    file:bg-indigo-50 file:text-indigo-600
                    hover:file:bg-indigo-100"
                  accept="image/*"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Archivos adjuntos
                </label>
                <input
                  type="file"
                  multiple
                  onChange={(e) =>
                    setCreateFormData({
                      ...createFormData,
                      archivosAdjuntos: Array.from(e.target.files || []),
                    })
                  }
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-medium
                    file:bg-indigo-50 file:text-indigo-600
                    hover:file:bg-indigo-100"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setCreateFormData({
                    titulo: "",
                    descripcion: "",
                    fecha: new Date().toISOString().split("T")[0],
                    imagenesCarrusel: [],
                    archivosAdjuntos: [],
                  });
                }}
                className="border border-gray-500 text-gray-500 bg-white px-4 py-2 rounded-md hover:bg-gray-500 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="border border-indigo-600 text-indigo-600 bg-white px-4 py-2 rounded-md hover:bg-indigo-600 hover:text-white transition-colors"
              >
                Crear Actividad
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {actividades.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No hay actividades disponibles
          </div>
        ) : (
          actividades.map((actividad) => (
            <div
              key={actividad.id_actividad}
              className="border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              {editingActividadId === actividad.id_actividad ? (
                <div className="p-4">
                  <h3 className="text-lg font-medium mb-4">Editar Actividad</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Título
                      </label>
                      <input
                        type="text"
                        value={editingFormData.titulo}
                        onChange={(e) =>
                          setEditingFormData({
                            ...editingFormData,
                            titulo: e.target.value,
                          })
                        }
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha
                      </label>
                      <input
                        type="date"
                        value={editingFormData.fecha}
                        onChange={(e) =>
                          setEditingFormData({
                            ...editingFormData,
                            fecha: e.target.value,
                          })
                        }
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Descripción
                      </label>
                      <textarea
                        value={editingFormData.descripcion}
                        onChange={(e) =>
                          setEditingFormData({
                            ...editingFormData,
                            descripcion: e.target.value,
                          })
                        }
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Archivos Existentes
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {actividad.archivos && actividad.archivos.length > 0 ? (
                        actividad.archivos.map((archivo) => (
                          <div
                            key={archivo.id_archivo}
                            className="relative group"
                          >
                            {isImageFile(archivo.extension) ? (
                              <div className="relative h-32 rounded-md overflow-hidden">
                                <Image
                                  src={`/api/actividades/download/${archivo.id_archivo}`}
                                  alt={archivo.titulo}
                                  fill
                                  className="object-cover"
                                  style={{
                                    opacity:
                                      editingFormData.archivosToDelete.includes(
                                        archivo.id_archivo
                                      )
                                        ? 0.5
                                        : 1,
                                  }}
                                  unoptimized
                                />
                              </div>
                            ) : (
                              <div className="flex items-center justify-center h-32 bg-gray-100 rounded-md">
                                <span className="text-sm text-gray-500">
                                  {archivo.extension.toUpperCase()}
                                </span>
                              </div>
                            )}
                            <button
                              onClick={() =>
                                setEditingFormData((prev) => ({
                                  ...prev,
                                  archivosToDelete:
                                    prev.archivosToDelete.includes(
                                      archivo.id_archivo
                                    )
                                      ? prev.archivosToDelete.filter(
                                          (id) => id !== archivo.id_archivo
                                        )
                                      : [
                                          ...prev.archivosToDelete,
                                          archivo.id_archivo,
                                        ],
                                }))
                              }
                              className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 col-span-full">
                          No hay archivos
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Agregar imágenes al carrusel
                      </label>
                      <input
                        type="file"
                        multiple
                        onChange={(e) =>
                          setEditingFormData({
                            ...editingFormData,
                            imagenesCarruselToAdd: Array.from(
                              e.target.files || []
                            ),
                          })
                        }
                        className="block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-md file:border-0
                          file:text-sm file:font-medium
                          file:bg-indigo-50 file:text-indigo-600
                          hover:file:bg-indigo-100"
                        accept="image/*"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Agregar archivos adjuntos
                      </label>
                      <input
                        type="file"
                        multiple
                        onChange={(e) =>
                          setEditingFormData({
                            ...editingFormData,
                            archivosAdjuntosToAdd: Array.from(
                              e.target.files || []
                            ),
                          })
                        }
                        className="block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-md file:border-0
                          file:text-sm file:font-medium
                          file:bg-indigo-50 file:text-indigo-600
                          hover:file:bg-indigo-100"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={cancelInlineEdit}
                      className="border border-gray-500 text-gray-500 bg-white px-4 py-2 rounded-md hover:bg-gray-500 hover:text-white transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => handleInlineUpdate(actividad.id_actividad)}
                      className="border border-green-600 text-green-600 bg-white px-4 py-2 rounded-md hover:bg-green-600 hover:text-white transition-colors"
                    >
                      Guardar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {actividad.titulo}
                        </h3>
                        <p className="text-sm text-gray-500 flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {new Date(actividad.fecha).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-gray-700">{actividad.descripcion}</p>
                    </div>

                    {actividad.archivos && actividad.archivos.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {actividad.archivos.map((archivo) => (
                          <div key={archivo.id_archivo} className="group">
                            {isImageFile(archivo.extension) ? (
                              <div className="relative h-32 rounded-md overflow-hidden">
                                <Image
                                  src={`/api/actividades/download/${archivo.id_archivo}`}
                                  alt={archivo.titulo}
                                  fill
                                  className="object-cover"
                                  unoptimized
                                />
                              </div>
                            ) : (
                              <a
                                href={`/api/actividades/download/${archivo.id_archivo}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center h-32 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                              >
                                <div className="text-center">
                                  <div className="text-3xl mb-1">📄</div>
                                  <span className="text-xs text-gray-600">
                                    {archivo.extension.toUpperCase()}
                                  </span>
                                </div>
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="border-t px-4 py-3 flex justify-end space-x-2">
                    <button
                      onClick={() => startInlineEdit(actividad)}
                      className="border border-yellow-500 text-yellow-500 bg-white px-3 py-1.5 rounded-md hover:bg-yellow-500 hover:text-white transition-colors text-sm flex items-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(actividad.id_actividad)}
                      className="border border-red-500 text-red-500 bg-white px-3 py-1.5 rounded-md hover:bg-red-500 hover:text-white transition-colors text-sm flex items-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Eliminar
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Actividades;
