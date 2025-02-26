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

interface Sede {
  id_sede: string;
  nombre: string;
  direccion: string;
  url: string;
  url_iframe: string;
  cursos: string[];
  archivos?: Archivo[];
}

interface Curso {
  id_curso: string;
  nombre_curso: string;
}

const Sedes: React.FC = () => {
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cursos, setCursos] = useState<Curso[]>([]);

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

  const fetchSedes = async () => {
    try {
      const response = await fetch("/api/sedes");
      const result = await response.json();
      if (result.success) {
        setSedes(result.data);
      } else {
        setError("Error al cargar las sedes");
      }
    } catch (error) {
      setError("Error en la conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const fetchCursos = async () => {
    try {
      const response = await fetch("/api/cursos");
      const data = await response.json();
      setCursos(data);
    } catch (error) {
      console.error("Error fetching cursos:", error);
    }
  };

  useEffect(() => {
    fetchSedes();
    fetchCursos();
  }, []);

  const getMediaType = (extension: string): "image" | "video" | "gif" => {
    const ext = extension.toLowerCase();
    if (["mp4", "webm", "ogg"].includes(ext)) return "video";
    if (ext === "gif") return "gif";
    return "image";
  };

  if (loading) {
    return (
      <section className="section relative flex flex-row justify-center items-center pt-8 px-2">
        <div className="container text-center">
          <h1 className="text-3xl font-medium text-center w-full pb-4">
            Sedes
          </h1>
          <p>Cargando sedes...</p>
        </div>
      </section>
    );
  }

  if (sedes.length === 0) {
    return (
      <section className="section relative flex flex-row justify-center items-center pt-8 px-2">
        <div className="container text-center">
          <h1 className="text-3xl font-medium text-center w-full pb-4">
            Sedes
          </h1>
          <p>No hay sedes registradas hasta el momento.</p>
        </div>
      </section>
    );
  }

  return (
    <div>
      <header className="text-black py-4">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-semibold text-center">Nuestras Sedes</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sedes.map((sede) => (
            <div
              key={sede.id_sede}
              className="rounded-lg shadow-lg overflow-hidden bg-white"
            >
              {sede.archivos && sede.archivos.length > 0 ? (
                <div className="relative aspect-[16/9]">
                  <Slider {...sliderSettings}>
                    {sede.archivos.map((archivo) => (
                      <div key={archivo.id_archivo}>
                        <div className="relative aspect-[16/9]">
                          {getMediaType(archivo.extension) === "video" ? (
                            <video
                              className="w-full h-full object-cover"
                              controls
                              autoPlay={false}
                              muted
                              loop
                            >
                              <source
                                src={`/api/sedes/download/${archivo.id_archivo}`}
                                type={`video/${archivo.extension}`}
                              />
                              Tu navegador no soporta el elemento de video.
                            </video>
                          ) : (
                            <Image
                              src={`/api/sedes/download/${archivo.id_archivo}`}
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
                </div>
              ) : (
                <div className="relative aspect-[16/9]">
                  <Image
                    src="/noimage.webp"
                    alt={sede.nombre}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {sede.nombre}
                </h3>
                <p className="text-gray-600 mb-4">{sede.direccion}</p>
                <a
                  href={sede.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 font-medium block mb-4"
                >
                  Ver en mapa
                </a>
                {sede.url_iframe && (
                  <div className="mt-4 aspect-[16/9] relative">
                    <iframe
                      src={sede.url_iframe}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      className="rounded-lg"
                    ></iframe>
                  </div>
                )}
                {sede.cursos && sede.cursos.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Cursos asociados:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {sede.cursos.map((cursoId) => {
                        const curso = cursos.find(
                          (c) => c.id_curso === cursoId
                        );
                        return curso ? (
                          <span
                            key={cursoId}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {curso.nombre_curso}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Sedes;
