import React from "react";

interface AsignaturaPageProps {
  params: {
    curso: string;
    asignatura: string;
  };
}

const AsistenciaPage = ({ params }: AsignaturaPageProps) => {

  return (
    <div className="container mx-auto px-4 py-8">
      <h1>asistencia</h1>
    </div>
  );
};

export default AsistenciaPage;