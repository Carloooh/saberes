const AccionesRapidas = () => {
    const items = [
      { href: "/actividades", title: "ACTIVIDADES", bg: "/images/actividades.webp" },
      { href: "/noticias", title: "NOTICIAS", bg: "/images/noticias.webp" },
      { href: "/sedes", title: "SEDES", bg: "/images/sedes.webp" },
      { href: "/galeria", title: "GALERÍA", bg: "/images/galeria.webp" },
      { href: "/faq", title: "PREGUNTAS FRECUENTES", bg: "/images/preguntas.webp" },
    ];
  
    return (
      <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <header className="text-center">
          <h2 className="text-xl font-bold text-gray-900 sm:text-3xl">Accesos rápidos</h2>
        </header>
        <div className="grid grid-cols-2 md:grid-cols-3 grid-rows-2 gap-2 m-4">
          {items.map((item, index) => (
            <a key={index} href={item.href} className="relative rounded-md shadow-lg hover:shadow-2xl transition-shadow duration-300">
              <div className="flex items-center justify-center bg-cover bg-center text-white font-bold text-2xl md:text-3xl lg:text-4xl p-10" style={{ backgroundImage: `url(${item.bg})` }}>
                <h1 className="drop-shadow-lg">{item.title}</h1>
              </div>
            </a>
          ))}
        </div>
      </div>
    );
  };
  
  export default AccionesRapidas;
  