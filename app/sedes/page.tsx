"use client";
import React, { useEffect, useState } from "react";
import SedeCard from "@/app/components/SedeCard"; // Importamos la componente SedeCard

interface Sede {
  id_sede: string;
  nombre: string;
  direccion: string;
  url: string; // Este será el mapaUrl
  imagen: string; // Este será la URL de la imagen
}

const Sedes: React.FC = () => {
  const [sedes, setSedes] = useState<Sede[]>([]);

  useEffect(() => {
    const fetchSedes = async () => {
      try {
        const response = await fetch("/api/sedes");
        const data = await response.json();
        if (data.success) {
          setSedes(data.data);
        } else {
          console.error("Error al obtener las sedes:", data.error);
        }
      } catch (error) {
        console.error("Error al conectar con la API:", error);
      }
    };

    fetchSedes();
  }, []);

  return (
    <div>
      <h1>Listado de Sedes</h1>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        {sedes.map((sede) => (
          <SedeCard
            key={sede.id_sede}
            nombre={sede.nombre}
            direccion={sede.direccion}
            imagenUrl={sede.imagen}
            mapaUrl={sede.url}
            iframeUrl={sede.url} // Asumimos que el iframeUrl es igual al mapaUrl
          />
        ))}
      </div>
    </div>
  );
};

export default Sedes;