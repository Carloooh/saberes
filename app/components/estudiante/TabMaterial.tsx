"use client";

import { useState, useEffect } from "react";

interface Material {
  id_material: string;
  titulo: string;
  descripcion: string;
  fecha: string;
  enlace?: string;
  archivos: {
    id_material_archivo: string;
    titulo: string;
    extension: string;
  }[];
}

const TabMaterial = ({ asignaturaId }: { asignaturaId: string }) => {
  const [materiales, setMateriales] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMateriales = async () => {
      try {
        const response = await fetch(
          `/api/estudiante/material?asignaturaId=${asignaturaId}`
        );
        const data = await response.json();
        if (data.success) {
          setMateriales(data.materiales);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching materiales:", error);
        setLoading(false);
      }
    };

    fetchMateriales();
  }, [asignaturaId]);

  const handleDownload = (archivoId: string) => {
    window.open(`/api/estudiante/material/download?id=${archivoId}`, "_blank");
  };

  if (loading)
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-gray-500">Cargando material educativo...</div>
      </div>
    );

  return (
    <div className="space-y-4">
      {materiales.length === 0 ? (
        <div className="text-center justify-center text-gray-500 py-8">
          No hay material educativo disponibles
        </div>
      ) : (
        materiales.map((material) => (
          <div
            key={material.id_material}
            className="bg-white p-6 rounded-lg shadow"
          >
            <h3 className="text-lg font-semibold mb-2">{material.titulo}</h3>
            <p className="text-gray-600 mb-4">{material.descripcion}</p>
            <p className="text-sm text-gray-500 mb-4">
              Fecha:{" "}
              {new Date(material.fecha + "T00:00:00").toLocaleDateString(
                "es-CL"
              )}
            </p>

            {material.enlace && (
              <a
                href={material.enlace}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 block mb-4"
              >
                Enlace del material
              </a>
            )}

            {material.archivos.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Archivos:</h4>
                <div className="space-y-2">
                  {material.archivos.map((archivo) => (
                    <button
                      key={archivo.id_material_archivo}
                      onClick={() =>
                        handleDownload(archivo.id_material_archivo)
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
        ))
      )}
    </div>
  );
};

export default TabMaterial;
