"use client";

import { useState, useEffect } from "react";
import TabMaterial from "@/app/components/estudiante/TabMaterial";
import TabCalificaciones from "@/app/components/estudiante/TabCalificaciones";
import TabTareas from "@/app/components/estudiante/TabTareas";

interface AsignaturaPageProps {
  params: {
    asignatura: string;
  };
}

const AsignaturaPage = ({ params }: AsignaturaPageProps) => {
  const [activeTab, setActiveTab] = useState("material");
  const [loading, setLoading] = useState(true);
  const [asignaturaData, setAsignaturaData] = useState<any>(null);

  useEffect(() => {
    const fetchAsignaturaData = async () => {
      try {
        const response = await fetch(
          `/api/estudiante/asignatura/${params.asignatura}`
        );
        const data = await response.json();
        if (data.success) {
          setAsignaturaData(data.data);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching asignatura data:", error);
        setLoading(false);
      }
    };

    fetchAsignaturaData();
  }, [params.asignatura]);

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        {asignaturaData?.nombre_asignatura || "Asignatura"}
      </h1>

      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("material")}
              className={`${
                activeTab === "material"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Material
            </button>
            <button
              onClick={() => setActiveTab("calificaciones")}
              className={`${
                activeTab === "calificaciones"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Calificaciones
            </button>
            <button
              onClick={() => setActiveTab("tareas")}
              className={`${
                activeTab === "tareas"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Tareas
            </button>
          </nav>
        </div>

        <div className="mt-6">
          {activeTab === "material" && (
            <TabMaterial asignaturaId={params.asignatura} />
          )}
          {activeTab === "calificaciones" && (
            <TabCalificaciones asignaturaId={params.asignatura} />
          )}
          {activeTab === "tareas" && (
            <TabTareas asignaturaId={params.asignatura} />
          )}
        </div>
      </div>
    </div>
  );
};

export default AsignaturaPage;
