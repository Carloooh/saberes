// "use client";
// import React, { useState, useEffect } from "react";
// import toast from "react-hot-toast";

// interface Asignatura {
//   id_asignatura: string;
//   nombre_asignatura: string;
// }

// interface Curso {
//   id_curso: string;
//   nombre_curso: string;
//   asignaturas: Asignatura[];
// }

// const Cursos: React.FC = () => {
//   const [cursos, setCursos] = useState<Curso[]>([]);
//   const [allAsignaturas, setAllAsignaturas] = useState<Asignatura[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [editingId, setEditingId] = useState<string | null>(null);
//   const [newCurso, setNewCurso] = useState({
//     nombre: "",
//     asignaturas: [] as string[],
//   });
//   const [editCurso, setEditCurso] = useState({
//     nombre: "",
//     asignaturas: [] as string[],
//   });

//   useEffect(() => {
//     fetchCursos();
//   }, []);

//   const fetchCursos = async () => {
//     try {
//       const response = await fetch("/api/admin/cursos");
//       const result = await response.json();

//       if (result.success) {
//         setCursos(result.data);
//         setAllAsignaturas(result.asignaturas);
//       } else {
//         setError("Error al cargar los cursos");
//       }
//     } catch (error) {
//       setError("Error en la conexión con el servidor");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCreate = async () => {
//     try {
//       const response = await fetch("/api/admin/cursos", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           nombre_curso: newCurso.nombre,
//           asignaturas: newCurso.asignaturas,
//         }),
//       });

//       const result = await response.json();

//       if (result.success) {
//         toast.success("Curso creado exitosamente");
//         setNewCurso({ nombre: "", asignaturas: [] });
//         fetchCursos();
//       } else {
//         toast.error("Error al crear el curso");
//       }
//     } catch (error) {
//       toast.error("Error en la conexión con el servidor");
//     }
//   };

//   const handleUpdate = async (id: string) => {
//     try {
//       const response = await fetch("/api/admin/cursos", {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           id_curso: id,
//           nombre_curso: editCurso.nombre,
//           asignaturas: editCurso.asignaturas,
//         }),
//       });

//       const result = await response.json();

//       if (result.success) {
//         toast.success("Curso actualizado exitosamente");
//         setEditingId(null);
//         fetchCursos();
//       } else {
//         toast.error("Error al actualizar el curso");
//       }
//     } catch (error) {
//       toast.error("Error en la conexión con el servidor");
//     }
//   };

//   const handleDelete = async (id: string) => {
//     if (
//       !window.confirm(
//         "¿Está seguro de eliminar este curso? Se eliminarán todas las evaluaciones, calificaciones y otros datos relacionados."
//       )
//     ) {
//       return;
//     }

//     try {
//       const response = await fetch("/api/admin/cursos", {
//         method: "DELETE",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ id_curso: id }),
//       });

//       const result = await response.json();

//       if (result.success) {
//         toast.success("Curso eliminado exitosamente");
//         fetchCursos();
//       } else {
//         toast.error("Error al eliminar el curso");
//       }
//     } catch (error) {
//       toast.error("Error en la conexión con el servidor");
//     }
//   };

//   if (loading) return <div>Cargando...</div>;
//   if (error) return <div className="text-red-500">{error}</div>;

//   return (
//     <div className="bg-white shadow sm:rounded-lg p-6">
//       <h3 className="text-lg font-medium text-gray-900 mb-6">
//         Gestión de Cursos
//       </h3>

//       {/* Formulario para nuevo curso */}
//       <div className="mb-8 p-4 border rounded-lg">
//         <h4 className="text-md font-medium mb-4">Crear Nuevo Curso</h4>
//         <div className="space-y-4">
//           <input
//             type="text"
//             value={newCurso.nombre}
//             onChange={(e) =>
//               setNewCurso({ ...newCurso, nombre: e.target.value })
//             }
//             placeholder="Nombre del curso"
//             className="w-full p-2 border rounded"
//           />
//           <div className="grid grid-cols-2 gap-4">
//             {allAsignaturas.map((asignatura) => (
//               <label
//                 key={asignatura.id_asignatura}
//                 className="flex items-center gap-2"
//               >
//                 <input
//                   type="checkbox"
//                   checked={newCurso.asignaturas.includes(
//                     asignatura.id_asignatura
//                   )}
//                   onChange={(e) => {
//                     const asignaturas = e.target.checked
//                       ? [...newCurso.asignaturas, asignatura.id_asignatura]
//                       : newCurso.asignaturas.filter(
//                           (id) => id !== asignatura.id_asignatura
//                         );
//                     setNewCurso({ ...newCurso, asignaturas });
//                   }}
//                 />
//                 {asignatura.nombre_asignatura}
//               </label>
//             ))}
//           </div>
//           <button
//             onClick={handleCreate}
//             className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
//           >
//             Crear Curso
//           </button>
//         </div>
//       </div>

//       {/* Lista de cursos */}
//       <div className="space-y-6">
//         {cursos.map((curso) => (
//           <div key={curso.id_curso} className="border p-4 rounded-lg">
//             {editingId === curso.id_curso ? (
//               <div className="space-y-4">
//                 <input
//                   type="text"
//                   value={editCurso.nombre}
//                   onChange={(e) =>
//                     setEditCurso({ ...editCurso, nombre: e.target.value })
//                   }
//                   className="w-full p-2 border rounded"
//                 />
//                 <div className="grid grid-cols-2 gap-4">
//                   {allAsignaturas.map((asignatura) => (
//                     <label
//                       key={asignatura.id_asignatura}
//                       className="flex items-center gap-2"
//                     >
//                       <input
//                         type="checkbox"
//                         checked={editCurso.asignaturas.includes(
//                           asignatura.id_asignatura
//                         )}
//                         onChange={(e) => {
//                           const asignaturas = e.target.checked
//                             ? [
//                                 ...editCurso.asignaturas,
//                                 asignatura.id_asignatura,
//                               ]
//                             : editCurso.asignaturas.filter(
//                                 (id) => id !== asignatura.id_asignatura
//                               );
//                           setEditCurso({ ...editCurso, asignaturas });
//                         }}
//                       />
//                       {asignatura.nombre_asignatura}
//                     </label>
//                   ))}
//                 </div>
//                 <div className="flex gap-2">
//                   <button
//                     onClick={() => handleUpdate(curso.id_curso)}
//                     className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
//                   >
//                     Guardar
//                   </button>
//                   <button
//                     onClick={() => setEditingId(null)}
//                     className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
//                   >
//                     Cancelar
//                   </button>
//                 </div>
//               </div>
//             ) : (
//               <>
//                 <div className="flex justify-between items-center mb-4">
//                   <h4 className="text-lg font-medium">{curso.nombre_curso}</h4>
//                   <div className="flex gap-2">
//                     <button
//                       onClick={() => {
//                         setEditingId(curso.id_curso);
//                         setEditCurso({
//                           nombre: curso.nombre_curso,
//                           asignaturas: curso.asignaturas.map(
//                             (a) => a.id_asignatura
//                           ),
//                         });
//                       }}
//                       className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
//                     >
//                       Editar
//                     </button>
//                     <button
//                       onClick={() => handleDelete(curso.id_curso)}
//                       className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
//                     >
//                       Eliminar
//                     </button>
//                   </div>
//                 </div>
//                 <div className="grid grid-cols-2 gap-4">
//                   {curso.asignaturas.map((asignatura) => (
//                     <div
//                       key={asignatura.id_asignatura}
//                       className="text-gray-600"
//                     >
//                       • {asignatura.nombre_asignatura}
//                     </div>
//                   ))}
//                 </div>
//               </>
//             )}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default Cursos;

"use client";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";

interface Asignatura {
  id_asignatura: string;
  nombre_asignatura: string;
}

interface Curso {
  id_curso: string;
  nombre_curso: string;
  asignaturas: Asignatura[];
}

const Cursos: React.FC = () => {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [allAsignaturas, setAllAsignaturas] = useState<Asignatura[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCurso, setNewCurso] = useState({
    nombre: "",
    asignaturas: [] as string[],
  });
  const [editCurso, setEditCurso] = useState({
    nombre: "",
    asignaturas: [] as string[],
  });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCursos, setFilteredCursos] = useState<Curso[]>([]);

  useEffect(() => {
    fetchCursos();
  }, []);

  useEffect(() => {
    filterCursos();
  }, [searchTerm, cursos]);

  const fetchCursos = async () => {
    try {
      const response = await fetch("/api/admin/cursos");
      const result = await response.json();

      if (result.success) {
        setCursos(result.data);
        setFilteredCursos(result.data);
        setAllAsignaturas(result.asignaturas);
      } else {
        setError("Error al cargar los cursos");
      }
    } catch (error) {
      setError("Error en la conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const filterCursos = () => {
    if (!searchTerm.trim()) {
      setFilteredCursos(cursos);
      return;
    }

    const searchLower = searchTerm.toLowerCase();
    const filtered = cursos.filter(
      (curso) =>
        curso.nombre_curso.toLowerCase().includes(searchLower) ||
        curso.asignaturas.some((asignatura) =>
          asignatura.nombre_asignatura.toLowerCase().includes(searchLower)
        )
    );
    setFilteredCursos(filtered);
  };

  const handleCreate = async () => {
    if (!newCurso.nombre.trim()) {
      toast.error("El nombre del curso es obligatorio");
      return;
    }

    if (newCurso.asignaturas.length === 0) {
      toast.error("Debe seleccionar al menos una asignatura");
      return;
    }

    try {
      const response = await fetch("/api/admin/cursos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre_curso: newCurso.nombre,
          asignaturas: newCurso.asignaturas,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Curso creado exitosamente");
        setNewCurso({ nombre: "", asignaturas: [] });
        setShowCreateForm(false);
        fetchCursos();
      } else {
        toast.error("Error al crear el curso");
      }
    } catch (error) {
      toast.error("Error en la conexión con el servidor");
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editCurso.nombre.trim()) {
      toast.error("El nombre del curso es obligatorio");
      return;
    }

    if (editCurso.asignaturas.length === 0) {
      toast.error("Debe seleccionar al menos una asignatura");
      return;
    }

    try {
      const response = await fetch("/api/admin/cursos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_curso: id,
          nombre_curso: editCurso.nombre,
          asignaturas: editCurso.asignaturas,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Curso actualizado exitosamente");
        setEditingId(null);
        fetchCursos();
      } else {
        toast.error("Error al actualizar el curso");
      }
    } catch (error) {
      toast.error("Error en la conexión con el servidor");
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !window.confirm(
        "¿Está seguro de eliminar este curso? Se eliminarán todas las evaluaciones, calificaciones y otros datos relacionados."
      )
    ) {
      return;
    }

    try {
      const response = await fetch("/api/admin/cursos", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_curso: id }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Curso eliminado exitosamente");
        fetchCursos();
      } else {
        toast.error("Error al eliminar el curso");
      }
    } catch (error) {
      toast.error("Error en la conexión con el servidor");
    }
  };

  if (loading) return <div className="p-6 text-center">Cargando...</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Gestión de Cursos
          </h3>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
          >
            {showCreateForm ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                Cancelar
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Nuevo Curso
              </>
            )}
          </button>
        </div>

        {/* Buscador */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Buscar por nombre de curso o asignatura..."
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Formulario para nuevo curso */}
        {showCreateForm && (
          <div className="mb-6 p-4 border rounded-lg bg-gray-50">
            <h4 className="text-md font-medium mb-4">Crear Nuevo Curso</h4>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="nombre_curso"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Nombre del curso <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="nombre_curso"
                  value={newCurso.nombre}
                  onChange={(e) =>
                    setNewCurso({ ...newCurso, nombre: e.target.value })
                  }
                  placeholder="Ejemplo: 1° Básico A"
                  className="w-full p-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Asignaturas <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 bg-white p-3 border rounded-md max-h-60 overflow-y-auto">
                  {allAsignaturas.map((asignatura) => (
                    <label
                      key={asignatura.id_asignatura}
                      className="flex items-center gap-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={newCurso.asignaturas.includes(
                          asignatura.id_asignatura
                        )}
                        onChange={(e) => {
                          const asignaturas = e.target.checked
                            ? [
                                ...newCurso.asignaturas,
                                asignatura.id_asignatura,
                              ]
                            : newCurso.asignaturas.filter(
                                (id) => id !== asignatura.id_asignatura
                              );
                          setNewCurso({ ...newCurso, asignaturas });
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      {asignatura.nombre_asignatura}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleCreate}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Crear Curso
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lista de cursos */}
        <div className="space-y-4">
          {filteredCursos.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm
                ? "No se encontraron cursos que coincidan con la búsqueda"
                : "No hay cursos disponibles"}
            </div>
          ) : (
            filteredCursos.map((curso) => (
              <div
                key={curso.id_curso}
                className="border rounded-md p-4 bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                {editingId === curso.id_curso ? (
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor={`edit_nombre_${curso.id_curso}`}
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Nombre del curso
                      </label>
                      <input
                        type="text"
                        id={`edit_nombre_${curso.id_curso}`}
                        value={editCurso.nombre}
                        onChange={(e) =>
                          setEditCurso({ ...editCurso, nombre: e.target.value })
                        }
                        className="w-full p-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Asignaturas
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 bg-white p-3 border rounded-md max-h-60 overflow-y-auto">
                        {allAsignaturas.map((asignatura) => (
                          <label
                            key={asignatura.id_asignatura}
                            className="flex items-center gap-2 text-sm"
                          >
                            <input
                              type="checkbox"
                              checked={editCurso.asignaturas.includes(
                                asignatura.id_asignatura
                              )}
                              onChange={(e) => {
                                const asignaturas = e.target.checked
                                  ? [
                                      ...editCurso.asignaturas,
                                      asignatura.id_asignatura,
                                    ]
                                  : editCurso.asignaturas.filter(
                                      (id) => id !== asignatura.id_asignatura
                                    );
                                setEditCurso({ ...editCurso, asignaturas });
                              }}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            {asignatura.nombre_asignatura}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleUpdate(curso.id_curso)}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-lg font-medium text-gray-900">
                        {curso.nombre_curso}
                      </h4>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingId(curso.id_curso);
                            setEditCurso({
                              nombre: curso.nombre_curso,
                              asignaturas: curso.asignaturas.map(
                                (a) => a.id_asignatura
                              ),
                            });
                          }}
                          className="bg-yellow-500 text-white px-3 py-1.5 rounded-md hover:bg-yellow-600 transition-colors text-sm flex items-center"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(curso.id_curso)}
                          className="bg-red-500 text-white px-3 py-1.5 rounded-md hover:bg-red-600 transition-colors text-sm flex items-center"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Eliminar
                        </button>
                      </div>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">
                        Asignaturas:
                      </h5>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {curso.asignaturas.map((asignatura) => (
                          <div
                            key={asignatura.id_asignatura}
                            className="text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-md flex items-center"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mr-1 text-blue-500"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                            </svg>
                            {asignatura.nombre_asignatura}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Cursos;
