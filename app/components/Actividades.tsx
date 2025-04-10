"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

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

const isVideoFile = (extension: string): boolean => {
  const videoExtensions = ["mp4", "webm", "ogg", "mov"];
  return videoExtensions.includes(extension.toLowerCase());
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
            <div className="grid grid-cols-1 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
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

  // Fix the slider settings to prevent duplicating media items
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    pauseOnHover: true,
    arrows: true,
    adaptiveHeight: true,
  };

  const thumbnailSliderSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    pauseOnHover: true,
    arrows: false,
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">
        Actividades
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {currentActividad && (
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden h-auto hover:shadow-xl transition-shadow">
              <div className="relative aspect-[16/9]">
                {currentActividad.archivos &&
                currentActividad.archivos.filter((archivo) =>
                  isMediaFile(archivo.extension)
                ).length > 0 ? (
                  <Slider {...sliderSettings}>
                    {currentActividad.archivos
                      .filter((archivo) => isMediaFile(archivo.extension))
                      .map((archivo) => (
                        <div key={archivo.id_archivo} className="outline-none">
                          <div className="relative aspect-[16/9]">
                            {isVideoFile(archivo.extension) ? (
                              <video
                                src={`/api/actividades/download/${archivo.id_archivo}`}
                                className="w-full h-full object-cover"
                                autoPlay
                                muted
                                loop
                                playsInline
                                controls
                              />
                            ) : (
                              <Image
                                src={`/api/actividades/download/${archivo.id_archivo}`}
                                alt={archivo.titulo}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            )}
                          </div>
                        </div>
                      ))}
                  </Slider>
                ) : (
                  <Image
                    src="/noimage.webp"
                    alt="No hay imagen disponible"
                    fill
                    className="object-cover"
                  />
                )}
              </div>
              <div className="p-4 flex flex-col justify-between">
                <h3 className="text-lg font-bold mb-1">
                  {currentActividad.titulo}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  {new Date(currentActividad.fecha).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-700">
                  {currentActividad.descripcion}
                </p>
              </div>
            </div>
          </div>
        )}
        <div className="flex flex-col gap-4">
          {actividades.map((actividad) => (
            <button
              key={actividad.id_actividad}
              onClick={() => setCurrentActividad(actividad)}
              className={`text-left transition-all duration-300 bg-white hover:bg-gray-50 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 overflow-hidden ${
                currentActividad?.id_actividad === actividad.id_actividad
                  ? "ring-2 ring-indigo-500"
                  : ""
              }`}
            >
              <div className="flex flex-row h-24">
                <div className="relative w-1/3 h-full flex-shrink-0 overflow-hidden">
                  {actividad.archivos &&
                  actividad.archivos.filter((archivo) => isMediaFile(archivo.extension)).length > 0 ? (
                    <Slider {...thumbnailSliderSettings}>
                      {actividad.archivos
                        .filter((archivo) => isMediaFile(archivo.extension))
                        .map((archivo) => (
                          <div key={archivo.id_archivo} className="outline-none">
                            <div className="relative h-24">
                              {isVideoFile(archivo.extension) ? (
                                <video
                                  src={`/api/actividades/download/${archivo.id_archivo}`}
                                  className="w-full h-full object-cover"
                                  autoPlay
                                  muted
                                  loop
                                  playsInline
                                />
                              ) : (
                                <Image
                                  src={`/api/actividades/download/${archivo.id_archivo}`}
                                  alt={archivo.titulo}
                                  fill
                                  className="object-cover"
                                  unoptimized
                                />
                              )}
                            </div>
                          </div>
                        ))}
                    </Slider>
                  ) : (
                    <Image
                      src="/noimage.webp"
                      alt="No hay imagen disponible"
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="p-3 flex-grow">
                  <h4 className="font-semibold text-sm line-clamp-2">
                    {actividad.titulo}
                  </h4>
                  <p className="text-xs text-gray-500">
                    {new Date(actividad.fecha).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </button>
          ))}
          <Link
            href="/actividades"
            className="flex items-center justify-center transition-all duration-300 bg-white hover:bg-gray-50 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 p-3"
          >
            <h4 className="font-semibold text-sm">Ver más actividades</h4>
          </Link>
        </div>
      </div>
    </div>
  );
}
