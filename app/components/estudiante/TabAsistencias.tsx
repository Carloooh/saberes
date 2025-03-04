"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale/es";
import toast from "react-hot-toast";

interface TabAsistenciasProps {
  cursoId: string;
  asignaturaId: string;
}

const TabAsistencias = ({ asignaturaId, cursoId }: TabAsistenciasProps) => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);

  //   useEffect(() => {}, [asignaturaId, cursoId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-gray-500">Cargando Asistencias...</div>
      </div>
    );
  }

  //   if (asistencias.length === 0) {
  //     return (
  //       <div className="flex justify-center items-center p-8">
  //         <div className="text-gray-500">No hay asistencias disponibles</div>
  //       </div>
  //     );
  //   }

  return (
    <div className="space-y-6">
      <span>Asistencias</span>
    </div>
  );
};

export default TabAsistencias;
