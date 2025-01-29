"use client"

import { useState } from 'react';

const faqs = [
  { 
    question: "¿Qué servicios ofrecen?", 
    answer: "Ofrecemos una amplia gama de servicios que incluyen talleres creativos, excursiones guiadas, eventos culturales y programas educativos."
  },
  { 
    question: "¿Cuáles son sus horarios de atención?", 
    answer: "Nuestros horarios de atención son de lunes a viernes de 9:00 AM a 6:00 PM, y los sábados de 10:00 AM a 2:00 PM."
  },
  { 
    question: "¿Cómo puedo contactarlos?", 
    answer: "Puede contactarnos por teléfono al (123) 456-7890, por correo electrónico a info@ejemplo.com o en nuestra oficina."
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Preguntas Frecuentes</h1>
      <div className="max-w-3xl mx-auto space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setOpenIndex(openIndex === index ? null : index)}>
            <h2 className="text-xl font-semibold mb-2 flex justify-between items-center">
              {faq.question}
              <span className={openIndex === index ? 'rotate-180' : ''}>▼</span>
            </h2>
            {openIndex === index && <p className="mt-2">{faq.answer}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}