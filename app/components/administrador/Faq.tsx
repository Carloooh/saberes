"use client";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";

interface FAQ {
  id_informacion: string;
  titulo: string;
  contenido: string;
}

const Faq: React.FC = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editQuestion, setEditQuestion] = useState("");
  const [editAnswer, setEditAnswer] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  // Obtener FAQs al cargar el componente
  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      const response = await fetch("/api/faq");
      const result = await response.json();

      if (result.success) {
        setFaqs(result.data);
      } else {
        setError("Error al cargar las FAQs");
        toast.error("Error al cargar las FAQs");
      }
    } catch {
      setError("Error en la conexión con el servidor");
      toast.error("Error en la conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  // Agregar una nueva FAQ
  const handleAdd = async () => {
    if (!newQuestion.trim() || !newAnswer.trim()) {
      toast.error("La pregunta y la respuesta son obligatorias");
      return;
    }

    try {
      const response = await fetch("/api/faq", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ titulo: newQuestion, contenido: newAnswer }),
      });

      const result = await response.json();

      if (result.success) {
        setNewQuestion("");
        setNewAnswer("");
        setShowAddForm(false); // Hide form after successful addition
        fetchFaqs();
        toast.success("Pregunta agregada correctamente");
      } else {
        setError("Error al agregar la FAQ");
        toast.error("Error al agregar la FAQ");
      }
    } catch {
      setError("Error en la conexión con el servidor");
      toast.error("Error en la conexión con el servidor");
    }
  };

  // Editar una FAQ
  const handleEdit = async (id: string) => {
    if (!editQuestion.trim() || !editAnswer.trim()) {
      toast.error("La pregunta y la respuesta son obligatorias");
      return;
    }

    try {
      const response = await fetch("/api/faq", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_informacion: id,
          titulo: editQuestion,
          contenido: editAnswer,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setEditId(null);
        setEditQuestion("");
        setEditAnswer("");
        fetchFaqs();
        toast.success("Pregunta actualizada correctamente");
      } else {
        setError("Error al actualizar la FAQ");
        toast.error("Error al actualizar la FAQ");
      }
    } catch {
      setError("Error en la conexión con el servidor");
      toast.error("Error en la conexión con el servidor");
    }
  };

  // Eliminar una FAQ
  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta pregunta?")) return;

    try {
      const response = await fetch("/api/faq", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id_informacion: id }),
      });

      const result = await response.json();

      if (result.success) {
        fetchFaqs();
        toast.success("Pregunta eliminada correctamente");
      } else {
        setError("Error al eliminar la FAQ");
        toast.error("Error al eliminar la FAQ");
      }
    } catch {
      setError("Error en la conexión con el servidor");
      toast.error("Error en la conexión con el servidor");
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

  if (error && faqs.length === 0) {
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
          Preguntas Frecuentes
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
              Nueva Pregunta
            </>
          )}
        </button>
      </div>

      {/* Formulario para agregar una nueva FAQ */}
      {showAddForm && (
        <div className="mb-8 p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-medium text-gray-800 mb-4">
            Agregar nueva pregunta
          </h2>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="newQuestion"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Pregunta <span className="text-red-500">*</span>
              </label>
              <input
                id="newQuestion"
                type="text"
                placeholder="Escribe la pregunta"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label
                htmlFor="newAnswer"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Respuesta <span className="text-red-500">*</span>
              </label>
              <textarea
                id="newAnswer"
                placeholder="Escribe la respuesta"
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                rows={4}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleAdd}
                className="border border-indigo-600 text-indigo-600 bg-white px-4 py-2 rounded-md hover:bg-indigo-600 hover:text-white transition-colors flex items-center"
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
                Agregar Pregunta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Listado de FAQs */}
      <div className="space-y-4">
        {faqs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No hay preguntas frecuentes disponibles
          </div>
        ) : (
          faqs.map((faq) => (
            <div
              key={faq.id_informacion}
              className="border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              {editId === faq.id_informacion ? (
                <div className="p-4">
                  <h3 className="text-lg font-medium mb-4">Editar Pregunta</h3>
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="editQuestion"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Pregunta <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="editQuestion"
                        type="text"
                        value={editQuestion}
                        onChange={(e) => setEditQuestion(e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="editAnswer"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Respuesta <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="editAnswer"
                        value={editAnswer}
                        onChange={(e) => setEditAnswer(e.target.value)}
                        rows={4}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => setEditId(null)}
                        className="border border-gray-500 text-gray-500 bg-white px-4 py-2 rounded-md hover:bg-gray-500 hover:text-white transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => handleEdit(faq.id_informacion)}
                        className="border border-green-600 text-green-600 bg-white px-4 py-2 rounded-md hover:bg-green-600 hover:text-white transition-colors"
                      >
                        Guardar
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="p-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                      {faq.titulo}
                    </h2>
                    <p className="mt-2 text-gray-700 whitespace-pre-wrap">
                      {faq.contenido}
                    </p>
                  </div>
                  <div className="border-t px-4 py-3 flex justify-end space-x-2">
                    <button
                      onClick={() => {
                        setEditId(faq.id_informacion);
                        setEditQuestion(faq.titulo);
                        setEditAnswer(faq.contenido);
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
                      onClick={() => handleDelete(faq.id_informacion)}
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
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Faq;
