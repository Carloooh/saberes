import React, { useState, useEffect } from "react";
import Image from "next/image";
import toast from "react-hot-toast";

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
        toast.success("Noticia creada con éxito");
      }
    } catch (error) {
      console.error("Error creating noticia:", error);
      toast.error("Error al crear la noticia");
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Fecha no disponible";

    try {
      // Handle SQL Server format (e.g. "Apr 4 2025 12:40PM")
      const match = dateString.match(/^([A-Za-z]{3})\s+(\d{1,2})\s+(\d{4})/);
      if (match) {
        const [, monthAbbr, day, year] = match;
        const monthNames: { [key: string]: string } = {
          Jan: "enero",
          Feb: "febrero",
          Mar: "marzo",
          Apr: "abril",
          May: "mayo",
          Jun: "junio",
          Jul: "julio",
          Aug: "agosto",
          Sep: "septiembre",
          Oct: "octubre",
          Nov: "noviembre",
          Dec: "diciembre",
        };

        return `${parseInt(day)} de ${monthNames[monthAbbr]} de ${year}`;
      }

      // Fallback to standard date parsing
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString("es-ES", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      }

      return dateString;
    } catch (error) {
      console.error("Error formatting date:", error, dateString);
      return "Fecha no disponible";
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
        toast.success("Noticia actualizada con éxito");
      }
    } catch (error) {
      console.error("Error updating noticia:", error);
      toast.error("Error al actualizar la noticia");
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
        toast.success("Noticia eliminada con éxito");
      }
    } catch (error) {
      console.error("Error deleting noticia:", error);
      toast.error("Error al eliminar la noticia");
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
    <div className="bg-white shadow sm:rounded-lg p-6">
      {/* Encabezado y botón para crear noticia */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-medium text-gray-900">
          Gestión de Noticias
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
              Nueva Noticia
            </>
          )}
        </button>
      </div>

      {/* Formulario para crear noticia */}
      {showCreateForm && (
        <div className="mb-6 p-6 border rounded-lg shadow-sm ">
          <h2 className="text-lg font-medium mb-4">Crear Noticia</h2>
          <form onSubmit={handleCreateSubmit}>
            <div className="grid grid-cols-1 gap-4 mb-4">
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
                  Contenido <span className="text-red-500">*</span>
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
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-medium
                    file:bg-indigo-50 file:text-indigo-600
                    hover:file:bg-indigo-100"
                  accept="image/*,video/*"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="destacado"
                  checked={createFormData.destacado}
                  onChange={(e) =>
                    setCreateFormData({
                      ...createFormData,
                      destacado: e.target.checked,
                    })
                  }
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label
                  htmlFor="destacado"
                  className="ml-2 text-sm text-gray-700"
                >
                  Destacar Noticia
                </label>
              </div>
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
                className="border border-gray-500 text-gray-500 bg-white px-4 py-2 rounded-md hover:bg-gray-500 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="border border-indigo-600 text-indigo-600 bg-white px-4 py-2 rounded-md hover:bg-indigo-600 hover:text-white transition-colors"
              >
                Crear Noticia
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Listado de noticias */}
      <div className="space-y-4">
        {noticias.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No hay noticias disponibles
          </div>
        ) : (
          noticias.map((noticia) => (
            <div
              key={noticia.id_noticia}
              className="border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              {editingNoticiaId === noticia.id_noticia ? (
                <div className="p-4">
                  <h3 className="text-lg font-medium mb-4">Editar Noticia</h3>
                  <div className="grid grid-cols-1 gap-4 mb-4">
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
                        Contenido
                      </label>
                      <textarea
                        value={editingFormData.contenido}
                        onChange={(e) =>
                          setEditingFormData({
                            ...editingFormData,
                            contenido: e.target.value,
                          })
                        }
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        rows={3}
                      />
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="edit-destacado"
                        checked={editingFormData.destacado}
                        onChange={(e) =>
                          setEditingFormData({
                            ...editingFormData,
                            destacado: e.target.checked,
                          })
                        }
                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <label
                        htmlFor="edit-destacado"
                        className="ml-2 text-sm text-gray-700"
                      >
                        Destacar Noticia
                      </label>
                    </div>
                  </div>

                  <div className="mb-4 z-0">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Archivos Existentes
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 z-0">
                      {noticia.archivos && noticia.archivos.length > 0 ? (
                        noticia.archivos.map((archivo) => (
                          <div
                            key={archivo.id_archivo}
                            className="relative group"
                          >
                            <div className="relative h-32 rounded-md overflow-hidden z-0">
                              <Image
                                src={`/api/noticias/download/${archivo.id_archivo}`}
                                alt={archivo.titulo}
                                fill
                                className="object-cover z-0"
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

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Agregar nuevos archivos
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
                      className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-medium
                        file:bg-indigo-50 file:text-indigo-600
                        hover:file:bg-indigo-100"
                      accept="image/*,video/*"
                    />
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={cancelInlineEdit}
                      className="border border-gray-500 text-gray-500 bg-white px-4 py-2 rounded-md hover:bg-gray-500 hover:text-white transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => handleInlineUpdate(noticia.id_noticia)}
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
                          {noticia.titulo}
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
                          {formatDate(noticia.fecha)}
                          {/* {new Date(noticia.fecha).toLocaleDateString()} */}
                        </p>
                      </div>
                      {noticia.destacado === 1 && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          Destacada
                        </span>
                      )}
                    </div>

                    <div className="mb-4">
                      <p className="text-gray-700">{noticia.contenido}</p>
                    </div>

                    {noticia.archivos && noticia.archivos.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 z-0">
                        {noticia.archivos.map((archivo) => (
                          <div key={archivo.id_archivo} className="group">
                            <div className="relative h-32 rounded-md overflow-hidden z-0">
                              <Image
                                src={`/api/noticias/download/${archivo.id_archivo}`}
                                alt={archivo.titulo}
                                fill
                                className="object-cover z-0"
                                unoptimized
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="border-t px-4 py-3 flex justify-end space-x-2">
                    <button
                      onClick={() => startInlineEdit(noticia)}
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
                      onClick={() => handleDelete(noticia.id_noticia)}
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

export default Noticias;
