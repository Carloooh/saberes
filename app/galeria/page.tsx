"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { X } from "lucide-react";

interface Archivo {
  id_archivo: string;
  extension: string;
}

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
            <div
              key={foto.id_archivo}
              className="cursor-pointer"
              onClick={() => setModalItem(foto)}
            >
              <Image
                src={`/api/galeria/download?id=${foto.id_archivo}`}
                alt={foto.id_archivo}
                width={400}
                height={300}
                className="w-full h-40 object-cover rounded"
                unoptimized
              />
            </div>
          ))}
        </div>
      )}

      {/* Contenido de videos */}
      {activeTab === "videos" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
          {videos.map((video) => (
            <div
              key={video.id_archivo}
              className="cursor-pointer"
              onClick={() => setModalItem(video)}
            >
              <video
                src={`/api/galeria/download?id=${video.id_archivo}`}
                className="w-full h-40 object-cover rounded"
              />
            </div>
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