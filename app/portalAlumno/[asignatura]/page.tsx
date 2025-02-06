import React from "react";

interface AsignaturaPageProps {
  params: {
    curso: string;
    asignatura: string;
  };
}

const MaterialAsignaturaPage = ({ params }: AsignaturaPageProps) => {
  const { curso, asignatura } = params;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1>{asignatura}</h1>
    </div>
    
  );
};

export default MaterialAsignaturaPage;