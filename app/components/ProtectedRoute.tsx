"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const router = useRouter();
  interface UserSession {
    tipo_usuario: string;
    // Add other properties if needed
  }

  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Obtener la sesión desde localStorage
    const storedSession = localStorage.getItem("userSession");

    if (storedSession) {
      try {
        const parsedSession = JSON.parse(storedSession);
        setUserSession(parsedSession);
      } catch (error) {
        console.error("Error al parsear userSession:", error);
        localStorage.removeItem("userSession"); // Eliminar sesión corrupta
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      if (!userSession || !allowedRoles.includes(userSession?.tipo_usuario)) {
        console.warn("Acceso denegado. Redirigiendo a /");
        router.replace("/");
      }
    }
  }, [isLoading, userSession, allowedRoles, router]);

  if (isLoading) {
    return <div></div>;
  }

  return <>{children}</>;
}










// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";

// interface ProtectedRouteProps {
//   children: React.ReactNode;
//   allowedRoles: string[];
// }

// export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
//   const router = useRouter();
//   interface UserSession {
//     tipo_usuario: string;
//     // Add other properties if needed
//   }

//   const [userSession, setUserSession] = useState<UserSession | null>(null);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     // Obtener la sesión desde localStorage de manera segura
//     const storedSession = localStorage.getItem("userSession");
//     if (storedSession) {
//       setUserSession(JSON.parse(storedSession));
//     }
//     setIsLoading(false);
//   }, []);

//   useEffect(() => {
//     if (!isLoading && (!userSession || !allowedRoles.includes(userSession.tipo_usuario))) {
//       router.replace("/");
//     }
//   }, [isLoading, userSession, allowedRoles, router]);

//   if (isLoading) {
//     return <div>Loading...</div>;
//   }

//   return <>{children}</>;
// }
