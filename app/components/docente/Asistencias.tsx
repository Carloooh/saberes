"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale/es";

interface AsistenciasProps {
  cursoId: string;
  asignaturaId: string;
}

export default function Asistencias({
  cursoId,
  asignaturaId,
}: AsistenciasProps) {
  const [loading, setLoading] = useState(true);

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Asistencias</h2>
        <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Nueva Asistencia
        </button>
      </div>
      test
    </div>
  );
}
