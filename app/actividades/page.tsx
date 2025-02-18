"use client";

import { useState } from "react";
import Image from "next/image";

interface Actividad {
  id: number;
  titulo: string;
  descripcion: string;
  fecha: string;
  imagen: string;
  documentos: { nombre: string; url: string }[];
}

const actividades = [
  {
    id: 1,
    titulo: "Taller de pintura",
    descripcion: "Aprende técnicas de pintura con expertos.",
    fecha: "2025-02-10",
    imagen: "/noimage.webp",
    documentos: [
      {
        nombre: "Programa del taller",
        url: "/documentos/programa-taller-pintura.pdf",
      },
      {
        nombre: "Lista de materiales",
        url: "/documentos/lista-materiales-pintura.pdf",
      },
    ],
  },
  {
    id: 2,
    titulo: "Excursión a la montaña",
    descripcion: "Disfruta de un día en la naturaleza.",
    fecha: "2025-03-15",
    imagen: "/noimage.webp",
    documentos: [
      { nombre: "Itinerario", url: "/documentos/itinerario-excursion.pdf" },
      { nombre: "Equipo recomendado", url: "/documentos/equipo-excursion.pdf" },
    ],
  },
];

const Actividades = () => {
  const [modalActividad, setModalActividad] = useState<Actividad | null>(null);

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Actividades</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {actividades.map((actividad) => (
          <div
            key={actividad.id}
            className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
            onClick={() => setModalActividad(actividad)}
          >
            <h2 className="text-xl font-semibold mb-2">{actividad.titulo}</h2>
            <Image
              src={actividad.imagen}
              alt={actividad.titulo}
              width={400}
              height={160}
              className="w-full h-40 object-cover mb-2 rounded"
            />
            <p className="mb-4 line-clamp-3">{actividad.descripcion}</p>
          </div>
        ))}
      </div>

      {modalActividad && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full">
            <h2 className="text-2xl font-bold mb-4">{modalActividad.titulo}</h2>
            <p>{modalActividad.descripcion}</p>
            <button
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              onClick={() => setModalActividad(null)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Actividades;
