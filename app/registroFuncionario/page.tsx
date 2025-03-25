"use client";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";

interface CursoConAsignaturas {
  id_curso: string;
  nombre_curso: string;
  asignaturas: {
    id_asignatura: string;
    nombre_asignatura: string;
  }[];
}

const RegistroFuncionario = () => {
  const [userType, setUserType] = useState("");
  const [cursos, setCursos] = useState<CursoConAsignaturas[]>([]);
  const [selectedCursos, setSelectedCursos] = useState<
    Record<string, string[]>
  >({});
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

  const [passwordError, setPasswordError] = useState("");

  // Add password validation function
  const validatePasswords = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const formElement = e.target.form as HTMLFormElement;
    const password = formElement?.clave.value;
    const confirmPassword = formElement?.clave2.value;

    if (name === "clave" || name === "clave2") {
      if (password && confirmPassword && password !== confirmPassword) {
        setPasswordError("Las contraseñas no coinciden");
      } else if (value.length < 8) {
        setPasswordError("La contraseña debe tener al menos 8 caracteres");
      } else {
        setPasswordError("");
      }
    }
  };

  const [emailError, setEmailError] = useState("");

  const validateEmails = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const formElement = e.target.form as HTMLFormElement;
    const email = formElement?.email.value;
    const confirmEmail = formElement?.email2.value;

    if (name === "email" || name === "email2") {
      if (email && confirmEmail) {
        if (email !== confirmEmail) {
          setEmailError("Los emails no coinciden");
        } else {
          setEmailError("");
        }
      }
    }
  };

  const Fn = {
    validaRut: (rutCompleto: string) => {
      rutCompleto = rutCompleto.replace(/\./g, "");
      if (!/^[0-9]+-[0-9kK]{1}$/.test(rutCompleto)) return false;
      const tmp = rutCompleto.split("-");
      const digv = tmp[1].toLowerCase();
      const rut = parseInt(tmp[0]);
      return Fn.dv(rut) === digv;
    },
    dv: (T: number): string => {
      let M = 0,
        S = 1;
      for (; T; T = Math.floor(T / 10)) {
        S = (S + (T % 10) * (9 - (M++ % 6))) % 11;
      }
      return S ? (S - 1).toString() : "k";
    },
  };
  const [rutError, setRutError] = useState("");
  const handleRutFormat = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^\dkK]/g, ""); // Allow digits and 'k'/'K'

    // Extract the verification digit if present
    let verificationDigit = "";
    if (value.length > 0 && /[kK\d]$/.test(value)) {
      verificationDigit = value.slice(-1);
      // Convert lowercase 'k' to uppercase 'K'
      if (verificationDigit === "k") {
        verificationDigit = "K";
      }
      value = value.slice(0, -1);
    }

    // Format only the numeric part - without dots
    const numericPart = value.replace(/\D/g, "");

    // Add back the verification digit with a hyphen
    if (verificationDigit) {
      e.target.value = `${numericPart}-${verificationDigit}`;
    } else {
      e.target.value = numericPart;
    }

    // Validate the RUT if it has a verification digit
    if (e.target.value.includes("-")) {
      if (!Fn.validaRut(e.target.value)) {
        setRutError("RUT inválido");
      } else {
        setRutError("");
      }
    }
  };

  // Cargar cursos con sus asignaturas
  useEffect(() => {
    fetch("/api/cursos-con-asignaturas")
      .then((res) => res.json())
      .then((data) => setCursos(data));
  }, []);

  // Manejar selección de curso y asignaturas
  const handleCursoChange = (cursoId: string) => {
    setSelectedCursos((prev) => {
      if (prev[cursoId]) {
        const { [cursoId]: _, ...rest } = prev;
        return rest;
      } else {
        return { ...prev, [cursoId]: [] };
      }
    });
  };

  const handleAsignaturaChange = (cursoId: string, asignaturaId: string) => {
    setSelectedCursos((prev) => {
      const asignaturas = prev[cursoId] || [];
      return {
        ...prev,
        [cursoId]: asignaturas.includes(asignaturaId)
          ? asignaturas.filter((id) => id !== asignaturaId)
          : [...asignaturas, asignaturaId],
      };
    });
  };

  const resetForm = (formElement: HTMLFormElement) => {
    formElement.reset();
    setUserType("");
    setSelectedCursos({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formElement = e.target as HTMLFormElement;
    const formData = new FormData(e.target as HTMLFormElement);
    const rut = formData.get("rut") as string;

    if (formData.get("clave") !== formData.get("clave2")) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    if (formData.get("email") !== formData.get("email2")) {
      toast.error("Los emails no coinciden");
      return;
    }

    if (!Fn.validaRut(rut)) {
      toast.error("RUT inválido");
      return;
    }

    const payload = {
      rut_usuario: formData.get("rut") as string,
      tipo_usuario: userType,
      email: formData.get("email") as string,
      clave: formData.get("clave") as string,
      nombres: formData.get("name") as string,
      apellidos: formData.get("apellido") as string,
      cursosAsignaturas: Object.entries(selectedCursos).map(
        ([cursoId, asignaturas]) => ({
          cursoId,
          asignaturas,
        })
      ),
    };

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      toast.success("Registro exitoso");
      resetForm(formElement);
    } else {
      toast.error("Error en el registro");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <form
        onSubmit={handleSubmit}
        className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg"
      >
        <h1 className="text-2xl font-bold mb-6 text-center w-full">
          Registro de Funcionario
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nombres
            </label>
            <input
              type="text"
              name="name"
              required
              minLength={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#E91E63] focus:border-[#E91E63]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Apellidos
            </label>
            <input
              type="text"
              name="apellido"
              required
              minLength={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#E91E63] focus:border-[#E91E63]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              required
              onChange={validateEmails}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#E91E63] focus:border-[#E91E63]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Confirmación Email
            </label>
            <input
              type="email"
              name="email2"
              required
              onChange={validateEmails}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#E91E63] focus:border-[#E91E63]"
            />
            {emailError && (
              <p className="mt-1 text-sm text-red-600">{emailError}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPasswords.login ? "text" : "password"}
                name="clave"
                required
                min={8}
                onChange={validatePasswords}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#E91E63] focus:border-[#E91E63]"
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
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Confirmación Contraseña
            </label>
            <div className="relative">
              <input
                type={showPasswords.login ? "text" : "password"}
                name="clave2"
                required
                min={8}
                onChange={validatePasswords}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#E91E63] focus:border-[#E91E63]"
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
            {passwordError && (
              <p className="mt-1 text-sm text-red-600">{passwordError}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              RUT
            </label>
            <input
              type="text"
              name="rut"
              required
              maxLength={11}
              placeholder="12345678-9"
              onChange={handleRutFormat}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#E91E63] focus:border-[#E91E63]"
            />
            {rutError && (
              <p className="mt-1 text-sm text-red-600">{rutError}</p>
            )}
          </div>
        </div>

        {/* Selector de Tipo de Usuario */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700">
            Tipo de Usuario
          </label>
          {/* Selector de Tipo de Usuario */}
          <select onChange={(e) => setUserType(e.target.value)} required>
            <option value="">Seleccionar...</option>
            <option value="Administrador">Administrador</option>
            <option value="Docente">Docente</option>
          </select>

          {/* Selector de Cursos y Asignaturas (solo Docente) */}
          {userType === "Docente" && (
            <div className="space-y-6 pt-8">
              <span>
                Seleccione los cursos y asignaturas en las que trabajará:
              </span>
              {cursos.map((curso) => (
                <div key={curso.id_curso} className="border p-4 rounded-lg">
                  <label className="flex items-center gap-2 mb-4">
                    <input
                      type="checkbox"
                      checked={!!selectedCursos[curso.id_curso]}
                      onChange={() => handleCursoChange(curso.id_curso)}
                    />
                    <span className="font-medium">{curso.nombre_curso}</span>
                  </label>

                  {selectedCursos[curso.id_curso] && (
                    <div className="grid grid-cols-2 gap-4 ml-6">
                      {curso.asignaturas.map((asignatura) => (
                        <label
                          key={asignatura.id_asignatura}
                          className="flex items-center gap-2"
                        >
                          <input
                            type="checkbox"
                            checked={selectedCursos[curso.id_curso]?.includes(
                              asignatura.id_asignatura
                            )}
                            onChange={() =>
                              handleAsignaturaChange(
                                curso.id_curso,
                                asignatura.id_asignatura
                              )
                            }
                          />
                          {asignatura.nombre_asignatura}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6">
          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-[#E91E63] text-white rounded-md hover:bg-[#C2185B] transition-colors"
          >
            Registrarse
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegistroFuncionario;
