import Image from "next/image";

const CardAnuncio = () => {
  return (
    <div className="flex flex-col w-[330px] h-[425px] bg-white text-black rounded-lg shadow-md">
      <Image src="/gato.png" alt="Anuncio" width={330} height={180} className="w-full h-[180px] rounded-lg object-cover" />
      <div className="p-4">
        <h1 className="text-lg font-bold">Título</h1>
        <p className="text-sm text-gray-600">Descripción</p>
        <button className="mt-3 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">Ver más</button>
      </div>
    </div>
  );
};

export default CardAnuncio;
