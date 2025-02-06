"use client";
import React from "react";
import Image from "next/image";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const SliderComponent = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    scrollSnap: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 2,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
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

  return (
    <section className="section relative flex flex-row justify-center items-center pt-8 px-2">
      <div className="container">
        <Slider {...settings}>
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="">
              <a
                href="#"
                className="card-link block bg-white rounded-[12px] p-[18px] border-2 border-transparent shadow-md transition-all duration-200 ease-in-out hover:border-[#5372F0]"
              >
                <Image
                  src={index % 2 === 0 ? "/gato.png" : "/cat.jpg"}
                  alt="Card Image"
                  className="card-image w-full aspect-[16/9] object-cover rounded-[10px]"
                  width={500}
                  height={281}
                />
                <p className="badge text-[#5372F0] py-[8px] px-[16px] text-[0.95rem] font-medium mt-[16px] mb-[18px] rounded-full w-fit">
                  03/01/2024
                </p>
                <h2 className="card-title text-black text-[1.19rem] font-semibold">
                  Nuevas oportunidades de becas disponibles para estudiantes
                  destacados
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