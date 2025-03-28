"use client";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredAsignaturas, setFilteredAsignaturas] = useState<Asignatura[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchAsignaturas();
  }, []);

  useEffect(() => {
    filterAsignaturas();
  }, [searchTerm, asignaturas]);

  const fetchAsignaturas = async () => {
    try {
      const response = await fetch("/api/admin/asignaturas");
      const result = await response.json();

      if (result.success) {
        setAsignaturas(result.data);
        setFilteredAsignaturas(result.data);
      } else {
        setError("Error al cargar las asignaturas");
        toast.error("Error al cargar las asignaturas");
      }
    } catch {
      setError("Error en la conexión con el servidor");
      toast.error("Error en la conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const filterAsignaturas = () => {
    if (!searchTerm.trim()) {
      setFilteredAsignaturas(asignaturas);
      return;
    }

    const searchLower = searchTerm.toLowerCase();
    const filtered = asignaturas.filter(
      (asignatura) => asignatura.nombre_asignatura.toLowerCase().includes(searchLower)
    );
    setFilteredAsignaturas(filtered);
  };

  const handleAdd = async () => {
    if (!newAsignatura.trim()) {
      toast.error("El nombre de la asignatura es obligatorio");
      return;
    }

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
        toast.success("Asignatura agregada exitosamente");
        setNewAsignatura("");
        setShowAddForm(false); // Hide form after successful addition
        fetchAsignaturas();
      } else {
        toast.error("Error al agregar la asignatura");
      }
    } catch {
      toast.error("Error en la conexión con el servidor");
    }
  };

  const handleEdit = async (id: string) => {
    if (!editNombre.trim()) {
      toast.error("El nombre de la asignatura es obligatorio");
      return;
    }

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
        toast.success("Asignatura actualizada exitosamente");
        setEditId(null);
        setEditNombre("");
        fetchAsignaturas();
      } else {
        toast.error("Error al actualizar la asignatura");
      }
    } catch {
      toast.error("Error en la conexión con el servidor");
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
          toast.success("Asignatura eliminada exitosamente");
          fetchAsignaturas();
        } else {
          toast.error("Error al eliminar la asignatura");
        }
      } catch {
        toast.error("Error en la conexión con el servidor");
      }
    }
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

  if (error) {
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
        <h1 className="text-xl font-medium text-gray-900">
          Gestión de Asignaturas
        </h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="border border-indigo-600 text-indigo-600 bg-white px-4 py-2 rounded-md hover:bg-indigo-600 hover:text-white transition-colors flex items-center"
        >
          {showAddForm ? (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Cancelar
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              Nueva Asignatura
            </>
          )}
        </button>
      </div>

      {/* Buscador */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar asignatura..."
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Formulario para agregar nueva asignatura */}
      {showAddForm && (
        <div className="mb-6 p-4 border rounded-lg">
          <h4 className="text-md font-medium mb-4">Nueva Asignatura</h4>
          <div className="flex items-center">
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
              className="ml-3 inline-flex items-center px-4 py-2 border border-indigo-600 text-sm font-medium rounded-md shadow-sm text-indigo-600 bg-white hover:bg-indigo-600 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              Agregar
            </button>
          </div>
        </div>
      )}

      {/* Lista de asignaturas */}
      <div className="space-y-4">
        {filteredAsignaturas.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchTerm
              ? "No se encontraron asignaturas que coincidan con la búsqueda"
              : "No hay asignaturas disponibles"}
          </div>
        ) : (
          filteredAsignaturas.map((asignatura) => (
            <div
              key={asignatura.id_asignatura}
              className="border rounded-md p-4 bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              {editId === asignatura.id_asignatura ? (
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor={`edit_nombre_${asignatura.id_asignatura}`}
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Nombre de la asignatura
                    </label>
                    <input
                      type="text"
                      id={`edit_nombre_${asignatura.id_asignatura}`}
                      value={editNombre}
                      onChange={(e) => setEditNombre(e.target.value)}
                      className="w-full p-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleEdit(asignatura.id_asignatura)}
                      className="border border-green-600 text-green-600 bg-white px-4 py-2 rounded-md hover:bg-green-600 hover:text-white transition-colors"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => setEditId(null)}
                      className="border border-gray-500 text-gray-500 bg-white px-4 py-2 rounded-md hover:bg-gray-500 hover:text-white transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <span className="text-gray-900 font-medium">
                    {asignatura.nombre_asignatura}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditId(asignatura.id_asignatura);
                        setEditNombre(asignatura.nombre_asignatura);
                      }}
                      className="border border-yellow-500 text-yellow-500 bg-white px-3 py-1.5 rounded-md hover:bg-yellow-500 hover:text-white transition-colors text-sm flex items-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(asignatura.id_asignatura)}
                      className="border border-red-500 text-red-500 bg-white px-3 py-1.5 rounded-md hover:bg-red-500 hover:text-white transition-colors text-sm flex items-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Eliminar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Asignaturas;
