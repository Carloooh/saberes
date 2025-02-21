import React, { useState, useEffect } from "react";

interface Noticia {
  id_noticia: string;
  titulo: string;
  contenido: string;
  destacado: number;
  fecha: string;
  archivos?: {
    id_archivo: string;
    titulo: string;
    extension: string;
  }[];
}

const Noticias: React.FC = () => {
  // Estado para el listado de noticias
  const [noticias, setNoticias] = useState<Noticia[]>([]);

  // Estado para el formulario de creación de noticia
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    titulo: "",
    contenido: "",
    destacado: false,
    archivos: [] as File[],
  });

  // Estado para la edición inline (se permite editar una sola noticia a la vez)
  const [editingNoticiaId, setEditingNoticiaId] = useState<string | null>(null);
  const [editingFormData, setEditingFormData] = useState({
    titulo: "",
    contenido: "",
    destacado: false,
    archivosToAdd: [] as File[],
    archivosToDelete: [] as string[],
  });

  useEffect(() => {
    fetchNoticias();
  }, []);

  const fetchNoticias = async () => {
    try {
      const response = await fetch("/api/noticias");
      const data = await response.json();
      if (data.success) {
        setNoticias(data.noticias);
      }
    } catch (error) {
      console.error("Error fetching noticias:", error);
    }
  };

  // Función para crear una nueva noticia
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = new FormData();
    form.append("titulo", createFormData.titulo);
    form.append("contenido", createFormData.contenido);
    form.append("destacado", createFormData.destacado ? "1" : "0");
    createFormData.archivos.forEach((file, index) => {
      form.append(`archivo-${index}`, file);
    });

    try {
      const response = await fetch("/api/noticias", {
        method: "POST",
        body: form,
      });
      const data = await response.json();
      if (data.success) {
        setCreateFormData({
          titulo: "",
          contenido: "",
          destacado: false,
          archivos: [],
        });
        setShowCreateForm(false);
        fetchNoticias();
      }
    } catch (error) {
      console.error("Error creating noticia:", error);
    }
  };

  // Función para actualizar (inline) una noticia editada
  const handleInlineUpdate = async (id: string) => {
    const form = new FormData();
    form.append("id_noticia", id);
    form.append("titulo", editingFormData.titulo);
    form.append("contenido", editingFormData.contenido);
    form.append("destacado", editingFormData.destacado ? "1" : "0");
    if (editingFormData.archivosToDelete.length > 0) {
      form.append(
        "archivosAEliminar",
        JSON.stringify(editingFormData.archivosToDelete)
      );
    }
    editingFormData.archivosToAdd.forEach((file, index) => {
      form.append(`archivo-${index}`, file);
    });

    try {
      const response = await fetch("/api/noticias", {
        method: "PUT",
        body: form,
      });
      const data = await response.json();
      if (data.success) {
        setEditingNoticiaId(null);
        setEditingFormData({
          titulo: "",
          contenido: "",
          destacado: false,
          archivosToAdd: [],
          archivosToDelete: [],
        });
        fetchNoticias();
      }
    } catch (error) {
      console.error("Error updating noticia:", error);
    }
  };

  // Función para eliminar una noticia
  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta noticia?")) return;
    try {
      const response = await fetch(`/api/noticias?id=${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.success) {
        fetchNoticias();
      }
    } catch (error) {
      console.error("Error deleting noticia:", error);
    }
  };

  // Función para cancelar la edición inline
  const cancelInlineEdit = () => {
    setEditingNoticiaId(null);
    setEditingFormData({
      titulo: "",
      contenido: "",
      destacado: false,
      archivosToAdd: [],
      archivosToDelete: [],
    });
  };

  // Inicia la edición inline de una noticia, precargando sus datos
  const startInlineEdit = (noticia: Noticia) => {
    setEditingNoticiaId(noticia.id_noticia);
    setEditingFormData({
      titulo: noticia.titulo,
      contenido: noticia.contenido,
      destacado: noticia.destacado === 1,
      archivosToAdd: [],
      archivosToDelete: [],
    });
  };

  return (
    <div className="container mx-auto p-4">
      {/* Encabezado y botón para crear noticia */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Noticias</h1>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Nueva Noticia
        </button>
      </div>

      {/* Formulario para crear noticia */}
      {showCreateForm && (
        <div className="mb-6 p-6 border rounded-lg shadow-lg bg-gray-50">
          <h2 className="text-xl font-semibold mb-4">Crear Noticia</h2>
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
                Contenido
              </label>
              <textarea
                value={createFormData.contenido}
                onChange={(e) =>
                  setCreateFormData({
                    ...createFormData,
                    contenido: e.target.value,
                  })
                }
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Archivos
              </label>
              <input
                type="file"
                multiple
                onChange={(e) =>
                  setCreateFormData({
                    ...createFormData,
                    archivos: Array.from(e.target.files || []),
                  })
                }
                className="mt-1 block w-full"
                accept="image/*,video/*"
              />
            </div>
            <div className="mb-4 flex items-center">
              <input
                type="checkbox"
                checked={createFormData.destacado}
                onChange={(e) =>
                  setCreateFormData({
                    ...createFormData,
                    destacado: e.target.checked,
                  })
                }
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">
                Destacar Noticia
              </label>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setCreateFormData({
                    titulo: "",
                    contenido: "",
                    destacado: false,
                    archivos: [],
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

      {/* Listado de noticias */}
      <div className="space-y-4">
        {noticias.map((noticia) => (
          <div
            key={noticia.id_noticia}
            className="border rounded-lg p-4 bg-white shadow"
          >
            {editingNoticiaId === noticia.id_noticia ? (
              // Modo edición inline en la misma card
              <div>
                <div className="flex justify-between items-center">
                  <input
                    type="text"
                    value={editingFormData.titulo}
                    onChange={(e) =>
                      setEditingFormData({
                        ...editingFormData,
                        titulo: e.target.value,
                      })
                    }
                    className="text-lg font-medium border rounded p-2 w-3/4"
                  />
                  <span
                    className={`px-2 py-1 rounded ${
                      editingFormData.destacado
                        ? "bg-green-500 text-white"
                        : "bg-gray-300 text-black"
                    }`}
                  >
                    {editingFormData.destacado ? "Destacada" : "No destacada"}
                  </span>
                </div>
                <div className="mt-2">
                  <textarea
                    value={editingFormData.contenido}
                    onChange={(e) =>
                      setEditingFormData({
                        ...editingFormData,
                        contenido: e.target.value,
                      })
                    }
                    className="w-full border rounded p-2"
                    rows={3}
                  />
                </div>
                <div className="mt-2 flex items-center">
                  <input
                    type="checkbox"
                    checked={editingFormData.destacado}
                    onChange={(e) =>
                      setEditingFormData({
                        ...editingFormData,
                        destacado: e.target.checked,
                      })
                    }
                    className="mr-2"
                  />
                  <span>Destacar Noticia</span>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Archivos Existentes:
                  </label>
                  <div className="mt-2 grid grid-cols-4 gap-4">
                    {noticia.archivos && noticia.archivos.length > 0 ? (
                      noticia.archivos.map((archivo) => (
                        <div key={archivo.id_archivo} className="relative">
                          <img
                            src={`/api/noticias/download/${archivo.id_archivo}`}
                            alt={archivo.titulo}
                            className="w-full h-32 object-cover rounded"
                            style={{
                              opacity:
                                editingFormData.archivosToDelete.includes(
                                  archivo.id_archivo
                                )
                                  ? 0.5
                                  : 1,
                            }}
                          />
                          <button
                            onClick={() =>
                              setEditingFormData((prev) => {
                                const { archivosToDelete } = prev;
                                if (
                                  archivosToDelete.includes(archivo.id_archivo)
                                ) {
                                  return {
                                    ...prev,
                                    archivosToDelete: archivosToDelete.filter(
                                      (id) => id !== archivo.id_archivo
                                    ),
                                  };
                                } else {
                                  return {
                                    ...prev,
                                    archivosToDelete: [
                                      ...archivosToDelete,
                                      archivo.id_archivo,
                                    ],
                                  };
                                }
                              })
                            }
                            className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
                          >
                            {editingFormData.archivosToDelete.includes(
                              archivo.id_archivo
                            )
                              ? "Undo"
                              : "X"}
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
                    Agregar nuevos archivos:
                  </label>
                  <input
                    type="file"
                    multiple
                    onChange={(e) =>
                      setEditingFormData({
                        ...editingFormData,
                        archivosToAdd: Array.from(e.target.files || []),
                      })
                    }
                    className="mt-1 block w-full"
                    accept="image/*,video/*"
                  />
                </div>
                <div className="flex justify-end space-x-3 mt-4">
                  <button
                    type="button"
                    onClick={cancelInlineEdit}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInlineUpdate(noticia.id_noticia)}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Guardar cambios
                  </button>
                </div>
              </div>
            ) : (
              // Modo visualización (sin edición)
              <div>
                <div className="flex justify-between items-center">
                  <h4 className="text-lg font-medium">{noticia.titulo}</h4>
                  <span
                    className={`px-2 py-1 rounded ${
                      noticia.destacado === 1
                        ? "bg-green-500 text-white"
                        : "bg-gray-300 text-black"
                    }`}
                  >
                    {noticia.destacado === 1 ? "Destacada" : "No destacada"}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  {new Date(noticia.fecha).toLocaleDateString()}
                </p>
                <p className="mt-2">{noticia.contenido}</p>
                {noticia.archivos && noticia.archivos.length > 0 && (
                  <div className="mt-4 grid grid-cols-4 gap-4">
                    {noticia.archivos.map((archivo) => (
                      <div key={archivo.id_archivo} className="relative">
                        <img
                          src={`/api/noticias/download/${archivo.id_archivo}`}
                          alt={archivo.titulo}
                          className="w-full h-32 object-cover rounded"
                        />
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex justify-end space-x-2 mt-2">
                  <button
                    onClick={() => startInlineEdit(noticia)}
                    className="px-3 py-1 text-blue-600 hover:underline"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(noticia.id_noticia)}
                    className="px-3 py-1 text-red-600 hover:underline"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Noticias;
