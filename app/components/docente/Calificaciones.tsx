// "use client";

// import { useState, useEffect } from "react";

// interface CalificacionesProps {
//   cursoId: string;
//   asignaturaId: string;
// }

// interface Estudiante {
//   email: string;
//   nombre: string;
//   calificaciones: number[];
// }

// const Calificaciones = ({ cursoId, asignaturaId }: CalificacionesProps) => {
//   const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);

//   // Obtener estudiantes del curso
//   useEffect(() => {
//     const fetchEstudiantes = async () => {
//       const response = await fetch(`/api/docente/calificaciones?cursoId=${cursoId}`);
//       const { data } = await response.json();
//       if (Array.isArray(data)) {
//         setEstudiantes(data);
//       } else {
//         setEstudiantes([]);
//         console.error("Fetched data is not an array:", data);
//       }
//     };

//     fetchEstudiantes();
//   }, [cursoId]);

//   // Agregar calificación a un estudiante
//   const agregarCalificacion = async (email: string, calificacion: number) => {
//     const response = await fetch("/api/docente/calificaciones", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         email,
//         asignaturaId,
//         calificacion,
//       }),
//     });

//     if (response.ok) {
//       const estudianteActualizado = await response.json();
//       setEstudiantes(
//         estudiantes.map((est) =>
//           est.email === email
//             ? { ...est, calificaciones: [...est.calificaciones, calificacion] }
//             : est
//         )
//       );
//     }
//   };

//   return (
//     <div>
//       <h3 className="text-lg font-semibold mb-4">Calificaciones</h3>

//       {/* Lista de estudiantes y calificaciones */}
//       <ul>
//         {estudiantes.map((estudiante) => (
//           <li key={estudiante.email} className="mb-4">
//             <h4 className="font-semibold">{estudiante.nombre}</h4>
//             <ul>
//               {estudiante.calificaciones.map((calificacion, index) => (
//                 <li key={index}>{calificacion}</li>
//               ))}
//             </ul>
//             <button
//               onClick={() => agregarCalificacion(estudiante.email, 7.0)} // Ejemplo: agregar calificación 7.0
//               className="bg-green-500 text-white p-1"
//             >
//               Agregar Calificación
//             </button>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default Calificaciones;






























"use client";

import { useState, useEffect } from "react";

interface CalificacionesProps {
  cursoId: string;
  asignaturaId: string;
}

interface Estudiante {
  email: string;
  nombre: string;
  calificaciones: Array<{ prueba: string; fecha: string; nota: number }>;
}

const Calificaciones: React.FC<CalificacionesProps> = ({ cursoId, asignaturaId }) => {
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCalificaciones = async () => {
      try {
        const response = await fetch(`/api/calificaciones?cursoId=${cursoId}&asignaturaId=${asignaturaId}`);
        if (!response.ok) {
          throw new Error("Error al obtener las calificaciones");
        }
        const data = await response.json();
        setEstudiantes(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCalificaciones();
  }, [cursoId, asignaturaId]);

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Calificaciones</h1>
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Prueba</th>
            <th>Fecha</th>
            <th>Nota</th>
          </tr>
        </thead>
        <tbody>
          {estudiantes.map((estudiante, index) => (
            <tr key={index}>
              <td>{estudiante.nombre}</td>
              <td>{estudiante.email}</td>
              <td>
                {estudiante.calificaciones.map((calificacion, idx) => (
                  <div key={idx}>
                    <span>{calificacion.prueba}</span>
                    <span>{calificacion.fecha}</span>
                    <span>{calificacion.nota}</span>
                  </div>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Calificaciones;