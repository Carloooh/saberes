"use client";

import { useState, useEffect } from "react";

interface CalificacionesProps {
  cursoId: string;
  asignaturaId: string;
}

interface Estudiante {
  email: string;
  nombre: string;
  calificaciones: number[];
}

const Calificaciones = ({ cursoId, asignaturaId }: CalificacionesProps) => {
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);

  // Obtener estudiantes del curso
  useEffect(() => {
    const fetchEstudiantes = async () => {
      const response = await fetch(`/api/docente/calificaciones?cursoId=${cursoId}`);
      const { data } = await response.json();
      if (Array.isArray(data)) {
        setEstudiantes(data);
      } else {
        setEstudiantes([]);
        console.error("Fetched data is not an array:", data);
      }
    };

    fetchEstudiantes();
  }, [cursoId]);

  // Agregar calificación a un estudiante
  const agregarCalificacion = async (email: string, calificacion: number) => {
    const response = await fetch("/api/docente/calificaciones", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        asignaturaId,
        calificacion,
      }),
    });

    if (response.ok) {
      const estudianteActualizado = await response.json();
      setEstudiantes(
        estudiantes.map((est) =>
          est.email === email
            ? { ...est, calificaciones: [...est.calificaciones, calificacion] }
            : est
        )
      );
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Calificaciones</h3>

      {/* Lista de estudiantes y calificaciones */}
      <ul>
        {estudiantes.map((estudiante) => (
          <li key={estudiante.email} className="mb-4">
            <h4 className="font-semibold">{estudiante.nombre}</h4>
            <ul>
              {estudiante.calificaciones.map((calificacion, index) => (
                <li key={index}>{calificacion}</li>
              ))}
            </ul>
            <button
              onClick={() => agregarCalificacion(estudiante.email, 7.0)} // Ejemplo: agregar calificación 7.0
              className="bg-green-500 text-white p-1"
            >
              Agregar Calificación
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Calificaciones;