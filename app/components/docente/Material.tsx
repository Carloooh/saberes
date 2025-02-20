"use client";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import es from "date-fns/locale/es";

interface MaterialArchivo {
  id_material_archivo: string;
  titulo: string;
  extension: string;
}

interface Material {
  id_material: string;
  id_asignatura: string;
  titulo: string;
  descripcion: string;
  fecha: string;
  enlace?: string;
  archivos?: MaterialArchivo[];
}

interface MaterialProps {
  cursoId: string;
  asignaturaId: string;
}

export default function Material({ cursoId, asignaturaId }: MaterialProps) {
  const [materiales, setMateriales] = useState<Material[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [currentMaterial, setCurrentMaterial] = useState<Partial<Material>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [files, setFiles] = useState<FileList | null>(null);

  useEffect(() => {
    if (asignaturaId) {
      fetchMateriales();
    }
  }, [asignaturaId]);

  const fetchMateriales = async () => {
    try {
      const response = await fetch(
        `/api/docente/material?asignaturaId=${asignaturaId}`
      );
      const data = await response.json();
      if (data.success) {
        setMateriales(data.materiales);
      }
    } catch (error) {
      console.error("Error al obtener materiales:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();

    if (!isEditing) {
      const today = new Date().toISOString().split("T")[0];
      formData.append("fecha", today);
    }

    Object.entries(currentMaterial).forEach(([key, value]) => {
      if (value !== undefined && key !== "archivos") {
        formData.append(key, value.toString());
      }
    });

    if (files) {
      Array.from(files).forEach((file, index) => {
        formData.append(`archivo-${index}`, file);
      });
    }

    formData.append("id_asignatura", asignaturaId);

    try {
      const response = await fetch("/api/docente/material", {
        method: isEditing ? "PUT" : "POST",
        body: formData,
      });

      if (response.ok) {
        setShowModal(false);
        setCurrentMaterial({});
        setFiles(null);
        fetchMateriales();
      }
    } catch (error) {
      console.error("Error al guardar material:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Está seguro de eliminar este material?")) return;

    try {
      const response = await fetch(`/api/docente/material?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchMateriales();
      }
    } catch (error) {
      console.error("Error al eliminar material:", error);
    }
  };

  const handleEdit = (material: Material) => {
    setCurrentMaterial(material);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleFileView = (archivoId: string) => {
    window.open(`/api/docente/material/download?id=${archivoId}`, "_blank");
  };

  const handleFileDownload = (archivoId: string) => {
    const link = document.createElement("a");
    link.href = `/api/docente/material/download?id=${archivoId}`;
    link.setAttribute("download", "");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Materiales Educativos</h2>
        <button
          onClick={() => {
            setIsEditing(false);
            setCurrentMaterial({});
            setShowModal(true);
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Agregar Material
        </button>
      </div>

      <div className="grid gap-4">
        {materiales.map((material) => (
          <div
            key={material.id_material}
            className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div className="flex-grow">
                <h3 className="text-lg font-semibold mb-2">
                  {material.titulo}
                </h3>
                <p className="text-gray-600 mb-2">{material.descripcion}</p>
                <p className="text-sm text-gray-500 mb-2">
                  {material.fecha
                    ? format(
                        new Date(material.fecha + "T00:00:00"),
                        "d 'de' MMMM 'de' yyyy",
                        {
                          locale: es,
                        }
                      )
                    : ""}
                </p>
                <div className="flex flex-col gap-2 mt-3">
                  {material.enlace && (
                    <a
                      href={material.enlace}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-700 inline-flex items-center"
                    >
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                      <span>Ver enlace</span>
                    </a>
                  )}
                  {material.archivos && material.archivos.length > 0 && (
                    <div className="border-t pt-2">
                      <h4 className="text-sm font-semibold mb-2">
                        Archivos adjuntos:
                      </h4>
                      <div className="grid gap-2">
                        {material.archivos.map((archivo) => (
                          <div
                            key={archivo.id_material_archivo}
                            className="flex items-center justify-between bg-gray-50 p-2 rounded"
                          >
                            <span className="text-sm">
                              {archivo.titulo}.{archivo.extension}
                            </span>
                            <div className="flex space-x-2">
                              <button
                                onClick={() =>
                                  handleFileView(archivo.id_material_archivo)
                                }
                                className="text-blue-500 hover:text-blue-700 inline-flex items-center text-sm"
                              >
                                <svg
                                  className="w-4 h-4 mr-1"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                  />
                                </svg>
                                Ver
                              </button>
                              <button
                                onClick={() =>
                                  handleFileDownload(
                                    archivo.id_material_archivo
                                  )
                                }
                                className="text-green-500 hover:text-green-700 inline-flex items-center text-sm"
                              >
                                <svg
                                  className="w-4 h-4 mr-1"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                  />
                                </svg>
                                Descargar
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => handleEdit(material)}
                  className="text-blue-500 hover:text-blue-700 inline-flex items-center"
                >
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  <span>Editar</span>
                </button>
                <button
                  onClick={() => handleDelete(material.id_material)}
                  className="text-red-500 hover:text-red-700 inline-flex items-center"
                >
                  <svg
                    className="w-4 h-4 mr-1"
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
                  <span>Eliminar</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">
              {isEditing ? "Editar Material" : "Nuevo Material"}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Título
                </label>
                <input
                  type="text"
                  value={currentMaterial.titulo || ""}
                  onChange={(e) =>
                    setCurrentMaterial({
                      ...currentMaterial,
                      titulo: e.target.value,
                    })
                  }
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Descripción
                </label>
                <textarea
                  value={currentMaterial.descripcion || ""}
                  onChange={(e) =>
                    setCurrentMaterial({
                      ...currentMaterial,
                      descripcion: e.target.value,
                    })
                  }
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Enlace (opcional)
                </label>
                <input
                  type="url"
                  value={currentMaterial.enlace || ""}
                  onChange={(e) =>
                    setCurrentMaterial({
                      ...currentMaterial,
                      enlace: e.target.value,
                    })
                  }
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Archivos (opcional)
                </label>
                <input
                  type="file"
                  multiple
                  onChange={(e) => setFiles(e.target.files)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                />
                {isEditing &&
                  currentMaterial.archivos &&
                  currentMaterial.archivos.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 mb-1">
                        Archivos actuales:
                      </p>
                      <ul className="list-disc pl-5">
                        {currentMaterial.archivos.map((archivo) => (
                          <li
                            key={archivo.id_material_archivo}
                            className="text-sm text-gray-600"
                          >
                            {archivo.titulo}.{archivo.extension}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded mr-2"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  {isEditing ? "Actualizar" : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
