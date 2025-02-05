// "use client";

// import { useState, useEffect } from "react";

// interface MaterialProps {
//   cursoId: string;
//   asignaturaId: string;
// }

// interface Material {
//   id_material: string;
//   nombre: string;
//   archivo?: string;
//   enlace?: string;
// }

// const Material = ({ cursoId, asignaturaId }: MaterialProps) => {
//   const [materiales, setMateriales] = useState<Material[]>([]);
//   const [nuevoMaterial, setNuevoMaterial] = useState<string>("");

//   // Obtener materiales de la API
//   useEffect(() => {
//     const fetchMateriales = async () => {
//       const response = await fetch(
//         `/api/docente/material?cursoId=${cursoId}&asignaturaId=${asignaturaId}`
//       );
//       const data = await response.json();
//       setMateriales(Array.isArray(data) ? data : []);
//     };

//     fetchMateriales();
//   }, [cursoId, asignaturaId]);

//   // Agregar un nuevo material
//   const agregarMaterial = async () => {
//     const response = await fetch("/api/docente/material", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         nombre: nuevoMaterial,
//         cursoId,
//         asignaturaId,
//       }),
//     });

//     if (response.ok) {
//       const nuevoMaterialData = await response.json();
//       setMateriales([...materiales, nuevoMaterialData]);
//       setNuevoMaterial("");
//     }
//   };

//   // Eliminar un material
//   const eliminarMaterial = async (id_material: string) => {
//     const response = await fetch(`/api/docente/material?id=${id_material}`, {
//       method: "DELETE",
//     });

//     if (response.ok) {
//       setMateriales(materiales.filter((material) => material.id_material !== id_material));
//     }
//   };

//   return (
//     <div>
//       <h3 className="text-lg font-semibold mb-4">Materiales</h3>

//       {/* Formulario para agregar material */}
//       <div className="mb-4">
//         <input
//           type="text"
//           value={nuevoMaterial}
//           onChange={(e) => setNuevoMaterial(e.target.value)}
//           placeholder="Nombre del material"
//           className="border p-2 mr-2"
//         />
//         <button onClick={agregarMaterial} className="bg-blue-500 text-white p-2">
//           Agregar
//         </button>
//       </div>

//       {/* Lista de materiales */}
//       <ul>
//         {materiales.map((material) => (
//           <li key={material.id_material} className="flex justify-between items-center mb-2">
//             <span>{material.nombre}</span>
//             <button
//               onClick={() => eliminarMaterial(material.id_material)}
//               className="bg-red-500 text-white p-1"
//             >
//               Eliminar
//             </button>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default Material;


























"use client";

import { useState, useEffect } from "react";

interface MaterialProps {
  cursoId: string;
  asignaturaId: string;
}

interface Material {
  id_material: string;
  nombre: string;
  archivo?: string;
  enlace?: string;
}

const Material = ({ cursoId, asignaturaId }: MaterialProps) => {
  const [materiales, setMateriales] = useState<Material[]>([]);
  const [nuevoMaterial, setNuevoMaterial] = useState<string>("");

  // Obtener materiales de la API
  useEffect(() => {
    const fetchMateriales = async () => {
      const response = await fetch(
        `/api/docente/material?cursoId=${cursoId}&asignaturaId=${asignaturaId}`
      );
      const { data } = await response.json();
      setMateriales(Array.isArray(data) ? data : []);
    };

    fetchMateriales();
  }, [cursoId, asignaturaId]);

  // Agregar un nuevo material
  const agregarMaterial = async () => {
    const response = await fetch("/api/docente/material", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nombre: nuevoMaterial,
        id_asignatura: asignaturaId,
      }),
    });

    if (response.ok) {
      const nuevoMaterialData = await response.json();
      setMateriales([...materiales, nuevoMaterialData]);
      setNuevoMaterial("");
    }
  };

  // Eliminar un material
  const eliminarMaterial = async (id_material: string) => {
    const response = await fetch(`/api/docente/material?id=${id_material}`, {
      method: "DELETE",
    });

    if (response.ok) {
      setMateriales(materiales.filter((material) => material.id_material !== id_material));
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Materiales</h3>

      {/* Formulario para agregar material */}
      <div className="mb-4">
        <input
          type="text"
          value={nuevoMaterial}
          onChange={(e) => setNuevoMaterial(e.target.value)}
          placeholder="Nombre del material"
          className="border p-2 mr-2"
        />
        <button onClick={agregarMaterial} className="bg-blue-500 text-white p-2">
          Agregar
        </button>
      </div>

      {/* Lista de materiales */}
      <ul>
        {materiales.map((material) => (
          <li key={material.id_material} className="flex justify-between items-center mb-2">
            <span>{material.nombre}</span>
            <button
              onClick={() => eliminarMaterial(material.id_material)}
              className="bg-red-500 text-white p-1"
            >
              Eliminar
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Material;