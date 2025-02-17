"use client";
import React, { useEffect, useState } from "react";

interface Curso {
  id_curso: string;
  nombre_curso: string;
}

const MatriculaEstudiante = () => {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  useEffect(() => {
    async function fetchCursos() {
      try {
        const response = await fetch("/api/cursos");
        if (!response.ok) {
          throw new Error("Error al cargar los cursos");
        }
        const data = await response.json();
        setCursos(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    fetchCursos();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    const response = await fetch("/api/auth/register/matricula", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      alert("Registro exitoso");
    } else {
      alert("Error en el registro");
    }
  };
  return (
    <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between">
      <div className="flex flex-col w-full">
        <h1 className="text-3xl font-bold text-center mb-4">
          Formulario de matrícula
        </h1>
        <p className="text-center mb-4">
          Para matricularte necesitarás los siguientes documentos en formato
          digital (PDF, Word, Imagen):
        </p>
        <ul className="list-disc list-inside space-y-2 text-sm ml-4">
          <li>Certificado de nacimiento (para todo trámite)</li>
          <li>Certificado de último año cursado y aprobado por el Mineduc</li>
          <li>Registro Social de Hogares (comuna El Quisco)</li>
          <li>Fotocopia de carnet del adulto responsable (por ambos lados)</li>
          <li>
            Certificado de diagnóstico en caso de que el alumno presente una
            necesidad educativa especial
          </li>
        </ul>
        <div className="pt-2">
          <span className="text-red-500 text-sm">
            {" "}
            Los campos marcados con * son obligatorios
          </span>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col space-y-5 pt-2"
            encType="multipart/form-data"
          >
            <fieldset className="border border-solid border-gray-300 p-3">
              <legend className="text-sm text-gray-700">
                Información personal
              </legend>
              <div className="space-y-4 mt-3">
                <div>
                  <label
                    htmlFor="rut_usuario"
                    className="block text-sm font-medium text-gray-700"
                  >
                    RUT <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="rut_usuario"
                    name="rut_usuario"
                    placeholder="Ejemplo: 12345678-9"
                    className="mt-1 block px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="rut_tipo"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Tipo de RUT <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="rut_tipo"
                    name="rut_tipo"
                    className="mt-1 block px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  >
                    <option value="">Seleccione una opción</option>
                    <option value="RUT">RUT</option>
                    <option value="RUT_EXTRANJERO">RUT Extranjero</option>
                    <option value="PASAPORTE">Pasaporte</option>
                    <option value="OTRO">Otro</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="nombres"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Nombres <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="nombres"
                    name="nombres"
                    placeholder="Ejemplo: Agustina Pascal"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="apellidos"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Apellidos <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="apellidos"
                    name="apellidos"
                    placeholder="Ejemplo: González Acevedo"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="fecha_nacimiento"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Fecha de nacimiento <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="fecha_nacimiento"
                    name="fecha_nacimiento"
                    className="mt-1 block px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    max={new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="sexo"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Sexo <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="sexo"
                    name="sexo"
                    className="mt-1 block px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  >
                    <option value="">Seleccione una opción</option>
                    <option value="Mujer">Mujer</option>
                    <option value="Hombre">Hombre</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="nacionalidad"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Nacionalidad <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="nacionalidad"
                    name="nacionalidad"
                    placeholder="Ejemplo: Chileno/a, Colombiano/a"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="talla"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Talla (opcional)
                  </label>
                  <input
                    type="text"
                    id="talla"
                    name="talla"
                    placeholder="Ejemplo: S, M, L, 12, etc..."
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="direccion"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Dirección <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="direccion"
                    name="direccion"
                    placeholder="Ejemplo: Avenida España Sin Número"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="comuna"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Comuna <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="comuna"
                    name="comuna"
                    placeholder="Ejemplo: El Quisco"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="sector"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Sector
                  </label>
                  <input
                    type="text"
                    id="sector"
                    name="sector"
                    placeholder="Ejemplo: Quisco Centro"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email <span className="text-red-500">*</span> (Alumno o
                    apoderado en su defecto)
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Ejemplo: nombre@ejemplo.com"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
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
                      className="mt-1 w-full block px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#E91E63] focus:border-[#E91E63]"
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
                    Confirmación contraseña
                  </label>
                  <input
                    type="password"
                    name="clave2"
                    required
                    className="mt-1 w-full block px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#E91E63] focus:border-[#E91E63]"
                  />
                </div>
              </div>
            </fieldset>
            <fieldset className="border border-solid border-gray-300 p-3">
              <legend className="text-sm font-medium text-gray-700">
                Información académica
              </legend>

              <div className="space-y-4 mt-3">
                <div>
                  <label
                    htmlFor="ultimo_establecimiento"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Último establecimiento{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="ultimo_establecimiento"
                    name="ultimo_establecimiento"
                    placeholder="Ejemplo: Escuela Mirasol"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="ultimo_nivel_cursado"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Último nivel cursado <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="ultimo_nivel_cursado"
                    name="ultimo_nivel_cursado"
                    placeholder="Ejemplo: 2° Básico"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="incidencia_academica"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Incidencia académica (opcional)
                  </label>
                  <input
                    type="text"
                    id="incidencia_academica"
                    name="incidencia_academica"
                    placeholder="Ejemplo: No Aplica"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    ¿Requiere apoyo especial?{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="flex space-x-4 mt-1">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="flag_apoyo_especial"
                        value="1"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        required
                      />
                      <span className="ml-2 text-sm text-gray-700">Sí</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="flag_apoyo_especial"
                        value="0"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        required
                      />
                      <span className="ml-2 text-sm text-gray-700">No</span>
                    </label>
                  </div>
                  <div className="mt-2">
                    <input
                      type="text"
                      id="apoyo_especial"
                      name="apoyo_especial"
                      placeholder="Especifique el tipo de apoyo especial (opcional)"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    ¿Da consentimiento para recibir apoyo especial?{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="flex space-x-4 mt-1">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="consentimiento_apoyo_especial"
                        value="1"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        required
                      />
                      <span className="ml-2 text-sm text-gray-700">Sí</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="consentimiento_apoyo_especial"
                        value="0"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        required
                      />
                      <span className="ml-2 text-sm text-gray-700">No</span>
                    </label>
                  </div>
                  <div className="mt-2">
                    <input
                      type="text"
                      id="razon_consentimiento_apoyo_especial"
                      name="razon_consentimiento_apoyo_especial"
                      placeholder="Especifique la razón del consentimiento (opcional)"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="rezago"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Rezago escolar
                  </label>
                  <input
                    type="text"
                    id="rezago"
                    name="rezago"
                    placeholder="Ejemplo: No registra, En proceso, etc."
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="id_curso"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Curso al que entrará el estudiante{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="id_curso"
                    name="id_curso"
                    className="mt-1 block px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  >
                    {loading && <option value="">Cargando cursos...</option>}
                    {error && <option value="">Error al cargar cursos</option>}
                    {!loading &&
                      cursos.map((curso) => (
                        <option key={curso.id_curso} value={curso.id_curso}>
                          {curso.nombre_curso}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            </fieldset>
            <fieldset className="border border-solid border-gray-300 p-3">
              <legend className="text-sm text-gray-700">
                Información de contactos
              </legend>
              <div className="space-y-4 mt-3">
                <h3 className="text-base font-semibold text-gray-700">
                  Apoderado/a Principal
                </h3>
                <div>
                  <label
                    htmlFor="nombres_apoderado1"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Nombres <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="nombres_apoderado1"
                    name="nombres_apoderado1"
                    placeholder="Ejemplo: Agustina Pascal"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="apellidos_apoderado1"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Apellidos <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="apellidos_apoderado1"
                    name="apellidos_apoderado1"
                    placeholder="Ejemplo: González Acevedo"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="rut_apoderado1"
                    className="block text-sm font-medium text-gray-700"
                  >
                    RUT <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="rut_apoderado1"
                    name="rut_apoderado1"
                    placeholder="Ejemplo: 12345678-9"
                    className="mt-1 block px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="tipo_rut_apoderado1"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Tipo de RUT <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="tipo_rut_apoderado1"
                    name="tipo_rut_apoderado1"
                    className="mt-1 block px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  >
                    <option value="">Seleccione una opción</option>
                    <option value="RUT">RUT</option>
                    <option value="RUT_EXTRANJERO">RUT Extranjero</option>
                    <option value="PASAPORTE">Pasaporte</option>
                    <option value="OTRO">Otro</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="nacionalidad_apoderado1"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Nacionalidad <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="nacionalidad_apoderado1"
                    name="nacionalidad_apoderado1"
                    placeholder="Ejemplo: Chileno/a, Colombiano/a"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="vinculo_apoderado1"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Vínculo con el/la alumno/a{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="vinculo_apoderado1"
                    name="vinculo_apoderado1"
                    placeholder="Ejemplo: Madre, Padre, Tutor/a"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="celular_apoderado1"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Celular <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="celular_apoderado1"
                    name="celular_apoderado1"
                    placeholder="Ejemplo: 987654321"
                    min={9}
                    max={9}
                    pattern="[9]{1} [0-9]{4}-[0-9]{4}"
                    className="mt-1 block px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="email_apoderado1"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email_apoderado1"
                    name="email_apoderado1"
                    placeholder="Ejemplo: nombre@ejemplo.com"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="direccion_apoderado1"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Dirección <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="direccion_apoderado1"
                    name="direccion_apoderado1"
                    placeholder="Ejemplo: Avenida España Sin Número"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="comuna_apoderado1"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Comuna <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="comuna_apoderado1"
                    name="comuna_apoderado1"
                    placeholder="Ejemplo: El Quisco"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="nucleo_familiar"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Ingrese la cantidad de personas que componen el núcleo
                    familiar del alumno <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="nucleo_familiar"
                    name="nucleo_familiar"
                    placeholder="Ejemplo: 1, 2, 3, etc..."
                    className="mt-1 block px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    min={0}
                    required
                  />
                </div>
              </div>

              <div className="space-y-4 mt-6">
                <h3 className="text-base font-semibold text-gray-700">
                  Apoderado/a Secundario (Opcional)
                </h3>
                <div>
                  <label
                    htmlFor="nombres_apoderado2"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Nombres
                  </label>
                  <input
                    type="text"
                    id="nombres_apoderado2"
                    name="nombres_apoderado2"
                    placeholder="Ejemplo: Valeria Meneses"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="apellidos_apoderado2"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Apellidos
                  </label>
                  <input
                    type="text"
                    id="apellidos_apoderado2"
                    name="apellidos_apoderado2"
                    placeholder="Ejemplo: Oscar Villarroel"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="celular_apoderado2"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Celular
                  </label>
                  <input
                    type="tel"
                    id="celular_apoderado2"
                    name="celular_apoderado2"
                    placeholder="Ejemplo: 981569877"
                    min={9}
                    max={9}
                    pattern="[9]{1} [0-9]{4}-[0-9]{4}"
                    className="mt-1 block px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="space-y-4 mt-6">
                <h3 className="text-base font-semibold text-gray-700">
                  Contacto de Emergencia
                </h3>
                <div>
                  <label
                    htmlFor="nombres_contacto"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Nombres <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="nombres_contacto"
                    name="nombres_contacto"
                    placeholder="Ejemplo: Aldo Jorge"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="apellidos_contacto"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Apellidos <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="apellidos_contacto"
                    name="apellidos_contacto"
                    placeholder="Ejemplo: Zarate Carreño"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="celular_contacto"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Celular <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="celular_contacto"
                    name="celular_contacto"
                    placeholder="Ejemplo: 999027852"
                    min={9}
                    max={9}
                    pattern="[9]{1} [0-9]{4}-[0-9]{4}"
                    className="mt-1 block px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="vinculo_contacto"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Vínculo con el/la alumno/a{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="vinculo_contacto"
                    name="vinculo_contacto"
                    placeholder="Ejemplo: Padre, Madre, Tutor/a"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>
              </div>
            </fieldset>
            <fieldset className="border border-solid border-gray-300 p-3">
              <legend className="text-sm text-gray-700">
                Información médica
              </legend>
              <div className="space-y-4 mt-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    ¿Tiene control médico regular?{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="flex space-x-4 mt-1">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="flag_control_medico"
                        value="1"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        required
                      />
                      <span className="ml-2 text-sm text-gray-700">Sí</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="flag_control_medico"
                        value="0"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        required
                      />
                      <span className="ml-2 text-sm text-gray-700">No</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    ¿Tiene alguna discapacidad?{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="flex space-x-4 mt-1">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="flag_discapacidad"
                        value="1"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        required
                      />
                      <span className="ml-2 text-sm text-gray-700">Sí</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="flag_discapacidad"
                        value="0"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        required
                      />
                      <span className="ml-2 text-sm text-gray-700">No</span>
                    </label>
                  </div>
                  <div className="mt-2">
                    <input
                      type="text"
                      name="discapacidad"
                      placeholder="Especifique la discapacidad (opcional)"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    ¿Tiene alguna necesidad educativa especial?{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="flex space-x-4 mt-1">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="flag_necesidad_especial"
                        value="1"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        required
                      />
                      <span className="ml-2 text-sm text-gray-700">Sí</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="flag_necesidad_especial"
                        value="0"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        required
                      />
                      <span className="ml-2 text-sm text-gray-700">No</span>
                    </label>
                  </div>
                  <div className="mt-2">
                    <input
                      type="text"
                      name="necesidad_especial"
                      placeholder="Especifique la necesidad especial (opcional)"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    ¿Tiene alguna enfermedad?{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="flex space-x-4 mt-1">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="flag_enfermedad"
                        value="1"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        required
                      />
                      <span className="ml-2 text-sm text-gray-700">Sí</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="flag_enfermedad"
                        value="0"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        required
                      />
                      <span className="ml-2 text-sm text-gray-700">No</span>
                    </label>
                  </div>
                  <div className="mt-2">
                    <input
                      type="text"
                      name="enfermedad"
                      placeholder="Especifique la enfermedad (opcional)"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    ¿Toma medicamentos regularmente?{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="flex space-x-4 mt-1">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="flag_medicamentos"
                        value="1"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        required
                      />
                      <span className="ml-2 text-sm text-gray-700">Sí</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="flag_medicamentos"
                        value="0"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        required
                      />
                      <span className="ml-2 text-sm text-gray-700">No</span>
                    </label>
                  </div>
                  <div className="mt-2">
                    <input
                      type="text"
                      name="medicamentos"
                      placeholder="Especifique los medicamentos (opcional)"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    ¿Tiene alguna alergia?{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="flex space-x-4 mt-1">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="flag_alergia"
                        value="1"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        required
                      />
                      <span className="ml-2 text-sm text-gray-700">Sí</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="flag_alergia"
                        value="0"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        required
                      />
                      <span className="ml-2 text-sm text-gray-700">No</span>
                    </label>
                  </div>
                  <div className="mt-2">
                    <input
                      type="text"
                      name="alergia"
                      placeholder="Especifique la alergia (opcional)"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="prevision_medica"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Previsión médica <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="prevision_medica"
                    name="prevision_medica"
                    placeholder="Ejemplo: Fonasa, Isapre"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="servicio_emergencia"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Servicio de emergencia{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="servicio_mergencia"
                    name="servicio_emergencia"
                    placeholder="Ejemplo: Cesfam, Particular"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>
              </div>
            </fieldset>
            <fieldset className="border border-solid border-gray-300 p-3">
              <legend className="text-sm text-gray-700">
                Documentos requeridos
              </legend>
              <div className="space-y-4 mt-3">
                <div>
                  <label
                    htmlFor="cert_nacimiento"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Certificado de nacimiento (para todo trámite){" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    id="cert_nacimiento"
                    name="cert_nacimiento"
                    accept=".pdf,.doc,.docx,image/png,image/jpeg"
                    className="mt-1 block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="cert_estudios"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Certificado de último año cursado y aprobado por el Mineduc{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    id="cert_estudios"
                    name="cert_estudios"
                    accept=".pdf,.doc,.docx,image/png,image/jpeg"
                    className="mt-1 block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="cert_rsh"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Registro Social de Hogares (comuna El Quisco){" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    id="cert_rsh"
                    name="cert_rsh"
                    accept=".pdf,.doc,.docx,image/png,image/jpeg"
                    className="mt-1 block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="cert_carnet"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Fotocopia de carnet del adulto responsable (por ambos lados){" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    id="cert_carnet"
                    name="cert_carnet"
                    accept=".pdf,.doc,.docx,image/png,image/jpeg"
                    className="mt-1 block  text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="cert_diagnostico"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Certificado de diagnóstico en caso de que el alumno presente
                    una necesidad educativa especial
                  </label>
                  <input
                    type="file"
                    id="cert_diagnostico"
                    name="cert_diagnostico"
                    accept=".pdf,.doc,.docx,image/png,image/jpeg"
                    className="mt-1 block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
              </div>
            </fieldset>
            <fieldset className="border border-solid border-gray-300 p-3">
              <legend className="text-sm text-gray-700">
                Términos y condiciones
              </legend>
              <div className="space-y-3 mt-3">
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="hitos"
                    name="hitos"
                    required
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="hitos" className="ml-2 text-sm text-gray-700">
                    Me comprometo a facilitar el acceso, al niño, niña y
                    adolescente (NNA) a los hitos importantes del programa
                    Saberes durante todo el año, siendo el último “Saberes
                    Summer” el cuál finaliza la primera semana de diciembre.
                    <span className="text-red-500">*</span>
                  </label>
                </div>

                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="asistencia"
                    name="asistencia"
                    required
                    className="h-4 w-4  text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="asistencia"
                    className="ml-2 text-sm text-gray-700"
                  >
                    Me comprometo con la asistencia diaria del/la NNA a clases,
                    todo el año socioeducativo (marzo a diciembre) para que
                    participe activamente en el Programa Saberes y así formar
                    parte del proceso de preparación, orientación, para la
                    rendición de exámenes libres.
                    <span className="text-red-500">*</span>
                  </label>
                </div>

                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="seguro_beneficio"
                    name="seguro_beneficio"
                    required
                    className="h-4 w-4  text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="seguro_beneficio"
                    className="ml-2 text-sm text-gray-700"
                  >
                    Estoy en conocimiento que “Saberes” es un modelo alternativo
                    de educación (escuela libre) dependiente de Dideco y no
                    cuenta con seguro escolar, ni convenio directo con Junaeb.
                    <span className="text-red-500">*</span>
                  </label>
                </div>

                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="reuniones"
                    name="reuniones"
                    required
                    className="h-4 w-4  text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="reuniones"
                    className="ml-2 text-sm text-gray-700"
                  >
                    Me comprometo a participar en la Escuela de Padres y de
                    reuniones de contenido programadas por los docentes del
                    equipo Saberes, en la búsqueda de una mayor integración del
                    NNA y familia. En el caso de no poder asistir, enviaré a un
                    adulto responsable en mi representación.
                    <span className="text-red-500">*</span>
                  </label>
                </div>

                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="apoyo_especial"
                    name="reuniones"
                    required
                    className="h-4 w-4  text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="apoyo_especial"
                    className="ml-2 text-sm text-gray-700"
                  >
                    En el caso de que mi hijo/a presente una necesidad educativa
                    especial, me comprometo a acompañarlo en su proceso con el
                    apoyo del Programa Saberes o de forma particular, para
                    garantizar el avance de su aprendizaje.
                    <span className="text-red-500">*</span>
                  </label>
                </div>

                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="sedes"
                    name="sedes"
                    required
                    className="h-4 w-4  text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="sedes" className="ml-2 text-sm text-gray-700">
                    Estoy consciente que los espacios educativos (aulas
                    adaptadas) del Programa Saberes se llevan a cabo en Sedes
                    Vecinales.
                    <span className="text-red-500">*</span>
                  </label>
                </div>

                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="multimedia"
                    name="multimedia"
                    required
                    className="h-4 w-4  text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="multimedia"
                    className="ml-2 text-sm text-gray-700"
                  >
                    Autorizo al/la NNA a que pueda participar de registros
                    fotográficos y/o audiovisuales en actividades relacionadas
                    con el programa o la I. Municipalidad de El Quisco (Solo
                    manejo profesional municipal).
                    <span className="text-red-500">*</span>
                  </label>
                </div>

                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="cumplimiento_compromisos"
                    name="cumplimiento_compromisos"
                    required
                    className="h-4 w-4  text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="cumplimiento_compromisos"
                    className="ml-2 text-sm text-gray-700"
                  >
                    Me comprometo a velar por el cumplimiento de lo solicitado
                    en el presente formulario y futuros requerimientos en
                    beneficio del proceso social y educativo, para propiciar el
                    avance y aprendizaje del NNA.
                    <span className="text-red-500">*</span>
                  </label>
                </div>

                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="terminos_condiciones"
                    name="terminos_condiciones"
                    required
                    className="h-4 w-4  text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="terminos_condiciones"
                    className="ml-2 text-sm text-gray-700"
                  >
                    He leído y firmado el compromiso adquirido comprendiendo lo
                    que en él se expone.
                    <span className="text-red-500">*</span>
                  </label>
                </div>
              </div>
            </fieldset>
            <div className="mt-6 w-full flex justify-center">
              <button
                type="submit"
                className="py-2.5 px-4 bg-[#E91E63] text-white rounded-md hover:bg-[#C2185B] transition-colors"
              >
                Matricularse
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MatriculaEstudiante;

// "use client";
// import React, { useEffect, useState } from "react";
// import { useForm } from "react-hook-form";
// import { yupResolver } from "@hookform/resolvers/yup";
// import * as yup from "yup";

// type FormDataMatricula = {
//   rut_usuario: string;
//   rut_tipo: string;
//   nombres: string;
//   apellidos: string;
//   fecha_nacimiento: string;
//   sexo: string;
//   nacionalidad: string;
//   talla?: string;
//   direccion: string;
//   comuna: string;
//   sector?: string;
//   email: string;
//   clave: string;
//   clave2: string;

//   ultimo_establecimiento: string;
//   ultimo_nivel_cursado: string;
//   incidencia_academica?: string;
//   flag_apoyo_especial: string;
//   apoyo_especial?: string;
//   consentimiento_apoyo_especial: string;
//   razon_consentimiento_apoyo_especial?: string;
//   rezago?: string;
//   id_curso: string;

//   nombres_apoderado1: string;
//   apellidos_apoderado1: string;
//   rut_apoderado1: string;
//   tipo_rut_apoderado1: string;
//   nacionalidad_apoderado1: string;
//   vinculo_apoderado1: string;
//   celular_apoderado1: string;
//   email_apoderado1: string;
//   direccion_apoderado1: string;
//   comuna_apoderado1: string;
//   nucleo_familiar: number;

//   nombres_apoderado2?: string;
//   apellidos_apoderado2?: string;
//   celular_apoderado2?: string;

//   nombres_contacto: string;
//   apellidos_contacto: string;
//   celular_contacto: string;
//   vinculo_contacto: string;

//   flag_control_medico: string;
//   flag_discapacidad: string;
//   discapacidad?: string;
//   flag_necesidad_especial: string;
//   necesidad_especial?: string;
//   flag_enfermedad: string;
//   enfermedad?: string;
//   flag_medicamentos: string;
//   medicamentos?: string;
//   flag_alergia: string;
//   alergia?: string;
//   prevision_medica: string;
//   servicio_emergencia: string;

//   cert_nacimiento: FileList; // Usar FileList en lugar de File
//   cert_estudios: FileList;
//   cert_rsh: FileList;
//   cert_carnet: FileList;
//   cert_diagnostico?: FileList;

//   hitos: boolean;
//   asistencia: boolean;
//   seguro_beneficio: boolean;
//   reuniones: boolean;
//   apoyo_especial_consent: boolean;
//   sedes: boolean;
//   multimedia: boolean;
//   cumplimiento_compromisos: boolean;
//   terminos_condiciones: boolean;
// };

// interface Curso {
//   id_curso: string;
//   nombre_curso: string;
// }

// type Condition = {
//   is: (value: string) => boolean;
//   then: (schema: yup.StringSchema) => yup.StringSchema;
//   otherwise?: (schema: yup.StringSchema) => yup.StringSchema;
// };

// const whenCondition = (field: string, condition: Condition) =>
//   yup.string().when(field, condition);

// const validateRUT = (rut: string) => {
//   if (!/^[0-9]+[-|‐]{1}[0-9kK]{1}$/.test(rut)) return false;
//   const tmp = rut.split("-");
//   let digv = tmp[1];
//   const cuerpo = tmp[0];
//   let suma = 0;
//   let multiplo = 2;

//   for (let i = cuerpo.length - 1; i >= 0; i--) {
//     suma += Number(cuerpo.charAt(i)) * multiplo;
//     multiplo = multiplo === 7 ? 2 : multiplo + 1;
//   }

//   const resultado = 11 - (suma % 11);
//   if (resultado === 11) digv = "0";
//   else if (resultado === 10) digv = "K";
//   else digv = resultado.toString();

//   return digv === digv.toUpperCase();
// };

// const schema = yup.object().shape({
//   rut_usuario: yup
//     .string()
//     .required("RUT es requerido")
//     .when("rut_tipo", {
//       is: (rutTipoValue: string) => rutTipoValue === "RUT",
//       then: (schema) =>
//         schema.test("valid-rut", "RUT inválido", (value) =>
//           validateRUT(value || "")
//         ),
//       otherwise: (schema) => schema.min(5, "Mínimo 5 caracteres"),
//     }),
//   rut_tipo: yup.string().required("Tipo de RUT es requerido"),
//   nombres: yup.string().required("Nombres son requeridos"),
//   apellidos: yup.string().required("Apellidos son requeridos"),
//   fecha_nacimiento: yup
//     .string()
//     .required("Fecha de nacimiento es requerida")
//     .test(
//       "is-valid-date",
//       "Fecha no válida",
//       (value) => !isNaN(Date.parse(value)) // Validar que sea fecha válida
//     )
//     .test(
//       "is-past-date",
//       "Fecha no puede ser futura",
//       (value) => new Date(value) <= new Date()
//     ),
//   // fecha_nacimiento: yup
//   //   .date()
//   //   .required("Fecha de nacimiento es requerida")
//   //   .max(new Date(), "Fecha no puede ser futura"),
//   sexo: yup.string().required("Sexo es requerido"),
//   nacionalidad: yup.string().required("Nacionalidad es requerida"),
//   talla: yup.string().nullable(),
//   direccion: yup.string().required("Dirección es requerida"),
//   comuna: yup.string().required("Comuna es requerida"),
//   sector: yup.string().nullable(),
//   email: yup.string().email("Email inválido").required("Email es requerido"),
//   clave: yup
//     .string()
//     .required("Contraseña es requerida")
//     .min(6, "Mínimo 6 caracteres"),
//   clave2: yup
//     .string()
//     .oneOf([yup.ref("clave")], "Las contraseñas deben coincidir")
//     .required("Confirmación de contraseña es requerida"),

//   ultimo_establecimiento: yup.string().required("Campo requerido"),
//   ultimo_nivel_cursado: yup.string().required("Campo requerido"),
//   incidencia_academica: yup.string().nullable(),
//   flag_apoyo_especial: yup.string().required("Campo requerido"),
//   apoyo_especial: whenCondition("flag_apoyo_especial", {
//     is: (value) => value === "1",
//     then: (schema) => schema.required("Especifique el apoyo especial"),
//   }),
//   consentimiento_apoyo_especial: yup.string().required("Campo requerido"),
//   razon_consentimiento_apoyo_especial: yup.string().nullable(),
//   rezago: yup.string().nullable(),
//   id_curso: yup.string().required("Curso es requerido"),

//   nombres_apoderado1: yup.string().required("Nombres son requeridos"),
//   apellidos_apoderado1: yup.string().required("Apellidos son requeridos"),
//   rut_apoderado1: yup.string().required("RUT es requerido"),
//   tipo_rut_apoderado1: yup.string().required("Tipo de RUT es requerido"),
//   nacionalidad_apoderado1: yup.string().required("Nacionalidad es requerida"),
//   vinculo_apoderado1: yup.string().required("Vínculo es requerido"),
//   celular_apoderado1: yup
//     .string()
//     .required("Celular es requerido")
//     .matches(
//       /^9\d{8}$/,
//       "Número inválido debe empezar con 9 y tener 9 dígitos"
//     ),
//   email_apoderado1: yup
//     .string()
//     .email("Email inválido")
//     .required("Email es requerido"),
//   direccion_apoderado1: yup.string().required("Dirección es requerida"),
//   comuna_apoderado1: yup.string().required("Comuna es requerida"),
//   nucleo_familiar: yup
//     .number()
//     .required("Campo requerido")
//     .min(1, "Mínimo 1 persona"),

//   nombres_apoderado2: yup.string().nullable(),
//   apellidos_apoderado2: yup.string().nullable(),
//   celular_apoderado2: yup
//     .string()
//     .nullable()
//     .matches(
//       /^9\d{8}$/,
//       "Número inválido debe empezar con 9 y tener 9 dígitos"
//     ),

//   nombres_contacto: yup.string().required("Nombres son requeridos"),
//   apellidos_contacto: yup.string().required("Apellidos son requeridos"),
//   celular_contacto: yup
//     .string()
//     .required("Celular es requerido")
//     .matches(
//       /^9\d{8}$/,
//       "Número inválido debe empezar con 9 y tener 9 dígitos"
//     ),
//   vinculo_contacto: yup.string().required("Vínculo es requerido"),

//   flag_control_medico: yup.string().required("Campo requerido"),
//   flag_discapacidad: yup.string().required("Campo requerido"),
//   discapacidad: whenCondition("flag_discapacidad", {
//     is: (value) => value === "1",
//     then: (schema) => schema.required("Especifique la discapacidad"),
//   }),
//   flag_necesidad_especial: yup.string().required("Campo requerido"),
//   necesidad_especial: whenCondition("flag_necesidad_especial", {
//     is: (value) => value === "1",
//     then: (schema) => schema.required("Especifique la necesidad especial"),
//   }),
//   flag_enfermedad: yup.string().required("Campo requerido"),
//   enfermedad: whenCondition("flag_enfermedad", {
//     is: (value) => value === "1",
//     then: (schema) => schema.required("Especifique la enfermedad"),
//   }),
//   flag_medicamentos: yup.string().required("Campo requerido"),
//   medicamentos: whenCondition("flag_medicamentos", {
//     is: (value) => value === "1",
//     then: (schema) => schema.required("Especifique los medicamentos"),
//   }),
//   flag_alergia: yup.string().required("Campo requerido"),
//   alergia: whenCondition("flag_alergia", {
//     is: (value) => value === "1",
//     then: (schema) => schema.required("Especifique la alergia"),
//   }),
//   prevision_medica: yup.string().required("Previsión médica es requerida"),
//   servicio_emergencia: yup
//     .string()
//     .required("Servicio de emergencia es requerido"),

//   cert_nacimiento: yup
//     .mixed<FileList>()
//     .required("Archivo requerido")
//     .test("fileType", "Formato no válido", (value) => {
//       if (!value || value.length === 0) return false;
//       const allowedFormats = ["application/pdf", "image/png", "image/jpeg"];
//       return allowedFormats.includes(value[0].type);
//     }),
//   cert_estudios: yup
//     .mixed()
//     .required("Archivo requerido")
//     .test("fileType", "Formato no válido", (value) => {
//       if (!(value as FileList)[0]) return false;
//       const allowedFormats = ["application/pdf", "image/png", "image/jpeg"];
//       return allowedFormats.includes((value as FileList)[0].type);
//     }),
//   cert_rsh: yup
//     .mixed()
//     .required("Archivo requerido")
//     .test("fileType", "Formato no válido", (value) => {
//       if (!(value as FileList)[0]) return false;
//       const allowedFormats = ["application/pdf", "image/png", "image/jpeg"];
//       return allowedFormats.includes((value as FileList)[0].type);
//     }),
//   cert_carnet: yup
//     .mixed()
//     .required("Archivo requerido")
//     .test("fileType", "Formato no válido", (value) => {
//       if (!(value as FileList)[0]) return false;
//       const allowedFormats = ["application/pdf", "image/png", "image/jpeg"];
//       return allowedFormats.includes((value as FileList)[0].type);
//     }),
//   cert_diagnostico: yup
//     .mixed()
//     .required("Archivo requerido")
//     .test("fileType", "Formato no válido", (value) => {
//       if (!(value as FileList)[0]) return false;
//       const allowedFormats = ["application/pdf", "image/png", "image/jpeg"];
//       return allowedFormats.includes((value as FileList)[0].type);
//     }),

//   // Términos y condiciones
//   hitos: yup.boolean().oneOf([true], "Debe aceptar este término"),
//   asistencia: yup.boolean().oneOf([true], "Debe aceptar este término"),
//   seguro_beneficio: yup.boolean().oneOf([true], "Debe aceptar este término"),
//   reuniones: yup.boolean().oneOf([true], "Debe aceptar este término"),
//   apoyo_especial_consent: yup
//     .boolean()
//     .oneOf([true], "Debe aceptar este término"),
//   sedes: yup.boolean().oneOf([true], "Debe aceptar este término"),
//   multimedia: yup.boolean().oneOf([true], "Debe aceptar este término"),
//   cumplimiento_compromisos: yup
//     .boolean()
//     .oneOf([true], "Debe aceptar este término"),
//   terminos_condiciones: yup
//     .boolean()
//     .oneOf([true], "Debe aceptar este término"),
// });

// const MatriculaEstudiante = () => {
//   const [cursos, setCursos] = useState<Curso[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [showPasswords, setShowPasswords] = useState({
//     login: false,
//     register: false,
//     confirmRegister: false,
//   });

//   const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
//     setShowPasswords((prev) => ({
//       ...prev,
//       [field]: !prev[field],
//     }));
//   };

//   const {
//     register,
//     handleSubmit,
//     watch,
//     setValue,
//     // control,
//     formState: { errors },
//   } = useForm<FormDataMatricula>({
//     resolver: yupResolver(schema) as any,
//     defaultValues: {
//       hitos: false,
//       asistencia: false,
//       seguro_beneficio: false,
//       reuniones: false,
//       apoyo_especial_consent: false,
//       sedes: false,
//       multimedia: false,
//       cumplimiento_compromisos: false,
//       terminos_condiciones: false,
//     },
//   });

//   useEffect(() => {
//     async function fetchCursos() {
//       try {
//         const response = await fetch("/api/cursos");
//         if (!response.ok) {
//           throw new Error("Error al cargar los cursos");
//         }
//         const data = await response.json();
//         setCursos(data);
//       } catch (err) {
//         setError((err as Error).message);
//       } finally {
//         setLoading(false);
//       }
//     }

//     fetchCursos();
//   }, []);

//   const onSubmit = async (data: FormDataMatricula) => {
//     const formData = new FormData();

//     for (const [key, value] of Object.entries(data)) {
//       if (value instanceof File) {
//         formData.append(key, value);
//       } else {
//         formData.append(key, String(value));
//       }
//     }

//     try {
//       const response = await fetch("/api/auth/register/matricula", {
//         method: "POST",
//         body: formData,
//       });

//       if (response.ok) {
//         alert("Registro exitoso");
//       } else {
//         const errorData = await response.json();
//         alert(
//           `Error en el registro: ${errorData.message || "Error desconocido"}`
//         );
//       }
//     } catch (error) {
//       console.error("Error de red:", error);
//       alert("Error de conexión. Intente nuevamente.");
//     }
//   };

//   const formatRUT = (value: string) => {
//     if (watch("rut_tipo") === "RUT") {
//       const cleanValue = value.replace(/[^0-9kK]/g, "");
//       if (cleanValue.length > 1) {
//         return `${cleanValue.slice(0, -1)}-${cleanValue.slice(-1)}`;
//       }
//     }
//     return value;
//   };

//   const handleRUTChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const formattedValue = formatRUT(e.target.value);
//     setValue("rut_usuario", formattedValue);
//   };

//   return (
//     <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between">
//       <div className="flex flex-col w-full">
//         <h1 className="text-3xl font-bold text-center mb-4">
//           Formulario de matrícula
//         </h1>
//         <p className="text-center mb-4">
//           Para matricularte necesitarás los siguientes documentos en formato
//           digital (PDF, Word, Imagen):
//         </p>
//         <ul className="list-disc list-inside space-y-2 text-sm ml-4">
//           <li>Certificado de nacimiento (para todo trámite)</li>
//           <li>Certificado de último año cursado y aprobado por el Mineduc</li>
//           <li>Registro Social de Hogares (comuna El Quisco)</li>
//           <li>Fotocopia de carnet del adulto responsable (por ambos lados)</li>
//           <li>
//             Certificado de diagnóstico en caso de que el alumno presente una
//             necesidad educativa especial
//           </li>
//         </ul>
//         <div className="pt-2">
//           <span className="text-red-500 text-sm">
//             {" "}
//             Los campos marcados con * son obligatorios
//           </span>
//           <form
//             onSubmit={handleSubmit(onSubmit)}
//             className="flex flex-col space-y-5 pt-2"
//             encType="multipart/form-data"
//           >
//             {/* Información personal */}
//             <fieldset className="border border-solid border-gray-300 p-3">
//               <legend className="text-sm text-gray-700">
//                 Información personal
//               </legend>
//               <div className="space-y-4 mt-3">
//                 <div>
//                   <label
//                     htmlFor="rut_usuario"
//                     className="block text-sm font-medium text-gray-700"
//                   >
//                     RUT <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     {...register("rut_usuario")}
//                     onChange={handleRUTChange}
//                     placeholder="Ejemplo: 12345678-9"
//                     className={`mt-1 block px-3 py-2 border ${
//                       errors.rut_usuario ? "border-red-500" : "border-gray-300"
//                     } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
//                   />
//                   {errors.rut_usuario && (
//                     <p className="text-red-500 text-sm">
//                       {errors.rut_usuario.message}
//                     </p>
//                   )}
//                 </div>

//                 <div>
//                   <label
//                     htmlFor="rut_tipo"
//                     className="block text-sm font-medium text-gray-700"
//                   >
//                     Tipo de RUT <span className="text-red-500">*</span>
//                   </label>
//                   <select
//                     {...register("rut_tipo")}
//                     className={`mt-1 block px-3 py-2 border ${
//                       errors.rut_tipo ? "border-red-500" : "border-gray-300"
//                     } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
//                   >
//                     <option value="">Seleccione una opción</option>
//                     <option value="RUT">RUT</option>
//                     <option value="RUT_EXTRANJERO">RUT Extranjero</option>
//                     <option value="PASAPORTE">Pasaporte</option>
//                     <option value="OTRO">Otro</option>
//                   </select>
//                   {errors.rut_tipo && (
//                     <p className="text-red-500 text-sm">
//                       {errors.rut_tipo.message}
//                     </p>
//                   )}
//                 </div>

//                 <div>
//                   <label
//                     htmlFor="nombres"
//                     className="block text-sm font-medium text-gray-700"
//                   >
//                     Nombres <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     {...register("nombres")}
//                     placeholder="Ejemplo: Agustina Pascal"
//                     className={`mt-1 block w-full px-3 py-2 border ${
//                       errors.nombres ? "border-red-500" : "border-gray-300"
//                     } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
//                   />
//                   {errors.nombres && (
//                     <p className="text-red-500 text-sm">
//                       {errors.nombres.message}
//                     </p>
//                   )}
//                 </div>

//                 <div>
//                   <label
//                     htmlFor="apellidos"
//                     className="block text-sm font-medium text-gray-700"
//                   >
//                     Apellidos <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     {...register("apellidos")}
//                     placeholder="Ejemplo: González Acevedo"
//                     className={`mt-1 block w-full px-3 py-2 border ${
//                       errors.apellidos ? "border-red-500" : "border-gray-300"
//                     } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
//                   />
//                   {errors.apellidos && (
//                     <p className="text-red-500 text-sm">
//                       {errors.apellidos.message}
//                     </p>
//                   )}
//                 </div>

//                 <div>
//                   <label
//                     htmlFor="fecha_nacimiento"
//                     className="block text-sm font-medium text-gray-700"
//                   >
//                     Fecha de nacimiento <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="date"
//                     {...register("fecha_nacimiento")}
//                     className={`mt-1 block px-3 py-2 border ${
//                       errors.fecha_nacimiento
//                         ? "border-red-500"
//                         : "border-gray-300"
//                     } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
//                     max={new Date().toISOString().split("T")[0]}
//                   />
//                   {errors.fecha_nacimiento && (
//                     <p className="text-red-500 text-sm">
//                       {errors.fecha_nacimiento.message}
//                     </p>
//                   )}
//                 </div>

//                 <div>
//                   <label
//                     htmlFor="sexo"
//                     className="block text-sm font-medium text-gray-700"
//                   >
//                     Sexo <span className="text-red-500">*</span>
//                   </label>
//                   <select
//                     {...register("sexo")}
//                     className={`mt-1 block px-3 py-2 border ${
//                       errors.sexo ? "border-red-500" : "border-gray-300"
//                     } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
//                   >
//                     <option value="">Seleccione una opción</option>
//                     <option value="Mujer">Mujer</option>
//                     <option value="Hombre">Hombre</option>
//                     <option value="Otro">Otro</option>
//                   </select>
//                   {errors.sexo && (
//                     <p className="text-red-500 text-sm">
//                       {errors.sexo.message}
//                     </p>
//                   )}
//                 </div>

//                 <div>
//                   <label
//                     htmlFor="nacionalidad"
//                     className="block text-sm font-medium text-gray-700"
//                   >
//                     Nacionalidad <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     {...register("nacionalidad")}
//                     placeholder="Ejemplo: Chileno/a, Colombiano/a"
//                     className={`mt-1 block w-full px-3 py-2 border ${
//                       errors.nacionalidad ? "border-red-500" : "border-gray-300"
//                     } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
//                   />
//                   {errors.nacionalidad && (
//                     <p className="text-red-500 text-sm">
//                       {errors.nacionalidad.message}
//                     </p>
//                   )}
//                 </div>

//                 <div>
//                   <label
//                     htmlFor="talla"
//                     className="block text-sm font-medium text-gray-700"
//                   >
//                     Talla (opcional)
//                   </label>
//                   <input
//                     {...register("talla")}
//                     placeholder="Ejemplo: S, M, L, 12, etc..."
//                     className={`mt-1 block w-full px-3 py-2 border ${
//                       errors.talla ? "border-red-500" : "border-gray-300"
//                     } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
//                   />
//                 </div>

//                 <div>
//                   <label
//                     htmlFor="direccion"
//                     className="block text-sm font-medium text-gray-700"
//                   >
//                     Dirección <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     {...register("direccion")}
//                     placeholder="Ejemplo: Avenida España Sin Número"
//                     className={`mt-1 block w-full px-3 py-2 border ${
//                       errors.direccion ? "border-red-500" : "border-gray-300"
//                     } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
//                   />
//                   {errors.direccion && (
//                     <p className="text-red-500 text-sm">
//                       {errors.direccion.message}
//                     </p>
//                   )}
//                 </div>

//                 <div>
//                   <label
//                     htmlFor="comuna"
//                     className="block text-sm font-medium text-gray-700"
//                   >
//                     Comuna <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     {...register("comuna")}
//                     placeholder="Ejemplo: El Quisco"
//                     className={`mt-1 block w-full px-3 py-2 border ${
//                       errors.comuna ? "border-red-500" : "border-gray-300"
//                     } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
//                   />
//                   {errors.comuna && (
//                     <p className="text-red-500 text-sm">
//                       {errors.comuna.message}
//                     </p>
//                   )}
//                 </div>

//                 <div>
//                   <label
//                     htmlFor="sector"
//                     className="block text-sm font-medium text-gray-700"
//                   >
//                     Sector
//                   </label>
//                   <input
//                     {...register("sector")}
//                     placeholder="Ejemplo: Quisco Centro"
//                     className={`mt-1 block w-full px-3 py-2 border ${
//                       errors.sector ? "border-red-500" : "border-gray-300"
//                     } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
//                   />
//                 </div>

//                 <div>
//                   <label
//                     htmlFor="email"
//                     className="block text-sm font-medium text-gray-700"
//                   >
//                     Email <span className="text-red-500">*</span> (Alumno o
//                     apoderado en su defecto)
//                   </label>
//                   <input
//                     type="email"
//                     {...register("email")}
//                     placeholder="Ejemplo: nombre@ejemplo.com"
//                     className={`mt-1 block w-full px-3 py-2 border ${
//                       errors.email ? "border-red-500" : "border-gray-300"
//                     } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
//                   />
//                   {errors.email && (
//                     <p className="text-red-500 text-sm">
//                       {errors.email.message}
//                     </p>
//                   )}
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">
//                     Contraseña <span className="text-red-500">*</span>
//                   </label>
//                   <div className="relative">
//                     <input
//                       type={showPasswords.login ? "text" : "password"}
//                       {...register("clave")}
//                       className={`mt-1 w-full block px-3 py-2 border ${
//                         errors.clave ? "border-red-500" : "border-gray-300"
//                       } rounded-md shadow-sm focus:outline-none focus:ring-[#E91E63] focus:border-[#E91E63]`}
//                     />
//                     <button
//                       type="button"
//                       onClick={() => togglePasswordVisibility("login")}
//                       className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
//                     >
//                       <svg
//                         xmlns="http://www.w3.org/2000/svg"
//                         className="size-5"
//                         fill="none"
//                         viewBox="0 0 24 24"
//                         stroke="currentColor"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth="2"
//                           d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
//                         />
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth="2"
//                           d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
//                         />
//                       </svg>
//                     </button>
//                   </div>
//                   {errors.clave && (
//                     <p className="text-red-500 text-sm">
//                       {errors.clave.message}
//                     </p>
//                   )}
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">
//                     Confirmación contraseña{" "}
//                     <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="password"
//                     {...register("clave2")}
//                     className={`mt-1 w-full block px-3 py-2 border ${
//                       errors.clave2 ? "border-red-500" : "border-gray-300"
//                     } rounded-md shadow-sm focus:outline-none focus:ring-[#E91E63] focus:border-[#E91E63]`}
//                   />
//                   {errors.clave2 && (
//                     <p className="text-red-500 text-sm">
//                       {errors.clave2.message}
//                     </p>
//                   )}
//                 </div>
//               </div>
//             </fieldset>

//             {/* Información académica */}
//             <fieldset className="border border-solid border-gray-300 p-3">
//               <legend className="text-sm font-medium text-gray-700">
//                 Información académica
//               </legend>
//               <div className="space-y-4 mt-3">
//                 <div>
//                   <label
//                     htmlFor="ultimo_establecimiento"
//                     className="block text-sm font-medium text-gray-700"
//                   >
//                     Último establecimiento{" "}
//                     <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     {...register("ultimo_establecimiento")}
//                     placeholder="Ejemplo: Escuela Mirasol"
//                     className={`mt-1 block w-full px-3 py-2 border ${
//                       errors.ultimo_establecimiento
//                         ? "border-red-500"
//                         : "border-gray-300"
//                     } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
//                   />
//                   {errors.ultimo_establecimiento && (
//                     <p className="text-red-500 text-sm">
//                       {errors.ultimo_establecimiento.message}
//                     </p>
//                   )}
//                 </div>

//                 <div>
//                   <label
//                     htmlFor="ultimo_nivel_cursado"
//                     className="block text-sm font-medium text-gray-700"
//                   >
//                     Último nivel cursado <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     {...register("ultimo_nivel_cursado")}
//                     placeholder="Ejemplo: 2° Básico"
//                     className={`mt-1 block w-full px-3 py-2 border ${
//                       errors.ultimo_nivel_cursado
//                         ? "border-red-500"
//                         : "border-gray-300"
//                     } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
//                   />
//                   {errors.ultimo_nivel_cursado && (
//                     <p className="text-red-500 text-sm">
//                       {errors.ultimo_nivel_cursado.message}
//                     </p>
//                   )}
//                 </div>

//                 <div>
//                   <label
//                     htmlFor="incidencia_academica"
//                     className="block text-sm font-medium text-gray-700"
//                   >
//                     Incidencia académica (opcional)
//                   </label>
//                   <input
//                     {...register("incidencia_academica")}
//                     placeholder="Ejemplo: No Aplica"
//                     className={`mt-1 block w-full px-3 py-2 border ${
//                       errors.incidencia_academica
//                         ? "border-red-500"
//                         : "border-gray-300"
//                     } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">
//                     ¿Requiere apoyo especial?{" "}
//                     <span className="text-red-500">*</span>
//                   </label>
//                   <div className="flex space-x-4 mt-1">
//                     <label className="inline-flex items-center">
//                       <input
//                         type="radio"
//                         value="1"
//                         {...register("flag_apoyo_especial")}
//                       />
//                       <span className="ml-2 text-sm text-gray-700">Sí</span>
//                     </label>
//                     <label className="inline-flex items-center">
//                       <input
//                         type="radio"
//                         value="0"
//                         {...register("flag_apoyo_especial")}
//                       />
//                       <span className="ml-2 text-sm text-gray-700">No</span>
//                     </label>
//                   </div>
//                   {errors.flag_apoyo_especial && (
//                     <p className="text-red-500 text-sm">
//                       {errors.flag_apoyo_especial.message}
//                     </p>
//                   )}
//                   {watch("flag_apoyo_especial") === "1" && (
//                     <div className="mt-2">
//                       <input
//                         {...register("apoyo_especial")}
//                         placeholder="Especifique el tipo de apoyo especial"
//                         className={`block w-full px-3 py-2 border ${
//                           errors.apoyo_especial
//                             ? "border-red-500"
//                             : "border-gray-300"
//                         } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
//                       />
//                       {errors.apoyo_especial && (
//                         <p className="text-red-500 text-sm">
//                           {errors.apoyo_especial.message}
//                         </p>
//                       )}
//                     </div>
//                   )}
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">
//                     ¿Da consentimiento para recibir apoyo especial?{" "}
//                     <span className="text-red-500">*</span>
//                   </label>
//                   <div className="flex space-x-4 mt-1">
//                     <label className="inline-flex items-center">
//                       <input
//                         type="radio"
//                         value="1"
//                         {...register("consentimiento_apoyo_especial")}
//                       />
//                       <span className="ml-2 text-sm text-gray-700">Sí</span>
//                     </label>
//                     <label className="inline-flex items-center">
//                       <input
//                         type="radio"
//                         value="0"
//                         {...register("consentimiento_apoyo_especial")}
//                       />
//                       <span className="ml-2 text-sm text-gray-700">No</span>
//                     </label>
//                   </div>
//                   {errors.consentimiento_apoyo_especial && (
//                     <p className="text-red-500 text-sm">
//                       {errors.consentimiento_apoyo_especial.message}
//                     </p>
//                   )}
//                   {watch("consentimiento_apoyo_especial") === "1" && (
//                     <div className="mt-2">
//                       <input
//                         {...register("razon_consentimiento_apoyo_especial")}
//                         placeholder="Especifique la razón del consentimiento"
//                         className={`block w-full px-3 py-2 border ${
//                           errors.razon_consentimiento_apoyo_especial
//                             ? "border-red-500"
//                             : "border-gray-300"
//                         } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
//                       />
//                     </div>
//                   )}
//                 </div>

//                 <div>
//                   <label
//                     htmlFor="rezago"
//                     className="block text-sm font-medium text-gray-700"
//                   >
//                     Rezago escolar
//                   </label>
//                   <input
//                     {...register("rezago")}
//                     placeholder="Ejemplo: No registra, En proceso, etc."
//                     className={`mt-1 block w-full px-3 py-2 border ${
//                       errors.rezago ? "border-red-500" : "border-gray-300"
//                     } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
//                   />
//                 </div>

//                 <div>
//                   <label
//                     htmlFor="id_curso"
//                     className="block text-sm font-medium text-gray-700"
//                   >
//                     Curso al que entrará el estudiante{" "}
//                     <span className="text-red-500">*</span>
//                   </label>
//                   <select
//                     {...register("id_curso")}
//                     className={`mt-1 block px-3 py-2 border ${
//                       errors.id_curso ? "border-red-500" : "border-gray-300"
//                     } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
//                   >
//                     {loading && <option value="">Cargando cursos...</option>}
//                     {error && <option value="">Error al cargar cursos</option>}
//                     {!loading &&
//                       cursos.map((curso) => (
//                         <option key={curso.id_curso} value={curso.id_curso}>
//                           {curso.nombre_curso}
//                         </option>
//                       ))}
//                   </select>
//                   {errors.id_curso && (
//                     <p className="text-red-500 text-sm">
//                       {errors.id_curso.message}
//                     </p>
//                   )}
//                 </div>
//               </div>
//             </fieldset>

//             {/* Información de contactos */}
//             <fieldset className="border border-solid border-gray-300 p-3">
//               <legend className="text-sm text-gray-700">
//                 Información de contactos
//               </legend>
//               <div className="space-y-4 mt-3">
//                 <h3 className="text-base font-semibold text-gray-700">
//                   Apoderado/a Principal
//                 </h3>
//                 <div>
//                   <label
//                     htmlFor="nombres_apoderado1"
//                     className="block text-sm font-medium text-gray-700"
//                   >
//                     Nombres <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     {...register("nombres_apoderado1")}
//                     placeholder="Ejemplo: Agustina Pascal"
//                     className={`mt-1 block w-full px-3 py-2 border ${
//                       errors.nombres_apoderado1
//                         ? "border-red-500"
//                         : "border-gray-300"
//                     } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
//                   />
//                   {errors.nombres_apoderado1 && (
//                     <p className="text-red-500 text-sm">
//                       {errors.nombres_apoderado1.message}
//                     </p>
//                   )}
//                 </div>

//                 <div>
//                   <label
//                     htmlFor="apellidos_apoderado1"
//                     className="block text-sm font-medium text-gray-700"
//                   >
//                     Apellidos <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     {...register("apellidos_apoderado1")}
//                     placeholder="Ejemplo: González Acevedo"
//                     className={`mt-1 block w-full px-3 py-2 border ${
//                       errors.apellidos_apoderado1
//                         ? "border-red-500"
//                         : "border-gray-300"
//                     } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
//                   />
//                   {errors.apellidos_apoderado1 && (
//                     <p className="text-red-500 text-sm">
//                       {errors.apellidos_apoderado1.message}
//                     </p>
//                   )}
//                 </div>

//                 <div>
//                   <label
//                     htmlFor="rut_apoderado1"
//                     className="block text-sm font-medium text-gray-700"
//                   >
//                     RUT <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     {...register("rut_apoderado1")}
//                     placeholder="Ejemplo: 12345678-9"
//                     className={`mt-1 block px-3 py-2 border ${
//                       errors.rut_apoderado1
//                         ? "border-red-500"
//                         : "border-gray-300"
//                     } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
//                   />
//                   {errors.rut_apoderado1 && (
//                     <p className="text-red-500 text-sm">
//                       {errors.rut_apoderado1.message}
//                     </p>
//                   )}
//                 </div>

//                 <div>
//                   <label
//                     htmlFor="tipo_rut_apoderado1"
//                     className="block text-sm font-medium text-gray-700"
//                   >
//                     Tipo de RUT <span className="text-red-500">*</span>
//                   </label>
//                   <select
//                     {...register("tipo_rut_apoderado1")}
//                     className={`mt-1 block px-3 py-2 border ${
//                       errors.tipo_rut_apoderado1
//                         ? "border-red-500"
//                         : "border-gray-300"
//                     } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
//                   >
//                     <option value="">Seleccione una opción</option>
//                     <option value="RUT">RUT</option>
//                     <option value="RUT_EXTRANJERO">RUT Extranjero</option>
//                     <option value="PASAPORTE">Pasaporte</option>
//                     <option value="OTRO">Otro</option>
//                   </select>
//                   {errors.tipo_rut_apoderado1 && (
//                     <p className="text-red-500 text-sm">
//                       {errors.tipo_rut_apoderado1.message}
//                     </p>
//                   )}
//                 </div>

//                 <div>
//                   <label
//                     htmlFor="nacionalidad_apoderado1"
//                     className="block text-sm font-medium text-gray-700"
//                   >
//                     Nacionalidad <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     {...register("nacionalidad_apoderado1")}
//                     placeholder="Ejemplo: Chileno/a, Colombiano/a"
//                     className={`mt-1 block w-full px-3 py-2 border ${
//                       errors.nacionalidad_apoderado1
//                         ? "border-red-500"
//                         : "border-gray-300"
//                     } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
//                   />
//                   {errors.nacionalidad_apoderado1 && (
//                     <p className="text-red-500 text-sm">
//                       {errors.nacionalidad_apoderado1.message}
//                     </p>
//                   )}
//                 </div>

//                 <div>
//                   <label
//                     htmlFor="vinculo_apoderado1"
//                     className="block text-sm font-medium text-gray-700"
//                   >
//                     Vínculo con el/la alumno/a{" "}
//                     <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     {...register("vinculo_apoderado1")}
//                     placeholder="Ejemplo: Madre, Padre, Tutor/a"
//                     className={`mt-1 block w-full px-3 py-2 border ${
//                       errors.vinculo_apoderado1
//                         ? "border-red-500"
//                         : "border-gray-300"
//                     } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
//                   />
//                   {errors.vinculo_apoderado1 && (
//                     <p className="text-red-500 text-sm">
//                       {errors.vinculo_apoderado1.message}
//                     </p>
//                   )}
//                 </div>

//                 <div>
//                   <label
//                     htmlFor="celular_apoderado1"
//                     className="block text-sm font-medium text-gray-700"
//                   >
//                     Celular <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     {...register("celular_apoderado1")}
//                     placeholder="Ejemplo: 987654321"
//                     className={`mt-1 block px-3 py-2 border ${
//                       errors.celular_apoderado1
//                         ? "border-red-500"
//                         : "border-gray-300"
//                     } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
//                   />
//                   {errors.celular_apoderado1 && (
//                     <p className="text-red-500 text-sm">
//                       {errors.celular_apoderado1.message}
//                     </p>
//                   )}
//                 </div>

//                 <div>
//                   <label
//                     htmlFor="email_apoderado1"
//                     className="block text-sm font-medium text-gray-700"
//                   >
//                     Email <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="email"
//                     {...register("email_apoderado1")}
//                     placeholder="Ejemplo: nombre@ejemplo.com"
//                     className={`mt-1 block w-full px-3 py-2 border ${
//                       errors.email_apoderado1
//                         ? "border-red-500"
//                         : "border-gray-300"
//                     } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
//                   />
//                   {errors.email_apoderado1 && (
//                     <p className="text-red-500 text-sm">
//                       {errors.email_apoderado1.message}
//                     </p>
//                   )}
//                 </div>

//                 <div>
//                   <label
//                     htmlFor="direccion_apoderado1"
//                     className="block text-sm font-medium text-gray-700"
//                   >
//                     Dirección <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     {...register("direccion_apoderado1")}
//                     placeholder="Ejemplo: Avenida España Sin Número"
//                     className={`mt-1 block w-full px-3 py-2 border ${
//                       errors.direccion_apoderado1
//                         ? "border-red-500"
//                         : "border-gray-300"
//                     } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
//                   />
//                   {errors.direccion_apoderado1 && (
//                     <p className="text-red-500 text-sm">
//                       {errors.direccion_apoderado1.message}
//                     </p>
//                   )}
//                 </div>

//                 <div>
//                   <label
//                     htmlFor="comuna_apoderado1"
//                     className="block text-sm font-medium text-gray-700"
//                   >
//                     Comuna <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     {...register("comuna_apoderado1")}
//                     placeholder="Ejemplo: El Quisco"
//                     className={`mt-1 block w-full px-3 py-2 border ${
//                       errors.comuna_apoderado1
//                         ? "border-red-500"
//                         : "border-gray-300"
//                     } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
//                   />
//                   {errors.comuna_apoderado1 && (
//                     <p className="text-red-500 text-sm">
//                       {errors.comuna_apoderado1.message}
//                     </p>
//                   )}
//                 </div>

//                 <div>
//                   <label
//                     htmlFor="nucleo_familiar"
//                     className="block text-sm font-medium text-gray-700"
//                   >
//                     Ingrese la cantidad de personas que componen el núcleo
//                     familiar del alumno <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="number"
//                     {...register("nucleo_familiar")}
//                     placeholder="Ejemplo: 1, 2, 3, etc..."
//                     className={`mt-1 block px-3 py-2 border ${
//                       errors.nucleo_familiar
//                         ? "border-red-500"
//                         : "border-gray-300"
//                     } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
//                     min={0}
//                   />
//                   {errors.nucleo_familiar && (
//                     <p className="text-red-500 text-sm">
//                       {errors.nucleo_familiar.message}
//                     </p>
//                   )}
//                 </div>
//               </div>

//               <div className="space-y-4 mt-6">
//                 <h3 className="text-base font-semibold text-gray-700">
//                   Apoderado/a Secundario (Opcional)
//                 </h3>
//                 <div>
//                   <label
//                     htmlFor="nombres_apoderado2"
//                     className="block text-sm font-medium text-gray-700"
//                   >
//                     Nombres
//                   </label>
//                   <input
//                     {...register("nombres_apoderado2")}
//                     placeholder="Ejemplo: Valeria Meneses"
//                     className={`mt-1 block w-full px-3 py-2 border ${
//                       errors.nombres_apoderado2
//                         ? "border-red-500"
//                         : "border-gray-300"
//                     } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
//                   />
//                 </div>

//                 <div>
//                   <label
//                     htmlFor="apellidos_apoderado2"
//                     className="block text-sm font-medium text-gray-700"
//                   >
//                     Apellidos
//                   </label>
//                   <input
//                     {...register("apellidos_apoderado2")}
//                     placeholder="Ejemplo: Oscar Villarroel"
//                     className={`mt-1 block w-full px-3 py-2 border ${
//                       errors.apellidos_apoderado2
//                         ? "border-red-500"
//                         : "border-gray-300"
//                     } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
//                   />
//                 </div>

//                 <div>
//                   <label
//                     htmlFor="celular_apoderado2"
//                     className="block text-sm font-medium text-gray-700"
//                   >
//                     Celular
//                   </label>
//                   <input
//                     {...register("celular_apoderado2")}
//                     placeholder="Ejemplo: 981569877"
//                     className={`mt-1 block px-3 py-2 border ${
//                       errors.celular_apoderado2
//                         ? "border-red-500"
//                         : "border-gray-300"
//                     } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
//                   />
//                   {errors.celular_apoderado2 && (
//                     <p className="text-red-500 text-sm">
//                       {errors.celular_apoderado2.message}
//                     </p>
//                   )}
//                 </div>
//               </div>

//               <div className="space-y-4 mt-6">
//                 <h3 className="text-base font-semibold text-gray-700">
//                   Contacto de Emergencia
//                 </h3>
//                 <div>
//                   <label
//                     htmlFor="nombres_contacto"
//                     className="block text-sm font-medium text-gray-700"
//                   >
//                     Nombres <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     {...register("nombres_contacto")}
//                     placeholder="Ejemplo: Aldo Jorge"
//                     className={`mt-1 block w-full px-3 py-2 border ${
//                       errors.nombres_contacto
//                         ? "border-red-500"
//                         : "border-gray-300"
//                     } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
//                   />
//                   {errors.nombres_contacto && (
//                     <p className="text-red-500 text-sm">
//                       {errors.nombres_contacto.message}
//                     </p>
//                   )}
//                 </div>

//                 <div>
//                   <label
//                     htmlFor="apellidos_contacto"
//                     className="block text-sm font-medium text-gray-700"
//                   >
//                     Apellidos <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     {...register("apellidos_contacto")}
//                     placeholder="Ejemplo: Zarate Carreño"
//                     className={`mt-1 block w-full px-3 py-2 border ${
//                       errors.apellidos_contacto
//                         ? "border-red-500"
//                         : "border-gray-300"
//                     } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
//                   />
//                   {errors.apellidos_contacto && (
//                     <p className="text-red-500 text-sm">
//                       {errors.apellidos_contacto.message}
//                     </p>
//                   )}
//                 </div>

//                 <div>
//                   <label
//                     htmlFor="celular_contacto"
//                     className="block text-sm font-medium text-gray-700"
//                   >
//                     Celular <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     {...register("celular_contacto")}
//                     placeholder="Ejemplo: 999027852"
//                     className={`mt-1 block px-3 py-2 border ${
//                       errors.celular_contacto
//                         ? "border-red-500"
//                         : "border-gray-300"
//                     } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
//                   />
//                   {errors.celular_contacto && (
//                     <p className="text-red-500 text-sm">
//                       {errors.celular_contacto.message}
//                     </p>
//                   )}
//                 </div>

//                 <div>
//                   <label
//                     htmlFor="vinculo_contacto"
//                     className="block text-sm font-medium text-gray-700"
//                   >
//                     Vínculo con el/la alumno/a{" "}
//                     <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     {...register("vinculo_contacto")}
//                     placeholder="Ejemplo: Padre, Madre, Tutor/a"
//                     className={`mt-1 block w-full px-3 py-2 border ${
//                       errors.vinculo_contacto
//                         ? "border-red-500"
//                         : "border-gray-300"
//                     } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
//                   />
//                   {errors.vinculo_contacto && (
//                     <p className="text-red-500 text-sm">
//                       {errors.vinculo_contacto.message}
//                     </p>
//                   )}
//                 </div>
//               </div>
//             </fieldset>

//             {/* Información médica */}
//             <fieldset className="border border-solid border-gray-300 p-3">
//               <legend className="text-sm text-gray-700">
//                 Información médica
//               </legend>
//               <div className="space-y-4 mt-3">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">
//                     ¿Tiene control médico regular?{" "}
//                     <span className="text-red-500">*</span>
//                   </label>
//                   <div className="flex space-x-4 mt-1">
//                     <label className="inline-flex items-center">
//                       <input
//                         type="radio"
//                         value="1"
//                         {...register("flag_control_medico")}
//                       />
//                       <span className="ml-2 text-sm text-gray-700">Sí</span>
//                     </label>
//                     <label className="inline-flex items-center">
//                       <input
//                         type="radio"
//                         value="0"
//                         {...register("flag_control_medico")}
//                       />
//                       <span className="ml-2 text-sm text-gray-700">No</span>
//                     </label>
//                   </div>
//                   {errors.flag_control_medico && (
//                     <p className="text-red-500 text-sm">
//                       {errors.flag_control_medico.message}
//                     </p>
//                   )}
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">
//                     ¿Tiene alguna discapacidad?{" "}
//                     <span className="text-red-500">*</span>
//                   </label>
//                   <div className="flex space-x-4 mt-1">
//                     <label className="inline-flex items-center">
//                       <input
//                         type="radio"
//                         value="1"
//                         {...register("flag_discapacidad")}
//                       />
//                       <span className="ml-2 text-sm text-gray-700">Sí</span>
//                     </label>
//                     <label className="inline-flex items-center">
//                       <input
//                         type="radio"
//                         value="0"
//                         {...register("flag_discapacidad")}
//                       />
//                       <span className="ml-2 text-sm text-gray-700">No</span>
//                     </label>
//                   </div>
//                   {errors.flag_discapacidad && (
//                     <p className="text-red-500 text-sm">
//                       {errors.flag_discapacidad.message}
//                     </p>
//                   )}
//                   {watch("flag_discapacidad") === "1" && (
//                     <div className="mt-2">
//                       <input
//                         {...register("discapacidad")}
//                         placeholder="Especifique la discapacidad"
//                         className={`block w-full px-3 py-2 border ${
//                           errors.discapacidad
//                             ? "border-red-500"
//                             : "border-gray-300"
//                         } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
//                       />
//                       {errors.discapacidad && (
//                         <p className="text-red-500 text-sm">
//                           {errors.discapacidad.message}
//                         </p>
//                       )}
//                     </div>
//                   )}
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">
//                     ¿Tiene alguna necesidad educativa especial?{" "}
//                     <span className="text-red-500">*</span>
//                   </label>
//                   <div className="flex space-x-4 mt-1">
//                     <label className="inline-flex items-center">
//                       <input
//                         type="radio"
//                         value="1"
//                         {...register("flag_necesidad_especial")}
//                       />
//                       <span className="ml-2 text-sm text-gray-700">Sí</span>
//                     </label>
//                     <label className="inline-flex items-center">
//                       <input
//                         type="radio"
//                         value="0"
//                         {...register("flag_necesidad_especial")}
//                       />
//                       <span className="ml-2 text-sm text-gray-700">No</span>
//                     </label>
//                   </div>
//                   {errors.flag_necesidad_especial && (
//                     <p className="text-red-500 text-sm">
//                       {errors.flag_necesidad_especial.message}
//                     </p>
//                   )}
//                   {watch("flag_necesidad_especial") === "1" && (
//                     <div className="mt-2">
//                       <input
//                         {...register("necesidad_especial")}
//                         placeholder="Especifique la necesidad especial"
//                         className={`block w-full px-3 py-2 border ${
//                           errors.necesidad_especial
//                             ? "border-red-500"
//                             : "border-gray-300"
//                         } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
//                       />
//                       {errors.necesidad_especial && (
//                         <p className="text-red-500 text-sm">
//                           {errors.necesidad_especial.message}
//                         </p>
//                       )}
//                     </div>
//                   )}
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">
//                     ¿Tiene alguna enfermedad?{" "}
//                     <span className="text-red-500">*</span>
//                   </label>
//                   <div className="flex space-x-4 mt-1">
//                     <label className="inline-flex items-center">
//                       <input
//                         type="radio"
//                         value="1"
//                         {...register("flag_enfermedad")}
//                       />
//                       <span className="ml-2 text-sm text-gray-700">Sí</span>
//                     </label>
//                     <label className="inline-flex items-center">
//                       <input
//                         type="radio"
//                         value="0"
//                         {...register("flag_enfermedad")}
//                       />
//                       <span className="ml-2 text-sm text-gray-700">No</span>
//                     </label>
//                   </div>
//                   {errors.flag_enfermedad && (
//                     <p className="text-red-500 text-sm">
//                       {errors.flag_enfermedad.message}
//                     </p>
//                   )}
//                   {watch("flag_enfermedad") === "1" && (
//                     <div className="mt-2">
//                       <input
//                         {...register("enfermedad")}
//                         placeholder="Especifique la enfermedad"
//                         className={`block w-full px-3 py-2 border ${
//                           errors.enfermedad
//                             ? "border-red-500"
//                             : "border-gray-300"
//                         } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
//                       />
//                       {errors.enfermedad && (
//                         <p className="text-red-500 text-sm">
//                           {errors.enfermedad.message}
//                         </p>
//                       )}
//                     </div>
//                   )}
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">
//                     ¿Toma medicamentos regularmente?{" "}
//                     <span className="text-red-500">*</span>
//                   </label>
//                   <div className="flex space-x-4 mt-1">
//                     <label className="inline-flex items-center">
//                       <input
//                         type="radio"
//                         value="1"
//                         {...register("flag_medicamentos")}
//                       />
//                       <span className="ml-2 text-sm text-gray-700">Sí</span>
//                     </label>
//                     <label className="inline-flex items-center">
//                       <input
//                         type="radio"
//                         value="0"
//                         {...register("flag_medicamentos")}
//                       />
//                       <span className="ml-2 text-sm text-gray-700">No</span>
//                     </label>
//                   </div>
//                   {errors.flag_medicamentos && (
//                     <p className="text-red-500 text-sm">
//                       {errors.flag_medicamentos.message}
//                     </p>
//                   )}
//                   {watch("flag_medicamentos") === "1" && (
//                     <div className="mt-2">
//                       <input
//                         {...register("medicamentos")}
//                         placeholder="Especifique los medicamentos"
//                         className={`block w-full px-3 py-2 border ${
//                           errors.medicamentos
//                             ? "border-red-500"
//                             : "border-gray-300"
//                         } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
//                       />
//                       {errors.medicamentos && (
//                         <p className="text-red-500 text-sm">
//                           {errors.medicamentos.message}
//                         </p>
//                       )}
//                     </div>
//                   )}
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700">
//                     ¿Tiene alguna alergia?{" "}
//                     <span className="text-red-500">*</span>
//                   </label>
//                   <div className="flex space-x-4 mt-1">
//                     <label className="inline-flex items-center">
//                       <input
//                         type="radio"
//                         value="1"
//                         {...register("flag_alergia")}
//                       />
//                       <span className="ml-2 text-sm text-gray-700">Sí</span>
//                     </label>
//                     <label className="inline-flex items-center">
//                       <input
//                         type="radio"
//                         value="0"
//                         {...register("flag_alergia")}
//                       />
//                       <span className="ml-2 text-sm text-gray-700">No</span>
//                     </label>
//                   </div>
//                   {errors.flag_alergia && (
//                     <p className="text-red-500 text-sm">
//                       {errors.flag_alergia.message}
//                     </p>
//                   )}
//                   {watch("flag_alergia") === "1" && (
//                     <div className="mt-2">
//                       <input
//                         {...register("alergia")}
//                         placeholder="Especifique la alergia"
//                         className={`block w-full px-3 py-2 border ${
//                           errors.alergia ? "border-red-500" : "border-gray-300"
//                         } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
//                       />
//                       {errors.alergia && (
//                         <p className="text-red-500 text-sm">
//                           {errors.alergia.message}
//                         </p>
//                       )}
//                     </div>
//                   )}
//                 </div>

//                 <div>
//                   <label
//                     htmlFor="prevision_medica"
//                     className="block text-sm font-medium text-gray-700"
//                   >
//                     Previsión médica <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     {...register("prevision_medica")}
//                     placeholder="Ejemplo: Fonasa, Isapre"
//                     className={`mt-1 block w-full px-3 py-2 border ${
//                       errors.prevision_medica
//                         ? "border-red-500"
//                         : "border-gray-300"
//                     } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
//                   />
//                   {errors.prevision_medica && (
//                     <p className="text-red-500 text-sm">
//                       {errors.prevision_medica.message}
//                     </p>
//                   )}
//                 </div>

//                 <div>
//                   <label
//                     htmlFor="servicio_emergencia"
//                     className="block text-sm font-medium text-gray-700"
//                   >
//                     Servicio de emergencia{" "}
//                     <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     {...register("servicio_emergencia")}
//                     placeholder="Ejemplo: Cesfam, Particular"
//                     className={`mt-1 block w-full px-3 py-2 border ${
//                       errors.servicio_emergencia
//                         ? "border-red-500"
//                         : "border-gray-300"
//                     } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
//                   />
//                   {errors.servicio_emergencia && (
//                     <p className="text-red-500 text-sm">
//                       {errors.servicio_emergencia.message}
//                     </p>
//                   )}
//                 </div>
//               </div>
//             </fieldset>

//             {/* Documentos requeridos */}
//             <fieldset className="border border-solid border-gray-300 p-3">
//               <legend className="text-sm text-gray-700">
//                 Documentos requeridos
//               </legend>
//               <div className="space-y-4 mt-3">
//                 <div>
//                   <label
//                     htmlFor="cert_nacimiento"
//                     className="block text-sm font-medium text-gray-700"
//                   >
//                     Certificado de nacimiento (para todo trámite){" "}
//                     <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="file"
//                     {...register("cert_nacimiento")}
//                     className={`mt-1 block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold ${
//                       errors.cert_nacimiento
//                         ? "file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
//                         : "file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
//                     }`}
//                   />
//                   {errors.cert_nacimiento && (
//                     <p className="text-red-500 text-sm">
//                       {errors.cert_nacimiento.message}
//                     </p>
//                   )}
//                 </div>

//                 <div>
//                   <label
//                     htmlFor="cert_estudios"
//                     className="block text-sm font-medium text-gray-700"
//                   >
//                     Certificado de último año cursado y aprobado por el Mineduc{" "}
//                     <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="file"
//                     {...register("cert_estudios")}
//                     className={`mt-1 block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold ${
//                       errors.cert_estudios
//                         ? "file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
//                         : "file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
//                     }`}
//                   />
//                   {errors.cert_estudios && (
//                     <p className="text-red-500 text-sm">
//                       {errors.cert_estudios.message}
//                     </p>
//                   )}
//                 </div>

//                 <div>
//                   <label
//                     htmlFor="cert_rsh"
//                     className="block text-sm font-medium text-gray-700"
//                   >
//                     Registro Social de Hogares (comuna El Quisco){" "}
//                     <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="file"
//                     {...register("cert_rsh")}
//                     className={`mt-1 block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold ${
//                       errors.cert_rsh
//                         ? "file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
//                         : "file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
//                     }`}
//                   />
//                   {errors.cert_rsh && (
//                     <p className="text-red-500 text-sm">
//                       {errors.cert_rsh.message}
//                     </p>
//                   )}
//                 </div>

//                 <div>
//                   <label
//                     htmlFor="cert_carnet"
//                     className="block text-sm font-medium text-gray-700"
//                   >
//                     Fotocopia de carnet del adulto responsable (por ambos lados){" "}
//                     <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="file"
//                     {...register("cert_carnet")}
//                     className={`mt-1 block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold ${
//                       errors.cert_carnet
//                         ? "file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
//                         : "file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
//                     }`}
//                   />
//                   {errors.cert_carnet && (
//                     <p className="text-red-500 text-sm">
//                       {errors.cert_carnet.message}
//                     </p>
//                   )}
//                 </div>

//                 <div>
//                   <label
//                     htmlFor="cert_diagnostico"
//                     className="block text-sm font-medium text-gray-700"
//                   >
//                     Certificado de diagnóstico en caso de que el alumno presente
//                     una necesidad educativa especial
//                   </label>
//                   <input
//                     type="file"
//                     {...register("cert_diagnostico")}
//                     className={`mt-1 block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold ${
//                       errors.cert_diagnostico
//                         ? "file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
//                         : "file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
//                     }`}
//                   />
//                   {errors.cert_diagnostico && (
//                     <p className="text-red-500 text-sm">
//                       {errors.cert_diagnostico.message}
//                     </p>
//                   )}
//                 </div>
//               </div>
//             </fieldset>

//             {/* Términos y condiciones */}
//             <fieldset className="border border-solid border-gray-300 p-3">
//               <legend className="text-sm text-gray-700">
//                 Términos y condiciones
//               </legend>
//               <div className="space-y-3 mt-3">
//                 <div className="flex items-start">
//                   <input
//                     type="checkbox"
//                     {...register("hitos")}
//                     className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border ${
//                       errors.hitos ? "border-red-500" : "border-gray-300"
//                     } rounded`}
//                   />
//                   <label htmlFor="hitos" className="ml-2 text-sm text-gray-700">
//                     Me comprometo a facilitar el acceso, al niño, niña y
//                     adolescente (NNA) a los hitos importantes del programa
//                     Saberes durante todo el año, siendo el último “Saberes
//                     Summer” el cuál finaliza la primera semana de diciembre.
//                     <span className="text-red-500">*</span>
//                   </label>
//                 </div>
//                 {errors.hitos && (
//                   <p className="text-red-500 text-sm">{errors.hitos.message}</p>
//                 )}

//                 <div className="flex items-start">
//                   <input
//                     type="checkbox"
//                     {...register("asistencia")}
//                     className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border ${
//                       errors.asistencia ? "border-red-500" : "border-gray-300"
//                     } rounded`}
//                   />
//                   <label
//                     htmlFor="asistencia"
//                     className="ml-2 text-sm text-gray-700"
//                   >
//                     Me comprometo con la asistencia diaria del/la NNA a clases,
//                     todo el año socioeducativo (marzo a diciembre) para que
//                     participe activamente en el Programa Saberes y así formar
//                     parte del proceso de preparación, orientación, para la
//                     rendición de exámenes libres.
//                     <span className="text-red-500">*</span>
//                   </label>
//                 </div>
//                 {errors.asistencia && (
//                   <p className="text-red-500 text-sm">
//                     {errors.asistencia.message}
//                   </p>
//                 )}

//                 <div className="flex items-start">
//                   <input
//                     type="checkbox"
//                     {...register("seguro_beneficio")}
//                     className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border ${
//                       errors.seguro_beneficio
//                         ? "border-red-500"
//                         : "border-gray-300"
//                     } rounded`}
//                   />
//                   <label
//                     htmlFor="seguro_beneficio"
//                     className="ml-2 text-sm text-gray-700"
//                   >
//                     Estoy en conocimiento que “Saberes” es un modelo alternativo
//                     de educación (escuela libre) dependiente de Dideco y no
//                     cuenta con seguro escolar, ni convenio directo con Junaeb.
//                     <span className="text-red-500">*</span>
//                   </label>
//                 </div>
//                 {errors.seguro_beneficio && (
//                   <p className="text-red-500 text-sm">
//                     {errors.seguro_beneficio.message}
//                   </p>
//                 )}

//                 <div className="flex items-start">
//                   <input
//                     type="checkbox"
//                     {...register("reuniones")}
//                     className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border ${
//                       errors.reuniones ? "border-red-500" : "border-gray-300"
//                     } rounded`}
//                   />
//                   <label
//                     htmlFor="reuniones"
//                     className="ml-2 text-sm text-gray-700"
//                   >
//                     Me comprometo a participar en la Escuela de Padres y de
//                     reuniones de contenido programadas por los docentes del
//                     equipo Saberes, en la búsqueda de una mayor integración del
//                     NNA y familia. En el caso de no poder asistir, enviaré a un
//                     adulto responsable en mi representación.
//                     <span className="text-red-500">*</span>
//                   </label>
//                 </div>
//                 {errors.reuniones && (
//                   <p className="text-red-500 text-sm">
//                     {errors.reuniones.message}
//                   </p>
//                 )}

//                 <div className="flex items-start">
//                   <input
//                     type="checkbox"
//                     {...register("apoyo_especial_consent")}
//                     className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border ${
//                       errors.apoyo_especial
//                         ? "border-red-500"
//                         : "border-gray-300"
//                     } rounded`}
//                   />
//                   <label
//                     htmlFor="apoyo_especial_consent"
//                     className="ml-2 text-sm text-gray-700"
//                   >
//                     En el caso de que mi hijo/a presente una necesidad educativa
//                     especial, me comprometo a acompañarlo en su proceso con el
//                     apoyo del Programa Saberes o de forma particular, para
//                     garantizar el avance de su aprendizaje.
//                     <span className="text-red-500">*</span>
//                   </label>
//                 </div>
//                 {errors.apoyo_especial && (
//                   <p className="text-red-500 text-sm">
//                     {errors.apoyo_especial.message}
//                   </p>
//                 )}

//                 <div className="flex items-start">
//                   <input
//                     type="checkbox"
//                     {...register("sedes")}
//                     className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border ${
//                       errors.sedes ? "border-red-500" : "border-gray-300"
//                     } rounded`}
//                   />
//                   <label htmlFor="sedes" className="ml-2 text-sm text-gray-700">
//                     Estoy consciente que los espacios educativos (aulas
//                     adaptadas) del Programa Saberes se llevan a cabo en Sedes
//                     Vecinales.
//                     <span className="text-red-500">*</span>
//                   </label>
//                 </div>
//                 {errors.sedes && (
//                   <p className="text-red-500 text-sm">{errors.sedes.message}</p>
//                 )}

//                 <div className="flex items-start">
//                   <input
//                     type="checkbox"
//                     {...register("multimedia")}
//                     className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border ${
//                       errors.multimedia ? "border-red-500" : "border-gray-300"
//                     } rounded`}
//                   />
//                   <label
//                     htmlFor="multimedia"
//                     className="ml-2 text-sm text-gray-700"
//                   >
//                     Autorizo al/la NNA a que pueda participar de registros
//                     fotográficos y/o audiovisuales en actividades relacionadas
//                     con el programa o la I. Municipalidad de El Quisco (Solo
//                     manejo profesional municipal).
//                     <span className="text-red-500">*</span>
//                   </label>
//                 </div>
//                 {errors.multimedia && (
//                   <p className="text-red-500 text-sm">
//                     {errors.multimedia.message}
//                   </p>
//                 )}

//                 <div className="flex items-start">
//                   <input
//                     type="checkbox"
//                     {...register("cumplimiento_compromisos")}
//                     className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border ${
//                       errors.cumplimiento_compromisos
//                         ? "border-red-500"
//                         : "border-gray-300"
//                     } rounded`}
//                   />
//                   <label
//                     htmlFor="cumplimiento_compromisos"
//                     className="ml-2 text-sm text-gray-700"
//                   >
//                     Me comprometo a velar por el cumplimiento de lo solicitado
//                     en el presente formulario y futuros requerimientos en
//                     beneficio del proceso social y educativo, para propiciar el
//                     avance y aprendizaje del NNA.
//                     <span className="text-red-500">*</span>
//                   </label>
//                 </div>
//                 {errors.cumplimiento_compromisos && (
//                   <p className="text-red-500 text-sm">
//                     {errors.cumplimiento_compromisos.message}
//                   </p>
//                 )}

//                 <div className="flex items-start">
//                   <input
//                     type="checkbox"
//                     {...register("terminos_condiciones")}
//                     className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border ${
//                       errors.terminos_condiciones
//                         ? "border-red-500"
//                         : "border-gray-300"
//                     } rounded`}
//                   />
//                   <label
//                     htmlFor="terminos_condiciones"
//                     className="ml-2 text-sm text-gray-700"
//                   >
//                     He leído y firmado el compromiso adquirido comprendiendo lo
//                     que en él se expone.
//                     <span className="text-red-500">*</span>
//                   </label>
//                 </div>
//                 {errors.terminos_condiciones && (
//                   <p className="text-red-500 text-sm">
//                     {errors.terminos_condiciones.message}
//                   </p>
//                 )}
//               </div>
//             </fieldset>

//             {/* Botón de envío */}
//             <div className="mt-6 w-full flex justify-center">
//               <button
//                 type="submit"
//                 className="py-2.5 px-4 bg-[#E91E63] text-white rounded-md hover:bg-[#C2185B] transition-colors"
//               >
//                 Matricularse
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MatriculaEstudiante;
