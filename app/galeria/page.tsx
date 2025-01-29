"use client"

import React, { useState } from 'react';
import Image from 'next/image';

const items = [
  { id: '1', type: 'image', url: '/images/default1.jpg', thumbnail: '/images/default1_thumb.jpg', title: 'Imagen 1' },
  { id: '2', type: 'video', url: '/videos/default1.mp4', thumbnail: '/videos/default1_thumb.jpg', title: 'Video 1' }
];

export default function Galeria() {
  const [modalItem, setModalItem] = useState<{ id: string; type: string; url: string; thumbnail: string; title: string } | null>(null);

  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Galería</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
        {items.map((item) => (
          <Image key={item.id} src={item.thumbnail} alt={item.title} width={400} height={160} className="w-full h-40 object-cover rounded" />
        ))}
      </div>

      {modalItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full">
            {modalItem.type === 'image' ? (
              <Image src={modalItem.url} alt={modalItem.title} width={800} height={600} className="w-full" />
            ) : (
              <video controls className="w-full">
                <source src={modalItem.url} type="video/mp4" />
              </video>
            )}
            <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600" onClick={() => setModalItem(null)}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}