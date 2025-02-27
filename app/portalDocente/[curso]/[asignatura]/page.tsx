"use client";

import { useState, useEffect } from "react";
import React from "react";
import Material from "@/app/components/docente/Material";
import Calificaciones from "@/app/components/docente/Calificaciones";
import Tareas from "@/app/components/docente/Tareas";
import { useSearchParams } from "next/navigation";
// import { useRouter } from "next/navigation";

interface AsignaturaPageProps {
  params: Promise<{
    curso: string;
    asignatura: string;
  }>;
}

const AsignaturaPage = ({ params }: AsignaturaPageProps) => {
  const [activeTab, setActiveTab] = useState<
    "material" | "calificaciones" | "tareas"
  >("material");
  const [curso, setCurso] = useState<string | null>(null);
  const [asignatura, setAsignatura] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const nombreCurso = searchParams.get("nombreCurso");
  const nombreAsignatura = searchParams.get("nombre");

  // const router = useRouter();

  useEffect(() => {
    params.then((resolvedParams) => {
      setCurso(resolvedParams.curso);
      setAsignatura(resolvedParams.asignatura);
    });
  }, [params]);

  if (!curso || !asignatura) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-gray-500">Cargando información asignatura...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Curso: {nombreCurso || curso}</h1>
      <h2 className="text-xl font-semibold mb-6">
        {" "}
        Asignatura: {nombreAsignatura || asignatura}{" "}
      </h2>
      {/* <button
        onClick={() => router.back()}
        className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
      >
        Volver
      </button> */}

      {/* <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Curso: {cursoNombre}</h1>
          <h2 className="text-xl font-semibold">
            Asignatura: {asignaturaNombre}
          </h2>
        </div>
        <button
          onClick={() => router.back()}
          className="mt-4 sm:mt-0 px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors duration-200 flex items-center gap-2"
        >
          <svg 
            className="w-4 h-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Volver
        </button>
      </div> */}

      {/* Pestañas */}
      <div className="flex space-x-4 border-b mb-6">
        <button
          className={`py-2 px-4 ${
            activeTab === "material"
              ? "border-b-2 border-blue-500 text-blue-500"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("material")}
        >
          Materiales
        </button>
        <button
          className={`py-2 px-4 ${
            activeTab === "calificaciones"
              ? "border-b-2 border-blue-500 text-blue-500"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("calificaciones")}
        >
          Calificaciones
        </button>
        <button
          className={`py-2 px-4 ${
            activeTab === "tareas"
              ? "border-b-2 border-blue-500 text-blue-500"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("tareas")}
        >
          Tareas
        </button>
      </div>

      {/* Contenido de las pestañas */}
      <div>
        {activeTab === "material" && (
          <Material cursoId={curso} asignaturaId={asignatura} />
        )}
        {activeTab === "calificaciones" && (
          <Calificaciones cursoId={curso} asignaturaId={asignatura} />
        )}
        {activeTab === "tareas" && (
          <Tareas cursoId={curso} asignaturaId={asignatura} />
        )}
      </div>
    </div>
  );
};

export default AsignaturaPage;
