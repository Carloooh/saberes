"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/app/components/ProtectedRoute";

interface Asignatura {
  id_asignatura: string;
  nombre_asignatura: string;
}

interface AsistenciaDia {
  id_dia: string;
  fecha: string;
  estado: "Presente" | "Ausente" | "Justificado";
}

interface UserData {
  cursoAlumno: {
    id_curso: string;
    nombre_curso: string;
  };
}

const PortalAlumno = () => {
  const [filter, setFilter] = useState("all");
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  const [asistencias, setAsistencias] = useState<AsistenciaDia[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch course and subjects data
        const cursoResponse = await fetch("/api/estudiante/curso");
        const cursoData = await cursoResponse.json();

        if (cursoData.success) {
          setUserData({
            cursoAlumno: {
              id_curso: cursoData.data.cursoAlumno.id_curso,
              nombre_curso: cursoData.data.cursoAlumno.nombre_curso,
            },
          });
          setAsignaturas(cursoData.data.asignaturas || []);

          // Fetch attendance data
          const asistenciaResponse = await fetch("/api/estudiante/asistencia");
          const asistenciaData = await asistenciaResponse.json();

          if (asistenciaData.success) {
            setAsistencias(asistenciaData.data || []);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
    return <div>Cargando...</div>;
  }

  return (
    <ProtectedRoute allowedRoles={["Estudiante", "Apoderado"]}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Portal del Alumno</h1>
        {userData && (
          <h2 className="text-xl mb-6">
            Curso: {userData.cursoAlumno.nombre_curso}
          </h2>
        )}

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Mis Asignaturas</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {asignaturas.map((asignatura) => (
              <div
                className="bg-white p-4 rounded-lg shadow"
                key={asignatura.id_asignatura}
              >
                <h3 className="font-semibold">
                  {asignatura.nombre_asignatura}
                </h3>
                <a
                  href={`/portalAlumno/${asignatura.id_asignatura}`}
                  className="text-blue-600 hover:underline text-sm"
                >
                  Ver asignatura
                </a>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Asistencia</h2>
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
              <p className="text-2xl font-bold text-green-800">
                {diasPresentes}
              </p>
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
                        new Date(b.fecha).getTime() -
                        new Date(a.fecha).getTime()
                    )
                    .map((dia) => (
                      <tr key={dia.id_dia}>
                        <td className="p-2 border-t">
                          {new Date(dia.fecha).toLocaleDateString("es-CL")}
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
      </div>
    </ProtectedRoute>
  );
};

export default PortalAlumno;
