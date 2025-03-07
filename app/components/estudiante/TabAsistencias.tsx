"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale/es";

interface AsistenciaDia {
  id_dia: string;
  fecha: string;
  estado: "Presente" | "Ausente" | "Justificado";
}

interface TabAsistenciasProps {
  cursoId: string;
  asignaturaId: string;
}

const TabAsistencias = ({ asignaturaId, cursoId }: TabAsistenciasProps) => {
  const [asistencias, setAsistencias] = useState<AsistenciaDia[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAsistencias = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(
          `/api/estudiante/asistencia?cursoId=${cursoId}&asignaturaId=${asignaturaId}`
        );
        const data = await response.json();

        if (data.success) {
          setAsistencias(data.data || []);
        } else {
          setError(data.error || "Error al cargar las asistencias");
        }
      } catch (error) {
        console.error("Error fetching asistencias:", error);
        setError("Error al cargar las asistencias");
      } finally {
        setLoading(false);
      }
    };

    if (asignaturaId && cursoId) {
      fetchAsistencias();
    }
  }, [cursoId, asignaturaId]);

  const updateFilter = (selectedFilter: string) => {
    setFilter((currentFilter) =>
      currentFilter === selectedFilter ? "all" : selectedFilter
    );
  };

  const filteredAsistencia = asistencias.filter(
    (dia) => filter === "all" || dia.estado === filter
  );

  // Calculate attendance statistics
  const totalDias = asistencias.length;
  const diasPresentes = asistencias.filter(
    (dia) => dia.estado === "Presente"
  ).length;
  const diasJustificados = asistencias.filter(
    (dia) => dia.estado === "Justificado"
  ).length;
  const diasAusentes = asistencias.filter(
    (dia) => dia.estado === "Ausente"
  ).length;
  const porcentajeAsistencia =
    totalDias > 0
      ? (((diasPresentes + diasJustificados) / totalDias) * 100).toFixed(1)
      : "0.0";

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-gray-500">Cargando asistencias...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (asistencias.length === 0) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-gray-500">
          No hay asistencias disponibles para esta asignatura
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-4">
        <div
          className={`bg-blue-100 p-4 rounded-lg cursor-pointer ${
            filter === "all" ? "ring-2 ring-blue-500" : ""
          }`}
          onClick={() => updateFilter("all")}
        >
          <p className="text-sm text-blue-800">Asistencia Total</p>
          <p className="text-2xl font-bold text-blue-800">
            {porcentajeAsistencia}%
          </p>
        </div>
        <div
          className={`bg-green-100 p-4 rounded-lg cursor-pointer ${
            filter === "Presente" ? "ring-2 ring-green-500" : ""
          }`}
          onClick={() => updateFilter("Presente")}
        >
          <p className="text-sm text-green-800">Días Presentes</p>
          <p className="text-2xl font-bold text-green-800">{diasPresentes}</p>
        </div>
        <div
          className={`bg-yellow-100 p-4 rounded-lg cursor-pointer ${
            filter === "Justificado" ? "ring-2 ring-yellow-500" : ""
          }`}
          onClick={() => updateFilter("Justificado")}
        >
          <p className="text-sm text-yellow-800">Faltas Justificadas</p>
          <p className="text-2xl font-bold text-yellow-800">
            {diasJustificados}
          </p>
        </div>
        <div
          className={`bg-red-100 p-4 rounded-lg cursor-pointer ${
            filter === "Ausente" ? "ring-2 ring-red-500" : ""
          }`}
          onClick={() => updateFilter("Ausente")}
        >
          <p className="text-sm text-red-800">Faltas Injustificadas</p>
          <p className="text-2xl font-bold text-red-800">{diasAusentes}</p>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="max-h-96 overflow-y-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-gray-100">
              <tr>
                <th className="p-2 text-left">Fecha</th>
                <th className="p-2 text-left">Estado</th>
              </tr>
            </thead>
            <tbody>
              {filteredAsistencia
                .sort(
                  (a, b) =>
                    new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
                )
                .map((dia) => (
                  <tr key={dia.id_dia}>
                    <td className="p-2 border-t">
                      {format(
                        new Date(dia.fecha + "T00:00:00"),
                        "d 'de' MMMM 'de' yyyy",
                        {
                          locale: es,
                        }
                      )}
                    </td>
                    <td className="p-2 border-t">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          dia.estado === "Presente"
                            ? "bg-green-200 text-green-800"
                            : dia.estado === "Justificado"
                            ? "bg-yellow-200 text-yellow-800"
                            : "bg-red-200 text-red-800"
                        }`}
                      >
                        {dia.estado}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TabAsistencias;
