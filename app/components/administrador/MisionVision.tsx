"use client";
import React, { useState, useEffect } from 'react';

const MisionVision: React.FC = () => {
  const [mision, setMision] = useState('');
  const [vision, setVision] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Obtener misión y visión al cargar el componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/misionvision');
        const result = await response.json();

        if (result.success) {
          setMision(result.data.mision);
          setVision(result.data.vision);
        } else {
          setError('Error al cargar los datos');
        }
      } catch {
        setError('Error en la conexión con el servidor');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Guardar cambios
  const handleSave = async () => {
    try {
      const response = await fetch('/api/misionvision', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mision, vision }),
      });

      const result = await response.json();

      if (result.success) {
        alert('Cambios guardados correctamente');
      } else {
        setError('Error al guardar los cambios');
      }
    } catch {
      setError('Error en la conexión con el servidor');
    }
  };

  if (loading) {
    return <p>Cargando...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Misión y Visión</h3>
        <div className="mt-5 space-y-6">
          <div>
            <label htmlFor="mission" className="block text-sm font-medium text-gray-700">Misión</label>
            <div className="mt-1">
              <textarea
                id="mission"
                name="mission"
                rows={3}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={mision}
                onChange={(e) => setMision(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label htmlFor="vision" className="block text-sm font-medium text-gray-700">Visión</label>
            <div className="mt-1">
              <textarea
                id="vision"
                name="vision"
                rows={3}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={vision}
                onChange={(e) => setVision(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              onClick={handleSave}
            >
              Guardar cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MisionVision;