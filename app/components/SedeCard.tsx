import Image from "next/image";

interface SedeCardProps {
  nombre: string;
  direccion: string;
  imagenUrl: string;
  mapaUrl: string;
  iframeUrl: string;
}

const SedeCard: React.FC<SedeCardProps> = ({
  nombre,
  direccion,
  imagenUrl,
  mapaUrl,
  iframeUrl,
}) => {
  return (
    <div
      style={{
        border: "1px solid #ccc",
        borderRadius: "8px",
        padding: "16px",
        maxWidth: "300px",
        textAlign: "center",
      }}
    >
      <h2>{nombre}</h2>
      <p>{direccion}</p>
      {/* Renderizado de la imagen */}
      <Image
        src={imagenUrl || "/noimage.webp"} // Si no hay imagen, muestra una por defecto
        alt={`Imagen de ${nombre}`}
        width={200}
        height={150}
        style={{ objectFit: "cover", borderRadius: "8px" }}
      />
      {/* Enlace al mapa */}
      <a href={mapaUrl} target="_blank" rel="noopener noreferrer">
        Ver en el mapa
      </a>
      {/* Mapa embebido */}
      <iframe
        src={iframeUrl}
        width="100%"
        height="200"
        style={{ border: "none", marginTop: "10px", borderRadius: "8px" }}
        allowFullScreen
      ></iframe>
    </div>
  );
};

export default SedeCard;