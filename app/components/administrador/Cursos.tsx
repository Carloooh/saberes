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

  useEffect(() => {
    fetchCursos();
  }, []);

  const fetchCursos = async () => {
    try {
      const response = await fetch("/api/admin/cursos");
      const result = await response.json();

      if (result.success) {
        setCursos(result.data);
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

  const handleCreate = async () => {
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
        fetchCursos();
      } else {
        toast.error("Error al crear el curso");
      }
    } catch (error) {
      toast.error("Error en la conexión con el servidor");
    }
  };

  const handleUpdate = async (id: string) => {
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

  if (loading) return <div>Cargando...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="bg-white shadow sm:rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-6">
        Gestión de Cursos
      </h3>

      {/* Formulario para nuevo curso */}
      <div className="mb-8 p-4 border rounded-lg">
        <h4 className="text-md font-medium mb-4">Crear Nuevo Curso</h4>
        <div className="space-y-4">
          <input
            type="text"
            value={newCurso.nombre}
            onChange={(e) =>
              setNewCurso({ ...newCurso, nombre: e.target.value })
            }
            placeholder="Nombre del curso"
            className="w-full p-2 border rounded"
          />
          <div className="grid grid-cols-2 gap-4">
            {allAsignaturas.map((asignatura) => (
              <label
                key={asignatura.id_asignatura}
                className="flex items-center gap-2"
              >
                <input
                  type="checkbox"
                  checked={newCurso.asignaturas.includes(
                    asignatura.id_asignatura
                  )}
                  onChange={(e) => {
                    const asignaturas = e.target.checked
                      ? [...newCurso.asignaturas, asignatura.id_asignatura]
                      : newCurso.asignaturas.filter(
                          (id) => id !== asignatura.id_asignatura
                        );
                    setNewCurso({ ...newCurso, asignaturas });
                  }}
                />
                {asignatura.nombre_asignatura}
              </label>
            ))}
          </div>
          <button
            onClick={handleCreate}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Crear Curso
          </button>
        </div>
      </div>

      {/* Lista de cursos */}
      <div className="space-y-6">
        {cursos.map((curso) => (
          <div key={curso.id_curso} className="border p-4 rounded-lg">
            {editingId === curso.id_curso ? (
              <div className="space-y-4">
                <input
                  type="text"
                  value={editCurso.nombre}
                  onChange={(e) =>
                    setEditCurso({ ...editCurso, nombre: e.target.value })
                  }
                  className="w-full p-2 border rounded"
                />
                <div className="grid grid-cols-2 gap-4">
                  {allAsignaturas.map((asignatura) => (
                    <label
                      key={asignatura.id_asignatura}
                      className="flex items-center gap-2"
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
                      />
                      {asignatura.nombre_asignatura}
                    </label>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdate(curso.id_curso)}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-medium">{curso.nombre_curso}</h4>
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
                      className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(curso.id_curso)}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {curso.asignaturas.map((asignatura) => (
                    <div
                      key={asignatura.id_asignatura}
                      className="text-gray-600"
                    >
                      • {asignatura.nombre_asignatura}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Cursos;
