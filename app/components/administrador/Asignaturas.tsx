"use client";
import React, { useState, useEffect } from "react";

interface Asignatura {
  id_asignatura: string;
  nombre_asignatura: string;
}

const Asignaturas: React.FC = () => {
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newAsignatura, setNewAsignatura] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editNombre, setEditNombre] = useState("");

  useEffect(() => {
    fetchAsignaturas();
  }, []);

  const fetchAsignaturas = async () => {
    try {
      const response = await fetch("/api/admin/asignaturas");
      const result = await response.json();

      if (result.success) {
        setAsignaturas(result.data);
      } else {
        setError("Error al cargar las asignaturas");
      }
    } catch {
      setError("Error en la conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    try {
      const response = await fetch("/api/admin/asignaturas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nombre_asignatura: newAsignatura }),
      });

      const result = await response.json();

      if (result.success) {
        setNewAsignatura("");
        fetchAsignaturas();
      } else {
        setError("Error al agregar la asignatura");
      }
    } catch {
      setError("Error en la conexión con el servidor");
    }
  };

  const handleEdit = async (id: string) => {
    try {
      const response = await fetch("/api/admin/asignaturas", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_asignatura: id,
          nombre_asignatura: editNombre,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setEditId(null);
        setEditNombre("");
        fetchAsignaturas();
      } else {
        setError("Error al actualizar la asignatura");
      }
    } catch {
      setError("Error en la conexión con el servidor");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("¿Está seguro de eliminar esta asignatura?")) {
      try {
        const response = await fetch("/api/admin/asignaturas", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id_asignatura: id }),
        });

        const result = await response.json();

        if (result.success) {
          fetchAsignaturas();
        } else {
          setError("Error al eliminar la asignatura");
        }
      } catch {
        setError("Error en la conexión con el servidor");
      }
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
        <h3 className="text-lg font-medium text-gray-900 mb-4">Asignaturas</h3>

        {/* Formulario para agregar nueva asignatura */}
        <div className="mb-6">
          <label
            htmlFor="newAsignatura"
            className="block text-sm font-medium text-gray-700"
          >
            Nueva Asignatura
          </label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <input
              type="text"
              id="newAsignatura"
              value={newAsignatura}
              onChange={(e) => setNewAsignatura(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Nombre de la asignatura"
            />
            <button
              onClick={handleAdd}
              className="ml-3 inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
            >
              Agregar
            </button>
          </div>
        </div>

        {/* Lista de asignaturas */}
        <div className="mt-6 space-y-4">
          {asignaturas.map((asignatura) => (
            <div
              key={asignatura.id_asignatura}
              className="flex items-center justify-between border-b pb-4"
            >
              {editId === asignatura.id_asignatura ? (
                <div className="flex-1 mr-4">
                  <input
                    type="text"
                    value={editNombre}
                    onChange={(e) => setEditNombre(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                  <div className="mt-2 flex space-x-2">
                    <button
                      onClick={() => handleEdit(asignatura.id_asignatura)}
                      className="inline-flex items-center rounded-md border border-transparent bg-green-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => setEditId(null)}
                      className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <span className="text-gray-900">
                    {asignatura.nombre_asignatura}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setEditId(asignatura.id_asignatura);
                        setEditNombre(asignatura.nombre_asignatura);
                      }}
                      className="inline-flex items-center rounded-md border border-transparent bg-yellow-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-yellow-700"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(asignatura.id_asignatura)}
                      className="inline-flex items-center rounded-md border border-transparent bg-red-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700"
                    >
                      Eliminar
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Asignaturas;
