"use client";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

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

  const [rutError, setRutError] = useState({
    rut_usuario: "",
    rut_apoderado1: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [emailError, setEmailError] = useState({
    email: "",
    email2: "",
    email_match: "",
    email_apoderado1: "",
  });
  const [phoneError, setPhoneError] = useState({
    celular_apoderado1: "",
    celular_apoderado2: "",
    celular_contacto: "",
  });

  const [flagFields, setFlagFields] = useState({
    flag_apoyo_especial: false,
    consentimiento_apoyo_especial: false,
    flag_discapacidad: false,
    flag_necesidad_especial: false,
    flag_enfermedad: false,
    flag_medicamentos: false,
    flag_alergia: false,
  });

  const [selectedRutTypes, setSelectedRutTypes] = useState({
    rut_tipo: "",
    tipo_rut_apoderado1: "",
  });

  // Handle RUT type selection
  const handleRutTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSelectedRutTypes((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Reset the corresponding RUT input field when type changes
    if (name === "rut_tipo") {
      const rutInput = document.getElementById(
        "rut_usuario"
      ) as HTMLInputElement;
      if (rutInput) {
        rutInput.value = "";
        // Also clear any error messages
        setRutError((prev) => ({
          ...prev,
          rut_usuario: "",
        }));
      }
    } else if (name === "tipo_rut_apoderado1") {
      const rutInput = document.getElementById(
        "rut_apoderado1"
      ) as HTMLInputElement;
      if (rutInput) {
        rutInput.value = "";
        // Also clear any error messages
        setRutError((prev) => ({
          ...prev,
          rut_apoderado1: "",
        }));
      }
    }
  };

  // Function to handle flag field changes
  const handleFlagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFlagFields((prev) => ({
      ...prev,
      [name]: value === "1", // Set to true if value is "1" (Yes)
    }));
  };

  // Modify the handlePhoneFormat function to track errors per field
  const handlePhoneFormat = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let newValue = value;

    // If the input doesn't start with +569, add it
    if (!newValue.startsWith("+569")) {
      newValue = "+569" + newValue.replace(/\D/g, "");
    } else {
      // Keep the +569 prefix and only allow digits after it
      const prefix = "+569";
      const rest = newValue.substring(4).replace(/\D/g, "");
      newValue = prefix + rest;
    }

    // Limit to the correct length (Chilean mobile: +569 + 8 digits)
    if (newValue.length > 12) {
      newValue = newValue.substring(0, 12);
    }

    e.target.value = newValue;

    // Validate the phone number and set error for the specific field
    if (newValue.length === 12) {
      setPhoneError((prev) => ({
        ...prev,
        [name]: "",
      }));
    } else if (newValue.length > 4) {
      // Only show error if user has started typing after +569
      setPhoneError((prev) => ({
        ...prev,
        [name]:
          "El número debe tener el formato +569XXXXXXXX (12 caracteres en total)",
      }));
    }
  };

  // Add email validation function
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Add email matching validation
  const validateEmails = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const formElement = e.target.form as HTMLFormElement;

    if (name === "email" || name === "email2" || name === "email_apoderado1") {
      // First validate the email format
      if (!validateEmail(value)) {
        setEmailError((prev) => ({
          ...prev,
          [name]: "El formato del email no es válido",
        }));
        return false;
      } else {
        setEmailError((prev) => ({
          ...prev,
          [name]: "",
        }));
      }

      // If we're validating either of the student emails, check if they match
      if (name === "email" || name === "email2") {
        const email = formElement?.email?.value || "";
        const email2 = formElement?.email2?.value || "";

        if (email && email2 && email !== email2) {
          setEmailError((prev) => ({
            ...prev,
            email_match: "Los correos electrónicos no coinciden",
          }));
          return false;
        } else if (email && email2 && email === email2) {
          setEmailError((prev) => ({
            ...prev,
            email_match: "",
          }));
        }
      }

      return true;
    }
    return true;
  };

  // Add RUT validation functions
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

  const handleRutFormat = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value.replace(/[^\dkK]/g, ""); // Allow digits and 'k'/'K'

    // Get the corresponding RUT type field name
    const rutTypeName =
      name === "rut_usuario" ? "rut_tipo" : "tipo_rut_apoderado1";
    const rutType =
      selectedRutTypes[rutTypeName as keyof typeof selectedRutTypes];

    // Only format and validate if the RUT type is "RUT"
    if (rutType === "RUT") {
      // Extract the verification digit if present
      let verificationDigit = "";
      if (formattedValue.length > 0 && /[kK\d]$/.test(formattedValue)) {
        verificationDigit = formattedValue.slice(-1);
        // Convert lowercase 'k' to uppercase 'K'
        if (verificationDigit === "k") {
          verificationDigit = "K";
        }
        formattedValue = formattedValue.slice(0, -1);
      }

      // Format only the numeric part - without dots
      const numericPart = formattedValue.replace(/\D/g, "");

      // Add back the verification digit with a hyphen
      if (verificationDigit) {
        e.target.value = `${numericPart}-${verificationDigit}`;
      } else {
        e.target.value = numericPart;
      }

      // Validate the RUT if it has a verification digit
      if (e.target.value.includes("-")) {
        if (!Fn.validaRut(e.target.value)) {
          setRutError((prev) => ({
            ...prev,
            [name]: "RUT inválido",
          }));
        } else {
          setRutError((prev) => ({
            ...prev,
            [name]: "",
          }));
        }
      }
    }
  };

  // Add password validation function
  const validatePassword = (password: string): boolean => {
    const hasMinLength = password.length >= 8;
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(
      password
    );
    const hasNumber = /\d/.test(password);

    if (!hasMinLength || !hasSpecialChar || !hasNumber) {
      setPasswordError(
        "La contraseña debe tener al menos 8 caracteres, un carácter especial y un número"
      );
      return false;
    }

    setPasswordError("");
    return true;
  };

  // Add password matching validation
  const validatePasswords = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const formElement = e.target.form as HTMLFormElement;
    const password = formElement?.clave.value;
    const confirmPassword = formElement?.clave2.value;

    if (name === "clave") {
      validatePassword(value);
    }

    if (name === "clave" || name === "clave2") {
      if (password && confirmPassword && password !== confirmPassword) {
        setPasswordError("Las contraseñas no coinciden");
      } else if (password && !validatePassword(password)) {
        // Already set in validatePassword
      } else if (password && confirmPassword && password === confirmPassword) {
        setPasswordError("");
      }
    }
  };

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

  const resetForm = (formElement: HTMLFormElement) => {
    formElement.reset();

    const radioInputs = formElement.querySelectorAll<HTMLInputElement>(
      'input[type="radio"]'
    );
    radioInputs.forEach((input) => {
      input.checked = false;
    });

    const checkboxInputs = formElement.querySelectorAll<HTMLInputElement>(
      'input[type="checkbox"]'
    );
    checkboxInputs.forEach((input) => {
      input.checked = false;
    });
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formElement = e.target as HTMLFormElement;
    const formData = new FormData(e.target as HTMLFormElement);

    const rut = formData.get("rut_usuario") as string;
    const password = formData.get("clave") as string;
    const confirmPassword = formData.get("clave2") as string;
    const rut2 = formData.get("rut__apoderado1") as string;
    const email = formData.get("email") as string;
    const email2 = formData.get("email2") as string;
    const emailApoderado = formData.get("email_apoderado1") as string;
    const phoneApoderado1 = formData.get("celular_apoderado1") as string;
    const phoneApoderado2 = formData.get("celular_apoderado2") as string;
    const phoneContacto = formData.get("celular_contacto") as string;

    // Validate phone format for primary guardian
    if (phoneApoderado1.length !== 12 || !phoneApoderado1.startsWith("+569")) {
      toast.error(
        "El número de celular del apoderado principal debe tener el formato +569XXXXXXXX"
      );
      return;
    }

    // Validate phone format for secondary guardian if provided
    if (
      phoneApoderado2 &&
      phoneApoderado2.length > 0 &&
      (phoneApoderado2.length !== 12 || !phoneApoderado2.startsWith("+569"))
    ) {
      toast.error(
        "El número de celular del apoderado secundario debe tener el formato +569XXXXXXXX"
      );
      return;
    }

    // Validate phone format for emergency contact
    if (phoneContacto.length !== 12 || !phoneContacto.startsWith("+569")) {
      toast.error(
        "El número de celular del contacto de emergencia debe tener el formato +569XXXXXXXX"
      );
      return;
    }

    // Validate email format
    if (!validateEmail(email)) {
      toast.error("El formato del email del estudiante no es válido");
      return;
    }

    // Validate email confirmation
    if (email !== email2) {
      toast.error("Los correos electrónicos del estudiante no coinciden");
      return;
    }

    if (!validateEmail(emailApoderado)) {
      toast.error("El formato del email del apoderado no es válido");
      return;
    }

    // Validate RUT
    if (!Fn.validaRut(rut)) {
      toast.error("RUT inválido");
      return;
    }

    if (!Fn.validaRut(rut2)) {
      toast.error("RUT inválido");
      return;
    }

    // Validate password format
    if (!validatePassword(password)) {
      toast.error(passwordError);
      return;
    }

    // Validate password matching
    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    const response = await fetch("/api/auth/register/matricula", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      toast.success("Registro exitoso");
      resetForm(formElement);
    } else {
      toast.error("Error en el registro");
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
                    onChange={handleRutTypeChange}
                    value={selectedRutTypes.rut_tipo}
                  >
                    <option value="">Seleccione una opción</option>
                    <option value="RUT">RUT</option>
                    <option value="RUT_EXTRANJERO">RUT Extranjero</option>
                    <option value="PASAPORTE">Pasaporte</option>
                    <option value="OTRO">Otro</option>
                  </select>
                </div>
                {selectedRutTypes.rut_tipo && (
                  <div>
                    <label
                      htmlFor="rut_usuario"
                      className="block text-sm font-medium text-gray-700"
                    >
                      {selectedRutTypes.rut_tipo === "RUT"
                        ? "RUT"
                        : selectedRutTypes.rut_tipo === "RUT_EXTRANJERO"
                        ? "RUT Extranjero"
                        : selectedRutTypes.rut_tipo === "PASAPORTE"
                        ? "Pasaporte"
                        : "Identificación"}{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="rut_usuario"
                      name="rut_usuario"
                      placeholder={
                        selectedRutTypes.rut_tipo === "RUT"
                          ? "Ejemplo: 12345678-9"
                          : "Ingrese su identificación"
                      }
                      className="mt-1 block px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      required
                      onChange={handleRutFormat}
                      maxLength={selectedRutTypes.rut_tipo === "RUT" ? 11 : 20}
                    />
                    {rutError.rut_usuario &&
                      selectedRutTypes.rut_tipo === "RUT" && (
                        <p className="mt-1 text-sm text-red-600">
                          {rutError.rut_usuario}
                        </p>
                      )}
                  </div>
                )}
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
                    onChange={validateEmails}
                  />
                  {emailError.email && (
                    <p className="mt-1 text-sm text-red-600">
                      {emailError.email}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="email2"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Confirmar Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email2"
                    name="email2"
                    placeholder="Confirme el email ingresado anteriormente"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                    onChange={validateEmails}
                  />
                  {emailError.email2 && (
                    <p className="mt-1 text-sm text-red-600">
                      {emailError.email2}
                    </p>
                  )}
                  {emailError.email_match && (
                    <p className="mt-1 text-sm text-red-600">
                      {emailError.email_match}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Contraseña <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.login ? "text" : "password"}
                      name="clave"
                      required
                      onChange={validatePasswords}
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
                  {passwordError && (
                    <p className="mt-1 text-sm text-red-600">{passwordError}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Confirmación Contraseña{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    name="clave2"
                    required
                    onChange={validatePasswords}
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
                        onChange={handleFlagChange}
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
                        onChange={handleFlagChange}
                        defaultChecked
                      />
                      <span className="ml-2 text-sm text-gray-700">No</span>
                    </label>
                  </div>
                  {flagFields.flag_apoyo_especial && (
                    <div className="mt-2">
                      <input
                        type="text"
                        id="apoyo_especial"
                        name="apoyo_especial"
                        placeholder="Especifique el tipo de apoyo especial"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                      />
                    </div>
                  )}
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
                        onChange={handleFlagChange}
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
                        onChange={handleFlagChange}
                        defaultChecked
                      />
                      <span className="ml-2 text-sm text-gray-700">No</span>
                    </label>
                  </div>
                  {flagFields.consentimiento_apoyo_especial && (
                    <div className="mt-2">
                      <input
                        type="text"
                        id="razon_consentimiento_apoyo_especial"
                        name="razon_consentimiento_apoyo_especial"
                        placeholder="Especifique la razón del consentimiento"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                      />
                    </div>
                  )}
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
                    onChange={handleRutTypeChange}
                    value={selectedRutTypes.tipo_rut_apoderado1}
                  >
                    <option value="">Seleccione una opción</option>
                    <option value="RUT">RUT</option>
                    <option value="RUT_EXTRANJERO">RUT Extranjero</option>
                    <option value="PASAPORTE">Pasaporte</option>
                    <option value="OTRO">Otro</option>
                  </select>
                </div>
                {selectedRutTypes.tipo_rut_apoderado1 && (
                  <div>
                    <label
                      htmlFor="rut_apoderado1"
                      className="block text-sm font-medium text-gray-700"
                    >
                      {selectedRutTypes.tipo_rut_apoderado1 === "RUT"
                        ? "RUT"
                        : selectedRutTypes.tipo_rut_apoderado1 ===
                          "RUT_EXTRANJERO"
                        ? "RUT Extranjero"
                        : selectedRutTypes.tipo_rut_apoderado1 === "PASAPORTE"
                        ? "Pasaporte"
                        : "Identificación"}{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="rut_apoderado1"
                      name="rut_apoderado1"
                      placeholder={
                        selectedRutTypes.tipo_rut_apoderado1 === "RUT"
                          ? "Ejemplo: 12345678-9"
                          : "Ingrese su identificación"
                      }
                      className="mt-1 block px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      required
                      onChange={handleRutFormat}
                      maxLength={
                        selectedRutTypes.tipo_rut_apoderado1 === "RUT" ? 11 : 20
                      }
                    />
                    {rutError.rut_apoderado1 &&
                      selectedRutTypes.tipo_rut_apoderado1 === "RUT" && (
                        <p className="mt-1 text-sm text-red-600">
                          {rutError.rut_apoderado1}
                        </p>
                      )}
                  </div>
                )}
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
                    placeholder="+569XXXXXXXX"
                    className="mt-1 block px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                    defaultValue="+569"
                    onChange={handlePhoneFormat}
                    maxLength={12}
                  />
                  {phoneError.celular_apoderado1 && (
                    <p className="mt-1 text-sm text-red-600">
                      {phoneError.celular_apoderado1}
                    </p>
                  )}
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
                    onChange={validateEmails}
                  />
                  {emailError.email_apoderado1 && (
                    <p className="mt-1 text-sm text-red-600">
                      {emailError.email_apoderado1}
                    </p>
                  )}
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
                    placeholder="+569XXXXXXXX"
                    className="mt-1 block px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    defaultValue="+569"
                    onChange={handlePhoneFormat}
                    maxLength={12}
                  />
                  {phoneError.celular_apoderado2 && (
                    <p className="mt-1 text-sm text-red-600">
                      {phoneError.celular_apoderado2}
                    </p>
                  )}
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
                    placeholder="+569XXXXXXXX"
                    className="mt-1 block px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                    defaultValue="+569"
                    onChange={handlePhoneFormat}
                    maxLength={12}
                  />
                  {phoneError.celular_contacto && (
                    <p className="mt-1 text-sm text-red-600">
                      {phoneError.celular_contacto}
                    </p>
                  )}
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
                    ¿Tiene control médico al día?{" "}
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
                        defaultChecked
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
                        onChange={handleFlagChange}
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
                        onChange={handleFlagChange}
                        defaultChecked
                      />
                      <span className="ml-2 text-sm text-gray-700">No</span>
                    </label>
                  </div>
                  {flagFields.flag_discapacidad && (
                    <div className="mt-2">
                      <input
                        type="text"
                        name="discapacidad"
                        placeholder="Especifique la discapacidad"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                      />
                    </div>
                  )}
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
                        onChange={handleFlagChange}
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
                        onChange={handleFlagChange}
                        defaultChecked
                      />
                      <span className="ml-2 text-sm text-gray-700">No</span>
                    </label>
                  </div>
                  {flagFields.flag_necesidad_especial && (
                    <div className="mt-2">
                      <input
                        type="text"
                        name="necesidad_especial"
                        placeholder="Especifique la necesidad especial"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                      />
                    </div>
                  )}
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
                        onChange={handleFlagChange}
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
                        onChange={handleFlagChange}
                        defaultChecked
                      />
                      <span className="ml-2 text-sm text-gray-700">No</span>
                    </label>
                  </div>
                  {flagFields.flag_enfermedad && (
                    <div className="mt-2">
                      <input
                        type="text"
                        name="enfermedad"
                        placeholder="Especifique la enfermedad"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                      />
                    </div>
                  )}
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
                        onChange={handleFlagChange}
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
                        onChange={handleFlagChange}
                        defaultChecked
                      />
                      <span className="ml-2 text-sm text-gray-700">No</span>
                    </label>
                  </div>
                  {flagFields.flag_medicamentos && (
                    <div className="mt-2">
                      <input
                        type="text"
                        name="medicamentos"
                        placeholder="Especifique los medicamentos"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                      />
                    </div>
                  )}
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
                        onChange={handleFlagChange}
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
                        onChange={handleFlagChange}
                        defaultChecked
                      />
                      <span className="ml-2 text-sm text-gray-700">No</span>
                    </label>
                  </div>
                  {flagFields.flag_alergia && (
                    <div className="mt-2">
                      <input
                        type="text"
                        name="alergia"
                        placeholder="Especifique la alergia"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                      />
                    </div>
                  )}
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
                    id="compromiso_apoyo_especial"
                    name="compromiso_apoyo_especial"
                    required
                    className="h-4 w-4  text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="compromiso_apoyo_especial"
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
