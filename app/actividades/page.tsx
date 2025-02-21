"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
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

const ActividadesPage: React.FC = () => {
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [selectedActividad, setSelectedActividad] = useState<Actividad | null>(
    null
  );

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    pauseOnHover: true,
    fade: true,
    cssEase: "linear",
    arrows: true,
  };

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

  return (
    <div>
      <header className="text-black py-4">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-semibold text-center">Actividades</h1>
        </div>
      </header>

      <div className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {actividades.map((actividad) => {
            const mediaFiles =
              actividad.archivos?.filter((archivo) =>
                isMediaFile(archivo.extension)
              ) || [];

            return (
              <div
                key={actividad.id_actividad}
                className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
              >
                <div className="mb-4 aspect-[16/9] relative">
                  {mediaFiles.length > 0 ? (
                    <Slider {...sliderSettings}>
                      {mediaFiles.map((archivo) => (
                        <div key={archivo.id_archivo}>
                          <div className="relative aspect-[16/9]">
                            <Image
                              src={`/api/actividades/download/${archivo.id_archivo}`}
                              alt={archivo.titulo}
                              fill
                              className="object-cover rounded-lg"
                              unoptimized
                            />
                          </div>
                        </div>
                      ))}
                    </Slider>
                  ) : (
                    <Image
                      src="/noimage.webp"
                      alt="No hay imagen disponible"
                      fill
                      className="object-cover rounded-lg"
                    />
                  )}
                </div>
                <h3 className="font-semibold text-lg mb-2">
                  {actividad.titulo}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  {new Date(actividad.fecha).toLocaleDateString()}
                </p>
                <p className="line-clamp-3">{actividad.descripcion}</p>
                <button
                  onClick={() => setSelectedActividad(actividad)}
                  className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors w-full"
                >
                  Ver más
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {selectedActividad && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {selectedActividad.titulo}
            </h2>

            {(() => {
              const mediaFiles =
                selectedActividad.archivos?.filter((archivo) =>
                  isMediaFile(archivo.extension)
                ) || [];
              const documentFiles =
                selectedActividad.archivos?.filter(
                  (archivo) => !isMediaFile(archivo.extension)
                ) || [];

              return (
                <>
                  <div className="mb-6 aspect-[16/9] relative">
                    {mediaFiles.length > 0 ? (
                      <Slider {...sliderSettings}>
                        {mediaFiles.map((archivo) => (
                          <div key={archivo.id_archivo}>
                            <div className="relative aspect-[16/9]">
                              <Image
                                src={`/api/actividades/download/${archivo.id_archivo}`}
                                alt={archivo.titulo}
                                fill
                                className="object-cover rounded-lg"
                                unoptimized
                              />
                            </div>
                          </div>
                        ))}
                      </Slider>
                    ) : (
                      <Image
                        src="/noimage.webp"
                        alt="No hay imagen disponible"
                        fill
                        className="object-cover rounded-lg"
                      />
                    )}
                  </div>

                  {documentFiles.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-2">
                        Documentos adjuntos:
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {documentFiles.map((doc) => (
                          <a
                            key={doc.id_archivo}
                            href={`/api/actividades/download/${doc.id_archivo}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center p-3 border rounded-lg hover:bg-gray-50"
                          >
                            <div className="text-2xl mr-3">📄</div>
                            <div>
                              <div className="font-medium">{doc.titulo}</div>
                              <div className="text-sm text-gray-500">
                                .{doc.extension}
                              </div>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  <p className="text-sm text-gray-600 mb-4">
                    {new Date(selectedActividad.fecha).toLocaleDateString()}
                  </p>
                  <p className="mb-6 whitespace-pre-wrap">
                    {selectedActividad.descripcion}
                  </p>
                </>
              );
            })()}

            <button
              onClick={() => setSelectedActividad(null)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActividadesPage;
