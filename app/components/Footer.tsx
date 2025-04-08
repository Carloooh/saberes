"use client";
import Image from "next/image";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";

export default function Footer() {
  const [isClipboardAvailable, setIsClipboardAvailable] = useState(true);

  useEffect(() => {
    // Check if clipboard API is available
    setIsClipboardAvailable(
      typeof navigator !== "undefined" &&
        navigator.clipboard !== undefined &&
        typeof navigator.clipboard.writeText === "function"
    );
  }, []);

  const copyToClipboard = (text: string) => {
    if (isClipboardAvailable) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          toast.success(`Copiado al portapapeles: ${text}`);
        })
        .catch((err) => {
          console.error("Error al copiar:", err);
          toast.error("No se pudo copiar al portapapeles");
          // Fallback method
          fallbackCopyToClipboard(text);
        });
    } else {
      // Use fallback method
      fallbackCopyToClipboard(text);
      toast.success(`Copiado al portapapeles: ${text}`);
    }
  };

  const fallbackCopyToClipboard = (text: string) => {
    try {
      // Create temporary textarea element
      const textArea = document.createElement("textarea");
      textArea.value = text;

      // Make it invisible but part of the document
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);

      // Select and copy
      textArea.select();
      document.execCommand("copy");

      // Clean up
      document.body.removeChild(textArea);
    } catch (err) {
      console.error("Fallback copy method failed:", err);
      toast.error("No se pudo copiar al portapapeles");
    }
  };

  return (
    <footer>
      {/* <div className="mx-auto max-w-5xl py-4 mt-4 sm:px-6 lg:px-8 border-gray-400 border-t text-center"> */}
      <div className="mx-auto container w-full py-4 mt-4 sm:px-6 lg:px-8 border-gray-400 border-t text-center">
        {/* <div className="min-h-screen w-full container mx-auto px-4 py-8"> */}
        {/* Logo */}
        <div className="mb-4">
          <Image
            src="/LogoSaberes.webp"
            alt="Logo"
            width={256}
            height={64}
            className="w-auto h-auto sm:w-48 md:w-56 lg:w-64 mx-auto"
          />
        </div>

        {/* Resumen objetivo general */}
        <p className="text-sm text-gray-600 mb-4">
          Fomentamos un modelo educativo innovador que involucra a estudiantes y
          familias, fortaleciendo aprendizajes curriculares y socioemocionales.
        </p>

        {/* Información de contacto en dos columnas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-gray-600 mx-auto">
          {/* Columna 1 */}
          <div className="space-y-1">
            <p className="font-semibold">Administrativo:</p>
            <p
              className="cursor-pointer underline"
              onClick={() => copyToClipboard("kescobar@elquisco.cl")}
            >
              kescobar@elquisco.cl
            </p>
            <p className="font-semibold">
              Gestión de accesos y colaboración en red:
            </p>
            <p
              className="cursor-pointer underline"
              onClick={() => copyToClipboard("tsepulveda@elquisco.cl")}
            >
              tsepulveda@elquisco.cl
            </p>
          </div>

          {/* Columna 2 */}
          <div className="space-y-1">
            <p className="font-semibold">Celular Saberes:</p>
            <p
              className="cursor-pointer underline"
              onClick={() => copyToClipboard("+56965798774")}
            >
              +56965798774
            </p>
            <p className="font-semibold">Correo Saberes:</p>
            <p
              className="cursor-pointer underline"
              onClick={() => copyToClipboard("convivencia.saberes@gmail.com")}
            >
              convivencia.saberes@gmail.com
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
