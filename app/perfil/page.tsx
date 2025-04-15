"use client";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

interface UserSession {
  rut_usuario: string;
  tipo_usuario: string;
}

interface Asignatura {
  id_asignatura: string;
  nombre_asignatura: string;
}

interface Curso {
  id_curso: string;
  nombre_curso: string;
  asignaturas: Asignatura[];
}

interface UserProfile {
  rut_usuario: string;
  rut_tipo: string;
  nombres: string;
  apellidos: string;
  email: string;
  tipo_usuario: string;
  fecha_nacimiento: string;
  nacionalidad: string;
  talla: string;
  direccion: string;
  comuna: string;
  sector: string;
  sexo: string;
  estado: string;

  cursoAlumno?: {
    nombre_curso: string;
  };

  matricula?: {
    fecha_matricula: string;
    ultimo_establecimiento: string;
    ultimo_nivel_cursado: string;
    incidencia_academica: string;
    flag_apoyo_especial: string;
    apoyo_especial: string;
    consentimiento_apoyo_especial: string;
    razon_consentimiento_apoyo_especial: string;
    rezago_escolar: string;
  };
  apoderado?: {
    nombres_apoderado1: string;
    apellidos_apoderado1: string;
    rut_apoderado1: string;
    rut_tipo_apoderado1: string;
    nacionalidad_apoderado1: string;
    vinculo_apoderado1: string;
    celular_apoderado1: string;
    email_apoderado1: string;
    comuna_apoderado1: string;
    direccion_apoderado1: string;
    nucleo_familiar: string;
    nombres_apoderado2: string;
    apellidos_apoderado2: string;
    celular_apoderado2: string;
  };
  contactoEmergencia?: {
    nombres: string;
    apellidos: string;
    celular: string;
    vinculo: string;
  };
  infoMedica?: {
    flag_control_medico: string;
    flag_discapacidad: string;
    discapacidad: string;
    flag_necesidad_especial: string;
    necesidad_especial: string;
    flag_enfermedad: string;
    enfermedad: string;
    flag_medicamentos: string;
    medicamentos: string;
    flag_alergia: string;
    alergia: string;
    prevision_medica: string;
    servicio_emergencia: string;
  };
  archivos?: Array<{
    id_documento: string;
    titulo: string;
    extension: string;
    downloadUrl: string;
    tipo: string;
  }>;
  // Campos específicos para docentes/administradores
  cursos?: Curso[];
}

const Perfil: React.FC = () => {
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isRequestingCode, setIsRequestingCode] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    newPassword: false,
    confirmPassword: false,
  });
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateEmailField = (email: string) => {
    if (!email || !validateEmail(email)) {
      setEmailError("Formato de correo inválido");
      return false;
    } else {
      setEmailError("");
      return true;
    }
  };

  const validatePasswordField = (password: string) => {
    if (password.trim() === "") {
      setPasswordError("");
      return true;
    }

    const errors = [];
    if (password.length < 8) errors.push("mínimo 8 caracteres");
    if (!/[A-Z]/.test(password)) errors.push("una mayúscula");
    if (!/\d/.test(password)) errors.push("un número");
    if (!/[!@#$%^&*()_+=[\]{};':"\\|,.<>/?-]/.test(password)) {
      errors.push("un carácter especial");
    }

    if (errors.length > 0) {
      setPasswordError(`La contraseña debe tener ${errors.join(", ")}`);
      return false;
    } else {
      setPasswordError("");
      return true;
    }
  };

  const validateConfirmPassword = () => {
    if (newPassword !== confirmPassword) {
      setConfirmPasswordError("Las contraseñas no coinciden");
      return false;
    } else {
      setConfirmPasswordError("");
      return true;
    }
  };

  // Add functions for email/password change
  const handleEditClick = () => {
    if (userData) {
      setNewEmail(userData.email);
      setNewPassword("");
      setConfirmPassword("");
      setShowEditModal(true);
    }
  };

  const handleRequestVerificationCode = async () => {
    // Validate fields
    const isEmailValid = validateEmailField(newEmail);
    const isPasswordValid = validatePasswordField(newPassword);
    const isConfirmPasswordValid = validateConfirmPassword();

    if (
      !isEmailValid ||
      !isPasswordValid ||
      (newPassword && !isConfirmPasswordValid)
    ) {
      return;
    }

    setIsRequestingCode(true);

    try {
      const response = await fetch("/api/perfil/request-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: newEmail,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Código de verificación enviado a tu correo");
        setShowVerificationModal(true);
        setShowEditModal(false);
      } else {
        toast.error(data.error || "Error al solicitar el código");
      }
    } catch (error) {
      console.error("Error al solicitar código:", error);
      toast.error("Error al solicitar el código de verificación");
    } finally {
      setIsRequestingCode(false);
    }
  };

  const handleVerifyAndUpdate = async () => {
    if (!verificationCode.trim()) {
      toast.error("Por favor ingresa el código de verificación");
      return;
    }

    setIsVerifying(true);

    try {
      const response = await fetch("/api/perfil/update-self", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: newEmail,
          password: newPassword || undefined,
          verificationCode,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Información actualizada correctamente");
        setShowVerificationModal(false);

        // Update local storage if email changed
        if (newEmail !== userData?.email) {
          const storedSession = localStorage.getItem("userSession");
          if (storedSession) {
            const parsedSession = JSON.parse(storedSession);
            parsedSession.email = newEmail;
            localStorage.setItem("userSession", JSON.stringify(parsedSession));
          }
        }

        // Refresh user data
        fetchUserData();
      } else {
        toast.error(data.error || "Error al verificar el código");
      }
    } catch (error) {
      console.error("Error al verificar código:", error);
      toast.error("Error al verificar el código");
    } finally {
      setIsVerifying(false);
    }
  };

  // Add function to refresh user data
  const fetchUserData = async () => {
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
    }
  };

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

  const calculateAge = (dateString: string): number => {
    if (!dateString) return 0;

    // Parse the date string properly (assuming format DD-MM-YYYY)
    const parts = dateString.split("-");
    if (parts.length !== 3) return 0;

    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Months are 0-indexed in JS
    const year = parseInt(parts[2], 10);

    const birthDate = new Date(year, month, day);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

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
    return (
      <div>
        <div className="flex justify-center items-center p-8">
          <div className="text-gray-500">Cargando datos del estudiante...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 w-full">
      <div className="mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Perfil de Usuario</h1>
        {userData && (
          <button
            onClick={handleEditClick}
            className="px-4 py-2 bg-white text-blue-600 border border-blue-600 rounded hover:bg-blue-600 hover:text-white transition-colors"
          >
            Editar Credenciales
          </button>
        )}
        {userData ? (
          <div className="space-y-6">
            {/* Información básica para todos los usuarios */}
            <div className="border-b pb-4">
              <h2 className="text-xl font-semibold mb-3">
                Información Personal
              </h2>
              <p>
                <span className="font-medium">Nombre:</span> {userData.nombres}{" "}
                {userData.apellidos}
              </p>
              <p>
                <span className="font-medium">Email:</span> {userData.email}
              </p>
              <p>
                <span className="font-medium">RUT:</span> {userData.rut_usuario}
              </p>
              {userData.tipo_usuario === "Estudiante" && (
                <p>
                  <span className="font-medium">Tipo de RUT:</span>{" "}
                  {userData.rut_tipo}
                </p>
              )}
              <p>
                <span className="font-medium">Tipo de Usuario:</span>{" "}
                {userData.tipo_usuario}
              </p>
              <p>
                <span className="font-medium">Estado de la cuenta:</span>{" "}
                {userData.estado}
              </p>
              {userData.tipo_usuario === "Estudiante" && (
                <>
                  <p>
                    <span className="font-medium">Sexo:</span> {userData.sexo}
                  </p>
                  <p>
                    <span className="font-medium">Fecha de nacimiento:</span>{" "}
                    {userData.fecha_nacimiento}
                  </p>
                  <p>
                    <span className="font-medium">Edad:</span>{" "}
                    {userData?.fecha_nacimiento
                      ? `${calculateAge(userData.fecha_nacimiento)} años`
                      : "No disponible"}
                  </p>
                  <p>
                    <span className="font-medium">Nacionalidad:</span>{" "}
                    {userData.nacionalidad}
                  </p>
                  <p>
                    <span className="font-medium">Talla:</span>{" "}
                    {userData.talla ? userData.talla : "No disponible"}
                  </p>

                  <p>
                    <span className="font-medium">Dirección:</span>{" "}
                    {userData.direccion}
                  </p>
                  <p>
                    <span className="font-medium">Comuna:</span>{" "}
                    {userData.comuna}
                  </p>
                  <p>
                    <span className="font-medium">Sector:</span>{" "}
                    {userData.sector}
                  </p>
                </>
              )}
            </div>

            {/* Información específica para estudiantes */}
            {userSession?.tipo_usuario === "Estudiante" && (
              <>
                {/* Sección de Familiar */}
                {userData.apoderado && (
                  <div className="border-b pb-4">
                    <h2 className="text-xl font-semibold mb-3">
                      Información Familiar
                    </h2>
                    <p>
                      <span className="font-medium">
                        Núcleo familiar (cantidad):{" "}
                      </span>{" "}
                      {userData.apoderado.nucleo_familiar}
                    </p>
                    <h3 className="text-lg pt-2 mb-2">Apoderado principal</h3>
                    <p>
                      <span className="font-medium">Nombre:</span>{" "}
                      {userData.apoderado.nombres_apoderado1}{" "}
                      {userData.apoderado.apellidos_apoderado1}
                    </p>
                    <p>
                      <span className="font-medium">RUT:</span>{" "}
                      {userData.apoderado.rut_apoderado1}
                    </p>
                    <p>
                      <span className="font-medium">Tipo: </span>
                      {userData.apoderado.rut_tipo_apoderado1}
                    </p>
                    <p>
                      <span className="font-medium">Contacto:</span> +
                      {userData.apoderado.celular_apoderado1}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span>{" "}
                      {userData.apoderado.email_apoderado1}
                    </p>
                    <p>
                      <span className="font-medium">Vinculo:</span>{" "}
                      {userData.apoderado.vinculo_apoderado1}
                    </p>
                    <p>
                      <span className="font-medium">Comuna:</span>{" "}
                      {userData.apoderado.comuna_apoderado1}
                    </p>
                    <p>
                      <span className="font-medium">Dirección:</span>{" "}
                      {userData.apoderado.direccion_apoderado1}
                    </p>
                    <p>
                      <span className="font-medium">Nacionalidad:</span>{" "}
                      {userData.apoderado.nacionalidad_apoderado1}
                    </p>
                    <h3 className="text-lg pt-2 mb-2">Apoderado secundario</h3>
                    <p>
                      <span className="font-medium">Nombre:</span>{" "}
                      {userData.apoderado.nombres_apoderado2}{" "}
                      {userData.apoderado.apellidos_apoderado2}
                    </p>
                    <p>
                      <span className="font-medium">Celular:</span> +
                      {userData.apoderado.celular_apoderado2}
                    </p>
                  </div>
                )}

                {/* Sección de Contacto Emergencia */}
                {userData.apoderado && (
                  <div className="border-b pb-4">
                    <h2 className="text-xl font-semibold mb-3">
                      Contacto de emergencia
                    </h2>
                    <p>
                      <span className="font-medium">Nombre:</span>{" "}
                      {userData.contactoEmergencia?.nombres}{" "}
                      {userData.contactoEmergencia?.apellidos}
                    </p>
                    <p>
                      <span className="font-medium">Celular:</span> +
                      {userData.contactoEmergencia?.celular}
                    </p>
                    <p>
                      <span className="font-medium">Vinculo:</span>{" "}
                      {userData.contactoEmergencia?.vinculo}
                    </p>
                  </div>
                )}

                {/* Sección Médica */}
                {userData.infoMedica && (
                  <div className="border-b pb-4">
                    <h2 className="text-xl font-semibold mb-3">
                      Información Médica
                    </h2>
                    <p>
                      <span className="font-medium">
                        Estado control médico:
                      </span>{" "}
                      {userData.infoMedica.flag_control_medico === "1"
                        ? "Atrasado"
                        : "Al día"}
                    </p>
                    <p>
                      <span className="font-medium">
                        ¿Tiene alguna discapacidad discapacidad?:
                      </span>{" "}
                      {userData.infoMedica.flag_discapacidad === "1"
                        ? "No"
                        : "Si"}
                    </p>
                    <p>
                      <span className="font-medium">Discapacidad:</span>{" "}
                      {userData.infoMedica.discapacidad
                        ? userData.infoMedica.discapacidad
                        : "No aplica"}
                    </p>
                    <p>
                      <span className="font-medium">
                        ¿Tiene alguna necesidad especial?:
                      </span>{" "}
                      {userData.infoMedica.flag_necesidad_especial === "1"
                        ? "Si"
                        : "No"}
                    </p>
                    <p>
                      <span className="font-medium">Necesidad especial:</span>{" "}
                      {userData.infoMedica.necesidad_especial
                        ? userData.infoMedica.necesidad_especial
                        : "No aplica"}
                    </p>

                    <p>
                      <span className="font-medium">
                        ¿Posee alguna enfermedad?:
                      </span>{" "}
                      {userData.infoMedica.flag_enfermedad === "1"
                        ? "Si"
                        : "No"}
                    </p>
                    <p>
                      <span className="font-medium">Enfermedad:</span>{" "}
                      {userData.infoMedica.enfermedad
                        ? userData.infoMedica.enfermedad
                        : "No aplica"}
                    </p>
                    <p>
                      <span className="font-medium">
                        ¿Utiliza medicamentos?:
                      </span>{" "}
                      {userData.infoMedica.flag_medicamentos === "1"
                        ? "Si"
                        : "No"}
                    </p>
                    <p>
                      <span className="font-medium">Medicamentos:</span>{" "}
                      {userData.infoMedica.medicamentos
                        ? userData.infoMedica.medicamentos
                        : "No aplica"}
                    </p>
                    <p>
                      <span className="font-medium">
                        ¿Posee alguna alergia?:
                      </span>{" "}
                      {userData.infoMedica.flag_alergia === "1" ? "Si" : "No"}
                    </p>
                    <p>
                      <span className="font-medium">Alergia:</span>{" "}
                      {userData.infoMedica.alergia
                        ? userData.infoMedica.alergia
                        : "No aplica"}
                    </p>
                    <p>
                      <span className="font-medium">Previsión:</span>{" "}
                      {userData.infoMedica.prevision_medica}
                    </p>
                    <p>
                      <span className="font-medium">
                        Servicio de Emergencia:
                      </span>{" "}
                      {userData.infoMedica.servicio_emergencia}
                    </p>
                  </div>
                )}

                {/* Sección de Matrícula */}
                {userData.matricula && (
                  <div className="border-b pb-4">
                    <h2 className="text-xl font-semibold mb-3">
                      Información de Matrícula
                    </h2>
                    <p>
                      <span className="font-medium">Curso alumno:</span>{" "}
                      {userData.cursoAlumno?.nombre_curso}
                    </p>
                    <p>
                      <span className="font-medium">Fecha de matricula:</span>{" "}
                      {userData.matricula.fecha_matricula}
                    </p>
                    <p>
                      <span className="font-medium">
                        Último establecimiento educacional:
                      </span>{" "}
                      {userData.matricula.ultimo_establecimiento}
                    </p>
                    <p>
                      <span className="font-medium">Último nivel cursado:</span>{" "}
                      {userData.matricula.ultimo_nivel_cursado}
                    </p>
                    <p>
                      <span className="font-medium">Incidencia académica:</span>{" "}
                      {userData.matricula.incidencia_academica}
                    </p>
                    <p>
                      <span className="font-medium">
                        Requiere apoyo especial:
                      </span>{" "}
                      {userData.matricula.flag_apoyo_especial === "1"
                        ? "Si"
                        : "No"}
                    </p>
                    <p>
                      <span className="font-medium">Apoyo especial:</span>{" "}
                      {userData.matricula.apoyo_especial
                        ? userData.matricula.apoyo_especial
                        : "No aplica"}
                    </p>
                    <p>
                      <span className="font-medium">
                        Consentimiento de apoyo especial:
                      </span>{" "}
                      {userData.matricula.consentimiento_apoyo_especial === "1"
                        ? "Aceptado"
                        : "No aceptado"}
                    </p>
                    <p>
                      <span className="font-medium">
                        Razón del consentimiento de apoyo especial:
                      </span>{" "}
                      {userData.matricula.razon_consentimiento_apoyo_especial}
                    </p>
                    <p>
                      <span className="font-medium">Rezago escolar:</span>{" "}
                      {userData.matricula.rezago_escolar}
                    </p>
                  </div>
                )}

                {/* Sección de Documentos */}
                {userData.archivos && userData.archivos.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold mb-3">Documentos</h2>
                    <div className="space-y-2">
                      {userData.archivos.map((archivo, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded"
                        >
                          <span className="flex items-center">
                            <svg
                              className="w-5 h-5 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                            {archivo.titulo}.{archivo.extension}
                          </span>
                          <a
                            href={archivo.downloadUrl}
                            download
                            className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:underline flex items-center"
                          >
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                              />
                            </svg>
                            Descargar
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Información específica para docentes y administradores */}
            {(userSession?.tipo_usuario === "Docente" ||
              userSession?.tipo_usuario === "Administrador") && (
              <div>
                <h2 className="text-xl font-semibold mb-3">
                  Cursos y Asignaturas Asignadas
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userData.cursos?.map((curso, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      <h3 className="text-lg font-medium mb-2 text-black border-b pb-2">
                        {curso.nombre_curso}
                      </h3>
                      <ul className="list-disc pl-5 text-sm space-y-1">
                        {curso.asignaturas.map((asignatura, idx) => (
                          <li key={idx} className="text-gray-700">
                            {asignatura.nombre_asignatura}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-red-500">
            No se pudo cargar el perfil del usuario.
          </p>
        )}
      </div>
      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Editar Credenciales</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleRequestVerificationCode();
              }}
            >
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => {
                    setNewEmail(e.target.value);
                    validateEmailField(e.target.value);
                  }}
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    emailError ? "border-red-500" : ""
                  }`}
                  required
                />
                {emailError && (
                  <p className="text-red-500 text-sm mt-1">{emailError}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2">
                  Nueva Contraseña (opcional)
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.newPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      validatePasswordField(e.target.value);
                    }}
                    className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      passwordError ? "border-red-500" : ""
                    }`}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() =>
                      setShowPasswords({
                        ...showPasswords,
                        newPassword: !showPasswords.newPassword,
                      })
                    }
                  >
                    {showPasswords.newPassword ? (
                      <svg
                        className="h-5 w-5 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="h-5 w-5 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
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
                    )}
                  </button>
                </div>
                {passwordError && (
                  <p className="text-red-500 text-sm mt-1">{passwordError}</p>
                )}
              </div>

              {newPassword && (
                <div className="mb-6">
                  <label className="block text-gray-700 mb-2">
                    Confirmar Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        validateConfirmPassword();
                      }}
                      className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        confirmPasswordError ? "border-red-500" : ""
                      }`}
                      required={!!newPassword}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() =>
                        setShowPasswords({
                          ...showPasswords,
                          confirmPassword: !showPasswords.confirmPassword,
                        })
                      }
                    >
                      {showPasswords.confirmPassword ? (
                        <svg
                          className="h-5 w-5 text-gray-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="h-5 w-5 text-gray-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
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
                      )}
                    </button>
                  </div>
                  {confirmPasswordError && (
                    <p className="text-red-500 text-sm mt-1">
                      {confirmPasswordError}
                    </p>
                  )}
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded hover:bg-gray-300 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isRequestingCode}
                  className="px-4 py-2 bg-white text-blue-600 border border-blue-600 rounded hover:bg-blue-600 hover:text-white transition-colors disabled:bg-white disabled:text-gray-400 disabled:border-gray-400"
                >
                  {isRequestingCode ? "Enviando..." : "Enviar Código"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Verification Code Modal */}
      {showVerificationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Verificar Código</h2>
            <p className="mb-4 text-gray-600">
              Se ha enviado un código de verificación a tu correo electrónico.
              Por favor, ingrésalo a continuación para confirmar los cambios.
            </p>
            <div className="mb-6">
              <label className="block text-gray-700 mb-2">
                Código de Verificación
              </label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ingresa el código de 6 dígitos"
                required
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowVerificationModal(false)}
                className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded hover:bg-gray-300 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleVerifyAndUpdate}
                disabled={isVerifying}
                className="px-4 py-2 bg-white text-blue-600 border border-blue-600 rounded hover:bg-blue-600 hover:text-white transition-colors disabled:bg-white disabled:text-gray-400 disabled:border-gray-400"
              >
                {isVerifying ? "Verificando..." : "Verificar y Actualizar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Perfil;
