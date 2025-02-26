"use client";
import Image from "next/image";
import React, { useState, useEffect } from "react";

const Hero = () => {
  const [mision, setMision] = useState("");
  const [vision, setVision] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Obtener misión y visión al cargar el componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/misionvision");
        const result = await response.json();

        if (result.success) {
          setMision(result.data.mision);
          setVision(result.data.vision);
        } else {
          setError("Error al cargar los datos");
        }
      } catch {
        setError("Error en la conexión con el servidor");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <section className="px-2 pt-8">
        <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h2 className="text-3xl font-semibold text-gray-900 sm:text-4xl">
              Saberes
            </h2>
            <p className="mt-4 text-gray-700 text-lg">
              <strong>Visión:</strong> ...
            </p>
            <p className="mt-4 text-gray-700 text-lg">
              <strong>Misión:</strong> ...
            </p>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <Image
              src="/logo_saberes.webp"
              width={500}
              height={300}
              alt="Gato"
              className="rounded shadow-lg"
            />
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <section className="px-2 pt-8">
      <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between">
        <div className="md:w-1/2 mb-8 md:mb-0">
          <h2 className="text-3xl font-semibold text-gray-900 sm:text-4xl">
            Saberes
          </h2>
          <p className="mt-4 text-gray-700 text-lg">
            <strong>Visión:</strong> {vision}
          </p>
          <p className="mt-4 text-gray-700 text-lg">
            <strong>Misión:</strong> {mision}
          </p>
        </div>
        <div className="md:w-1/2 flex justify-center">
          <Image
            src="/logo_saberes.webp"
            width={500}
            height={300}
            alt="Gato"
            className="rounded shadow-lg"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
