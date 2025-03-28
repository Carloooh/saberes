"use client";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";

const MisionVision: React.FC = () => {
  const [mision, setMision] = useState("");
  const [vision, setVision] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [originalMision, setOriginalMision] = useState("");
  const [originalVision, setOriginalVision] = useState("");

  // Obtener misión y visión al cargar el componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/misionvision");
        const result = await response.json();

        if (result.success) {
          setMision(result.data.mision);
          setVision(result.data.vision);
          setOriginalMision(result.data.mision);
          setOriginalVision(result.data.vision);
        } else {
          setError("Error al cargar los datos");
          toast.error("Error al cargar los datos");
        }
      } catch {
        setError("Error en la conexión con el servidor");
        toast.error("Error en la conexión con el servidor");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Guardar cambios
  const handleSave = async () => {
    try {
      const response = await fetch("/api/misionvision", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mision, vision }),
      });

      const result = await response.json();

      if (result.success) {
        setIsEditing(false);
        setOriginalMision(mision);
        setOriginalVision(vision);
        toast.success("Cambios guardados correctamente");
      } else {
        setError("Error al guardar los cambios");
        toast.error("Error al guardar los cambios");
      }
    } catch {
      setError("Error en la conexión con el servidor");
      toast.error("Error en la conexión con el servidor");
    }
  };

  // Cancelar edición
  const handleCancel = () => {
    setMision(originalMision);
    setVision(originalVision);
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="bg-white shadow sm:rounded-lg p-6">
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  if (error && !mision && !vision) {
    return (
      <div className="bg-white shadow sm:rounded-lg p-6">
        <div className="flex justify-center items-center h-40">
          <p className="text-red-500 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow sm:rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-medium text-gray-900">Misión y Visión</h1>
        {!isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="border border-indigo-600 text-indigo-600 bg-white px-4 py-2 rounded-md hover:bg-indigo-600 hover:text-white transition-colors flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            Editar
          </button>
        )}
      </div>

      <div className="space-y-6">
        <div className="p-4 rounded-lg border border-gray-200">
          <h2 className="text-lg font-medium text-gray-800 mb-2">Misión</h2>
          {isEditing ? (
            <textarea
              id="mission"
              name="mission"
              rows={4}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={mision}
              onChange={(e) => setMision(e.target.value)}
            />
          ) : (
            <p className="text-gray-700 whitespace-pre-wrap">{mision}</p>
          )}
        </div>

        <div className="p-4 rounded-lg border border-gray-200">
          <h2 className="text-lg font-medium text-gray-800 mb-2">Visión</h2>
          {isEditing ? (
            <textarea
              id="vision"
              name="vision"
              rows={4}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={vision}
              onChange={(e) => setVision(e.target.value)}
            />
          ) : (
            <p className="text-gray-700 whitespace-pre-wrap">{vision}</p>
          )}
        </div>

        {isEditing && (
          <div className="flex justify-end space-x-3 mt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="border border-gray-500 text-gray-500 bg-white px-4 py-2 rounded-md hover:bg-gray-500 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="border border-green-600 text-green-600 bg-white px-4 py-2 rounded-md hover:bg-green-600 hover:text-white transition-colors"
            >
              Guardar cambios
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MisionVision;
