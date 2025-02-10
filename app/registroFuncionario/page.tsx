"use client";
import React, { useState } from "react";

const RegistroFuncionario = () => {
  const [userType, setUserType] = useState("");
  const handleUserTypeChange = (type: string) => {
    setUserType(type);
  };
  const [showPasswords, setShowPasswords] = useState({
    login: false,
    register: false,
    confirmRegister: false,
  });

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
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

  // interface UserData {
  //   rut_usuario: string;
  //   rut_tipo: string;
  //   email: string;
  //   clave: string;
  //   nombres: string;
  //   apellidos: string;
  //   tipo_usuario: string;
  //   estado: boolean;
  //   edad?: number;
  //   sexo?: string;
  //   nacionalidad?: string;
  //   talla?: string;
  //   fecha_nacimiento?: string;
  //   direccion?: string;
  //   comuna?: string;
  //   sector?: string;
  //   codigo_temporal?: string;
  // }

  const handleRegister = async (userData: UserData) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });
      const data = await response.json();
      if (data.success) {
        alert("Registro exitoso");
      } else {
        alert("Error en el registro");
      }
    } catch (error) {
      console.error("Error al registrar:", error);
    }
  };
  return (
    <section className="px-2 pt-8 flex flex-col">
      <h1 className="text-center text-3xl text-black">Registro Funcionario</h1>
      <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between">
        <form
          className="space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target as HTMLFormElement);
            const userData = {
              id_usuario: formData.get("id_usuario") as string,
              nombre: formData.get("name") as string,
              email: formData.get("email") as string,
              clave: formData.get("password") as string,
              tipo_usuario: formData.get("userType") as string,
              estado: true,
              rut: formData.get("rut") as string,
              hijos: formData.get("children") as string,
              cursos: formData.get("course") as string,
              asignaturas: formData.get("subject") as string,
            };
            handleRegister(userData);
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="reg-name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Nombres
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
                <label
                  htmlFor="reg-apellido"
                  className="block text-sm font-medium text-gray-700"
                >
                  Apellidos
                </label>
                <input
                  type="text"
                  id="reg-apellido"
                  name="apellido"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#E91E63] focus:border-[#E91E63]"
                />
              </div>
              <div>
                <label
                  htmlFor="reg-email"
                  className="block text-sm font-medium text-gray-700"
                >
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
                <label
                  htmlFor="reg-rut"
                  className="block text-sm font-medium text-gray-700"
                >
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
                <label
                  htmlFor="reg-password"
                  className="block text-sm font-medium text-gray-700"
                >
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
                    onClick={() => togglePasswordVisibility("register")}
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
              <div>
                <label
                  htmlFor="confirm-password"
                  className="block text-sm font-medium text-gray-700"
                >
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
                    onClick={() => togglePasswordVisibility("confirmRegister")}
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
            </div>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="user-type"
                  className="block text-sm font-medium text-gray-700"
                >
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
                </select>
              </div>

              <div
                className={`course-field ${
                  userType === "Estudiante" ? "" : "hidden"
                }`}
              >
                <label
                  htmlFor="course"
                  className="block text-sm font-medium text-gray-700"
                >
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

              <div
                className={`children-field ${
                  userType === "Apoderado" ? "" : "hidden"
                }`}
              >
                <label
                  htmlFor="children"
                  className="block text-sm font-medium text-gray-700"
                >
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

              <div
                className={`subject-field ${
                  userType === "Docente" ? "" : "hidden"
                }`}
              >
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-gray-700"
                >
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
    </section>
  );
};

export default RegistroFuncionario;
