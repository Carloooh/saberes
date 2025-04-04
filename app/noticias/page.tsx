"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { format } from "path";

interface Archivo {
  id_archivo: string;
  titulo: string;
  extension: string;
}

interface Noticia {
  id_noticia: string;
  titulo: string;
  contenido: string;
  fecha: string;
  destacado: number;
  archivos?: Archivo[];
}

const Noticias: React.FC = () => {
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [selectedNoticia, setSelectedNoticia] = useState<Noticia | null>(null);

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

  useEffect(() => {
    fetchNoticias();
  }, []);

  if (noticias.length === 0) {
    return (
      <section className="section relative flex flex-row justify-center items-center pt-8 px-2">
        <div className="container text-center">
          <h1 className="text-3xl font-medium text-center w-full pb-4">
            Noticias
          </h1>
          <p>No hay noticias hasta el momento.</p>
        </div>
      </section>
    );
  }

  const getMediaType = (extension: string): "image" | "video" => {
    const ext = extension.toLowerCase();
    if (["mp4", "webm", "ogg"].includes(ext)) return "video";
    return "image";
  };

  return (
    <div className="min-h-screen overflow-x-hidden">
      <header className="text-black py-4">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-semibold text-center">Noticias</h1>
        </div>
      </header>

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {noticias.map((noticia) => (
            <div
              key={noticia.id_noticia}
              className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
            >
              <div className="mb-4 aspect-[16/9] relative">
                {noticia.archivos && noticia.archivos.length > 0 ? (
                  <Slider {...sliderSettings}>
                    {noticia.archivos.map((archivo) => (
                      <div key={archivo.id_archivo}>
                        <div className="relative aspect-[16/9]">
                          {getMediaType(archivo.extension) === "video" ? (
                            <video
                              className="w-full h-full object-cover rounded-lg"
                              controls
                              muted
                              loop
                            >
                              <source
                                src={`/api/noticias/download/${archivo.id_archivo}`}
                                type={`video/${archivo.extension}`}
                              />
                              Tu navegador no soporta el elemento de video.
                            </video>
                          ) : (
                            <Image
                              src={`/api/noticias/download/${archivo.id_archivo}`}
                              alt={archivo.titulo}
                              fill
                              className="object-cover rounded-lg"
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
                    className="object-cover rounded-lg"
                  />
                )}
              </div>
              <h3 className="font-semibold text-lg mb-2">{noticia.titulo}</h3>
              <p className="text-sm text-gray-600 mb-2">
                {formatDate(noticia.fecha)}
              </p>
              <p className="line-clamp-3">{noticia.contenido}</p>
              <button
                onClick={() => setSelectedNoticia(noticia)}
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors w-full"
              >
                Leer más
              </button>
            </div>
          ))}
        </div>
      </div>
      {selectedNoticia && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg w-[95%] max-w-3xl mx-auto my-8">
            <div className="p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold mb-4">
                {selectedNoticia.titulo}
              </h2>

              {selectedNoticia.archivos &&
                selectedNoticia.archivos.length > 0 && (
                  <div className="mb-6 aspect-[16/9] relative w-full">
                    {getMediaType(selectedNoticia.archivos[0].extension) ===
                    "video" ? (
                      <video
                        className="w-full h-full object-cover rounded-lg"
                        controls
                        muted
                        loop
                      >
                        <source
                          src={`/api/noticias/download/${selectedNoticia.archivos[0].id_archivo}`}
                          type={`video/${selectedNoticia.archivos[0].extension}`}
                        />
                        Tu navegador no soporta el elemento de video.
                      </video>
                    ) : (
                      <Image
                        src={`/api/noticias/download/${selectedNoticia.archivos[0].id_archivo}`}
                        alt={selectedNoticia.titulo}
                        fill
                        className="object-cover rounded-lg"
                        unoptimized
                      />
                    )}
                  </div>
                )}

              <p className="text-sm text-gray-600 mb-4">
                {formatDate(selectedNoticia.fecha)}
              </p>
              <div className="prose max-w-none mb-6 overflow-x-hidden">
                <p className="whitespace-pre-wrap break-words">
                  {selectedNoticia.contenido}
                </p>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => setSelectedNoticia(null)}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Noticias;
