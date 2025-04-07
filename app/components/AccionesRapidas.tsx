const AccionesRapidas = () => {
  const items = [
    {
      href: "/actividades",
      title: "ACTIVIDADES",
      color: "from-blue-50 to-blue-100",
      textColor: "text-blue-700 group-hover:text-blue-900",
    },
    {
      href: "/noticias",
      title: "NOTICIAS",
      color: "from-green-50 to-green-100",
      textColor: "text-green-700 group-hover:text-green-900",
    },
    {
      href: "/sedes",
      title: "SEDES",
      color: "from-purple-50 to-purple-100",
      textColor: "text-purple-700 group-hover:text-purple-900",
    },
    {
      href: "/galeria",
      title: "GALERÍA",
      color: "from-amber-50 to-amber-100",
      textColor: "text-amber-700 group-hover:text-amber-900",
    },
    {
      href: "/faq",
      title: "PREGUNTAS FRECUENTES",
      color: "from-teal-50 to-teal-100",
      textColor: "text-teal-700 group-hover:text-teal-900",
    },
    {
      href: "/matriculaEstudiante",
      title: "MATRICULAR ESTUDIANTE",
      color: "from-rose-50 to-rose-100",
      textColor: "text-rose-700 group-hover:text-rose-900",
    }, // Nueva acción
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
            className={`group flex flex-col items-center justify-center h-32 bg-gradient-to-br ${item.color} 
                       rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-100`}
          >
            <span
              className={`font-medium text-sm sm:text-base lg:text-lg transition-colors duration-300 text-center ${item.textColor}`}
            >
              {item.title}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
};

export default AccionesRapidas;
