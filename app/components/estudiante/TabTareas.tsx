"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import es from "date-fns/locale/es";

interface Archivo {
  id_archivo: string;
  titulo: string;
  extension: string;
}

interface Entrega {
  id_entrega: string;
  fecha_entrega: string;
  estado: string;
  comentario: string | null;
  archivos: Archivo[];
}

interface Tarea {
  id_tarea: string;
  titulo: string;
  descripcion: string;
  fecha: string;
  archivos: Archivo[];
  entrega: Entrega | null;
}

const TabTareas = ({ asignaturaId }: { asignaturaId: string }) => {
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);

  useEffect(() => {
    fetchTareas();
  }, [asignaturaId]);

  const fetchTareas = async () => {
    try {
      const response = await fetch(
        `/api/estudiante/tareas?asignaturaId=${asignaturaId}`
      );
      const data = await response.json();
      if (data.success) {
        setTareas(data.tareas);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching tareas:", error);
      setLoading(false);
    }
  };

  const handleDownload = (archivoId: string, tipo: "tarea" | "entrega") => {
    window.open(
      `/api/docente/tareas/download?id=${archivoId}&tipo=${tipo}`,
      "_blank"
    );
  };

  const handleSubmit = async (
    tareaId: string,
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setSubmitting(tareaId);

    try {
      const formData = new FormData(e.currentTarget);
      formData.append("tareaId", tareaId);
      formData.append("asignaturaId", asignaturaId);

      const files = formData.getAll("archivos");
      if (files.length === 0) {
        alert("Por favor, selecciona al menos un archivo");
        return;
      }

      const response = await fetch("/api/estudiante/tareas", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        alert("Tarea entregada exitosamente");
        fetchTareas();
      } else {
        alert(data.error || "Error al entregar la tarea");
      }
    } catch (error) {
      console.error("Error submitting tarea:", error);
      alert("Error al entregar la tarea");
    } finally {
      setSubmitting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-gray-500">Cargando tareas...</div>
      </div>
    );
  }

  if (tareas.length === 0) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-gray-500">No hay tareas disponibles</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {tareas.map((tarea) => (
        <div
          key={tarea.id_tarea}
          className="bg-white rounded-lg shadow overflow-hidden"
        >
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold">{tarea.titulo}</h3>
              <span className="text-sm text-gray-500">
                {format(
                  new Date(tarea.fecha + "T00:00:00"),
                  "d 'de' MMMM 'de' yyyy",
                  {
                    locale: es,
                  }
                )}
              </span>
            </div>

            <p className="text-gray-600 mb-4">{tarea.descripcion}</p>

            {tarea.archivos.length > 0 && (
              <div className="mb-6">
                <h4 className="font-medium mb-2">Archivos de la tarea:</h4>
                <div className="space-y-2">
                  {tarea.archivos.map((archivo) => (
                    <button
                      key={archivo.id_archivo}
                      onClick={() =>
                        handleDownload(archivo.id_archivo, "tarea")
                      }
                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-2"
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
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 border-t pt-6">
              {tarea.entrega ? (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">Estado de entrega</h4>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        tarea.entrega.estado === "entregada"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {tarea.entrega.estado}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-4">
                    Entregado el:{" "}
                    {format(
                      new Date(tarea.entrega.fecha_entrega + "T00:00:00"),
                      "d 'de' MMMM 'de' yyyy",
                      { locale: es }
                    )}
                  </p>

                  {tarea.entrega.comentario && (
                    <div className="mb-4">
                      <h5 className="font-medium mb-2">Comentario:</h5>
                      <p className="text-gray-600 text-sm">
                        {tarea.entrega.comentario}
                      </p>
                    </div>
                  )}

                  {tarea.entrega.archivos.length > 0 && (
                    <div>
                      <h5 className="font-medium mb-2">Archivos entregados:</h5>
                      <div className="space-y-2">
                        {tarea.entrega.archivos.map((archivo) => (
                          <button
                            key={archivo.id_archivo}
                            onClick={() =>
                              handleDownload(archivo.id_archivo, "entrega")
                            }
                            className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-2"
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
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <form
                  onSubmit={(e) => handleSubmit(tarea.id_tarea, e)}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Comentario (opcional)
                    </label>
                    <textarea
                      name="comentario"
                      rows={3}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Agrega un comentario a tu entrega..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subir archivos
                    </label>
                    <input
                      type="file"
                      name="archivos"
                      multiple
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
                      className="block w-full text-sm text-gray-500
        file:mr-4 file:py-2 file:px-4
        file:rounded-full file:border-0
        file:text-sm file:font-semibold
        file:bg-blue-50 file:text-blue-700
        hover:file:bg-blue-100
        cursor-pointer"
                      required
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Formatos permitidos: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX,
                      TXT, ZIP, RAR
                    </p>
                  </div>
                  <button
                    type="submit"
                    disabled={submitting === tarea.id_tarea}
                    className={`w-full bg-blue-600 text-white px-4 py-2 rounded-md 
      ${
        submitting === tarea.id_tarea
          ? "opacity-50 cursor-not-allowed"
          : "hover:bg-blue-700"
      }`}
                  >
                    {submitting === tarea.id_tarea
                      ? "Entregando..."
                      : "Entregar Tarea"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TabTareas;
