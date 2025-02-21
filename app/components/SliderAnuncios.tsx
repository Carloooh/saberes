"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const SliderComponent = () => {
  const [noticiasDestacadas, setNoticiasDestacadas] = useState([]);
  const [loading, setLoading] = useState(true);

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
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: Math.min(3, noticiasDestacadas.length),
          slidesToScroll: 2,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: Math.min(2, noticiasDestacadas.length),
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  if (loading) {
    return (
      <div className="container text-center flex flex-row justify-center items-center pt-8 px-2">
        <p>Cargando noticias destacadas...</p>
      </div>
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
      <div className="container">
        <h1 className="text-3xl font-medium text-center w-full pb-4">
          Noticias Destacadas
        </h1>
        <Slider {...settings}>
          {noticiasDestacadas.map((noticia, index) => (
            <div key={noticia.id_noticia} className="">
              <a
                href={`/noticias`}
                className="card-link block bg-white rounded-[12px] p-[18px] border-2 border-transparent shadow-md transition-all duration-200 ease-in-out hover:border-[#5372F0]"
              >
                {noticia.archivos && noticia.archivos.length > 0 && (
                  <Image
                    src={`/api/noticias/download/${noticia.archivos[0].id_archivo}`}
                    alt="Card Image"
                    className="card-image w-full aspect-[16/9] object-cover rounded-[10px]"
                    width={500}
                    height={281}
                  />
                )}
                <p className="badge text-[#5372F0] py-[8px] px-[16px] text-[0.95rem] font-medium mt-[16px] mb-[18px] rounded-full w-fit">
                  {new Date(noticia.fecha).toLocaleDateString()}
                </p>
                <h2 className="card-title text-black text-[1.19rem] font-semibold">
                  {noticia.titulo}
                </h2>
                <button className="card-button text-[#5372F0] rounded-full w-[35px] h-[35px] border-2 border-[#5372F0] mt-[30px] mb-[5px] transform rotate-[-45deg] cursor-pointer transition-all duration-400 ease-in-out hover:bg-[#5372F0] hover:text-white flex items-center justify-center">
                  <span className="material-symbols-outlined">
                    arrow_forward
                  </span>
                </button>
              </a>
            </div>
          ))}
        </Slider>
      </div>
    </section>
  );
};

export default SliderComponent;
