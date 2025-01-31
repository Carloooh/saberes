"use client"

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Header() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    login: false,
    register: false,
    confirmRegister: false
  });
  const [userType, setUserType] = useState('');
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
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleMenuItemClick = () => {
    setShowMenu(false);
  };

  const handleUserTypeChange = (type: string) => {
    setUserType(type);
  };

  const handleLogin = async (email: string, clave: string) => {
    console.log(clave)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, clave }),
      });
      const data = await response.json();
      if (data.success) {
        localStorage.setItem('userSession', JSON.stringify(data.user));
        setIsAuthenticated(true);
        setShowLoginModal(false);
        router.push('/');
      } else {
        alert('Credenciales incorrectas');
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
    }
  };

  interface UserData {
    id_usuario: string;
    nombre: string;
    email: string;
    clave: string;
    tipo_usuario: string;
    estado: boolean;
    rut: string;
    hijos?: string;
    cursos?: string;
    asignaturas?: string;
  }

  const handleRegister = async (userData: UserData) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      const data = await response.json();
      if (data.success) {
        alert('Registro exitoso');
        setShowRegisterModal(false);
      } else {
        alert('Error en el registro');
      }
    } catch (error) {
      console.error('Error al registrar:', error);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setIsAuthenticated(false);
    router.push("/");
  };

  const [userSession, setUserSession] = useState<null | { tipo_usuario: string }>(null);

  useEffect(() => {
    const session = JSON.parse(localStorage.getItem("userSession") || "null");
    setUserSession(session);
  }, []);

  const hasAccess = (rolesPermitidos: string[]) => {
    return userSession && rolesPermitidos.includes(userSession.tipo_usuario);
  };

  return (
    <>
      <header className="border-b bg-white shadow-sm">
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
                  className="max-h-16 w-auto"
                />
              </Link>
              <nav className="hidden md:flex items-center gap-6">
                <Link href="/" className="text-sm font-medium text-black hover:text-[#2196F3] transition-colors">
                  Inicio
                </Link>
                <Link href="/portalAlumno" className="text-sm font-medium text-black hover:text-[#FF7043] transition-colors " title={userSession ? (hasAccess(["Docente", "Profesor", "Administrador"]) ? "" : "No tienes permiso") : "Debes iniciar sesión"}>
                  Portal Alumnos
                </Link>
                <Link href="/portalDocente" className="text-sm font-medium text-black hover:text-[#4CAF50] transition-colors">
                  Portal Docente
                </Link>
                <Link href="/portalAdministrador" className="text-sm font-medium text-black hover:text-[#FFD700] transition-colors">
                  Portal Administrador
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex ">
                {isAuthenticated ? (
                  <>
                    <div className="flex flex-row gap-1">
                    <Link href="/perfil" className="rounded-md border border-[#2196F3] text-[#2196F3] hover:bg-[#FFD700]/20 px-2 md:px-2 place-content-center text-sm font-normal transition">
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
                        Registrarse
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
                  <svg xmlns="http://www.w3.org/2000/svg" className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                {showMenu && (
                  <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-md w-48 z-10">
                    <Link href="/" onClick={handleMenuItemClick} className="block px-4 py-2 text-sm text-black hover:bg-[#2196F3] hover:text-white transition-colors">
                      Inicio
                    </Link>
                    <Link href="/portalAlumno" onClick={handleMenuItemClick} className="block px-4 py-2 text-sm text-black hover:bg-[#FF7043] hover:text-white transition-colors">
                      Portal Alumnos y Apoderados
                    </Link>
                    <Link href="/portalDocente" onClick={handleMenuItemClick} className="block px-4 py-2 text-sm text-black hover:bg-[#4CAF50] hover:text-white transition-colors">
                      Portal Docente
                    </Link>
                    <Link href="/portalAdministrador" onClick={handleMenuItemClick} className="block px-4 py-2 text-sm text-black hover:bg-[#FFD700] hover:text-white transition-colors">
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
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowLoginModal(false)} />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-white rounded-lg shadow-lg">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-xl font-semibold">Iniciar Sesión</h2>
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6">
                <form className="space-y-4" onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const email = form.email.value;
                  const clave = form.clave.value;
                  handleLogin(email, clave);
                }}>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#2196F3] focus:border-[#2196F3]"
                    />
                  </div>
                  <div>
                    <label htmlFor="clave" className="block text-sm font-medium text-gray-700">
                      Contraseña
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.login ? "text" : "clave"}
                        id="clave"
                        name="clave"
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#2196F3] focus:border-[#2196F3]"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('login')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <a href="#" className="text-sm text-[#2196F3] hover:text-[#1976D2]">
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
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowRegisterModal(false)} />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <div className="relative w-full max-w-4xl bg-white rounded-lg shadow-lg">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-xl font-semibold">Registro</h2>
                <button
                  onClick={() => setShowRegisterModal(false)}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6 max-h-[80vh] overflow-y-auto">
                <form className="space-y-6" onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target as HTMLFormElement);
                  const userData = {
                    id_usuario: formData.get('id_usuario') as string,
                    nombre: formData.get('name') as string,
                    email: formData.get('email') as string,
                    clave: formData.get('password') as string,
                    tipo_usuario: formData.get('userType') as string,
                    estado: true,
                    rut: formData.get('rut') as string,
                    hijos: formData.get('children') as string,
                    cursos: formData.get('course') as string,
                    asignaturas: formData.get('subject') as string,
                  };
                  handleRegister(userData);
                }}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="reg-name" className="block text-sm font-medium text-gray-700">
                          Nombre Completo
                        </label>
                        <input
                          type="text"
                          id="reg-name"
                          name="name"
                          required
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#E91E63] focus:border-[#E91E63]"
                        />
                      </div>
                      <div>
                        <label htmlFor="reg-email" className="block text-sm font-medium text-gray-700">
                          Email
                        </label>
                        <input
                          type="email"
                          id="reg-email"
                          name="email"
                          required
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#E91E63] focus:border-[#E91E63]"
                        />
                      </div>
                      <div>
                        <label htmlFor="reg-rut" className="block text-sm font-medium text-gray-700">
                          RUT
                        </label>
                        <input
                          type="text"
                          id="reg-rut"
                          name="rut"
                          required
                          placeholder="12.345.678-9"
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#E91E63] focus:border-[#E91E63]"
                        />
                      </div>
                      <div>
                        <label htmlFor="reg-password" className="block text-sm font-medium text-gray-700">
                          Contraseña
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords.register ? "text" : "password"}
                            id="reg-password"
                            name="password"
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#E91E63] focus:border-[#E91E63]"
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility('register')}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <div>
                        <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                          Confirmar Contraseña
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords.confirmRegister ? "text" : "password"}
                            id="confirm-password"
                            name="confirmPassword"
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#E91E63] focus:border-[#E91E63]"
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility('confirmRegister')}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="user-type" className="block text-sm font-medium text-gray-700">
                          Tipo de Usuario
                        </label>
                        <select
                          id="user-type"
                          name="userType"
                          required
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#E91E63] focus:border-[#E91E63]"
                          onChange={(e) => handleUserTypeChange(e.target.value)}
                        >
                          <option value="">Seleccionar...</option>
                          <option value="Administrador">Administrador</option>
                          <option value="Docente">Docente</option>
                          <option value="Profesor">Profesor</option>
                          <option value="Estudiante">Estudiante</option>
                          <option value="Apoderado">Apoderado</option>
                        </select>
                      </div>
                      <div className={`course-field ${userType === 'Estudiante' ? '' : 'hidden'}`}>
                        <label htmlFor="course" className="block text-sm font-medium text-gray-700">
                          Curso
                        </label>
                        <select
                          id="course"
                          name="course"
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#E91E63] focus:border-[#E91E63]"
                        >
                          <option value="">Seleccionar...</option>
                          <option value="1">Primero Básico</option>
                          <option value="2">Segundo Básico</option>
                          <option value="3">Tercero Básico</option>
                          <option value="4">Cuarto Básico</option>
                          <option value="5">Quinto Básico</option>
                          <option value="6">Sexto Básico</option>
                          <option value="7">Séptimo Básico</option>
                          <option value="8">Octavo Básico</option>
                        </select>
                      </div>
                      <div className={`children-field ${userType === 'Apoderado' ? '' : 'hidden'}`}>
                        <label htmlFor="children" className="block text-sm font-medium text-gray-700">
                          Hijos (opcional)
                        </label>
                        <textarea
                          id="children"
                          name="children"
                          rows={3}
                          placeholder="Nombre de los hijos"
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#E91E63] focus:border-[#E91E63]"
                        />
                      </div>
                      <div className={`subject-field ${userType === 'Profesor' || userType === 'Docente' ? '' : 'hidden'}`}>
                        <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                          Asignatura (opcional)
                        </label>
                        <input
                          type="text"
                          id="subject"
                          name="subject"
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#E91E63] focus:border-[#E91E63]"
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 bg-[#E91E63] text-white rounded-md hover:bg-[#C2185B] transition-colors"
                  >
                    Registrarse
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}