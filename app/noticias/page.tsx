// // "use client";

// // import React, { useState, useEffect } from "react";
// // import Image from "next/image";
// // import Slider from "react-slick";
// // import "slick-carousel/slick/slick.css";
// // import "slick-carousel/slick/slick-theme.css";

// // interface Archivo {
// //   id_archivo: string;
// //   titulo: string;
// //   extension: string;
// // }

// // interface Noticia {
// //   id_noticia: string;
// //   titulo: string;
// //   contenido: string;
// //   fecha: string;
// //   destacado: number;
// //   archivos?: Archivo[];
// // }

// // const Noticias: React.FC = () => {
// //   const [noticias, setNoticias] = useState<Noticia[]>([]);
// //   const [modalData, setModalData] = useState<Noticia | null>(null);

// //   const sliderSettings = {
// //     dots: true,
// //     infinite: true,
// //     speed: 500,
// //     slidesToShow: 1,
// //     slidesToScroll: 1,
// //     autoplay: true,
// //     autoplaySpeed: 3000,
// //     pauseOnHover: true,
// //     swipeToSlide: true,
// //   };

// //   useEffect(() => {
// //     fetchNoticias();
// //   }, []);

// //   const fetchNoticias = async () => {
// //     try {
// //       const response = await fetch("/api/noticias");
// //       const data = await response.json();
// //       if (data.success) {
// //         setNoticias(data.noticias);
// //       }
// //     } catch (error) {
// //       console.error("Error fetching noticias:", error);
// //     }
// //   };

// //   const openModal = (noticia: Noticia) => {
// //     setModalData(noticia);
// //   };

// //   const closeModal = () => {
// //     setModalData(null);
// //   };

// //   const getImageUrl = (archivo: Archivo) => {
// //     return `/api/noticias/download/${archivo.id_archivo}`;
// //   };

// //   return (
// //     <div>
// //       <header className="text-black py-4">
// //         <div className="container mx-auto px-4">
// //           <h1 className="text-2xl font-semibold">Noticias</h1>
// //         </div>
// //       </header>

// //       <div className="container mx-auto py-8 px-4">
// //         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
// //           {noticias.map((noticia) => (
// //             <div
// //               key={noticia.id_noticia}
// //               className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
// //             >
// //               <Image
// //                 src={
// //                   noticia.archivos && noticia.archivos.length > 0
// //                     ? getImageUrl(noticia.archivos[0])
// //                     : "/noimage.webp"
// //                 }
// //                 alt={noticia.titulo}
// //                 width={400}
// //                 height={160}
// //                 className="w-full h-40 object-cover mb-2 rounded"
// //                 unoptimized
// //               />
// //               <h3 className="font-semibold text-lg mb-2">{noticia.titulo}</h3>
// //               <p className="text-sm text-gray-600 mb-2">
// //                 {new Date(noticia.fecha).toLocaleDateString()}
// //               </p>
// //               <p className="line-clamp-3">{noticia.contenido}</p>
// //               <button
// //                 onClick={() => openModal(noticia)}
// //                 className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors w-full"
// //               >
// //                 Leer más
// //               </button>
// //             </div>
// //           ))}
// //         </div>
// //       </div>

// //       {modalData && (
// //         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
// //           <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
// //             <h2 className="text-2xl font-bold mb-4">{modalData.titulo}</h2>

// //             {modalData.archivos && modalData.archivos.length > 0 && (
// //               <div className="mb-4">
// //                 <Slider {...sliderSettings}>
// //                   {modalData.archivos.map((archivo) => (
// //                     <div key={archivo.id_archivo} className="px-1">
// //                       <Image
// //                         src={`/api/noticias/download/${archivo.id_archivo}`}
// //                         alt={archivo.titulo}
// //                         width={128}
// //                         height={128}
// //                         className="w-full h-32 object-cover rounded"
// //                         unoptimized
// //                       />
// //                     </div>
// //                   ))}
// //                 </Slider>
// //               </div>
// //             )}

// //             <p className="text-sm text-gray-600 mb-4">
// //               {new Date(modalData.fecha).toLocaleDateString()}
// //             </p>
// //             <p className="mb-4">{modalData.contenido}</p>
// //             <button
// //               onClick={closeModal}
// //               className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
// //             >
// //               Cerrar
// //             </button>
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   );
// // };

// // export default Noticias;

// "use client";

// import React, { useState, useEffect } from "react";
// import Image from "next/image";
// import Link from "next/link";
// import Slider from "react-slick";
// import "slick-carousel/slick/slick.css";
// import "slick-carousel/slick/slick-theme.css";

// // ... keep interfaces ...

// const Noticias: React.FC = () => {
//   const [noticias, setNoticias] = useState<Noticia[]>([]);

//   const sliderSettings = {
//     dots: true,
//     infinite: true,
//     speed: 500,
//     slidesToShow: 1,
//     slidesToScroll: 1,
//     autoplay: true,
//     autoplaySpeed: 4000,
//     pauseOnHover: true,
//     fade: true,
//     cssEase: "linear",
//     arrows: true,
//   };

//   useEffect(() => {
//     fetchNoticias();
//   }, []);

//   // ... keep fetchNoticias function ...

//   return (
//     <div>
//       <header className="text-black py-4">
//         <div className="container mx-auto px-4">
//           <h1 className="text-2xl font-semibold">Noticias</h1>
//         </div>
//       </header>

//       <div className="container mx-auto py-8 px-4">
//         {noticias.length > 0 && (
//           <div className="mb-12 max-w-4xl mx-auto">
//             <Slider {...sliderSettings}>
//               {noticias.map((noticia) => (
//                 <div key={noticia.id_noticia} className="px-2">
//                   <Link
//                     href={`/noticias/${noticia.id_noticia}`}
//                     className="block relative aspect-[16/9] w-full"
//                   >
//                     <Image
//                       src={
//                         noticia.archivos && noticia.archivos.length > 0
//                           ? `/api/noticias/download/${noticia.archivos[0].id_archivo}`
//                           : "/noimage.webp"
//                       }
//                       alt={noticia.titulo}
//                       fill
//                       className="object-cover rounded-lg"
//                       unoptimized
//                     />
//                     <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 rounded-b-lg">
//                       <h2 className="text-white text-xl font-semibold mb-2">
//                         {noticia.titulo}
//                       </h2>
//                       <p className="text-white/90 text-sm">
//                         {new Date(noticia.fecha).toLocaleDateString()}
//                       </p>
//                     </div>
//                   </Link>
//                 </div>
//               ))}
//             </Slider>
//           </div>
//         )}

//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {noticias.map((noticia) => (
//             <div
//               key={noticia.id_noticia}
//               className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
//             >
//               <Image
//                 src={
//                   noticia.archivos && noticia.archivos.length > 0
//                     ? `/api/noticias/download/${noticia.archivos[0].id_archivo}`
//                     : "/noimage.webp"
//                 }
//                 alt={noticia.titulo}
//                 width={400}
//                 height={160}
//                 className="w-full h-40 object-cover mb-2 rounded"
//                 unoptimized
//               />
//               <h3 className="font-semibold text-lg mb-2">{noticia.titulo}</h3>
//               <p className="text-sm text-gray-600 mb-2">
//                 {new Date(noticia.fecha).toLocaleDateString()}
//               </p>
//               <p className="line-clamp-3">{noticia.contenido}</p>
//               <Link
//                 href={`/noticias/${noticia.id_noticia}`}
//                 className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors w-full inline-block text-center"
//               >
//                 Ver noticia
//               </Link>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Noticias;

"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

interface Archivo {
  id_archivo: string;
  titulo: string;
  extension: string;
}

interface Noticia {
  id_noticia: string;
  titulo: string;
  contenido: string;
  fecha: string;
  destacado: number;
  archivos?: Archivo[];
}

const Noticias: React.FC = () => {
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [selectedNoticia, setSelectedNoticia] = useState<Noticia | null>(null);

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    pauseOnHover: true,
    fade: true,
    cssEase: "linear",
    arrows: true,
  };

  const fetchNoticias = async () => {
    try {
      const response = await fetch("/api/noticias");
      const data = await response.json();
      if (data.success) {
        setNoticias(data.noticias);
      }
    } catch (error) {
      console.error("Error fetching noticias:", error);
    }
  };

  useEffect(() => {
    fetchNoticias();
  }, []);

  return (
    <div>
      <header className="text-black py-4">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-semi text-center w-full">Noticias</h1>
        </div>
      </header>

      <div className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {noticias.map((noticia) => (
            <div
              key={noticia.id_noticia}
              className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
            >
              {noticia.archivos && noticia.archivos.length > 0 && (
                <div className="mb-4 aspect-[16/9] relative">
                  <Slider {...sliderSettings}>
                    {noticia.archivos.map((archivo) => (
                      <div key={archivo.id_archivo}>
                        <div className="relative aspect-[16/9]">
                          <Image
                            src={`/api/noticias/download/${archivo.id_archivo}`}
                            alt={archivo.titulo}
                            fill
                            className="object-cover rounded-lg"
                            unoptimized
                          />
                        </div>
                      </div>
                    ))}
                  </Slider>
                </div>
              )}
              <h3 className="font-semibold text-lg mb-2">{noticia.titulo}</h3>
              <p className="text-sm text-gray-600 mb-2">
                {new Date(noticia.fecha).toLocaleDateString()}
              </p>
              <p className="line-clamp-3">{noticia.contenido}</p>
              <button
                onClick={() => setSelectedNoticia(noticia)}
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors w-full"
              >
                Leer más
              </button>
            </div>
          ))}
        </div>
      </div>

      {selectedNoticia && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {selectedNoticia.titulo}
            </h2>

            {selectedNoticia.archivos &&
              selectedNoticia.archivos.length > 0 && (
                <div className="mb-6 aspect-[16/9] relative">
                  <Slider {...sliderSettings}>
                    {selectedNoticia.archivos.map((archivo) => (
                      <div key={archivo.id_archivo}>
                        <div className="relative aspect-[16/9]">
                          <Image
                            src={`/api/noticias/download/${archivo.id_archivo}`}
                            alt={archivo.titulo}
                            fill
                            className="object-cover rounded-lg"
                            unoptimized
                          />
                        </div>
                      </div>
                    ))}
                  </Slider>
                </div>
              )}

            <p className="text-sm text-gray-600 mb-4">
              {new Date(selectedNoticia.fecha).toLocaleDateString()}
            </p>
            <p className="mb-6 whitespace-pre-wrap">
              {selectedNoticia.contenido}
            </p>
            <button
              onClick={() => setSelectedNoticia(null)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Noticias;
