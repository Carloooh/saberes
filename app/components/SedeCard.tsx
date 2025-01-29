interface SedeCardProps {
    nombre: string;
    direccion: string;
    imagenUrl: string;
    mapaUrl: string;
    iframeUrl: string;
  }
  
  import Image from 'next/image';
  
    const SedeCard: React.FC<SedeCardProps> = ({ nombre, direccion, imagenUrl, mapaUrl, iframeUrl }) => {
    return (
      <div className="bg-white rounded-lg overflow-hidden shadow-lg border border-gray-200 text-gray-800 flex flex-col md:flex-row max-w-5xl mx-auto">
        <div className="flex-1 p-6 flex flex-col items-center md:items-start">
          <Image
            src={imagenUrl}
            alt={`Imagen de ${nombre}`}
            className="rounded-full border-4 border-white object-cover w-full h-full"
            width={128}
            height={128}
          />
          <h3 className="font-bold text-2xl mb-2">{nombre}</h3>
          <div className="inline-flex items-center text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <span>{direccion}</span>
          </div>
          <a href={mapaUrl} target="_blank" rel="noopener noreferrer" className="w-full md:w-auto mt-4">
            <button className="w-full md:w-auto rounded-full bg-blue-600 text-white font-bold hover:bg-blue-700 px-6 py-2 transition duration-300 ease-in-out">
              Ver en el mapa
            </button>
          </a>
        </div>
        <div className="w-full md:w-1/2 h-64 md:h-auto">
          <iframe 
            src={iframeUrl} 
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            title={`Mapa de ${nombre}`}
          ></iframe>
        </div>
      </div>
    );
  };
  
  export default SedeCard;  