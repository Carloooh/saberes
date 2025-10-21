"use client";
import Image from "next/image";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";

// export default function Footer() {
//   const [isClipboardAvailable, setIsClipboardAvailable] = useState(true);

//   useEffect(() => {
//     // Check if clipboard API is available
//     setIsClipboardAvailable(
//       typeof navigator !== "undefined" &&
//         navigator.clipboard !== undefined &&
//         typeof navigator.clipboard.writeText === "function"
//     );
//   }, []);

//   const copyToClipboard = (text: string) => {
//     if (isClipboardAvailable) {
//       navigator.clipboard
//         .writeText(text)
//         .then(() => {
//           toast.success(`Copiado al portapapeles: ${text}`);
//         })
//         .catch((err) => {
//           console.error("Error al copiar:", err);
//           toast.error("No se pudo copiar al portapapeles");
//           // Fallback method
//           fallbackCopyToClipboard(text);
//         });
//     } else {
//       // Use fallback method
//       fallbackCopyToClipboard(text);
//       toast.success(`Copiado al portapapeles: ${text}`);
//     }
//   };

//   const fallbackCopyToClipboard = (text: string) => {
//     try {
//       // Create temporary textarea element
//       const textArea = document.createElement("textarea");
//       textArea.value = text;

//       // Make it invisible but part of the document
//       textArea.style.position = "fixed";
//       textArea.style.opacity = "0";
//       document.body.appendChild(textArea);

//       // Select and copy
//       textArea.select();
//       document.execCommand("copy");

//       // Clean up
//       document.body.removeChild(textArea);
//     } catch (err) {
//       console.error("Fallback copy method failed:", err);
//       toast.error("No se pudo copiar al portapapeles");
//     }
//   };

//   return (
//     <footer className="bg-slate-800 ">
//       <div className="mx-auto container max-w-[80rem] w-full flex flex-col gap-6 justify-center pb-8 pt-14 sm:px-6 lg:px-8">
//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
//           {/* Logo + resumen */}
//           <div className="space-y-3 text-center lg:text-left col-span-1 lg:col-span-5 bg-gradient-to-br from-indigo-100 to-indigo-300 py-6 px-6 rounded-2xl shadow-lg">
//             <Image
//               src="/LogoSaberes.webp"
//               alt="Logo Saberes"
//               width={256}
//               height={64}
//               className="w-auto h-auto max-w-[200px] mx-auto lg:mx-0"
//             />
//             <p className="text-sm text-slate-700 leading-relaxed">
//               Fomentamos un modelo educativo innovador que involucra a
//               estudiantes y familias, fortaleciendo aprendizajes curriculares y
//               socioemocionales.
//             </p>
//           </div>

//           {/* Información de contacto */}
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 col-span-1 lg:col-span-7">
//             <div className="flex flex-col gap-6">
//               <h3 className="text-xs font-bold tracking-wider text-gray-400 uppercase border-b border-gray-600 pb-2">
//                 Contacto Administrativo
//               </h3>

//               {/* Administrativo */}
//               <div className="space-y-2">
//                 <p className="font-semibold text-gray-500 text-sm">
//                   Administrativo
//                 </p>
//                 <div
//                   className="flex items-center gap-2 group cursor-pointer"
//                   onClick={() => copyToClipboard("kescobar@elquisco.cl")}
//                 >
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     viewBox="0 0 24 24"
//                     fill="none"
//                     stroke="currentColor"
//                     strokeWidth="2"
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     className="w-4 h-4 text-blue-400 group-hover:text-blue-500 transition-colors"
//                   >
//                     <path d="M3 7a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-10z" />
//                     <path d="M3 7l9 6l9 -6" />
//                   </svg>
//                   <p className="text-sm text-gray-300 group-hover:text-blue-500 transition-colors hover:underline">
//                     kescobar@elquisco.cl
//                   </p>
//                 </div>
//               </div>

//               {/* Gestión Acceso */}
//               <div className="space-y-2">
//                 <p className="font-semibold text-gray-500 text-sm">
//                   Gestión de accesos
//                 </p>
//                 <div
//                   className="flex items-center gap-2 group cursor-pointer"
//                   onClick={() => copyToClipboard("tsepulveda@elquisco.cl")}
//                 >
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     viewBox="0 0 24 24"
//                     fill="none"
//                     stroke="currentColor"
//                     strokeWidth="2"
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     className="w-4 h-4 text-blue-400 group-hover:text-blue-500 transition-colors"
//                   >
//                     <path d="M3 7a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-10z" />
//                     <path d="M3 7l9 6l9 -6" />
//                   </svg>
//                   <p className="text-sm text-gray-300 group-hover:text-blue-500 transition-colors hover:underline">
//                     tsepulveda@elquisco.cl
//                   </p>
//                 </div>
//               </div>
//             </div>

//             <div className="flex flex-col gap-6">
//               <h3 className="text-xs font-bold tracking-wider text-gray-400 uppercase border-b border-gray-600 pb-2">
//                 Programa Saberes
//               </h3>

//               {/* Celular Saberes */}
//               <div className="space-y-2">
//                 <p className="font-semibold text-gray-500 text-sm">Celular</p>
//                 <div
//                   className="flex items-center gap-2 group cursor-pointer"
//                   onClick={() => copyToClipboard("+56965798774")}
//                 >
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     viewBox="0 0 24 24"
//                     fill="none"
//                     stroke="currentColor"
//                     strokeWidth="2"
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     className="w-4 h-4 text-green-400 group-hover:text-green-500 transition-colors"
//                   >
//                     <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
//                   </svg>
//                   <p className="text-sm text-gray-300 group-hover:text-green-500 transition-colors hover:underline">
//                     +56965798774
//                   </p>
//                 </div>
//               </div>

//               {/* Correo Saberes */}
//               <div className="space-y-2">
//                 <p className="font-semibold text-gray-500 text-sm">Correo</p>
//                 <div
//                   className="flex items-center gap-2 group cursor-pointer"
//                   onClick={() =>
//                     copyToClipboard("convivencia.saberes@gmail.com")
//                   }
//                 >
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     viewBox="0 0 24 24"
//                     fill="none"
//                     stroke="currentColor"
//                     strokeWidth="2"
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     className="w-4 h-4 text-blue-400 group-hover:text-blue-500 transition-colors"
//                   >
//                     <path d="M3 7a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-10z" />
//                     <path d="M3 7l9 6l9 -6" />
//                   </svg>
//                   <p className="text-sm text-gray-300 group-hover:text-blue-500 transition-colors hover:underline">
//                     convivencia.saberes@gmail.com
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Sello institucional */}
//           {/* <div className="flex flex-col items-center justify-center text-center col-span-1 lg:col-span-2 bg-gradient-to-bs from-indigo-500 to-indigo-700 pt-5 pb-6 px-4 rounded-xl border border-slate-600">
//             <Image
//               src="/sello.png"
//               alt="Sello institucional"
//               width={80}
//               height={80}
//               className="w-16 h-16 lg:w-20 lg:h-20 object-contain mb-3"
//             />
//             <h4 className="text-sm font-bold text-amber-100 mb-1">
//               Institución Ganadora 2025
//             </h4>
//             <p className="text-xs text-amber-50 leading-tight">
//               Reconocimiento Instituciones Transformadoras - Gobierno Digital
//             </p>
//           </div> */}
//         </div>

//         {/* Sello institucional */}
//         <div className="flex flex-col items-center justify-center text-center col-span-1 lg:col-span-2 bg-gradient-to-bs from-indigo-500 to-indigo-700 pt-5 pb-6 px-4 rounded-xl bordesr border-slate-600">
//           <Image
//             src="/sello.png"
//             alt="Sello institucional"
//             width={80}
//             height={80}
//             className="w-16 h-16 lg:w-20 lg:h-20 object-contain mb-3"
//           />
//           <h4 className="text-sm font-bold text-amber-100 mb-1">
//             Institución Ganadora 2025
//           </h4>
//           <p className="text-xs text-amber-50 leading-tight">
//             Reconocimiento Instituciones Transformadoras - Gobierno Digital
//           </p>
//         </div>

//         {/* Línea inferior */}
//         <div className="border-t border-gray-600 pt-6 text-center">
//           <p className="text-xs text-gray-500">
//             © {new Date().getFullYear()} Saberes. Todos los derechos reservados.
//           </p>
//         </div>
//       </div>
//     </footer>
//   );
// }

export default function Footer() {
  const [isClipboardAvailable, setIsClipboardAvailable] = useState(true);

  useEffect(() => {
    // Check if clipboard API is available
    setIsClipboardAvailable(
      typeof navigator !== "undefined" &&
        navigator.clipboard !== undefined &&
        typeof navigator.clipboard.writeText === "function"
    );
  }, []);

  const copyToClipboard = (text: string) => {
    if (isClipboardAvailable) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          toast.success(`Copiado al portapapeles: ${text}`);
        })
        .catch((err) => {
          console.error("Error al copiar:", err);
          toast.error("No se pudo copiar al portapapeles");
          // Fallback method
          fallbackCopyToClipboard(text);
        });
    } else {
      // Use fallback method
      fallbackCopyToClipboard(text);
      toast.success(`Copiado al portapapeles: ${text}`);
    }
  };

  const fallbackCopyToClipboard = (text: string) => {
    try {
      // Create temporary textarea element
      const textArea = document.createElement("textarea");
      textArea.value = text;

      // Make it invisible but part of the document
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);

      // Select and copy
      textArea.select();
      document.execCommand("copy");

      // Clean up
      document.body.removeChild(textArea);
    } catch (err) {
      console.error("Fallback copy method failed:", err);
      toast.error("No se pudo copiar al portapapeles");
    }
  };

  return (
    <footer className="bg-slate-800 relative">
      <div className="h-full w-full absolute top-0 left-0 bg-gradient-to-br from-blue-700/25 via-indigo-800/10 to-indigo-700/25"></div>
      <div className="mx-auto relative container max-w-[80rem] w-full flex flex-col gap-6 justify-center px-4 pt-6 pb-8 sm:pt-14 sm:px-6 lg:px-8">
        {/* Background */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Logo + resumen */}
          <div className="space-y-4 text-center lg:text-left col-span-1 lg:col-span-5 bg-slate-700/40 border-2 border-slate-600 rounded-2xl shadow-md p-6 transition-colors hover:bg-slate-700/50">
            {/* Acento superior sutil con el gradiente de marca */}
            <div className="h-1 w-20 bg-gradient-to-r from-[#2196F3] to-[#E91E63] rounded-full opacity-70 mx-auto lg:mx-0"></div>

            <Image
              src="/LogoSaberes.webp"
              alt="Logo Saberes"
              width={256}
              height={64}
              sizes="(max-width: 768px) 160px, 256px"
              className="w-auto h-auto max-w-[200px] mx-auto lg:mx-0 opacity-90"
            />

            <p className="text-sm text-gray-300 leading-relaxed">
              Fomentamos un modelo educativo innovador que involucra a
              estudiantes y familias, fortaleciendo aprendizajes curriculares y
              socioemocionales.
            </p>
          </div>

          {/* Información de contacto */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 col-span-1 lg:col-span-7">
            <div className="flex flex-col gap-6">
              <h3 className="text-xs font-bold tracking-wider text-gray-400 uppercase border-b border-gray-600 pb-2">
                Contacto Administrativo
              </h3>

              {/* Administrativo */}
              <div className="space-y-2">
                <p className="font-semibold text-gray-500 text-sm">
                  Administrativo
                </p>
                <div
                  className="flex items-center gap-2 group cursor-pointer"
                  onClick={() => copyToClipboard("kescobar@elquisco.cl")}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4 text-blue-400 group-hover:text-blue-500 transition-colors"
                  >
                    <path d="M3 7a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-10z" />
                    <path d="M3 7l9 6l9 -6" />
                  </svg>
                  <p className="text-sm text-gray-300 group-hover:text-blue-500 transition-colors hover:underline">
                    kescobar@elquisco.cl
                  </p>
                </div>
              </div>

              {/* Gestión Acceso */}
              <div className="space-y-2">
                <p className="font-semibold text-gray-500 text-sm">
                  Gestión de accesos
                </p>
                <div
                  className="flex items-center gap-2 group cursor-pointer"
                  onClick={() => copyToClipboard("tsepulveda@elquisco.cl")}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4 text-blue-400 group-hover:text-blue-500 transition-colors"
                  >
                    <path d="M3 7a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-10z" />
                    <path d="M3 7l9 6l9 -6" />
                  </svg>
                  <p className="text-sm text-gray-300 group-hover:text-blue-500 transition-colors hover:underline">
                    tsepulveda@elquisco.cl
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <h3 className="text-xs font-bold tracking-wider text-gray-400 uppercase border-b border-gray-600 pb-2">
                Programa Saberes
              </h3>

              {/* Celular Saberes */}
              <div className="space-y-2">
                <p className="font-semibold text-gray-500 text-sm">Celular</p>
                <div
                  className="flex items-center gap-2 group cursor-pointer"
                  onClick={() => copyToClipboard("+56965798774")}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4 text-green-400 group-hover:text-green-500 transition-colors"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <p className="text-sm text-gray-300 group-hover:text-green-500 transition-colors hover:underline">
                    +56965798774
                  </p>
                </div>
              </div>

              {/* Correo Saberes */}
              <div className="space-y-2">
                <p className="font-semibold text-gray-500 text-sm">Correo</p>
                <div
                  className="flex items-center gap-2 group cursor-pointer"
                  onClick={() =>
                    copyToClipboard("convivencia.saberes@gmail.com")
                  }
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4 text-blue-400 group-hover:text-blue-500 transition-colors"
                  >
                    <path d="M3 7a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-10z" />
                    <path d="M3 7l9 6l9 -6" />
                  </svg>
                  <p className="text-sm text-gray-300 group-hover:text-blue-500 transition-colors hover:underline">
                    convivencia.saberes@gmail.com
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sello institucional */}
          {/* <div className="flex flex-col items-center justify-center text-center col-span-1 lg:col-span-2 bg-gradient-to-bs from-indigo-500 to-indigo-700 pt-5 pb-6 px-4 rounded-xl border border-slate-600">
            <Image
              src="/sello.png"
              alt="Sello institucional"
              width={80}
              height={80}
              className="w-16 h-16 lg:w-20 lg:h-20 object-contain mb-3"
            />
            <h4 className="text-sm font-bold text-amber-100 mb-1">
              Institución Ganadora 2025
            </h4>
            <p className="text-xs text-amber-50 leading-tight">
              Reconocimiento Instituciones Transformadoras - Gobierno Digital
            </p>
          </div> */}
        </div>

        {/* Sello institucional */}
        <div className="flex flex-col items-center justify-center text-center col-span-1 lg:col-span-2 bg-gradient-to-bs from-indigo-500 to-indigo-700 pt-3 pb-2 px-4 rounded-xl bordesr border-slate-600">
          <Image
            src="/sello.png"
            alt="Sello institucional"
            width={80}
            height={80}
            className="w-16 h-16 lg:w-20 lg:h-20 object-contain mb-3"
          />
          <h4 className="text-sm font-bold text-amber-100 mb-1">
            Institución Ganadora 2025
          </h4>
          <p className="text-xs text-amber-50 leading-tight">
            Reconocimiento Instituciones Transformadoras - Gobierno Digital
          </p>
        </div>

        {/* Línea inferior */}
        <div className="border-t border-gray-600 pt-6 text-center">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Saberes. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
