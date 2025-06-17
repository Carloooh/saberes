"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { Pinwheel } from "ldrs/react";
import "ldrs/react/Pinwheel.css";

interface Archivo {
  id_archivo: string;
  extension: string;
}

// Componente para cada item de la galería con spinner
const GalleryItem = ({
  item,
  onClick,
}: {
  item: Archivo;
  onClick: () => void;
}) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div
      className="cursor-pointer relative w-full h-40 rounded"
      onClick={onClick}
    >
      {/* Spinner de carga para este elemento */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded">
          <Pinwheel size="35" stroke="3.5" speed="0.9" color="#3b82f6" />
        </div>
      )}

      {/* Renderizado de imagen o video */}
      {["png", "jpg", "jpeg"].includes(item.extension) ? (
        <Image
          src={`/api/galeria/download?id=${item.id_archivo}`}
          alt={item.id_archivo}
          width={400}
          height={300}
          className="w-full h-full object-cover rounded"
          unoptimized
          onLoadingComplete={() => setIsLoading(false)}
          onError={() => setIsLoading(false)}
        />
      ) : (
        <video
          src={`/api/galeria/download?id=${item.id_archivo}`}
          className="w-full h-full object-cover rounded"
          autoPlay
          loop
          playsInline
          muted
          onCanPlay={() => setIsLoading(false)}
          onError={() => setIsLoading(false)}
        />
      )}
    </div>
  );
};

export default function GaleriaPage() {
  const [fotos, setFotos] = useState<Archivo[]>([]);
  const [videos, setVideos] = useState<Archivo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalItem, setModalItem] = useState<Archivo | null>(null);
  const [activeTab, setActiveTab] = useState<"images" | "videos">("images");

  // Obtener archivos al cargar el componente
  useEffect(() => {
    const fetchArchivos = async () => {
      try {
        const response = await fetch("/api/galeria");
        const result = await response.json();

        if (result.success) {
          const fotos = result.data.filter((archivo: Archivo) =>
            ["png", "jpg", "jpeg"].includes(archivo.extension)
          );
          const videos = result.data.filter(
            (archivo: Archivo) => archivo.extension === "mp4"
          );
          setFotos(fotos);
          setVideos(videos);
        } else {
          setError("Error al cargar los archivos");
        }
      } catch {
        setError("Error en la conexión con el servidor");
      } finally {
        setLoading(false);
      }
    };

    fetchArchivos();
  }, []);

  if (loading) {
    return <p className="text-center text-lg font-semibold">Cargando...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Galería</h1>

      {/* Tabs de imágenes y videos */}
      <div className="flex justify-center gap-4 mb-6">
        <button
          className={`px-6 py-2 rounded-full ${
            activeTab === "images"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700"
          } transition-colors`}
          onClick={() => setActiveTab("images")}
        >
          Imágenes
        </button>
        <button
          className={`px-6 py-2 rounded-full ${
            activeTab === "videos"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700"
          } transition-colors`}
          onClick={() => setActiveTab("videos")}
        >
          Videos
        </button>
      </div>

      {/* Contenido de imágenes */}
      {activeTab === "images" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
          {fotos.map((foto) => (
            <GalleryItem
              key={foto.id_archivo}
              item={foto}
              onClick={() => setModalItem(foto)}
            />
          ))}
        </div>
      )}

      {/* Contenido de videos */}
      {activeTab === "videos" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
          {videos.map((video) => (
            <GalleryItem
              key={video.id_archivo}
              item={video}
              onClick={() => setModalItem(video)}
            />
          ))}
        </div>
      )}

      {/* Modal para visualizar el archivo */}
      {modalItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full relative">
            {/* Botón de cierre en la esquina superior derecha */}
            <button
              className="absolute -top-6 -right-6 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-80 transition"
              onClick={() => setModalItem(null)}
            >
              <X className="w-6 h-6" />
            </button>

            {["png", "jpg", "jpeg"].includes(modalItem.extension) ? (
              <Image
                src={`/api/galeria/download?id=${modalItem.id_archivo}`}
                alt={modalItem.id_archivo}
                width={800}
                height={600}
                className="w-full"
                unoptimized
              />
            ) : (
              <video controls className="w-full">
                <source
                  src={`/api/galeria/download?id=${modalItem.id_archivo}`}
                  type="video/mp4"
                />
              </video>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
