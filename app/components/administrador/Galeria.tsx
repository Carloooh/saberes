"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import toast from "react-hot-toast";

interface Archivo {
  id_archivo: string;
  extension: string;
  titulo?: string; // Add titulo to the interface
}

const Galeria: React.FC = () => {
  const [archivos, setArchivos] = useState<Archivo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [showUploadForm, setShowUploadForm] = useState(false);

  // Obtener archivos al cargar el componente o al cambiar la búsqueda
  const fetchArchivos = async () => {
    try {
      const response = await fetch(`/api/galeria?search=${searchQuery}`);
      const result = await response.json();

      if (result.success) {
        setArchivos(result.data);
      } else {
        setError("Error al cargar los archivos");
        toast.error("Error al cargar los archivos");
      }
    } catch {
      setError("Error en la conexión con el servidor");
      toast.error("Error en la conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchivos();
  }, [searchQuery]);

  // Subir un nuevo archivo
  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar el tipo de archivo
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "video/mp4"];
    if (!allowedTypes.includes(file.type)) {
      setError(
        "Formato de archivo no permitido. Solo se permiten PNG, JPG, JPEG y MP4."
      );
      toast.error(
        "Formato de archivo no permitido. Solo se permiten PNG, JPG, JPEG y MP4."
      );
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    setUploadMessage("Subiendo archivo...");

    try {
      const response = await fetch("/api/galeria", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setUploadMessage("Archivo subido correctamente.");
        toast.success("Archivo subido correctamente");
        fetchArchivos(); // Actualizar el listado
        setTimeout(() => setUploadMessage(""), 3000); // Limpiar mensaje después de 3 segundos
        setShowUploadForm(false); // Ocultar el formulario después de subir
      } else {
        setError("Error al subir el archivo");
        toast.error("Error al subir el archivo");
      }
    } catch {
      setError("Error en la conexión con el servidor");
      toast.error("Error en la conexión con el servidor");
    } finally {
      setUploading(false);
    }
  };

  // Eliminar un archivo
  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este archivo?")) return;

    try {
      const response = await fetch("/api/galeria", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id_archivo: id }),
      });

      const result = await response.json();

      if (result.success) {
        fetchArchivos(); // Actualizar el listado
        toast.success("Archivo eliminado correctamente");
      } else {
        setError("Error al eliminar el archivo");
        toast.error("Error al eliminar el archivo");
      }
    } catch {
      setError("Error en la conexión con el servidor");
      toast.error("Error en la conexión con el servidor");
    }
  };

  // Descargar un archivo
  const handleDownload = async (id: string, extension: string, titulo: string) => {
    try {
      const response = await fetch(`/api/galeria/download?id=${id}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${titulo || id}.${extension}`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success("Descarga iniciada");
    } catch {
      setError("Error al descargar el archivo");
      toast.error("Error al descargar el archivo");
    }
  };

  // Visualizar un archivo en una nueva pestaña
  const handleView = (id: string) => {
    const url = `/api/galeria/download?id=${id}`;
    window.open(url, "_blank");
  };

  // Editar el nombre de un archivo
  const handleRename = async (id: string) => {
    if (!nuevoNombre.trim()) {
      toast.error("El nombre no puede estar vacío");
      return;
    }

    try {
      const response = await fetch("/api/galeria", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id_archivo: id, nuevoNombre }),
      });

      const result = await response.json();

      if (result.success) {
        setEditId(null);
        setNuevoNombre("");
        fetchArchivos(); // Actualizar el listado
        toast.success("Archivo renombrado correctamente");
      } else {
        setError("Error al renombrar el archivo");
        toast.error("Error al renombrar el archivo");
      }
    } catch {
      setError("Error en la conexión con el servidor");
      toast.error("Error en la conexión con el servidor");
    }
  };

  if (loading) {
    return (
      <div className="bg-white shadow sm:rounded-lg p-6">
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  if (error && archivos.length === 0) {
    return (
      <div className="bg-white shadow sm:rounded-lg p-6">
        <div className="flex justify-center items-center h-40">
          <p className="text-red-500 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow sm:rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-medium text-gray-900">
          Galería de Archivos
        </h1>
        <button
          onClick={() => setShowUploadForm(!showUploadForm)}
          className="border border-indigo-600 text-indigo-600 bg-white px-4 py-2 rounded-md hover:bg-indigo-600 hover:text-white transition-colors flex items-center"
        >
          {showUploadForm ? (
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
              Subir Archivo
            </>
          )}
        </button>
      </div>

      {/* Filtro de búsqueda */}
      <div className="mb-6">
        <label
          htmlFor="search"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Buscar archivos
        </label>
        <div className="relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <input
            id="search"
            type="text"
            placeholder="Buscar por nombre o extensión"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Subir nuevo archivo - solo se muestra cuando showUploadForm es true */}
      {showUploadForm && (
        <div className="mb-8 p-4  rounded-lg border border-gray-200">
          <h2 className="text-lg font-medium text-gray-800 mb-3">
            Subir nuevo archivo
          </h2>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Seleccionar archivo (PNG, JPG, JPEG, MP4)
              </label>
              <input
                type="file"
                onChange={handleUpload}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-medium
                  file:bg-indigo-50 file:text-indigo-600
                  hover:file:bg-indigo-100"
                accept=".png,.jpg,.jpeg,.mp4"
              />
            </div>
          </div>
          {uploading && (
            <div className="mt-3 flex items-center text-blue-500">
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500 mr-2"></div>
              <span>{uploadMessage}</span>
            </div>
          )}
          {uploadMessage && !uploading && (
            <p className="mt-3 text-green-500">{uploadMessage}</p>
          )}
        </div>
      )}

      {/* Listado de archivos */}
      <div className="space-y-4">
        {archivos.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No hay archivos disponibles
          </div>
        ) : (
          archivos.map((archivo) => (
            <div
              key={archivo.id_archivo}
              className="border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center space-x-4">
                    {/* Preview del archivo */}
                    <div className="h-16 w-16 flex-shrink-0 rounded-md overflow-hidden bg-gray-100 border">
                      {archivo.extension === "mp4" ? (
                        <video
                          src={`/api/galeria/download?id=${archivo.id_archivo}`}
                          className="h-full w-full object-cover"
                          controls={false}
                        />
                      ) : (
                        <Image
                          src={`/api/galeria/download?id=${archivo.id_archivo}`}
                          alt={archivo.titulo || archivo.id_archivo}
                          width={64}
                          height={64}
                          className="h-full w-full object-cover"
                          unoptimized
                        />
                      )}
                    </div>
                    <div>
                      {/* Display titulo instead of id_archivo */}
                      <p className="font-medium text-gray-900">
                        {archivo.titulo || archivo.id_archivo}
                      </p>
                      <p className="text-sm text-gray-500">
                        .{archivo.extension}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleView(archivo.id_archivo)}
                      className="border border-blue-500 text-blue-500 bg-white px-3 py-1.5 rounded-md hover:bg-blue-500 hover:text-white transition-colors text-sm flex items-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path
                          fillRule="evenodd"
                          d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Ver
                    </button>
                    <button
                      onClick={() =>
                        handleDownload(archivo.id_archivo, archivo.extension, archivo.titulo || archivo.id_archivo)
                      }
                      className="border border-green-500 text-green-500 bg-white px-3 py-1.5 rounded-md hover:bg-green-500 hover:text-white transition-colors text-sm flex items-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Descargar
                    </button>
                    <button
                      onClick={() => setEditId(archivo.id_archivo)}
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
                      Renombrar
                    </button>
                    <button
                      onClick={() => handleDelete(archivo.id_archivo)}
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
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8a1 1 0 00-1-1zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Eliminar
                    </button>
                  </div>
                </div>

                {editId === archivo.id_archivo && (
                  <div className="mt-4 p-4 rounded-md">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nuevo nombre
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Nuevo nombre"
                        value={nuevoNombre}
                        onChange={(e) => setNuevoNombre(e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                      <button
                        onClick={() => handleRename(archivo.id_archivo)}
                        className="border border-green-600 text-green-600 bg-white px-4 py-2 rounded-md hover:bg-green-600 hover:text-white transition-colors"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={() => {
                          setEditId(null);
                          setNuevoNombre("");
                        }}
                        className="border border-gray-500 text-gray-500 bg-white px-4 py-2 rounded-md hover:bg-gray-500 hover:text-white transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Galeria;
