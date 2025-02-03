"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface Archivo {
  id_archivo: string;
  extension: string;
}

const Galeria: React.FC = () => {
  const [archivos, setArchivos] = useState<Archivo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [nuevoNombre, setNuevoNombre] = useState('');

  // Obtener archivos al cargar el componente o al cambiar la búsqueda
  const fetchArchivos = async () => {
    try {
      const response = await fetch(`/api/galeria?search=${searchQuery}`);
      const result = await response.json();

      if (result.success) {
        setArchivos(result.data);
      } else {
        setError('Error al cargar los archivos');
      }
    } catch {
      setError('Error en la conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchivos();
  }, [searchQuery]);

  // Subir un nuevo archivo
  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar el tipo de archivo
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'video/mp4'];
    if (!allowedTypes.includes(file.type)) {
      setError('Formato de archivo no permitido. Solo se permiten PNG, JPG, JPEG y MP4.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    setUploadMessage('Subiendo archivo...');

    try {
      const response = await fetch('/api/galeria', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setUploadMessage('Archivo subido correctamente.');
        fetchArchivos(); // Actualizar el listado
        setTimeout(() => setUploadMessage(''), 3000); // Limpiar mensaje después de 3 segundos
      } else {
        setError('Error al subir el archivo');
      }
    } catch {
      setError('Error en la conexión con el servidor');
    } finally {
      setUploading(false);
    }
  };

  // Eliminar un archivo
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch('/api/galeria', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id_archivo: id }),
      });

      const result = await response.json();

      if (result.success) {
        fetchArchivos(); // Actualizar el listado
      } else {
        setError('Error al eliminar el archivo');
      }
    } catch {
      setError('Error en la conexión con el servidor');
    }
  };

  // Descargar un archivo
  const handleDownload = async (id: string, extension: string) => {
    try {
      const response = await fetch(`/api/galeria/download?id=${id}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${id}.${extension}`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch {
      setError('Error al descargar el archivo');
    }
  };

  // Visualizar un archivo en una nueva pestaña
  const handleView = (id: string) => {
    const url = `/api/galeria/download?id=${id}`;
    window.open(url, '_blank');
  };

  // Editar el nombre de un archivo
  const handleRename = async (id: string) => {
    try {
      const response = await fetch('/api/galeria', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id_archivo: id, nuevoNombre }),
      });

      const result = await response.json();

      if (result.success) {
        setEditId(null);
        setNuevoNombre('');
        fetchArchivos(); // Actualizar el listado
      } else {
        setError('Error al renombrar el archivo');
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
        <h3 className="text-lg font-medium text-gray-900 mb-4">Galería</h3>

        {/* Filtro de búsqueda */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Buscar por nombre o extensión"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 border rounded-md mb-2"
          />
        </div>

        {/* Subir nuevo archivo */}
        <div className="mb-6">
          <input
            type="file"
            onChange={handleUpload}
            className="w-full p-2 border rounded-md mb-2"
            accept=".png,.jpg,.jpeg,.mp4"
          />
          {uploading && <p className="text-blue-500">{uploadMessage}</p>}
          {uploadMessage && !uploading && <p className="text-green-500">{uploadMessage}</p>}
        </div>

        {/* Listado de archivos */}
        <div className="space-y-4">
          {archivos.map((archivo) => (
            <div key={archivo.id_archivo} className="border rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  {/* Preview del archivo */}
                  {archivo.extension === 'mp4' ? (
                    <video src={`/api/galeria/download?id=${archivo.id_archivo}`} className="w-16 h-16 object-cover rounded" controls />
                  ) : (
                    <Image src={`/api/galeria/download?id=${archivo.id_archivo}`} alt={archivo.id_archivo} width={64} height={64} className="object-cover rounded" unoptimized />
                  )}
                  <span>{archivo.id_archivo}.{archivo.extension}</span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleView(archivo.id_archivo)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                  >
                    Ver
                  </button>
                  <button
                    onClick={() => handleDownload(archivo.id_archivo, archivo.extension)}
                    className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                  >
                    Descargar
                  </button>
                  <button
                    onClick={() => setEditId(archivo.id_archivo)}
                    className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600"
                  >
                    Renombrar
                  </button>
                  <button
                    onClick={() => handleDelete(archivo.id_archivo)}
                    className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
              {editId === archivo.id_archivo && (
                <div className="mt-2">
                  <input
                    type="text"
                    placeholder="Nuevo nombre"
                    value={nuevoNombre}
                    onChange={(e) => setNuevoNombre(e.target.value)}
                    className="w-full p-2 border rounded-md mb-2"
                  />
                  <button
                    onClick={() => handleRename(archivo.id_archivo)}
                    className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                  >
                    Guardar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Galeria;