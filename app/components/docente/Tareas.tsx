// "use client";

// import { useState, useEffect } from "react";
// import { format } from "date-fns";
// import es from "date-fns/locale/es";

// interface Archivo {
//   id_archivo: string;
//   titulo: string;
//   extension: string;
// }

// interface ArchivoEntrega extends Archivo {
//   downloadUrl: string;
// }

// interface Entrega {
//   rut_estudiante: string;
//   nombres: string;
//   apellidos: string;
//   estado: "pendiente" | "entregada";
//   fecha_entrega: string | null;
//   comentario: string | null;
//   archivos_entrega: ArchivoEntrega[];
// }

// interface Tarea {
//   id_tarea: string;
//   id_asignatura: string;
//   titulo: string;
//   descripcion: string;
//   fecha: string;
//   archivos: Archivo[];
//   entregas: Entrega[];
// }

// interface TareasProps {
//   cursoId: string;
//   asignaturaId: string;
// }

// export default function Tareas({ cursoId, asignaturaId }: TareasProps) {
//   const [tareas, setTareas] = useState<Tarea[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedEntrega, setSelectedEntrega] = useState<Entrega | null>(null);
//   const [expandedTarea, setExpandedTarea] = useState<string | null>(null);
//   const [showNewTareaForm, setShowNewTareaForm] = useState(false);
//   const [newTarea, setNewTarea] = useState({
//     titulo: "",
//     descripcion: "",
//     archivos: [] as File[],
//   });

//   const fetchTareas = async () => {
//     try {
//       const response = await fetch(
//         `/api/docente/tareas?asignaturaId=${asignaturaId}`
//       );
//       const data = await response.json();
//       if (data.success) {
//         setTareas(data.tareas);
//       }
//     } catch (error) {
//       console.error("Error fetching tareas:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchTareas();
//   }, [asignaturaId]);

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files) {
//       setNewTarea((prev) => ({
//         ...prev,
//         // archivos: [...prev.archivos, ...Array.from(e.target.files!)],
//         archivos: Array.from(e.target.files!),
//       }));
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     const formData = new FormData();
//     formData.append("titulo", newTarea.titulo);
//     formData.append("descripcion", newTarea.descripcion);
//     formData.append("id_asignatura", asignaturaId);

//     // newTarea.archivos.forEach((file, index) => {
//     //   formData.append(`archivo-${index}`, file);
//     // });

//     for (let i = 0; i < newTarea.archivos.length; i++) {
//       formData.append("archivos", newTarea.archivos[i]);
//     }

//     // newTarea.archivos.forEach((file) => {
//     //   formData.append("archivo", file);
//     // });

//     try {
//       const response = await fetch("/api/docente/tareas", {
//         method: "POST",
//         body: formData,
//       });

//       if (response.ok) {
//         setNewTarea({ titulo: "", descripcion: "", archivos: [] });
//         setShowNewTareaForm(false);
//         fetchTareas();
//       }
//     } catch (error) {
//       console.error("Error creating tarea:", error);
//     }
//   };

//   const handleDeleteTarea = async (id_tarea: string, id_asignatura: string) => {
//     try {
//       const response = await fetch("/api/docente/tareas", {
//         method: "DELETE",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ id_tarea, id_asignatura }),
//       });

//       if (response.ok) {
//         fetchTareas(); // Refrescar la lista de tareas
//       }
//     } catch (error) {
//       console.error("Error deleting tarea:", error);
//     }
//   };

//   if (loading) return <div>Cargando...</div>;

//   return (
//     <div className="space-y-4">
//       <div className="flex justify-between items-center">
//         <h2 className="text-xl font-bold">Tareas</h2>
//         <button
//           onClick={() => setShowNewTareaForm(!showNewTareaForm)}
//           className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
//         >
//           {showNewTareaForm ? "Cancelar" : "Nueva Tarea"}
//         </button>
//       </div>

//       {showNewTareaForm && (
//         <form
//           onSubmit={handleSubmit}
//           className="space-y-4 bg-white p-4 rounded shadow"
//         >
//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               Título
//             </label>
//             <input
//               type="text"
//               value={newTarea.titulo}
//               onChange={(e) =>
//                 setNewTarea((prev) => ({ ...prev, titulo: e.target.value }))
//               }
//               className="mt-1 block w-full rounded border-gray-300 shadow-sm"
//               required
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               Descripción
//             </label>
//             <textarea
//               value={newTarea.descripcion}
//               onChange={(e) =>
//                 setNewTarea((prev) => ({
//                   ...prev,
//                   descripcion: e.target.value,
//                 }))
//               }
//               className="mt-1 block w-full rounded border-gray-300 shadow-sm"
//               rows={4}
//               required
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               Archivos
//             </label>
//             <input
//               type="file"
//               onChange={handleFileChange}
//               multiple
//               className="mt-1 block w-full"
//             />
//             {newTarea.archivos.length > 0 && (
//               <div className="mt-2">
//                 <p className="text-sm text-gray-600">Archivos seleccionados:</p>
//                 <ul className="list-disc pl-5">
//                   {newTarea.archivos.map((file, index) => (
//                     <li key={index} className="text-sm text-gray-600">
//                       {file.name}
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             )}
//           </div>
//           <div className="flex justify-end">
//             <button
//               type="submit"
//               className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
//             >
//               Crear Tarea
//             </button>
//           </div>
//         </form>
//       )}

//       <div className="space-y-4">
//         {tareas.map((tarea) => (
//           <div key={tarea.id_tarea} className="bg-white rounded shadow">
//             <div
//               className="p-4 cursor-pointer"
//               onClick={() =>
//                 setExpandedTarea(
//                   expandedTarea === tarea.id_tarea ? null : tarea.id_tarea
//                 )
//               }
//             >
//               <div className="flex justify-between items-center">
//                 <h3 className="text-lg font-semibold">{tarea.titulo}</h3>
//                 <span className="text-sm text-gray-500">
//                   {format(
//                     new Date(tarea.fecha + "T00:00:00"),
//                     "d 'de' MMMM, yyyy",
//                     {
//                       locale: es,
//                     }
//                   )}
//                 </span>
//                 <button
//                   onClick={() =>
//                     handleDeleteTarea(tarea.id_tarea, tarea.id_asignatura)
//                   }
//                   className="text-red-500 hover:text-red-600"
//                 >
//                   Eliminar
//                 </button>
//               </div>
//               <p className="text-gray-600 mt-2">{tarea.descripcion}</p>
//               {tarea.archivos.length > 0 && (
//                 <div className="mt-2">
//                   <p className="text-sm font-medium text-gray-700">Archivos:</p>
//                   <div className="flex flex-wrap gap-2">
//                     {tarea.archivos.map((archivo) => (
//                       <a
//                         key={archivo.id_archivo}
//                         href={`/api/docente/tareas/download?id=${archivo.id_archivo}&tipo=tarea`}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="text-blue-500 hover:text-blue-600 text-sm"
//                       >
//                         {archivo.titulo}.{archivo.extension}
//                       </a>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </div>

//             {expandedTarea === tarea.id_tarea && (
//               <div className="border-t p-4">
//                 <h4 className="font-medium mb-3">Estado de entregas:</h4>
//                 <div className="overflow-x-auto">
//                   <table className="min-w-full divide-y divide-gray-200">
//                     <thead className="bg-gray-50">
//                       <tr>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Estudiante
//                         </th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Estado
//                         </th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Fecha Entrega
//                         </th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Archivos
//                         </th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                           Comentario
//                         </th>
//                       </tr>
//                     </thead>
//                     <tbody className="bg-white divide-y divide-gray-200">
//                       {tarea.entregas.map((entrega) => (
//                         <tr key={entrega.rut_estudiante}>
//                           <td className="px-6 py-4 whitespace-nowrap">
//                             {entrega.nombres} {entrega.apellidos}
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap">
//                             <span
//                               className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
//                                 entrega.estado === "entregada"
//                                   ? "bg-green-100 text-green-800"
//                                   : "bg-yellow-100 text-yellow-800"
//                               }`}
//                             >
//                               {entrega.estado}
//                             </span>
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                             {entrega.fecha_entrega
//                               ? format(
//                                   new Date(entrega.fecha_entrega + "T00:00:00"),
//                                   "dd/MM/yyyy HH:mm"
//                                 )
//                               : "-"}
//                           </td>
//                           <td className="px-6 py-4">
//                             {entrega.archivos_entrega?.length > 0 ? (
//                               <div className="flex flex-col gap-1">
//                                 {entrega.archivos_entrega.map((archivo) => (
//                                   <a
//                                     key={archivo.id_archivo}
//                                     href={`/api/docente/tareas/download?id=${archivo.id_archivo}&tipo=entrega`}
//                                     target="_blank"
//                                     rel="noopener noreferrer"
//                                     className="text-blue-500 hover:text-blue-600 text-sm"
//                                   >
//                                     {archivo.titulo}.{archivo.extension}
//                                   </a>
//                                 ))}
//                               </div>
//                             ) : (
//                               <span className="text-sm text-gray-500">-</span>
//                             )}
//                           </td>
//                           <td className="px-6 py-4">
//                             <span className="text-sm text-gray-500">
//                               {entrega.comentario || "-"}
//                             </span>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             )}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import es from "date-fns/locale/es";

interface Archivo {
  id_archivo: string;
  titulo: string;
  extension: string;
}

interface ArchivoEntrega extends Archivo {
  downloadUrl: string;
}

interface Entrega {
  rut_estudiante: string;
  nombres: string;
  apellidos: string;
  estado: "pendiente" | "entregada";
  fecha_entrega: string | null;
  comentario: string | null;
  archivos_entrega: ArchivoEntrega[];
}

interface Tarea {
  id_tarea: string;
  id_asignatura: string;
  titulo: string;
  descripcion: string;
  fecha: string;
  archivos: Archivo[];
  entregas: Entrega[];
}

interface TareasProps {
  cursoId: string;
  asignaturaId: string;
}

export default function Tareas({ cursoId, asignaturaId }: TareasProps) {
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTarea, setExpandedTarea] = useState<string | null>(null);
  const [selectedEntrega, setSelectedEntrega] = useState<string | null>(null);
  const [showNewTareaForm, setShowNewTareaForm] = useState(false);
  const [newTarea, setNewTarea] = useState({
    titulo: "",
    descripcion: "",
    archivos: [] as File[],
  });

  const fetchTareas = async () => {
    try {
      const response = await fetch(
        `/api/docente/tareas?asignaturaId=${asignaturaId}`
      );
      const data = await response.json();
      if (data.success) {
        setTareas(data.tareas);
      }
    } catch (error) {
      console.error("Error fetching tareas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTareas();
  }, [asignaturaId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewTarea((prev) => ({
        ...prev,
        archivos: Array.from(e.target.files!),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("titulo", newTarea.titulo);
    formData.append("descripcion", newTarea.descripcion);
    formData.append("id_asignatura", asignaturaId);

    for (let i = 0; i < newTarea.archivos.length; i++) {
      formData.append("archivos", newTarea.archivos[i]);
    }

    try {
      const response = await fetch("/api/docente/tareas", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setNewTarea({ titulo: "", descripcion: "", archivos: [] });
        setShowNewTareaForm(false);
        fetchTareas();
      }
    } catch (error) {
      console.error("Error creating tarea:", error);
    }
  };

  const handleDeleteTarea = async (id_tarea: string, id_asignatura: string) => {
    try {
      const response = await fetch("/api/docente/tareas", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id_tarea, id_asignatura }),
      });

      if (response.ok) {
        fetchTareas();
      }
    } catch (error) {
      console.error("Error deleting tarea:", error);
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Tareas</h2>
        <button
          onClick={() => setShowNewTareaForm(!showNewTareaForm)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {showNewTareaForm ? "Cancelar" : "Nueva Tarea"}
        </button>
      </div>

      {showNewTareaForm && (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 bg-white p-4 rounded shadow"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Título
            </label>
            <input
              type="text"
              value={newTarea.titulo}
              onChange={(e) =>
                setNewTarea((prev) => ({ ...prev, titulo: e.target.value }))
              }
              className="mt-1 block w-full rounded border-gray-300 shadow-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Descripción
            </label>
            <textarea
              value={newTarea.descripcion}
              onChange={(e) =>
                setNewTarea((prev) => ({
                  ...prev,
                  descripcion: e.target.value,
                }))
              }
              className="mt-1 block w-full rounded border-gray-300 shadow-sm"
              rows={4}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Archivos
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              multiple
              className="mt-1 block w-full"
            />
            {newTarea.archivos.length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-gray-600">Archivos seleccionados:</p>
                <ul className="list-disc pl-5">
                  {newTarea.archivos.map((file, index) => (
                    <li key={index} className="text-sm text-gray-600">
                      {file.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Crear Tarea
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {tareas.map((tarea) => (
          <div key={tarea.id_tarea} className="bg-white rounded shadow">
            <div
              className="p-4 cursor-pointer"
              onClick={() =>
                setExpandedTarea(
                  expandedTarea === tarea.id_tarea ? null : tarea.id_tarea
                )
              }
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">{tarea.titulo}</h3>
                <span className="text-sm text-gray-500">
                  {format(
                    new Date(tarea.fecha + "T00:00:00"),
                    "d 'de' MMMM, yyyy",
                    {
                      locale: es,
                    }
                  )}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteTarea(tarea.id_tarea, tarea.id_asignatura);
                  }}
                  className="text-red-500 hover:text-red-600"
                >
                  Eliminar
                </button>
              </div>
              <p className="text-gray-600 mt-2">{tarea.descripcion}</p>
              {tarea.archivos.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-700">Archivos:</p>
                  <div className="flex flex-wrap gap-2">
                    {tarea.archivos.map((archivo) => (
                      <a
                        key={archivo.id_archivo}
                        href={`/api/docente/tareas/download?id=${archivo.id_archivo}&tipo=tarea`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-600 text-sm"
                      >
                        {archivo.titulo}.{archivo.extension}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {expandedTarea === tarea.id_tarea && (
              <div className="border-t p-4">
                <h4 className="font-medium mb-3">Estado de entregas:</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estudiante
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fecha Entrega
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {tarea.entregas.map((entrega) => (
                        <>
                          <tr
                            key={entrega.rut_estudiante}
                            className="hover:bg-gray-50"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              {entrega.nombres} {entrega.apellidos}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  entrega.estado === "entregada"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {entrega.estado}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {entrega.fecha_entrega
                                ? format(
                                    new Date(
                                      entrega.fecha_entrega + "T00:00:00"
                                    ),
                                    "dd/MM/yyyy HH:mm"
                                  )
                                : "-"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <button
                                onClick={() =>
                                  setSelectedEntrega(
                                    selectedEntrega === entrega.rut_estudiante
                                      ? null
                                      : entrega.rut_estudiante
                                  )
                                }
                                className="text-blue-600 hover:text-blue-800"
                              >
                                {selectedEntrega === entrega.rut_estudiante
                                  ? "Ocultar detalles"
                                  : "Ver detalles"}
                              </button>
                            </td>
                          </tr>
                          {selectedEntrega === entrega.rut_estudiante && (
                            <tr>
                              <td colSpan={4} className="px-6 py-4 bg-gray-50">
                                <div className="space-y-4">
                                  {entrega.comentario && (
                                    <div>
                                      <h5 className="font-medium text-sm text-gray-700 mb-2">
                                        Comentario del estudiante:
                                      </h5>
                                      <p className="text-sm text-gray-600">
                                        {entrega.comentario}
                                      </p>
                                    </div>
                                  )}

                                  {entrega.archivos_entrega?.length > 0 && (
                                    <div>
                                      <h5 className="font-medium text-sm text-gray-700 mb-2">
                                        Archivos entregados:
                                      </h5>
                                      <div className="flex flex-wrap gap-2">
                                        {entrega.archivos_entrega.map(
                                          (archivo) => (
                                            <a
                                              key={archivo.id_archivo}
                                              href={`/api/docente/tareas/download?id=${archivo.id_archivo}&tipo=entrega`}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                                            >
                                              <svg
                                                className="w-4 h-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                              >
                                                <path
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  strokeWidth={2}
                                                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                />
                                              </svg>
                                              {archivo.titulo}.
                                              {archivo.extension}
                                            </a>
                                          )
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
