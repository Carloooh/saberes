"use client";
import React, { useState, useEffect } from 'react';

interface FAQ {
  id_informacion: string;
  titulo: string;
  contenido: string;
}

export default function FAQ() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  // Componente Skeleton Loader para una sola FAQ
  const SkeletonFAQ = () => (
    <div className="border rounded-lg p-4 bg-white">
      <h2 className="text-xl font-semibold mb-2 h-6 bg-gray-200 rounded w-3/4 animate-pulse"></h2>
      <div className="space-y-2">
        {[...Array(1)].map((_, index) => (
          <div key={index} className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6 text-center">Preguntas Frecuentes</h1>
        <div className="max-w-3xl mx-auto space-y-4">
          {[...Array(3)].map((_, index) => (
            <SkeletonFAQ key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Preguntas Frecuentes</h1>
      <div className="max-w-3xl mx-auto space-y-4">
        {faqs.map((faq, index) => (
          <div key={faq.id_informacion} className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setOpenIndex(openIndex === index ? null : index)}>
            <h2 className="text-xl font-semibold mb-2 flex justify-between items-center">
              {faq.titulo}
              <span className={openIndex === index ? 'rotate-180' : ''}>▼</span>
            </h2>
            {openIndex === index && <p className="mt-2 text-gray-700">{faq.contenido}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}