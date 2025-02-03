"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface Sede {
  id_sede: string;
  nombre: string;
  direccion: string;
  url: string;
  imagen: string; // Base64 o URL de la imagen
}

const Sedes: React.FC = () => {
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [newNombre, setNewNombre] = useState('');
  const [newDireccion, setNewDireccion] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newImagen, setNewImagen] = useState<File | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editNombre, setEditNombre] = useState('');
  const [editDireccion, setEditDireccion] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [editImagen, setEditImagen] = useState<File | null>(null);

  // Obtener sedes al cargar el componente o al cambiar la búsqueda
  const fetchSedes = async () => {
    try {
      const response = await fetch(`/api/sedes?search=${searchQuery}`);
      const result = await response.json();

      if (result.success) {
        setSedes(result.data);
      } else {
        setError('Error al cargar las sedes');
      }
    } catch {
      setError('Error en la conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSedes();
  }, [searchQuery]);

  // Subir imagen
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, isEdit: boolean = false) => {
    const file = event.target.files?.[0];
    if (file) {
      if (isEdit) {
        setEditImagen(file);
      } else {
        setNewImagen(file);
      }
    }
  };

  // Agregar una nueva sede
  const handleAdd = async () => {
    try {
      const formData = new FormData();
      formData.append('nombre', newNombre);
      formData.append('direccion', newDireccion);
      formData.append('url', newUrl);
      if (newImagen) {
        formData.append('imagen', newImagen);
      }

      const response = await fetch('/api/sedes', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setNewNombre('');
        setNewDireccion('');
        setNewUrl('');
        setNewImagen(null);
        fetchSedes(); // Actualizar el listado
      } else {
        setError('Error al agregar la sede');
      }
    } catch {
      setError('Error en la conexión con el servidor');
    }
  };

  // Modificar una sede
  const handleEdit = async (id: string) => {
    try {
      const formData = new FormData();
      formData.append('id_sede', id);
      formData.append('nombre', editNombre);
      formData.append('direccion', editDireccion);
      formData.append('url', editUrl);
      if (editImagen) {
        formData.append('imagen', editImagen);
      }

      const response = await fetch('/api/sedes', {
        method: 'PUT',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setEditId(null);
        setEditNombre('');
        setEditDireccion('');
        setEditUrl('');
        setEditImagen(null);
        fetchSedes(); // Actualizar el listado
      } else {
        setError('Error al modificar la sede');
      }
    } catch {
      setError('Error en la conexión con el servidor');
    }
  };

  // Eliminar una sede
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch('/api/sedes', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id_sede: id }),
      });

      const result = await response.json();

      if (result.success) {
        fetchSedes(); // Actualizar el listado
      } else {
        setError('Error al eliminar la sede');
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
        <h3 className="text-lg font-medium text-gray-900 mb-4">Sedes</h3>

        {/* Filtro de búsqueda */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Buscar por nombre o dirección"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 border rounded-md mb-2"
          />
        </div>

        {/* Formulario para agregar una nueva sede */}
        <div className="mb-6">
          <label htmlFor="newNombre" className="block text-sm font-medium text-gray-700">Nombre</label>
          <input
            id="newNombre"
            type="text"
            placeholder="Nombre"
            value={newNombre}
            onChange={(e) => setNewNombre(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          <label htmlFor="newDireccion" className="block text-sm font-medium text-gray-700 mt-2">Dirección</label>
          <input
            id="newDireccion"
            type="text"
            placeholder="Dirección"
            value={newDireccion}
            onChange={(e) => setNewDireccion(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          <label htmlFor="newUrl" className="block text-sm font-medium text-gray-700 mt-2">URL de Google Maps</label>
          <input
            id="newUrl"
            type="text"
            placeholder="URL de Google Maps"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          <label htmlFor="newImagen" className="block text-sm font-medium text-gray-700 mt-2">Imagen</label>
          <input
            id="newImagen"
            type="file"
            onChange={(e) => handleImageUpload(e)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            accept="image/*"
          />
          {newImagen && (
            <Image
              src={URL.createObjectURL(newImagen)}
              alt="Vista previa"
              width={64}
              height={64}
              className="w-16 h-16 object-cover rounded mt-2"
            />
          )}
          <button
            onClick={handleAdd}
            className="mt-2 inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Agregar sede
          </button>
        </div>

        {/* Listado de sedes */}
        <div className="space-y-4">
          {sedes.map((sede) => (
            <div key={sede.id_sede} className="border rounded-lg p-4">
              {editId === sede.id_sede ? (
                <div>
                  <label htmlFor="editNombre" className="block text-sm font-medium text-gray-700">Nombre</label>
                  <input
                    id="editNombre"
                    type="text"
                    value={editNombre}
                    onChange={(e) => setEditNombre(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                  <label htmlFor="editDireccion" className="block text-sm font-medium text-gray-700 mt-2">Dirección</label>
                  <input
                    id="editDireccion"
                    type="text"
                    value={editDireccion}
                    onChange={(e) => setEditDireccion(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                  <label htmlFor="editUrl" className="block text-sm font-medium text-gray-700 mt-2">URL de Google Maps</label>
                  <input
                    id="editUrl"
                    type="text"
                    value={editUrl}
                    onChange={(e) => setEditUrl(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                  <label htmlFor="editImagen" className="block text-sm font-medium text-gray-700 mt-2">Imagen</label>
                  <input
                    id="editImagen"
                    type="file"
                    onChange={(e) => handleImageUpload(e, true)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    accept="image/*"
                  />
                  {editImagen ? (
                    <Image
                      src={URL.createObjectURL(editImagen)}
                      alt="Vista previa"
                      width={64}
                      height={64}
                      className="w-16 h-16 object-cover rounded mt-2"
                    />
                  ) : (
                    sede.imagen && (
                      <Image
                        src={`data:image/jpeg;base64,${sede.imagen}`}
                        alt={sede.nombre}
                        width={64}
                        height={64}
                        className="w-16 h-16 object-cover rounded mt-2"
                      />
                    )
                  )}
                  <div className="flex justify-end space-x-2 mt-2">
                    <button
                      onClick={() => handleEdit(sede.id_sede)}
                      className="inline-flex items-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => setEditId(null)}
                      className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{sede.nombre}</h2>
                  <p className="mt-2 text-gray-700">{sede.direccion}</p>
                  <p className="mt-2 text-blue-500">{sede.url}</p>
                  {sede.imagen && (
                    <Image
                      src={`data:image/jpeg;base64,${sede.imagen}`}
                      alt={sede.nombre}
                      width={64}
                      height={64}
                      className="w-16 h-16 object-cover rounded mt-2"
                    />
                  )}
                  <div className="flex justify-end space-x-2 mt-2">
                    <button
                      onClick={() => {
                        setEditId(sede.id_sede);
                        setEditNombre(sede.nombre);
                        setEditDireccion(sede.direccion);
                        setEditUrl(sede.url);
                        setEditImagen(null);
                      }}
                      className="inline-flex items-center rounded-md border border-transparent bg-yellow-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(sede.id_sede)}
                      className="inline-flex items-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sedes;