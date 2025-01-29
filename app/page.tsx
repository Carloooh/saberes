import React from 'react'
import Hero from '@/app/components/Hero';
import Actividades from '@/app/components/Actividades';
import SliderAnuncios from '@/app/components/SliderAnuncios';
import AccionesRapidas from "@/app/components/AccionesRapidas";

const HomePage = () => {
  return (
    <div>
      <SliderAnuncios />
      <Hero />
      <AccionesRapidas />
      <Actividades />
    </div>
  );
};

export default HomePage;
