"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import es from "date-fns/locale/es";

interface Calificacion {
  id_evaluacion: string;
  titulo: string;
  fecha: string;
  nota: number;
}

const TabCalificaciones = ({ asignaturaId }: { asignaturaId: string }) => {
  const [calificaciones, setCalificaciones] = useState<Calificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCalificaciones = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(
          `/api/estudiante/calificaciones?asignaturaId=${asignaturaId}`
        );
        const data = await response.json();

        if (data.success) {
          setCalificaciones(data.calificaciones);
        } else {
          setError(data.error || "Error al cargar las calificaciones");
        }
      } catch (error) {
        console.error("Error fetching calificaciones:", error);
        setError("Error al cargar las calificaciones");
      } finally {
        setLoading(false);
      }
    };

    if (asignaturaId) {
      fetchCalificaciones();
    }
  }, [asignaturaId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-gray-500">Cargando calificaciones...</div>
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

  if (calificaciones.length === 0) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-gray-500">No hay calificaciones disponibles</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Evaluación
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nota
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {calificaciones.map((calificacion) => (
              <tr key={calificacion.id_evaluacion} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(
                    new Date(calificacion.fecha + "T00:00:00"),
                    "d 'de' MMMM 'de' yyyy",
                    {
                      locale: es,
                    }
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {calificacion.titulo}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                      ${
                        calificacion.nota >= 4.0
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                  >
                    {calificacion.nota.toFixed(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Resumen de Calificaciones
        </h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Promedio</p>
            <p className="text-2xl font-semibold">
              {(
                calificaciones.reduce((acc, cal) => acc + cal.nota, 0) /
                calificaciones.length
              ).toFixed(1)}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Nota más alta</p>
            <p className="text-2xl font-semibold">
              {Math.max(...calificaciones.map((cal) => cal.nota)).toFixed(1)}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Nota más baja</p>
            <p className="text-2xl font-semibold">
              {Math.min(...calificaciones.map((cal) => cal.nota)).toFixed(1)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TabCalificaciones;
