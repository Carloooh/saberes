import React from "react";

interface AsignaturaPageProps {
  params: {
    curso: string;
    asignatura: string;
  };
}

const AsistenciaPage = ({ params }: AsignaturaPageProps) => {

  return (
    <div className="p-6">
      <h1>asistencia</h1>
    </div>
  );
};

export default AsistenciaPage;