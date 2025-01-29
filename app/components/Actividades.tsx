"use client";

import { useState } from "react";
import Image from "next/image";

interface Event {
  id: number;
  title: string;
  date: string;
  image: string;
  description: string;
}

const events: Event[] = [
  { id: 1, title: "Fiesta de Verano", date: "15 de Julio, 2023", image: "/gato.png", description: "Una celebración llena de música, comida y diversión para toda la comunidad." },
  { id: 2, title: "Conferencia Anual", date: "5 de Septiembre, 2023", image: "/gato.png", description: "Expertos de la industria compartirán las últimas tendencias y conocimientos." },
  { id: 3, title: "Maratón Benéfico", date: "10 de Octubre, 2023", image: "/gato.png", description: "Corre por una buena causa y ayuda a recaudar fondos para organizaciones locales." },
  { id: 4, title: "Festival de Arte", date: "20 de Noviembre, 2023", image: "/gato.png", description: "Exhibición de obras de artistas locales e internacionales, con talleres interactivos." },
  { id: 5, title: "Concierto de Invierno", date: "15 de Diciembre, 2023", image: "/gato.png", description: "Una noche mágica de música clásica y contemporánea en el auditorio principal." },
  { id: 6, title: "Feria de Ciencias", date: "25 de Enero, 2024", image: "/gato.png", description: "Jóvenes científicos presentan sus proyectos innovadores y compiten por becas." },
];

export default function Actividades() {
  const [currentEvent, setCurrentEvent] = useState(events[0]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h2 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">Actividades</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden h-80">
            <Image src={currentEvent.image} alt={currentEvent.title} width={800} height={400} className="w-full h-48 object-cover" />
            <div className="p-4 h-32 flex flex-col justify-between">
              <h3 className="text-lg font-bold mb-1">{currentEvent.title}</h3>
              <p className="text-sm text-gray-600 mb-2">{currentEvent.date}</p>
              <p className="text-sm text-gray-700 line-clamp-4 font-light">{currentEvent.description}</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
          {events.slice(1, 4).map((event) => (
            <button
              key={event.id}
              onClick={() => setCurrentEvent(event)}
              className="text-left transition-all duration-300 bg-white hover:bg-gray-50 border rounded-lg p-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <h4 className="font-semibold text-sm">{event.title}</h4>
              <p className="text-xs text-gray-500">{event.date}</p>
            </button>
          ))}
          <a href="/actividades" className="text-center transition-all duration-300 bg-white hover:bg-gray-50 border rounded-lg p-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <h4 className="font-semibold text-sm">Ver más actividades</h4>
          </a>
        </div>
      </div>
    </div>
  );
}