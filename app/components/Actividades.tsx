"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

interface Archivo {
  id_archivo: string;
  titulo: string;
  extension: string;
}

interface Actividad {
  id_actividad: string;
  titulo: string;
  descripcion: string;
  fecha: string;
  archivos?: Archivo[];
}

const isMediaFile = (extension: string): boolean => {
  const mediaExtensions = ["jpg", "jpeg", "png", "gif", "mp4", "webm"];
  return mediaExtensions.includes(extension.toLowerCase());
};

export default function Actividades() {
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [currentActividad, setCurrentActividad] = useState<Actividad | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActividades();
  }, []);

  const fetchActividades = async () => {
    try {
      const response = await fetch("/api/actividades");
      const data = await response.json();
      if (data.success) {
        const limitedActividades = data.actividades.slice(0, 4);
        setActividades(limitedActividades);
        if (limitedActividades.length > 0) {
          setCurrentActividad(limitedActividades[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching actividades:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 bg-gray-200 rounded-lg h-80"></div>
            <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (actividades.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">
          Actividades
        </h2>
        <div className="text-center text-gray-600">
          No hay actividades disponibles en este momento.
        </div>
      </div>
    );
  }

  const getFirstMediaFile = (actividad: Actividad) => {
    const mediaFiles = actividad.archivos?.filter((archivo) =>
      isMediaFile(archivo.extension)
    );
    return mediaFiles && mediaFiles.length > 0 ? mediaFiles[0] : null;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">
        Actividades
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {currentActividad && (
          <div className="md:col-span-2">
            <Link href="/actividades" className="block">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden h-80 hover:shadow-xl transition-shadow">
                <div className="relative h-48">
                  {getFirstMediaFile(currentActividad) ? (
                    <Image
                      src={`/api/actividades/download/${
                        getFirstMediaFile(currentActividad)?.id_archivo
                      }`}
                      alt={currentActividad.titulo}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <Image
                      src="/noimage.webp"
                      alt="No hay imagen disponible"
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="p-4 h-32 flex flex-col justify-between">
                  <h3 className="text-lg font-bold mb-1">
                    {currentActividad.titulo}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {new Date(currentActividad.fecha).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {currentActividad.descripcion}
                  </p>
                </div>
              </div>
            </Link>
          </div>
        )}
        <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
          {actividades.slice(1).map((actividad) => (
            <button
              key={actividad.id_actividad}
              onClick={() => setCurrentActividad(actividad)}
              className="text-left transition-all duration-300 bg-white hover:bg-gray-50 border rounded-lg p-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <h4 className="font-semibold text-sm">{actividad.titulo}</h4>
              <p className="text-xs text-gray-500">
                {new Date(actividad.fecha).toLocaleDateString()}
              </p>
            </button>
          ))}
          <Link
            href="/actividades"
            className={`flex items-center justify-center transition-all duration-300 bg-white hover:bg-gray-50 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              actividades.length === 1
                ? "col-span-2 md:col-span-1 h-12"
                : "h-full min-h-[3rem]"
            }`}
          >
            <h4 className="font-semibold text-sm px-3">Ver más actividades</h4>
          </Link>
        </div>
        {/* <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
          {actividades.slice(1).map((actividad) => (
            <button
              key={actividad.id_actividad}
              onClick={() => setCurrentActividad(actividad)}
              className="text-left transition-all duration-300 bg-white hover:bg-gray-50 border rounded-lg p-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <h4 className="font-semibold text-sm">{actividad.titulo}</h4>
              <p className="text-xs text-gray-500">
                {new Date(actividad.fecha).toLocaleDateString()}
              </p>
            </button>
          ))}
          <Link
            href="/actividades"
            className={`text-center transition-all duration-300 bg-white hover:bg-gray-50 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              actividades.length <= 2 ? "p-2" : "p-3"
            } ${actividades.length === 1 ? "col-span-2 md:col-span-1" : ""}`}
          >
            <h4 className="font-semibold text-sm">Ver más actividades</h4>
          </Link>
        </div> */}
      </div>
    </div>
  );
}
