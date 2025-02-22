"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function Header() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    login: false,
    register: false,
    confirmRegister: false,
  });

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const res = await fetch("/api/auth/check-session");
      const data = await res.json();
      setIsAuthenticated(data.authenticated);
    };
    checkAuth();
  }, []);

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleMenuItemClick = () => {
    setShowMenu(false);
  };

  const handleLogin = async (rut_usuario: string, clave: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rut_usuario, clave }),
      });
      const data = await response.json();
      if (data.success) {
        setIsAuthenticated(true);
        setUserSession(data.user);
        localStorage.setItem("userSession", JSON.stringify(data.user));
        setShowLoginModal(false);
        router.push("/");
        toast.success("Sesión iniciada correctamente");
      } else {
        toast.error("Credenciales incorrectas");
      }
    } catch (error) {
      toast.error(`Error: ${error}`);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      // Clear all states
      setIsAuthenticated(false);
      setUserSession(null);
      localStorage.removeItem("userSession");
      // Reset menu state
      setShowMenu(false);
      toast.success("Sesión cerrada correctamente");
      router.push("/");
    } catch (error) {
      console.error("Error during logout:", error);
      toast.error("Error al cerrar sesión");
    }
  };

  const [userSession, setUserSession] = useState<null | {
    tipo_usuario: string;
  }>(null);

  useEffect(() => {
    if (!userSession) {
      setIsAuthenticated(false);
    }
  }, [userSession]);

  useEffect(() => {
    const session = JSON.parse(localStorage.getItem("userSession") || "null");
    setUserSession(session);
  }, []);

  const hasAccess = (rolesPermitidos: string[]) => {
    if (!isAuthenticated || !userSession || !userSession.tipo_usuario) {
      return false;
    }
    return rolesPermitidos.includes(userSession.tipo_usuario);
  };

  return (
    <>
      <header className="border-b shadow-sm">
        <div className="h-1 w-full bg-gradient-to-r from-[#2196F3] to-[#E91E63]"></div>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link className="flex items-center gap-2" href="/">
                <Image
                  src="/LogoSaberes.webp"
                  alt="Logo de Saberes"
                  width={128}
                  height={64}
                  className="max-h-16 w-auto h-auto"
                />
              </Link>
              <nav className="hidden md:flex items-center gap-6">
                <Link
                  href="/"
                  className="text-sm font-medium text-black hover:text-[#2196F3] transition-colors"
                >
                  Inicio
                </Link>
                <Link
                  href="/portalAlumno"
                  className={`text-sm font-medium ${
                    hasAccess(["Estudiante"])
                      ? "text-black hover:text-[#FF7043]"
                      : "text-gray-400 pointer-events-none"
                  } transition-colors`}
                  title={
                    !hasAccess(["Estudiante"])
                      ? "No tienes permiso para acceder a este portal"
                      : ""
                  }
                >
                  Portal Alumnos
                </Link>
                <Link
                  href="/portalDocente"
                  className={`text-sm font-medium ${
                    hasAccess(["Docente", "Administrador"])
                      ? "text-black hover:text-[#4CAF50]"
                      : "text-gray-400 pointer-events-none"
                  } transition-colors`}
                  title={
                    !hasAccess(["Docente", "Administrador"])
                      ? "No tienes permiso para acceder a este portal"
                      : ""
                  }
                >
                  Portal Docente
                </Link>
                <Link
                  href="/portalAdministrador"
                  className={`text-sm font-medium ${
                    hasAccess(["Administrador"])
                      ? "text-black hover:text-[#FFD700]"
                      : "text-gray-400 pointer-events-none"
                  } transition-colors`}
                  title={
                    !hasAccess(["Administrador"])
                      ? "No tienes permiso para acceder a este portal"
                      : ""
                  }
                >
                  Portal Administrador
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex ">
                {isAuthenticated ? (
                  <>
                    <div className="flex flex-row gap-1">
                      <Link
                        href="/perfil"
                        className="rounded-md border border-[#2196F3] text-[#2196F3] hover:bg-[#FFD700]/20 px-2 md:px-2 place-content-center text-sm font-normal transition"
                      >
                        Perfil
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="rounded-md bg-[#E91E63]/85 text-white hover:bg-[#E91E63] px-2 md:px-2 place-content-center text-clip text-sm font-normal transition whitespace-nowrap"
                      >
                        Cerrar Sesión
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex flex-row gap-1">
                      <button
                        onClick={() => setShowLoginModal(true)}
                        className="rounded-md border border-[#2196F3] text-[#2196F3] hover:bg-[#FFD700]/20 px-2 place-content-center text-sm font-normal transition"
                      >
                        Acceder
                      </button>
                      <button
                        onClick={() => setShowRegisterModal(true)}
                        className="rounded-md bg-[#E91E63]/85 text-white hover:bg-[#E91E63] px-2 place-content-center text-sm font-normal transition"
                      >
                        Unirse
                      </button>
                    </div>
                  </>
                )}
              </div>
              <div className="block md:hidden relative z-99999999999999999">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="rounded bg-gray-100 p-2 text-gray-600 transition hover:text-gray-600/75"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="size-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
                {showMenu && (
                  <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-md w-48 z-10">
                    <Link
                      href="/"
                      onClick={handleMenuItemClick}
                      className="block px-4 py-2 text-sm text-black hover:bg-[#2196F3] hover:text-white transition-colors"
                    >
                      Inicio
                    </Link>
                    <Link
                      href="/portalAlumno"
                      onClick={handleMenuItemClick}
                      className={`block px-4 py-2 text-sm ${
                        hasAccess(["Estudiante"])
                          ? "text-black hover:bg-[#FF7043] hover:text-white"
                          : "text-gray-400 pointer-events-none"
                      } transition-colors`}
                      title={
                        !hasAccess(["Estudiante"])
                          ? "No tienes permiso para acceder a este portal"
                          : ""
                      }
                    >
                      Portal Alumnos
                    </Link>
                    <Link
                      href="/portalDocente"
                      onClick={handleMenuItemClick}
                      className={`block px-4 py-2 text-sm ${
                        hasAccess(["Docente", "Administrador"])
                          ? "text-black hover:bg-[#4CAF50] hover:text-white"
                          : "text-gray-400 pointer-events-none"
                      } transition-colors`}
                      title={
                        !hasAccess(["Docente", "Administrador"])
                          ? "No tienes permiso para acceder a este portal"
                          : ""
                      }
                    >
                      Portal Docente
                    </Link>
                    <Link
                      href="/portalAdministrador"
                      onClick={handleMenuItemClick}
                      className={`block px-4 py-2 text-sm ${
                        hasAccess(["Administrador"])
                          ? "text-black hover:bg-[#FFD700] hover:text-white"
                          : "text-gray-400 pointer-events-none"
                      } transition-colors`}
                      title={
                        !hasAccess(["Administrador"])
                          ? "No tienes permiso para acceder a este portal"
                          : ""
                      }
                    >
                      Portal Administrador
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setShowLoginModal(false)}
          />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-white rounded-lg shadow-lg">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-xl font-semibold">Iniciar Sesión</h2>
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="size-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="p-6">
                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.target as HTMLFormElement;
                    const rut_usuario = form.rut_usuario.value;
                    const clave = form.clave.value;
                    handleLogin(rut_usuario, clave);
                  }}
                >
                  <div>
                    <label
                      htmlFor="rut_usuario"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Rut
                    </label>
                    <input
                      type="text"
                      id="rut_usuario"
                      name="rut_usuario"
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#2196F3] focus:border-[#2196F3]"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="clave"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Contraseña
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.login ? "text" : "password"}
                        id="clave"
                        name="clave"
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#2196F3] focus:border-[#2196F3]"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility("login")}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="size-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <a
                      href="#"
                      className="text-sm text-[#2196F3] hover:text-[#1976D2]"
                    >
                      ¿Olvidaste tu contraseña?
                    </a>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 bg-[#2196F3] text-white rounded-md hover:bg-[#1976D2] transition-colors"
                  >
                    Acceder
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Register Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setShowRegisterModal(false)}
          />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-white rounded-lg shadow-lg">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-xl font-semibold text-center w-full">
                  Unirse al programa
                </h2>
                <button
                  onClick={() => setShowRegisterModal(false)}
                  className="p-1 hover:bg-gray-100 rounded-full text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="size-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="p-6">
                <p className="text-sm text-gray-600 mb-6">
                  Para unirte a Saberes, debes registrarte en el sistema.
                  <br />
                  Completa uno de los siguientes formularios según sea tu caso:
                </p>
                <div className="space-y-4">
                  <Link
                    href="/registroFuncionario"
                    onClick={() => setShowRegisterModal(false)}
                    className="block w-full px-4 py-2.5 text-center text-sm font-medium text-[#2196F3] border border-[#2196F3] rounded-md hover:bg-[#2196F3]/10 transition-colors"
                  >
                    Registrarse como Funcionario
                  </Link>
                  <Link
                    href="/matriculaEstudiante"
                    onClick={() => setShowRegisterModal(false)}
                    className="block w-full px-4 py-2.5 text-center text-sm font-medium text-[#E91E63] border border-[#E91E63] rounded-md hover:bg-[#E91E63]/10 transition-colors"
                  >
                    Matricularse como Estudiante
                  </Link>
                </div>
                <p className="text-xs text-gray-500 mt-6">
                  Tras completar el formulario, un administrador evaluará tu
                  solicitud y recibirás un correo con la resolución.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// https://www.youtube.com/watch?v=ANQfJrKIPGU

// https://www.nodemailer.com/

// https://react.email/docs/introduction
// https://demo.react.email/preview/magic-links/plaid-verify-identity
