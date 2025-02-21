const AccionesRapidas = () => {
  const items = [
    { href: "/actividades", title: "ACTIVIDADES" },
    { href: "/noticias", title: "NOTICIAS" },
    { href: "/sedes", title: "SEDES" },
    { href: "/galeria", title: "GALERÍA" },
    { href: "/faq", title: "PREGUNTAS FRECUENTES" },
    { href: "/matriculaEstudiante", title: "MATRICULAR ESTUDIANTE" }, // Nueva acción
  ];

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      {/* Encabezado */}
      <header className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 sm:text-3xl">
          Accesos rápidos
        </h2>
      </header>

      {/* Contenedor de los accesos rápidos */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {items.map((item, index) => (
          <a
            key={index}
            href={item.href}
            className="group flex flex-col items-center justify-center h-32 bg-gradient-to-br from-indigo-50 to-indigo-100 
                       rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
          >
            <span className="text-indigo-700 font-medium text-sm sm:text-base lg:text-lg group-hover:text-indigo-900 transition-colors duration-300 text-center">
              {item.title}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
};

export default AccionesRapidas;
