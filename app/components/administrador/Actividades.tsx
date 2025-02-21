"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

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
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Actividades</h1>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Nueva Actividad
        </button>
      </div>

      {showCreateForm && (
        <div className="mb-6 p-6 border rounded-lg shadow-lg bg-gray-50">
          <h2 className="text-xl font-semibold mb-4">Crear Actividad</h2>
          <form onSubmit={handleCreateSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Título
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Fecha
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Descripción
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
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
                className="mt-1 block w-full"
                accept="image/*"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
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
                className="mt-1 block w-full"
              />
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
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Crear
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {actividades.map((actividad) => (
          <div
            key={actividad.id_actividad}
            className="border rounded-lg p-4 bg-white shadow"
          >
            {editingActividadId === actividad.id_actividad ? (
              <div>
                <input
                  type="text"
                  value={editingFormData.titulo}
                  onChange={(e) =>
                    setEditingFormData({
                      ...editingFormData,
                      titulo: e.target.value,
                    })
                  }
                  className="w-full mb-2 p-2 border rounded"
                />
                <input
                  type="date"
                  value={editingFormData.fecha}
                  onChange={(e) =>
                    setEditingFormData({
                      ...editingFormData,
                      fecha: e.target.value,
                    })
                  }
                  className="w-full mb-2 p-2 border rounded"
                />
                <textarea
                  value={editingFormData.descripcion}
                  onChange={(e) =>
                    setEditingFormData({
                      ...editingFormData,
                      descripcion: e.target.value,
                    })
                  }
                  className="w-full mb-4 p-2 border rounded"
                  rows={3}
                />
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Archivos Existentes:
                  </label>
                  <div className="mt-2 grid grid-cols-4 gap-4">
                    {actividad.archivos && actividad.archivos.length > 0 ? (
                      actividad.archivos.map((archivo) => (
                        <div key={archivo.id_archivo} className="relative">
                          {isImageFile(archivo.extension) ? (
                            <Image
                              src={`/api/actividades/download/${archivo.id_archivo}`}
                              alt={archivo.titulo}
                              width={150}
                              height={150}
                              className="rounded object-cover"
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
                          ) : (
                            <div className="flex items-center justify-center w-[150px] h-[150px] bg-gray-100 rounded">
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
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                          >
                            ×
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No hay archivos</p>
                    )}
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Agregar imágenes al carrusel:
                  </label>
                  <input
                    type="file"
                    multiple
                    onChange={(e) =>
                      setEditingFormData({
                        ...editingFormData,
                        imagenesCarruselToAdd: Array.from(e.target.files || []),
                      })
                    }
                    className="mt-1 block w-full"
                    accept="image/*"
                  />
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Agregar archivos adjuntos:
                  </label>
                  <input
                    type="file"
                    multiple
                    onChange={(e) =>
                      setEditingFormData({
                        ...editingFormData,
                        archivosAdjuntosToAdd: Array.from(e.target.files || []),
                      })
                    }
                    className="mt-1 block w-full"
                  />
                </div>
                <div className="flex justify-end space-x-3 mt-4">
                  <button
                    onClick={cancelInlineEdit}
                    className="px-3 py-1 text-gray-600 hover:underline"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleInlineUpdate(actividad.id_actividad)}
                    className="px-3 py-1 text-blue-600 hover:underline"
                  >
                    Guardar
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium">{actividad.titulo}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(actividad.fecha).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => startInlineEdit(actividad)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(actividad.id_actividad)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
                <p className="mt-2">{actividad.descripcion}</p>
                {actividad.archivos && actividad.archivos.length > 0 && (
                  <div className="mt-4 grid grid-cols-4 gap-4">
                    {actividad.archivos.map((archivo) => (
                      <div key={archivo.id_archivo}>
                        {isImageFile(archivo.extension) ? (
                          <Image
                            src={`/api/actividades/download/${archivo.id_archivo}`}
                            alt={archivo.titulo}
                            width={150}
                            height={150}
                            className="rounded object-cover"
                            unoptimized
                          />
                        ) : (
                          <a
                            href={`/api/actividades/download/${archivo.id_archivo}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center w-[150px] h-[150px] bg-gray-100 rounded hover:bg-gray-200"
                          >
                            <div className="text-center">
                              <div className="text-4xl mb-2">📄</div>
                              <span className="text-sm text-gray-600">
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
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Actividades;
