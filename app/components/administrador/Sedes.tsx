// "use client";

// import React, { useState, useEffect } from "react";
// import Image from "next/image";

// interface Sede {
//   id_sede: string;
//   nombre: string;
//   direccion: string;
//   url: string;
//   url_iframe: string;
//   imagen?: string;
//   archivos?: {
//     id_archivo: string;
//     titulo: string;
//     extension: string;
//   }[];
// }

// interface Curso {
//   id_curso: string;
//   nombre_curso: string;
// }

// const Sedes: React.FC = () => {
//   const [sedes, setSedes] = useState<Sede[]>([]);
//   const [cursos, setCursos] = useState<Curso[]>([]);
//   const [showCreateForm, setShowCreateForm] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const [createFormData, setCreateFormData] = useState({
//     nombre: "",
//     direccion: "",
//     url: "",
//     url_iframe: "",
//     archivos: [] as File[],
//   });

//   const [editId, setEditId] = useState<string | null>(null);
//   const [editFormData, setEditFormData] = useState({
//     nombre: "",
//     direccion: "",
//     url: "",
//     url_iframe: "",
//     archivosToAdd: [] as File[],
//     archivosToDelete: [] as string[],
//   });

//   useEffect(() => {
//     fetch("/api/cursos")
//       .then((res) => res.json())
//       .then((data) => setCursos(data));
//   }, []);

//   const fetchSedes = async () => {
//     try {
//       setLoading(true);
//       const response = await fetch("/api/sedes");
//       const result = await response.json();

//       if (result.success) {
//         setSedes(result.data);
//       } else {
//         setError("Error al cargar las sedes");
//       }
//     } catch (error) {
//       setError("Error en la conexión con el servidor");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchSedes();
//   }, []);

//   const handleCreateSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     const formData = new FormData();
//     formData.append("nombre", createFormData.nombre);
//     formData.append("direccion", createFormData.direccion);
//     formData.append("url", createFormData.url);
//     formData.append("url_iframe", createFormData.url_iframe);
//     createFormData.archivos.forEach((file, index) => {
//       formData.append(`archivo-${index}`, file);
//     });

//     try {
//       const response = await fetch("/api/sedes", {
//         method: "POST",
//         body: formData,
//       });
//       const result = await response.json();

//       if (result.success) {
//         setCreateFormData({
//           nombre: "",
//           direccion: "",
//           url: "",
//           url_iframe: "",
//           archivos: [],
//         });
//         setShowCreateForm(false);
//         fetchSedes();
//       }
//     } catch (error) {
//       setError("Error al crear la sede");
//     }
//   };

//   const handleEdit = async (id: string) => {
//     const formData = new FormData();
//     formData.append("id_sede", id);
//     formData.append("nombre", editFormData.nombre);
//     formData.append("direccion", editFormData.direccion);
//     formData.append("url", editFormData.url);
//     formData.append("url_iframe", editFormData.url_iframe);

//     if (editFormData.archivosToDelete.length > 0) {
//       formData.append(
//         "archivosAEliminar",
//         JSON.stringify(editFormData.archivosToDelete)
//       );
//     }

//     editFormData.archivosToAdd.forEach((file, index) => {
//       formData.append(`archivo-${index}`, file);
//     });

//     try {
//       const response = await fetch("/api/sedes", {
//         method: "PUT",
//         body: formData,
//       });
//       const result = await response.json();

//       if (result.success) {
//         setEditId(null);
//         setEditFormData({
//           nombre: "",
//           direccion: "",
//           url: "",
//           url_iframe: "",
//           archivosToAdd: [],
//           archivosToDelete: [],
//         });
//         fetchSedes();
//       }
//     } catch (error) {
//       setError("Error al actualizar la sede");
//     }
//   };

//   const handleDelete = async (id: string) => {
//     if (!confirm("¿Estás seguro de eliminar esta sede?")) return;
//     try {
//       const response = await fetch("/api/sedes", {
//         method: "DELETE",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ id_sede: id }),
//       });
//       const result = await response.json();

//       if (result.success) {
//         fetchSedes();
//       }
//     } catch (error) {
//       setError("Error al eliminar la sede");
//     }
//   };

//   const startEdit = (sede: Sede) => {
//     setEditId(sede.id_sede);
//     setEditFormData({
//       nombre: sede.nombre,
//       direccion: sede.direccion,
//       url: sede.url,
//       url_iframe: sede.url_iframe,
//       archivosToAdd: [],
//       archivosToDelete: [],
//     });
//   };

//   if (loading) {
//     return <div className="text-center p-4">Cargando...</div>;
//   }

//   return (
//     <div className="container mx-auto p-4">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-2xl font-bold">Sedes</h1>
//         <button
//           onClick={() => setShowCreateForm(!showCreateForm)}
//           className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
//         >
//           Nueva Sede
//         </button>
//       </div>

//       {error && (
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
//           {error}
//         </div>
//       )}

//       {showCreateForm && (
//         <div className="mb-6 p-6 border rounded-lg shadow-lg bg-gray-50">
//           <h2 className="text-xl font-semibold mb-4">Crear Sede</h2>
//           <form onSubmit={handleCreateSubmit}>
//             <div className="grid grid-cols-1 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Nombre
//                 </label>
//                 <input
//                   type="text"
//                   value={createFormData.nombre}
//                   onChange={(e) =>
//                     setCreateFormData({
//                       ...createFormData,
//                       nombre: e.target.value,
//                     })
//                   }
//                   className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Dirección
//                 </label>
//                 <input
//                   type="text"
//                   value={createFormData.direccion}
//                   onChange={(e) =>
//                     setCreateFormData({
//                       ...createFormData,
//                       direccion: e.target.value,
//                     })
//                   }
//                   className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   URL
//                 </label>
//                 <input
//                   type="url"
//                   value={createFormData.url}
//                   onChange={(e) =>
//                     setCreateFormData({
//                       ...createFormData,
//                       url: e.target.value,
//                     })
//                   }
//                   className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   URL del iframe
//                 </label>
//                 <input
//                   type="text"
//                   value={createFormData.url_iframe}
//                   onChange={(e) =>
//                     setCreateFormData({
//                       ...createFormData,
//                       url_iframe: e.target.value,
//                     })
//                   }
//                   className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
//                 />
//               </div>
//               <div>
//               {cursos.map((curso) => (
//                 <div key={curso.id_curso} className="border p-4 rounded-lg">
//                   <label className="flex items-center gap-2 mb-4">
//                     <input
//                       type="checkbox"
//                       checked={!!selectedCursos[curso.id_curso]}
//                       onChange={() => handleCursoChange(curso.id_curso)}
//                     />
//                     <span className="font-medium">{curso.nombre_curso}</span>
//                   </label>

//                 </div>
//               ))}
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Archivos
//                 </label>
//                 <input
//                   type="file"
//                   multiple
//                   onChange={(e) =>
//                     setCreateFormData({
//                       ...createFormData,
//                       archivos: Array.from(e.target.files || []),
//                     })
//                   }
//                   className="mt-1 block w-full"
//                   accept="image/*,video/*"
//                 />
//               </div>
//             </div>
//             <div className="flex justify-end space-x-3 mt-4">
//               <button
//                 type="button"
//                 onClick={() => {
//                   setShowCreateForm(false);
//                   setCreateFormData({
//                     nombre: "",
//                     direccion: "",
//                     url: "",
//                     url_iframe: "",
//                     archivos: [],
//                   });
//                 }}
//                 className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
//               >
//                 Cancelar
//               </button>
//               <button
//                 type="submit"
//                 className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
//               >
//                 Crear
//               </button>
//             </div>
//           </form>
//         </div>
//       )}

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {sedes.map((sede) => (
//           <div
//             key={sede.id_sede}
//             className="border rounded-lg p-4 bg-white shadow"
//           >
//             {editId === sede.id_sede ? (
//               <div>
//                 <input
//                   type="text"
//                   value={editFormData.nombre}
//                   onChange={(e) =>
//                     setEditFormData({
//                       ...editFormData,
//                       nombre: e.target.value,
//                     })
//                   }
//                   className="mb-2 w-full p-2 border rounded"
//                   placeholder="Nombre"
//                 />
//                 <input
//                   type="text"
//                   value={editFormData.direccion}
//                   onChange={(e) =>
//                     setEditFormData({
//                       ...editFormData,
//                       direccion: e.target.value,
//                     })
//                   }
//                   className="mb-2 w-full p-2 border rounded"
//                   placeholder="Dirección"
//                 />
//                 <input
//                   type="url"
//                   value={editFormData.url}
//                   onChange={(e) =>
//                     setEditFormData({
//                       ...editFormData,
//                       url: e.target.value,
//                     })
//                   }
//                   className="mb-2 w-full p-2 border rounded"
//                   placeholder="URL"
//                 />
//                 <input
//                   type="text"
//                   value={editFormData.url_iframe}
//                   onChange={(e) =>
//                     setEditFormData({
//                       ...editFormData,
//                       url_iframe: e.target.value,
//                     })
//                   }
//                   className="mb-2 w-full p-2 border rounded"
//                   placeholder="URL del iframe"
//                 />
//                 <input
//                   type="file"
//                   multiple
//                   onChange={(e) =>
//                     setEditFormData({
//                       ...editFormData,
//                       archivosToAdd: Array.from(e.target.files || []),
//                     })
//                   }
//                   className="mb-2 w-full"
//                   accept="image/*,video/*"
//                 />
//                 {sede.archivos && sede.archivos.length > 0 && (
//                   <div className="grid grid-cols-2 gap-2 mb-2">
//                     {sede.archivos.map((archivo) => (
//                       <div key={archivo.id_archivo} className="relative">
//                         <Image
//                           src={`/api/sedes/download/${archivo.id_archivo}`}
//                           alt={archivo.titulo}
//                           width={100}
//                           height={100}
//                           className="w-full h-24 object-cover rounded"
//                           unoptimized
//                         />
//                         <button
//                           onClick={() =>
//                             setEditFormData({
//                               ...editFormData,
//                               archivosToDelete: [
//                                 ...editFormData.archivosToDelete,
//                                 archivo.id_archivo,
//                               ],
//                             })
//                           }
//                           className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
//                         >
//                           X
//                         </button>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//                 <div className="flex justify-end space-x-2">
//                   <button
//                     onClick={() => {
//                       setEditId(null);
//                       setEditFormData({
//                         nombre: "",
//                         direccion: "",
//                         url: "",
//                         url_iframe: "",
//                         archivosToAdd: [],
//                         archivosToDelete: [],
//                       });
//                     }}
//                     className="px-3 py-1 text-gray-600 hover:underline"
//                   >
//                     Cancelar
//                   </button>
//                   <button
//                     onClick={() => handleEdit(sede.id_sede)}
//                     className="px-3 py-1 text-blue-600 hover:underline"
//                   >
//                     Guardar
//                   </button>
//                 </div>
//               </div>
//             ) : (
//               <div>
//                 <h3 className="text-lg font-semibold mb-2">{sede.nombre}</h3>
//                 <p className="text-gray-600 mb-2">{sede.direccion}</p>
//                 <a
//                   href={sede.url}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="text-blue-600 hover:underline mb-2 block"
//                 >
//                   {sede.url}
//                 </a>
//                 {sede.url_iframe && (
//                   <div className="mb-4">
//                     <iframe
//                       src={sede.url_iframe}
//                       className="w-full h-48 rounded border"
//                       frameBorder="0"
//                       allowFullScreen
//                     ></iframe>
//                   </div>
//                 )}
//                 {sede.archivos && sede.archivos.length > 0 && (
//                   <div className="grid grid-cols-2 gap-2 mb-2">
//                     {sede.archivos.map((archivo) => (
//                       <div key={archivo.id_archivo}>
//                         <Image
//                           src={`/api/sedes/download/${archivo.id_archivo}`}
//                           alt={archivo.titulo}
//                           width={100}
//                           height={100}
//                           className="w-full h-24 object-cover rounded"
//                           unoptimized
//                         />
//                       </div>
//                     ))}
//                   </div>
//                 )}
//                 <div className="flex justify-end space-x-2">
//                   <button
//                     onClick={() => startEdit(sede)}
//                     className="px-3 py-1 text-blue-600 hover:underline"
//                   >
//                     Editar
//                   </button>
//                   <button
//                     onClick={() => handleDelete(sede.id_sede)}
//                     className="px-3 py-1 text-red-600 hover:underline"
//                   >
//                     Eliminar
//                   </button>
//                 </div>
//               </div>
//             )}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default Sedes;

"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

interface Sede {
  id_sede: string;
  nombre: string;
  direccion: string;
  url: string;
  url_iframe: string;
  cursos: string[];
  imagen?: string;
  archivos?: {
    id_archivo: string;
    titulo: string;
    extension: string;
  }[];
}

interface Curso {
  id_curso: string;
  nombre_curso: string;
}

const Sedes: React.FC = () => {
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [createFormData, setCreateFormData] = useState({
    nombre: "",
    direccion: "",
    url: "",
    url_iframe: "",
    cursos: [] as string[],
    archivos: [] as File[],
  });

  const [editId, setEditId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({
    nombre: "",
    direccion: "",
    url: "",
    url_iframe: "",
    cursos: [] as string[],
    archivosToAdd: [] as File[],
    archivosToDelete: [] as string[],
  });

  useEffect(() => {
    fetch("/api/cursos")
      .then((res) => res.json())
      .then((data) => setCursos(data));
  }, []);

  const fetchSedes = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/sedes");
      const result = await response.json();

      if (result.success) {
        setSedes(result.data);
      } else {
        setError("Error al cargar las sedes");
      }
    } catch (error) {
      setError("Error en la conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSedes();
  }, []);

  const handleCursoChange = (cursoId: string, formType: "create" | "edit") => {
    if (formType === "create") {
      setCreateFormData((prev) => ({
        ...prev,
        cursos: prev.cursos.includes(cursoId)
          ? prev.cursos.filter((id) => id !== cursoId)
          : [...prev.cursos, cursoId],
      }));
    } else {
      setEditFormData((prev) => ({
        ...prev,
        cursos: prev.cursos.includes(cursoId)
          ? prev.cursos.filter((id) => id !== cursoId)
          : [...prev.cursos, cursoId],
      }));
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("nombre", createFormData.nombre);
    formData.append("direccion", createFormData.direccion);
    formData.append("url", createFormData.url);
    formData.append("url_iframe", createFormData.url_iframe);
    formData.append("cursos", JSON.stringify(createFormData.cursos));
    createFormData.archivos.forEach((file, index) => {
      formData.append(`archivo-${index}`, file);
    });

    try {
      const response = await fetch("/api/sedes", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();

      if (result.success) {
        setCreateFormData({
          nombre: "",
          direccion: "",
          url: "",
          url_iframe: "",
          cursos: [],
          archivos: [],
        });
        setShowCreateForm(false);
        fetchSedes();
      }
    } catch (error) {
      setError("Error al crear la sede");
    }
  };

  const handleEdit = async (id: string) => {
    const formData = new FormData();
    formData.append("id_sede", id);
    formData.append("nombre", editFormData.nombre);
    formData.append("direccion", editFormData.direccion);
    formData.append("url", editFormData.url);
    formData.append("url_iframe", editFormData.url_iframe);
    formData.append("cursos", JSON.stringify(editFormData.cursos));

    if (editFormData.archivosToDelete.length > 0) {
      formData.append(
        "archivosAEliminar",
        JSON.stringify(editFormData.archivosToDelete)
      );
    }

    editFormData.archivosToAdd.forEach((file, index) => {
      formData.append(`archivo-${index}`, file);
    });

    try {
      const response = await fetch("/api/sedes", {
        method: "PUT",
        body: formData,
      });
      const result = await response.json();

      if (result.success) {
        setEditId(null);
        setEditFormData({
          nombre: "",
          direccion: "",
          url: "",
          url_iframe: "",
          cursos: [],
          archivosToAdd: [],
          archivosToDelete: [],
        });
        fetchSedes();
      }
    } catch (error) {
      setError("Error al actualizar la sede");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta sede?")) return;
    try {
      const response = await fetch("/api/sedes", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id_sede: id }),
      });
      const result = await response.json();

      if (result.success) {
        fetchSedes();
      }
    } catch (error) {
      setError("Error al eliminar la sede");
    }
  };

  const startEdit = (sede: Sede) => {
    setEditId(sede.id_sede);
    setEditFormData({
      nombre: sede.nombre,
      direccion: sede.direccion,
      url: sede.url,
      url_iframe: sede.url_iframe,
      cursos: sede.cursos || [],
      archivosToAdd: [],
      archivosToDelete: [],
    });
  };

  if (loading) {
    return <div className="text-center p-4">Cargando...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Sedes</h1>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Nueva Sede
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {showCreateForm && (
        <div className="mb-6 p-6 border rounded-lg shadow-lg bg-gray-50">
          <h2 className="text-xl font-semibold mb-4">Crear Sede</h2>
          <form onSubmit={handleCreateSubmit}>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nombre
                </label>
                <input
                  type="text"
                  value={createFormData.nombre}
                  onChange={(e) =>
                    setCreateFormData({
                      ...createFormData,
                      nombre: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Dirección
                </label>
                <input
                  type="text"
                  value={createFormData.direccion}
                  onChange={(e) =>
                    setCreateFormData({
                      ...createFormData,
                      direccion: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  URL
                </label>
                <input
                  type="url"
                  value={createFormData.url}
                  onChange={(e) =>
                    setCreateFormData({
                      ...createFormData,
                      url: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  URL del iframe
                </label>
                <input
                  type="text"
                  value={createFormData.url_iframe}
                  onChange={(e) =>
                    setCreateFormData({
                      ...createFormData,
                      url_iframe: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cursos
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {cursos.map((curso) => (
                    <div key={curso.id_curso} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`create-curso-${curso.id_curso}`}
                        checked={createFormData.cursos.includes(curso.id_curso)}
                        onChange={() =>
                          handleCursoChange(curso.id_curso, "create")
                        }
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor={`create-curso-${curso.id_curso}`}
                        className="ml-2 block text-sm text-gray-900"
                      >
                        {curso.nombre_curso}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Archivos
                </label>
                <input
                  type="file"
                  multiple
                  onChange={(e) =>
                    setCreateFormData({
                      ...createFormData,
                      archivos: Array.from(e.target.files || []),
                    })
                  }
                  className="mt-1 block w-full"
                  accept="image/*,video/*"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-4">
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setCreateFormData({
                    nombre: "",
                    direccion: "",
                    url: "",
                    url_iframe: "",
                    cursos: [],
                    archivos: [],
                  });
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Crear
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sedes.map((sede) => (
          <div
            key={sede.id_sede}
            className="border rounded-lg p-4 bg-white shadow"
          >
            {editId === sede.id_sede ? (
              <div>
                <input
                  type="text"
                  value={editFormData.nombre}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      nombre: e.target.value,
                    })
                  }
                  className="mb-2 w-full p-2 border rounded"
                  placeholder="Nombre"
                />
                <input
                  type="text"
                  value={editFormData.direccion}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      direccion: e.target.value,
                    })
                  }
                  className="mb-2 w-full p-2 border rounded"
                  placeholder="Dirección"
                />
                <input
                  type="url"
                  value={editFormData.url}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      url: e.target.value,
                    })
                  }
                  className="mb-2 w-full p-2 border rounded"
                  placeholder="URL"
                />
                <input
                  type="text"
                  value={editFormData.url_iframe}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      url_iframe: e.target.value,
                    })
                  }
                  className="mb-2 w-full p-2 border rounded"
                  placeholder="URL del iframe"
                />
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cursos
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {cursos.map((curso) => (
                      <div key={curso.id_curso} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`edit-curso-${curso.id_curso}`}
                          checked={editFormData.cursos.includes(curso.id_curso)}
                          onChange={() =>
                            handleCursoChange(curso.id_curso, "edit")
                          }
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label
                          htmlFor={`edit-curso-${curso.id_curso}`}
                          className="ml-2 block text-sm text-gray-900"
                        >
                          {curso.nombre_curso}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <input
                  type="file"
                  multiple
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      archivosToAdd: Array.from(e.target.files || []),
                    })
                  }
                  className="mb-2 w-full"
                  accept="image/*,video/*"
                />
                {sede.archivos && sede.archivos.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    {sede.archivos.map((archivo) => (
                      <div key={archivo.id_archivo} className="relative">
                        <Image
                          src={`/api/sedes/download/${archivo.id_archivo}`}
                          alt={archivo.titulo}
                          width={100}
                          height={100}
                          className="w-full h-24 object-cover rounded"
                          unoptimized
                        />
                        <button
                          onClick={() =>
                            setEditFormData({
                              ...editFormData,
                              archivosToDelete: [
                                ...editFormData.archivosToDelete,
                                archivo.id_archivo,
                              ],
                            })
                          }
                          className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
                        >
                          X
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => {
                      setEditId(null);
                      setEditFormData({
                        nombre: "",
                        direccion: "",
                        url: "",
                        url_iframe: "",
                        cursos: [],
                        archivosToAdd: [],
                        archivosToDelete: [],
                      });
                    }}
                    className="px-3 py-1 text-gray-600 hover:underline"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleEdit(sede.id_sede)}
                    className="px-3 py-1 text-blue-600 hover:underline"
                  >
                    Guardar
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-semibold mb-2">{sede.nombre}</h3>
                <p className="text-gray-600 mb-2">{sede.direccion}</p>
                <a
                  href={sede.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline mb-2 block"
                >
                  {sede.url}
                </a>
                {sede.url_iframe && (
                  <div className="mb-4">
                    <iframe
                      src={sede.url_iframe}
                      className="w-full h-48 rounded border"
                      frameBorder="0"
                      allowFullScreen
                    ></iframe>
                  </div>
                )}
                {sede.cursos && sede.cursos.length > 0 && (
                  <div className="mb-2">
                    <h4 className="text-sm font-medium text-gray-700">
                      Cursos:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {sede.cursos.map((cursoId) => {
                        const curso = cursos.find(
                          (c) => c.id_curso === cursoId
                        );
                        return curso ? (
                          <span
                            key={cursoId}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                          >
                            {curso.nombre_curso}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
                {sede.archivos && sede.archivos.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    {sede.archivos.map((archivo) => (
                      <div key={archivo.id_archivo}>
                        <Image
                          src={`/api/sedes/download/${archivo.id_archivo}`}
                          alt={archivo.titulo}
                          width={100}
                          height={100}
                          className="w-full h-24 object-cover rounded"
                          unoptimized
                        />
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => startEdit(sede)}
                    className="px-3 py-1 text-blue-600 hover:underline"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(sede.id_sede)}
                    className="px-3 py-1 text-red-600 hover:underline"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sedes;
