"use client";

import { useState } from "react";
import toast from "react-hot-toast";

const AccionesGenerales = () => {
  const [loading, setLoading] = useState<string | null>(null);

  const handleEnviarBienvenida = async () => {
    if (
      !confirm(
        "¿Estás seguro de enviar mensajes de bienvenida a todos los estudiantes activos? Esto generará nuevas contraseñas para todos ellos."
      )
    ) {
      return;
    }

    setLoading("bienvenida");
    try {
      const response = await fetch(
        "/api/administrador/acciones-generales/bienvenida",
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success(
          `Se enviaron ${data.enviados} mensajes de bienvenida correctamente.`
        );
      } else {
        toast.error(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Error al enviar mensajes de bienvenida:", error);
      toast.error("Ocurrió un error al enviar los mensajes de bienvenida.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold text-gray-800">Acciones Generales</h2>
      <p className="text-gray-600">
        Estas acciones afectan a múltiples usuarios a la vez. Úsalas con
        precaución.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tarjeta de Bienvenida */}
        <div className="border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-xl font-semibold text-gray-800">
            Bienvenida a los alumnos
          </h3>
          <p className="text-gray-600 mt-2 mb-4">
            Envío de mensaje de bienvenida a todos los alumnos y sus
            credenciales de inicio de sesión, a quienes tengan una cuenta activa
            y un email registrado.
          </p>
          <button
            onClick={handleEnviarBienvenida}
            disabled={loading === "bienvenida"}
            className={`border border-blue-600 text-blue-600 bg-white px-4 py-2 rounded-md transition-colors
              ${
                loading === "bienvenida"
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-blue-600 hover:text-white"
              }`}
          >
            {loading === "bienvenida" ? "Enviando..." : "Enviar mensajes"}
          </button>
        </div>

        {/* Tarjeta de Cambio de Curso (desactivada) */}
        <div className="border border-gray-200 rounded-lg p-6 shadow-sm bg-gray-50">
          <h3 className="text-xl font-semibold text-gray-800">
            Cambiar de curso
          </h3>
          <p className="text-gray-600 mt-2 mb-4">
            Pasar de curso a todos los alumnos que cumplan con los criterios
            mínimos.
          </p>
          <button
            disabled={true}
            className="border border-gray-400 text-gray-400 bg-white px-4 py-2 rounded-md cursor-not-allowed"
          >
            Próximamente
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccionesGenerales;
