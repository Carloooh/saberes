// "use client";
// import React, { useEffect, useState } from "react";
// import ProtectedRoute from "@/app/components/ProtectedRoute";

// interface UserSession {
//   rut_usuario: string,
//   tipo_usuario: string,

// }

// interface UserProfile {
//   nombre: string;
//   email: string;
// }

// const Perfil: React.FC = () => {
//   const [userSession, setUserSession] = useState<UserSession | null>(null);
//   const [userData, setUserData] = useState<UserProfile | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const storedSession = localStorage.getItem("userSession");
//     if (storedSession) {
//       try {
//         const parsedSession = JSON.parse(storedSession);
//         setUserSession(parsedSession);
//       } catch (error) {
//         console.error("Error al parsear userSession:", error);
//         localStorage.removeItem("userSession");
//       }
//     }
//   }, []);

//   useEffect(() => {
//     if (userSession) {
//       const fetchUserProfile = async () => {
//         try {
//           const response = await fetch("/api/perfil", {
//             method: "GET",
//           });

//           if (!response.ok) {
//             throw new Error("Error al obtener el perfil del usuario");
//           }

//           const data = await response.json();
//           if (data.success) {
//             setUserData(data.data);
//           } else {
//             console.error(data.error);
//           }
//         } catch (error) {
//           console.error("Error al cargar el perfil:", error);
//         } finally {
//           setLoading(false);
//         }
//       };

//       fetchUserProfile();
//     }
//   }, [userSession]);

//   if (loading) {
//     return <div>Cargando...</div>;
//   }

//   return (
//     <ProtectedRoute allowedRoles={["Estudiante", "Docente", "Administrador"]}>
//       <div className="min-h-screen w-full container mx-auto px-4 py-8">
//         <h1>Perfil</h1>
//         {userData ? (
//           <div>
//             <p>Nombre: {userData.nombre}</p>
//             <p>Email: {userData.email}</p>
//           </div>
//         ) : (
//           <p>No se pudo cargar el perfil del usuario.</p>
//         )}
//       </div>
//     </ProtectedRoute>
//   );
// };

// export default Perfil;

"use client";
import React, { useEffect, useState } from "react";

interface UserSession {
  rut_usuario: string;
  tipo_usuario: string;
}

interface UserProfile {
  nombres: string;
  email: string;
  matricula?: any;
  apoderado?: any;
  infoMedica?: any;
  archivos?: any[];
  cursos?: any[];
  asignaturas?: any[];
}

const Perfil: React.FC = () => {
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedSession = localStorage.getItem("userSession");
    if (storedSession) {
      try {
        const parsedSession = JSON.parse(storedSession);
        setUserSession(parsedSession);
      } catch (error) {
        console.error("Error al parsear userSession:", error);
        localStorage.removeItem("userSession");
      }
    }
  }, []);

  useEffect(() => {
    if (userSession) {
      const fetchUserProfile = async () => {
        try {
          const response = await fetch("/api/perfil", {
            method: "GET",
          });

          if (!response.ok) {
            throw new Error("Error al obtener el perfil del usuario");
          }

          const data = await response.json();
          if (data.success) {
            setUserData(data.data);
          } else {
            console.error(data.error);
          }
        } catch (error) {
          console.error("Error al cargar el perfil:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchUserProfile();
    }
  }, [userSession]);

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <div>
      <h1>Perfil</h1>
      {userData ? (
        <>
          <p>Nombre: {userData.nombres}</p>
          <p>Email: {userData.email}</p>

          {userSession?.tipo_usuario === "Estudiante" && (
            <>
              <h2>Matrícula</h2>
              <pre>{JSON.stringify(userData.matricula, null, 2)}</pre>

              <h2>Apoderado</h2>
              <pre>{JSON.stringify(userData.apoderado, null, 2)}</pre>

              <h2>Información Médica</h2>
              <pre>{JSON.stringify(userData.infoMedica, null, 2)}</pre>

              <h2>Documentos</h2>
              <ul>
                {userData.archivos?.map((archivo: any, index: number) => (
                  <li key={index}>{archivo.titulo}</li>
                ))}
              </ul>
            </>
          )}

          {(userSession?.tipo_usuario === "Docente" ||
            userSession?.tipo_usuario === "Administrador") && (
            <>
              <h2>Cursos Asignados</h2>
              <ul>
                {userData.cursos?.map((curso: any, index: number) => (
                  <li key={index}>{curso.nombre_curso}</li>
                ))}
              </ul>

              <h2>Asignaturas Asignadas</h2>
              <ul>
                {userData.asignaturas?.map((asignatura: any, index: number) => (
                  <li key={index}>{asignatura.nombre_asignatura}</li>
                ))}
              </ul>
            </>
          )}
        </>
      ) : (
        <p>No se pudo cargar el perfil del usuario.</p>
      )}
    </div>
  );
};

export default Perfil;
