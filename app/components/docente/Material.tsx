import { useEffect, useState } from "react";

interface Material {
  id_material: string;
  nombre: string;
  archivo?: string;
  enlace?: string;
  id_asignatura: string;
}

interface MaterialProps {
  cursoId: string;
  asignaturaId: string;
}

export default function Material({ cursoId, asignaturaId }: MaterialProps) {
  const [materiales, setMateriales] = useState<Material[]>([]);
  const [nuevoMaterial, setNuevoMaterial] = useState<Partial<Material>>({ nombre: "" });

  useEffect(() => {
    if (cursoId && asignaturaId) {
      fetchMateriales();
    }
  }, [cursoId, asignaturaId]);

  const fetchMateriales = async () => {
    try {
      const response = await fetch(`/api/docente/material?cursoId=${cursoId}&asignaturaId=${asignaturaId}`);
      const data = await response.json();
      if (data.success) {
        setMateriales(data.data);
      }
    } catch (error) {
      console.error("Error al obtener materiales", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNuevoMaterial({ ...nuevoMaterial, [e.target.name]: e.target.value });
  };

  const agregarMaterial = async () => {
    if (nuevoMaterial.nombre) {
      try {
        const response = await fetch(`/api/docente/material`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...nuevoMaterial,
            id_asignatura: asignaturaId,
          }),
        });
        const data = await response.json();
        if (data.success) {
          fetchMateriales();
          setNuevoMaterial({ nombre: "" });
        }
      } catch (error) {
        console.error("Error al agregar material", error);
      }
    }
  };

  const editarMaterial = async (material: Material) => {
    try {
      const response = await fetch(`/api/docente/material`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...material,
          id_asignatura: asignaturaId,
        }),
      });
      const data = await response.json();
      if (data.success) {
        fetchMateriales();
      }
    } catch (error) {
      console.error("Error al editar material", error);
    }
  };

  const eliminarMaterial = async (id_material: string) => {
    try {
      const response = await fetch(`/api/docente/material?id=${id_material}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.success) {
        fetchMateriales();
      }
    } catch (error) {
      console.error("Error al eliminar material", error);
    }
  };

  return (
    <div>
      <h2>Materiales</h2>
      <ul>
        {materiales.map((material) => (
          <li key={material.id_material}>
            <input
              type="text"
              value={material.nombre}
              onChange={(e) =>
                editarMaterial({ ...material, nombre: e.target.value })
              }
            />
            <button onClick={() => eliminarMaterial(material.id_material)}>
              Eliminar
            </button>
          </li>
        ))}
      </ul>

      <h3>Agregar Nuevo Material</h3>
      <input
        type="text"
        name="nombre"
        value={nuevoMaterial.nombre || ""}
        onChange={handleInputChange}
        placeholder="Nombre del material"
      />
      <button onClick={agregarMaterial}>Agregar</button>
    </div>
  );
}
