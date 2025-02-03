// "use client";
// import React, { useEffect, useState } from "react";
// import SedeCard from "@/app/components/SedeCard"; // Importamos la componente SedeCard

// interface Sede {
//   id_sede: string;
//   nombre: string;
//   direccion: string;
//   url: string; // Este será el mapaUrl
//   imagen: string; // Este será la URL de la imagen
// }

// const Sedes: React.FC = () => {
//   const [sedes, setSedes] = useState<Sede[]>([]);

//   useEffect(() => {
//     const fetchSedes = async () => {
//       try {
//         const response = await fetch("/api/sedes");
//         const data = await response.json();
//         if (data.success) {
//           setSedes(data.data);
//         } else {
//           console.error("Error al obtener las sedes:", data.error);
//         }
//       } catch (error) {
//         console.error("Error al conectar con la API:", error);
//       }
//     };

//     fetchSedes();
//   }, []);

//   return (
//     <div>
//       <h1>Listado de Sedes</h1>
//       <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
//         {sedes.map((sede) => (
//           <SedeCard
//             key={sede.id_sede}
//             nombre={sede.nombre}
//             direccion={sede.direccion}
//             imagenUrl={sede.imagen}
//             mapaUrl={sede.url}
//             iframeUrl={sede.url} // Asumimos que el iframeUrl es igual al mapaUrl
//           />
//         ))}
//       </div>
//     </div>
//   );
// };

// export default Sedes;



"use client"

import React from 'react';
import Image from 'next/image';

interface SedeCardProps {
  nombre: string;
  direccion: string;
  imagenUrl: string;
  mapaUrl: string;
  iframeUrl: string;
}

const SedeCard: React.FC<SedeCardProps> = ({ nombre, direccion, imagenUrl, mapaUrl, iframeUrl }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative w-full h-64">
        <Image src={imagenUrl} alt={nombre} layout="fill" objectFit="cover" />
      </div>
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-800">{nombre}</h3>
        <p className="text-gray-600 mb-4">{direccion}</p>
        <a
          href={mapaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          Ver en mapa
        </a>
        <div className="mt-4">
          <iframe
            src={iframeUrl}
            width="100%"
            height="300"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
          ></iframe>
        </div>
      </div>
    </div>
  );
};

const Sedes: React.FC = () => {
  const sedes = [
    {
      nombre: "Sede Central",
      direccion: "Av. Principal 123, Ciudad",
      imagenUrl: "/noimage.webp",
      mapaUrl: "https://maps.app.goo.gl/6iR1AwVa5Z8GSnuz8",
      iframeUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d495.13724880265954!2d-71.69381754069869!3d-33.400474756148824!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9662178eb403d623%3A0xaad39777fd1fec8d!2sPlaza%20Manutara!5e0!3m2!1ses!2scl!4v1736167233869!5m2!1ses!2scl",
    },
    {
      nombre: "Sede Norte",
      direccion: "Calle Norte 456, Ciudad",
      imagenUrl: "/noimage.webp",
      mapaUrl: "https://maps.app.goo.gl/example2",
      iframeUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d495.13724880265954!2d-71.69381754069869!3d-33.400474756148824!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9662178eb403d623%3A0xaad39777fd1fec8d!2sPlaza%20Manutara!5e0!3m2!1ses!2scl!4v1736167233869!5m2!1ses!2scl",
    },
  ];

  return (
    <div>
      <header className="text-black py-4">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-semibold">Listado de Sedes</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="space-y-8">
          {sedes.map((sede, index) => (
            <SedeCard key={index} {...sede} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Sedes;