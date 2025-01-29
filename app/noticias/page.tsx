"use client"

import React, { useState } from 'react';
import Image from 'next/image';

interface Noticia {
  id: number;
  titulo: string;
  descripcion: string;
  fecha: string;
  imagen: string;
}

const Noticias: React.FC = () => {
  const noticias: Noticia[] = [
    { 
      id: 1, 
      titulo: "Nueva exposición en el museo", 
      descripcion: "Una fascinante colección de arte moderno llega a nuestro museo local...",
      fecha: "2025-01-15", 
      imagen: "/noimage.webp" 
    },
    { 
      id: 2, 
      titulo: "Concierto benéfico este fin de semana", 
      descripcion: "Únete a nosotros para apoyar una buena causa en nuestro concierto benéfico anual...",
      fecha: "2025-01-20", 
      imagen: "/noimage.webp" 
    },
  ];

  const [modalData, setModalData] = useState<Noticia | null>(null);

  const openModal = (noticia: Noticia) => {
    setModalData(noticia);
  };

  const closeModal = () => {
    setModalData(null);
  };

  return (
    <div>
      <header className="text-black py-4">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-semibold">Noticias</h1>
        </div>
      </header>

      <div className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {noticias.map((noticia) => (
            <div key={noticia.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
              <Image src={noticia.imagen} alt={noticia.titulo} width={400} height={160} className="w-full h-40 object-cover mb-2 rounded" />
              <p className="text-sm text-gray-600 mb-2">{noticia.fecha}</p>
              <p className="line-clamp-3">{noticia.descripcion}</p>
              <button
                onClick={() => openModal(noticia)}
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors w-full"
              >
                Leer más
              </button>
            </div>
          ))}
        </div>
      </div>

      {modalData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">{modalData.titulo}</h2>
            <Image src={modalData.imagen} alt={modalData.titulo} width={400} height={192} className="w-full h-48 object-cover mb-4 rounded" />
            <p className="text-sm text-gray-600 mb-2">{modalData.fecha}</p>
            <p>{modalData.descripcion}</p>
            <button
              onClick={closeModal}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Noticias;