"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

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

const SliderComponent = () => {
  const [noticiasDestacadas, setNoticiasDestacadas] = useState<Noticia[]>([]);
  const [loading, setLoading] = useState(true);

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
    const fetchNoticiasDestacadas = async () => {
      try {
        const response = await fetch("/api/noticias?destacado=1");
        const data = await response.json();
        if (data.success) {
          setNoticiasDestacadas(data.noticias);
        } else {
          console.error("Error fetching noticias destacadas:", data.error);
        }
      } catch (error) {
        console.error("Error fetching noticias destacadas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNoticiasDestacadas();
  }, []);

  const settings = {
    dots: true,
    infinite: noticiasDestacadas.length > 3,
    speed: 500,
    slidesToShow: Math.min(3, noticiasDestacadas.length),
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    swipeToSlide: true,
    centerMode: false,
    rows: 1,
    slidesPerRow: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: Math.min(2, noticiasDestacadas.length),
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  if (loading) {
    return (
      <section className="section relative flex flex-row justify-center items-center pt-8 px-2">
        <div className="container text-center">
          <h1 className="text-3xl font-medium text-center w-full pb-4">
            Noticias Destacadas
          </h1>
          <p>Cargando noticias destacadas...</p>
        </div>
      </section>
    );
  }

  if (noticiasDestacadas.length === 0) {
    return (
      <section className="section relative flex flex-row justify-center items-center pt-8 px-2">
        <div className="container text-center">
          <h1 className="text-3xl font-medium text-center w-full pb-4">
            Noticias Destacadas
          </h1>
          <p>No hay noticias destacadas en este momento.</p>
          <a href="/noticias" className="text-[#5372F0] underline">
            Ver todas las noticias
          </a>
        </div>
      </section>
    );
  }

  return (
    <section className="section relative flex flex-row justify-center items-center pt-8 px-2">
      <div className="container max-w-6xl mx-auto">
        <h1 className="text-3xl font-medium text-center w-full pb-4">
          Noticias Destacadas
        </h1>
        <div className="px-4">
          <Slider {...settings}>
            {noticiasDestacadas.map((noticia) => (
              <div key={noticia.id_noticia}>
                <div className="px-2">
                  <div className="max-w-sm mx-auto">
                    <a
                      href="/noticias"
                      className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden h-full"
                    >
                      <div className="aspect-[16/9] relative">
                        {noticia.archivos && noticia.archivos.length > 0 ? (
                          <Image
                            src={`/api/noticias/download/${noticia.archivos[0].id_archivo}`}
                            alt={noticia.titulo}
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
                      <div className="p-4">
                        <p className="text-sm text-blue-600 mb-2">
                          {formatDate(noticia.fecha)}
                        </p>
                        <h2 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                          {noticia.titulo}
                        </h2>
                        <div className="flex justify-end">
                          <span className="text-blue-600 hover:text-blue-800">
                            Leer más →
                          </span>
                        </div>
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </section>
  );
};

export default SliderComponent;
