"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import toast from "react-hot-toast";

interface Sede {
  id_sede: string;
  nombre: string;
  direccion: string;
  url: string;
  url_iframe: string;
  cursos: string[];
  imagen?: string;
  archivos?: {
    id_archivo: string;
    titulo: string;
    extension: string;
  }[];
}

interface Curso {
  id_curso: string;
  nombre_curso: string;
}

const Sedes: React.FC = () => {
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Add a function to extract the src URL from iframe HTML
  const extractIframeSrc = (iframeHtml: string): string => {
    const srcMatch = iframeHtml.match(/src="([^"]+)"/);
    return srcMatch ? srcMatch[1] : iframeHtml;
  };

  // Handle iframe input change with automatic URL extraction
  const handleIframeInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    formType: "create" | "edit"
  ) => {
    const value = e.target.value;
    const extractedUrl = extractIframeSrc(value);

    if (formType === "create") {
      setCreateFormData({
        ...createFormData,
        url_iframe: extractedUrl,
      });
    } else {
      setEditFormData({
        ...editFormData,
        url_iframe: extractedUrl,
      });
    }
  };

  const [createFormData, setCreateFormData] = useState({
    nombre: "",
    direccion: "",
    url: "",
    url_iframe: "",
    cursos: [] as string[],
    archivos: [] as File[],
  });

  const [editId, setEditId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({
    nombre: "",
    direccion: "",
    url: "",
    url_iframe: "",
    cursos: [] as string[],
    archivosToAdd: [] as File[],
    archivosToDelete: [] as string[],
  });

  useEffect(() => {
    fetch("/api/cursos")
      .then((res) => res.json())
      .then((data) => {
        // Handle the new response format where data is wrapped in a 'data' property
        if (data.success && Array.isArray(data.data)) {
          setCursos(data.data);
        } else if (Array.isArray(data)) {
          setCursos(data);
        } else {
          console.error("Unexpected format for cursos data:", data);
          setCursos([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching cursos:", error);
        setCursos([]);
      });
  }, []);

  const fetchSedes = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/sedes");
      const result = await response.json();

      if (result.success) {
        setSedes(result.data);
      } else {
        setError("Error al cargar las sedes");
      }
    } catch (error) {
      setError("Error en la conexión con el servidor");
      toast.error(`Error en la conexión con el servidor: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSedes();
  }, []);

  const handleCursoChange = (cursoId: string, formType: "create" | "edit") => {
    if (formType === "create") {
      setCreateFormData((prev) => ({
        ...prev,
        cursos: prev.cursos.includes(cursoId)
          ? prev.cursos.filter((id) => id !== cursoId)
          : [...prev.cursos, cursoId],
      }));
    } else {
      setEditFormData((prev) => ({
        ...prev,
        cursos: prev.cursos.includes(cursoId)
          ? prev.cursos.filter((id) => id !== cursoId)
          : [...prev.cursos, cursoId],
      }));
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("nombre", createFormData.nombre);
    formData.append("direccion", createFormData.direccion);
    formData.append("url", createFormData.url);
    formData.append("url_iframe", createFormData.url_iframe);
    formData.append("cursos", JSON.stringify(createFormData.cursos));
    createFormData.archivos.forEach((file, index) => {
      formData.append(`archivo-${index}`, file);
    });

    try {
      const response = await fetch("/api/sedes", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();

      if (result.success) {
        setCreateFormData({
          nombre: "",
          direccion: "",
          url: "",
          url_iframe: "",
          cursos: [],
          archivos: [],
        });
        setShowCreateForm(false);
        fetchSedes();
      }
    } catch (error) {
      setError("Error al crear la sede");
      toast.error(`Error al crear la sede: ${error}`);
    }
  };

  const handleEdit = async (id: string) => {
    const formData = new FormData();
    formData.append("id_sede", id);
    formData.append("nombre", editFormData.nombre);
    formData.append("direccion", editFormData.direccion);
    formData.append("url", editFormData.url);
    formData.append("url_iframe", editFormData.url_iframe);
    formData.append("cursos", JSON.stringify(editFormData.cursos));

    if (editFormData.archivosToDelete.length > 0) {
      formData.append(
        "archivosAEliminar",
        JSON.stringify(editFormData.archivosToDelete)
      );
    }

    editFormData.archivosToAdd.forEach((file, index) => {
      formData.append(`archivo-${index}`, file);
    });

    try {
      const response = await fetch("/api/sedes", {
        method: "PUT",
        body: formData,
      });
      const result = await response.json();

      if (result.success) {
        setEditId(null);
        setEditFormData({
          nombre: "",
          direccion: "",
          url: "",
          url_iframe: "",
          cursos: [],
          archivosToAdd: [],
          archivosToDelete: [],
        });
        fetchSedes();
      }
    } catch (error) {
      setError("Error al actualizar la sede");
      toast.error(`Error al actualizar la sede: ${error}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta sede?")) return;
    try {
      const response = await fetch("/api/sedes", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id_sede: id }),
      });
      const result = await response.json();

      if (result.success) {
        fetchSedes();
      }
    } catch (error) {
      setError("Error al eliminar la sede");
      toast.error(`Error al eliminar la sede: ${error}`);
    }
  };

  const startEdit = (sede: Sede) => {
    setEditId(sede.id_sede);
    setEditFormData({
      nombre: sede.nombre,
      direccion: sede.direccion,
      url: sede.url,
      url_iframe: sede.url_iframe,
      cursos: sede.cursos || [],
      archivosToAdd: [],
      archivosToDelete: [],
    });
  };

  if (loading) {
    return <div className="text-center p-4">Cargando...</div>;
  }

  return (
    <div className="bg-white shadow sm:rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-medium text-gray-900">Gestión de Sedes</h1>
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
              Nueva Sede
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {showCreateForm && (
        <div className="mb-6 p-6 border rounded-lg shadow-sm ">
          <h2 className="text-lg font-medium mb-4">Crear Sede</h2>
          <form onSubmit={handleCreateSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={createFormData.nombre}
                  onChange={(e) =>
                    setCreateFormData({
                      ...createFormData,
                      nombre: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Dirección <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={createFormData.direccion}
                  onChange={(e) =>
                    setCreateFormData({
                      ...createFormData,
                      direccion: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Link Google Maps <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  placeholder="Ejemplo: https://maps.app.goo.gl/3jM3ADZCkNUZYd7Z7"
                  value={createFormData.url}
                  onChange={(e) =>
                    setCreateFormData({
                      ...createFormData,
                      url: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  URL iframe mapa
                </label>
                <input
                  type="text"
                  value={createFormData.url_iframe}
                  placeholder="Pega aquí el código iframe de Google Maps"
                  onChange={(e) => handleIframeInputChange(e, "create")}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Pega el código completo del iframe y se extraerá
                  automáticamente la URL
                </p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cursos
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-white p-3 border rounded-md max-h-60 overflow-y-auto">
                  {cursos.map((curso) => (
                    <div key={curso.id_curso} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`create-curso-${curso.id_curso}`}
                        checked={createFormData.cursos.includes(curso.id_curso)}
                        onChange={() =>
                          handleCursoChange(curso.id_curso, "create")
                        }
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor={`create-curso-${curso.id_curso}`}
                        className="ml-2 block text-sm text-gray-900"
                      >
                        {curso.nombre_curso}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="md:col-span-2">
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
                  className="mt-1 block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-medium
                    file:bg-indigo-50 file:text-indigo-600
                    hover:file:bg-indigo-100"
                  accept="image/*,video/*"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setCreateFormData({
                    nombre: "",
                    direccion: "",
                    url: "",
                    url_iframe: "",
                    cursos: [],
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
                Crear Sede
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sedes.length === 0 ? (
          <div className="col-span-3 text-center py-8 text-gray-500">
            No hay sedes disponibles
          </div>
        ) : (
          sedes.map((sede) => (
            <div
              key={sede.id_sede}
              className="border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              {editId === sede.id_sede ? (
                <div className="p-4">
                  <h3 className="text-lg font-medium mb-4">Editar Sede</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre
                      </label>
                      <input
                        type="text"
                        value={editFormData.nombre}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            nombre: e.target.value,
                          })
                        }
                        className="w-full p-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Nombre"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dirección
                      </label>
                      <input
                        type="text"
                        value={editFormData.direccion}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            direccion: e.target.value,
                          })
                        }
                        className="w-full p-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Dirección"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Link Google Maps
                      </label>
                      <input
                        type="url"
                        value={editFormData.url}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            url: e.target.value,
                          })
                        }
                        className="w-full p-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="URL"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        URL iframe mapa
                      </label>
                      <input
                        type="text"
                        value={editFormData.url_iframe}
                        onChange={(e) => handleIframeInputChange(e, "edit")}
                        className="w-full p-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Pega aquí el código iframe de Google Maps"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Pega el código completo del iframe y se extraerá
                        automáticamente la URL
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cursos
                      </label>
                      <div className="grid grid-cols-2 gap-2 bg-white p-3 border rounded-md max-h-40 overflow-y-auto">
                        {cursos.map((curso) => (
                          <div
                            key={curso.id_curso}
                            className="flex items-center"
                          >
                            <input
                              type="checkbox"
                              id={`edit-curso-${curso.id_curso}`}
                              checked={editFormData.cursos.includes(
                                curso.id_curso
                              )}
                              onChange={() =>
                                handleCursoChange(curso.id_curso, "edit")
                              }
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <label
                              htmlFor={`edit-curso-${curso.id_curso}`}
                              className="ml-2 block text-sm text-gray-900"
                            >
                              {curso.nombre_curso}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Agregar archivos
                      </label>
                      <input
                        type="file"
                        multiple
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            archivosToAdd: Array.from(e.target.files || []),
                          })
                        }
                        className="w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-md file:border-0
                          file:text-sm file:font-medium
                          file:bg-indigo-50 file:text-indigo-600
                          hover:file:bg-indigo-100"
                        accept="image/*,video/*"
                      />
                    </div>
                    {sede.archivos && sede.archivos.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Archivos actuales
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {sede.archivos.map((archivo) => (
                            <div key={archivo.id_archivo} className="relative">
                              <Image
                                src={`/api/sedes/download/${archivo.id_archivo}`}
                                alt={archivo.titulo}
                                width={100}
                                height={100}
                                className="w-full h-24 object-cover rounded"
                                unoptimized
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setEditFormData({
                                    ...editFormData,
                                    archivosToDelete: [
                                      ...editFormData.archivosToDelete,
                                      archivo.id_archivo,
                                    ],
                                  })
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
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end space-x-2 mt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setEditId(null);
                        setEditFormData({
                          nombre: "",
                          direccion: "",
                          url: "",
                          url_iframe: "",
                          cursos: [],
                          archivosToAdd: [],
                          archivosToDelete: [],
                        });
                      }}
                      className="border border-gray-500 text-gray-500 bg-white px-3 py-1.5 rounded-md hover:bg-gray-500 hover:text-white transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEdit(sede.id_sede)}
                      className="border border-green-600 text-green-600 bg-white px-3 py-1.5 rounded-md hover:bg-green-600 hover:text-white transition-colors"
                    >
                      Guardar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-2">
                      {sede.nombre}
                    </h3>
                    <div className="flex items-start mb-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-500 mr-1 mt-0.5 flex-shrink-0"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <p className="text-gray-600">{sede.direccion}</p>
                    </div>
                    <a
                      href={sede.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-800 hover:underline mb-3 inline-flex items-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Ver en Google Maps
                    </a>

                    {sede.url_iframe && (
                      <div className="mb-3 rounded-md overflow-hidden border border-gray-200">
                        <iframe
                          src={sede.url_iframe}
                          className="w-full h-48"
                          frameBorder="0"
                          allowFullScreen
                        ></iframe>
                      </div>
                    )}

                    {sede.cursos && sede.cursos.length > 0 && (
                      <div className="mb-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-1">
                          Cursos:
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {sede.cursos.map((cursoId) => {
                            const curso = cursos.find(
                              (c) => c.id_curso === cursoId
                            );
                            return curso ? (
                              <span
                                key={cursoId}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                              >
                                {curso.nombre_curso}
                              </span>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}

                    {sede.archivos && sede.archivos.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        {sede.archivos.map((archivo) => (
                          <div
                            key={archivo.id_archivo}
                            className="rounded-md overflow-hidden"
                          >
                            <Image
                              src={`/api/sedes/download/${archivo.id_archivo}`}
                              alt={archivo.titulo}
                              width={100}
                              height={100}
                              className="w-full h-24 object-cover"
                              unoptimized
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="border-t px-4 py-3 flex justify-end space-x-2">
                    <button
                      onClick={() => startEdit(sede)}
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
                      onClick={() => handleDelete(sede.id_sede)}
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

export default Sedes;
