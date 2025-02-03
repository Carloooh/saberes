"use client";
import React, { useState, useEffect } from 'react';

interface FAQ {
  id_informacion: string;
  titulo: string;
  contenido: string;
}

const Faq: React.FC = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editQuestion, setEditQuestion] = useState('');
  const [editAnswer, setEditAnswer] = useState('');

  // Obtener FAQs al cargar el componente
  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const response = await fetch('/api/faq');
        const result = await response.json();

        if (result.success) {
          setFaqs(result.data);
        } else {
          setError('Error al cargar las FAQs');
        }
      } catch {
        setError('Error en la conexión con el servidor');
      } finally {
        setLoading(false);
      }
    };

    fetchFaqs();
  }, []);

  // Agregar una nueva FAQ
  const handleAdd = async () => {
    try {
      const response = await fetch('/api/faq', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ titulo: newQuestion, contenido: newAnswer }),
      });

      const result = await response.json();

      if (result.success) {
        setNewQuestion('');
        setNewAnswer('');
        const updatedResponse = await fetch('/api/faq');
        const updatedResult = await updatedResponse.json();
        setFaqs(updatedResult.data);
      } else {
        setError('Error al agregar la FAQ');
      }
    } catch {
      setError('Error en la conexión con el servidor');
    }
  };

  // Editar una FAQ
  const handleEdit = async (id: string) => {
    try {
      const response = await fetch('/api/faq', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id_informacion: id, titulo: editQuestion, contenido: editAnswer }),
      });

      const result = await response.json();

      if (result.success) {
        setEditId(null);
        setEditQuestion('');
        setEditAnswer('');
        const updatedResponse = await fetch('/api/faq');
        const updatedResult = await updatedResponse.json();
        setFaqs(updatedResult.data);
      } else {
        setError('Error al actualizar la FAQ');
      }
    } catch {
      setError('Error en la conexión con el servidor');
    }
  };

  // Eliminar una FAQ
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch('/api/faq', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id_informacion: id }),
      });

      const result = await response.json();

      if (result.success) {
        const updatedResponse = await fetch('/api/faq');
        const updatedResult = await updatedResponse.json();
        setFaqs(updatedResult.data);
      } else {
        setError('Error al eliminar la FAQ');
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
        <h3 className="text-lg font-medium text-gray-900 mb-4">Preguntas Frecuentes</h3>

        {/* Formulario para agregar una nueva FAQ */}
        <div className="mb-6">
          <label htmlFor="newQuestion" className="block text-sm font-medium text-gray-700">Nueva Pregunta</label>
          <input
            id="newQuestion"
            type="text"
            placeholder="Nueva pregunta"
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          <label htmlFor="newAnswer" className="block text-sm font-medium text-gray-700 mt-2">Respuesta</label>
          <textarea
            id="newAnswer"
            placeholder="Respuesta"
            value={newAnswer}
            onChange={(e) => setNewAnswer(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          <button
            onClick={handleAdd}
            className="mt-2 inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Agregar
          </button>
        </div>

        {/* Listado de FAQs */}
        <div className="space-y-4">
          {faqs.map((faq) => (
            <div key={faq.id_informacion} className="border rounded-lg p-4">
              {editId === faq.id_informacion ? (
                <div>
                  <label htmlFor="editQuestion" className="block text-sm font-medium text-gray-700">Pregunta</label>
                  <input
                    id="editQuestion"
                    type="text"
                    value={editQuestion}
                    onChange={(e) => setEditQuestion(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                  <label htmlFor="editAnswer" className="block text-sm font-medium text-gray-700 mt-2">Respuesta</label>
                  <textarea
                    id="editAnswer"
                    value={editAnswer}
                    onChange={(e) => setEditAnswer(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                  <div className="flex justify-end space-x-2 mt-2">
                    <button
                      onClick={() => handleEdit(faq.id_informacion)}
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
                  <h2 className="text-xl font-semibold text-gray-900">{faq.titulo}</h2>
                  <p className="mt-2 text-gray-700">{faq.contenido}</p>
                  <div className="flex justify-end space-x-2 mt-2">
                    <button
                      onClick={() => {
                        setEditId(faq.id_informacion);
                        setEditQuestion(faq.titulo);
                        setEditAnswer(faq.contenido);
                      }}
                      className="inline-flex items-center rounded-md border border-transparent bg-yellow-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(faq.id_informacion)}
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

export default Faq;