"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";

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
  clave: string;
  estado: string;
  tipo_usuario: string;
  fecha_nacimiento: string;
  nacionalidad: string;
  talla: string;
  direccion: string;
  comuna: string;
  sector: string;

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
  cursos?: Curso[];
}

const PerfilUsuario: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
  const [newRut, setNewRut] = useState("");
  const [rutError, setRutError] = useState("");
  const [showFileModal, setShowFileModal] = useState(false);
  const [selectedFileType, setSelectedFileType] = useState("");
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [customFileName, setCustomFileName] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const fileTypes = [
    { id: "cert_nacimiento", name: "Certificado de Nacimiento" },
    { id: "cert_carnet", name: "Fotocopia Carnet" },
    { id: "cert_estudios", name: "Certificado de Estudios" },
    { id: "cert_rsh", name: "Registro Social de Hogares" },
    { id: "cert_diagnostico", name: "Certificado de Diagnóstico" },
  ];

  const getFileByType = (type: string) => {
    return userData?.archivos?.find((doc) => doc.tipo === type);
  };

  // Function to handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileToUpload(e.target.files[0]);
      // Set default custom name based on file name without extension
      const fileName = e.target.files[0].name.split(".")[0];
      setCustomFileName(fileName);
    }
  };

  const openFileModal = (fileType: string) => {
    setSelectedFileType(fileType);
    setCustomFileName("");
    setFileToUpload(null);
    setShowFileModal(true);
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fileToUpload) {
      toast.error("Por favor seleccione un archivo");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", fileToUpload);
      formData.append("fileType", selectedFileType);
      formData.append("customFileName", customFileName);
      formData.append("targetRut", userData?.rut_usuario || "");

      const response = await fetch("/api/perfil/upload-document", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Archivo subido correctamente");
        setShowFileModal(false);
        // Refresh user data to show the new file
        fetchUserData();
      } else {
        toast.error(data.error || "Error al subir el archivo");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Error al subir el archivo");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileDownload = (documentId: string) => {
    window.open(`/api/perfil/documentos/${documentId}`, "_blank");
  };

  const renderDocumentSection = () => {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Documentos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fileTypes.map((fileType) => {
            const file = getFileByType(fileType.id);
            return (
              <div key={fileType.id} className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">{fileType.name}</h3>
                {file ? (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">
                      Nombre: {file.titulo}.{file.extension}
                    </p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleFileDownload(file.id_documento)}
                        className="px-3 py-1 bg-white text-blue-600 border border-blue-600 text-sm rounded hover:bg-blue-600 hover:text-white transition-colors"
                      >
                        Descargar
                      </button>
                      <button
                        onClick={() => openFileModal(fileType.id)}
                        className="px-3 py-1 bg-white text-yellow-600 border border-yellow-600 text-sm rounded hover:bg-yellow-600 hover:text-white transition-colors"
                      >
                        Reemplazar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">
                      No hay archivo subido
                    </p>
                    <button
                      onClick={() => openFileModal(fileType.id)}
                      className="px-3 py-1 bg-white text-green-600 border border-green-600 text-sm rounded hover:bg-green-600 hover:text-white transition-colors"
                    >
                      Subir Archivo
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Add this modal for file upload/replacement
  const renderFileModal = () => {
    const selectedType = fileTypes.find((type) => type.id === selectedFileType);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h2 className="text-xl font-bold mb-4">
            {getFileByType(selectedFileType)
              ? `Reemplazar ${selectedType?.name}`
              : `Subir ${selectedType?.name}`}
          </h2>
          <form onSubmit={handleFileUpload}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">
                Seleccionar Archivo
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 mb-2">
                Nombre Personalizado (opcional)
              </label>
              <input
                type="text"
                value={customFileName}
                onChange={(e) => setCustomFileName(e.target.value)}
                placeholder="Nombre del archivo"
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                Si se deja vacío, se usará el nombre original del archivo
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowFileModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isUploading || !fileToUpload}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
              >
                {isUploading ? "Subiendo..." : "Subir"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const validateRutField = (rut: string) => {
    if (rut.trim() === "") {
      setRutError("");
      return true;
    }

    // Basic RUT validation (can be enhanced)
    const rutRegex = /^[0-9]{1,9}-[0-9kK]{1}$/;
    if (!rutRegex.test(rut)) {
      setRutError("Formato de RUT inválido (ej: 12345678-9)");
      return false;
    } else {
      setRutError("");
      return true;
    }
  };

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
    // Corregir la expresión regular de caracteres especiales
    if (!/[!@#$%^&*()_+=[\]{};':"\\|,.<>/?-]/.test(password)) {
      errors.push("un carácter especial");
    }

    if (errors.length > 0) {
      setPasswordError(`Debe incluir: ${errors.join(", ")}.`);
      return false;
    } else {
      setPasswordError("");
      return true;
    }
  };

  const validateConfirmPasswordField = (confirmPass: string) => {
    if (newPassword && confirmPass !== newPassword) {
      setConfirmPasswordError("Las contraseñas no coinciden");
      return false;
    } else {
      setConfirmPasswordError("");
      return true;
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
        router.push("/");
      }
    } else {
      router.push("/");
    }
  }, [router]);

  useEffect(() => {
    if (userSession) {
      if (!["Administrador", "Docente"].includes(userSession.tipo_usuario)) {
        toast.error("No tienes permiso para ver este perfil");
        router.push("/");
        return;
      }

      fetchUserData();
    }
  }, [userSession, params.rut]);

  const fetchUserData = async () => {
    try {
      const response = await fetch(`/api/perfil?rut=${params.rut}`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Error al obtener el perfil del usuario");
      }

      const data = await response.json();
      if (data.success) {
        setUserData(data.data);
      } else {
        setError(data.error || "Error al cargar el perfil");
      }
    } catch (error) {
      setError("Error al cargar el perfil");
      console.error("Error al cargar el perfil:", error);
    } finally {
      setLoading(false);
    }
  };

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

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleRequestCode = async () => {
    if (!userData) return;

    setIsRequestingCode(true);
    try {
      const response = await fetch("/api/perfil/request-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetRut: userData.rut_usuario,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(
          "Código de verificación enviado al correo del administrador"
        );
        setShowVerificationModal(true);
      } else {
        toast.error(data.error || "Error al solicitar código de verificación");
      }
    } catch (error) {
      console.error("Error requesting verification code:", error);
      toast.error("Error al solicitar código de verificación");
    } finally {
      setIsRequestingCode(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode.trim()) {
      toast.error("Por favor ingrese el código de verificación");
      return;
    }

    setIsVerifying(true);
    try {
      const response = await fetch("/api/perfil/verify-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: verificationCode,
          targetRut: userData?.rut_usuario,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Código verificado correctamente");
        setShowVerificationModal(false);
        setShowEditModal(true);
        setNewEmail(userData?.email || "");
      } else {
        toast.error(data.error || "Código de verificación incorrecto");
      }
    } catch (error) {
      console.error("Error verifying code:", error);
      toast.error("Error al verificar el código");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    const isEmailValid = validateEmailField(newEmail);
    const isPasswordValid = validatePasswordField(newPassword);
    const isConfirmPasswordValid =
      validateConfirmPasswordField(confirmPassword);
    const isRutValid = validateRutField(newRut);

    if (
      !isEmailValid ||
      (newPassword && (!isPasswordValid || !isConfirmPasswordValid)) ||
      (newRut && !isRutValid)
    ) {
      toast.error("Por favor corrija los errores del formulario");
      return;
    }

    setIsUpdating(true);
    try {
      const response = await fetch("/api/perfil/update-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetRut: userData?.rut_usuario,
          email: newEmail !== userData?.email ? newEmail : undefined,
          password: newPassword || undefined,
          newRut: newRut || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Usuario actualizado correctamente");
        setShowEditModal(false);
        // Reset form fields
        setNewEmail("");
        setNewPassword("");
        setConfirmPassword("");
        setVerificationCode("");
        setNewRut("");
        // Refresh user data
        fetchUserData();
      } else {
        toast.error(data.error || "Error al actualizar usuario");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Error al actualizar usuario");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-gray-500">Cargando datos del usuario...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-gray-500">
          Perfil con identificador: {params.rut} no fue encontrado en la base de
          datos.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 w-full">
      <div className="mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Perfil de Usuario</h1>
          <div className="flex gap-2">
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Volver
            </button>
          </div>
        </div>

        {userData && (
          <div className="space-y-6">
            {/* Información básica */}
            <div className="border-b pb-4">
              <h2 className="text-xl font-semibold mb-3">
                Información Personal
              </h2>
              <p>
                <span className="font-medium">Nombre:</span> {userData.nombres}{" "}
                {userData.apellidos}
              </p>
              <p>
                <span className="font-medium">RUT:</span> {userData.rut_usuario}
              </p>
              <p>
                <span className="font-medium">Tipo de RUT:</span>{" "}
                {userData.rut_tipo || "No especificado"}
              </p>
              <p>
                <span className="font-medium">Email:</span> {userData.email}
              </p>
              <p>
                <span className="font-medium">Estado de la cuenta:</span>{" "}
                {userData.estado}
              </p>
              <p>
                <span className="font-medium">Fecha de Nacimiento:</span>{" "}
                {userData.fecha_nacimiento}
              </p>
              {userData.fecha_nacimiento && (
                <p>
                  <span className="font-medium">Edad:</span>{" "}
                  {calculateAge(userData.fecha_nacimiento)} años
                </p>
              )}
              <p>
                <span className="font-medium">Nacionalidad:</span>{" "}
                {userData.nacionalidad || "No especificada"}
              </p>
              <p>
                <span className="font-medium">Talla:</span>{" "}
                {userData.talla || "No especificada"}
              </p>
              <p>
                <span className="font-medium">Dirección:</span>{" "}
                {userData.direccion || "No especificada"}
              </p>
              <p>
                <span className="font-medium">Comuna:</span>{" "}
                {userData.comuna || "No especificada"}
              </p>
              <p>
                <span className="font-medium">Sector:</span>{" "}
                {userData.sector || "No especificado"}
              </p>
              <p>
                <span className="font-medium">Tipo de Usuario:</span>{" "}
                {userData.tipo_usuario}
              </p>

              {/* Admin Edit Button */}
              {userSession?.tipo_usuario === "Administrador" && (
                <div className="mt-4">
                  <button
                    onClick={handleRequestCode}
                    disabled={isRequestingCode}
                    className="border border-blue-600 text-blue-600 bg-white hover:bg-blue-600 hover:text-white font-medium py-2 px-4 rounded transition-colors duration-200"
                  >
                    {isRequestingCode ? "Enviando..." : "Editar Credenciales"}
                  </button>
                </div>
              )}
            </div>

            {/* Información específica del estudiante */}
            {userData.tipo_usuario === "Estudiante" && (
              <>
                {/* Curso actual */}
                <div className="border-b pb-4">
                  <h2 className="text-xl font-semibold mb-3">Curso Actual</h2>
                  <p>{userData.cursoAlumno?.nombre_curso || "No asignado"}</p>
                </div>

                {/* Matrícula */}
                <div className="border-b pb-4">
                  <h2 className="text-xl font-semibold mb-3">
                    Información de Matrícula
                  </h2>
                  <p>
                    <span className="font-medium">Fecha de Matrícula:</span>{" "}
                    {userData.matricula?.fecha_matricula || "No especificada"}
                  </p>
                  <p>
                    <span className="font-medium">Último Establecimiento:</span>{" "}
                    {userData.matricula?.ultimo_establecimiento ||
                      "No especificado"}
                  </p>
                  <p>
                    <span className="font-medium">Último Nivel Cursado:</span>{" "}
                    {userData.matricula?.ultimo_nivel_cursado ||
                      "No especificado"}
                  </p>
                  <p>
                    <span className="font-medium">Incidencia Académica:</span>{" "}
                    {userData.matricula?.incidencia_academica ||
                      "No especificada"}
                  </p>
                  <p>
                    <span className="font-medium">Apoyo Especial:</span>{" "}
                    {userData.matricula?.flag_apoyo_especial === "1"
                      ? "Sí"
                      : "No"}
                  </p>
                  {userData.matricula?.flag_apoyo_especial === "1" && (
                    <>
                      <p>
                        <span className="font-medium">
                          Detalle Apoyo Especial:
                        </span>{" "}
                        {userData.matricula.apoyo_especial}
                      </p>
                      <p>
                        <span className="font-medium">
                          Consentimiento Apoyo Especial:
                        </span>{" "}
                        {userData.matricula.consentimiento_apoyo_especial ===
                        "1"
                          ? "Sí"
                          : "No"}
                      </p>
                      <p>
                        <span className="font-medium">
                          Razón Consentimiento:
                        </span>{" "}
                        {userData.matricula
                          .razon_consentimiento_apoyo_especial ||
                          "No especificada"}
                      </p>
                    </>
                  )}
                  <p>
                    <span className="font-medium">Rezago Escolar:</span>{" "}
                    {userData.matricula?.rezago_escolar || "No especificado"}
                  </p>
                </div>

                {/* Apoderado */}
                <div className="border-b pb-4">
                  <h2 className="text-xl font-semibold mb-3">
                    Información del Apoderado
                  </h2>
                  <div className="mb-4">
                    <h3 className="text-lg font-medium mb-2">
                      Apoderado Principal
                    </h3>
                    <p>
                      <span className="font-medium">Nombre:</span>{" "}
                      {userData.apoderado?.nombres_apoderado1 ||
                        "No especificado"}{" "}
                      {userData.apoderado?.apellidos_apoderado1}
                    </p>
                    <p>
                      <span className="font-medium">RUT:</span>{" "}
                      {userData.apoderado?.rut_apoderado1 || "No especificado"}
                    </p>
                    <p>
                      <span className="font-medium">Tipo de RUT:</span>{" "}
                      {userData.apoderado?.rut_tipo_apoderado1 ||
                        "No especificado"}
                    </p>
                    <p>
                      <span className="font-medium">Nacionalidad:</span>{" "}
                      {userData.apoderado?.nacionalidad_apoderado1 ||
                        "No especificada"}
                    </p>
                    <p>
                      <span className="font-medium">Vínculo:</span>{" "}
                      {userData.apoderado?.vinculo_apoderado1 ||
                        "No especificado"}
                    </p>
                    <p>
                      <span className="font-medium">Teléfono:</span>{" "}
                      {userData.apoderado?.celular_apoderado1 ||
                        "No especificado"}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span>{" "}
                      {userData.apoderado?.email_apoderado1 ||
                        "No especificado"}
                    </p>
                    <p>
                      <span className="font-medium">Comuna:</span>{" "}
                      {userData.apoderado?.comuna_apoderado1 ||
                        "No especificada"}
                    </p>
                    <p>
                      <span className="font-medium">Dirección:</span>{" "}
                      {userData.apoderado?.direccion_apoderado1 ||
                        "No especificada"}
                    </p>
                    <p>
                      <span className="font-medium">Núcleo Familiar:</span>{" "}
                      {userData.apoderado?.nucleo_familiar || "No especificado"}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">
                      Apoderado Secundario
                    </h3>
                    <p>
                      <span className="font-medium">Nombre:</span>{" "}
                      {userData.apoderado?.nombres_apoderado2 ||
                        "No especificado"}{" "}
                      {userData.apoderado?.apellidos_apoderado2}
                    </p>
                    <p>
                      <span className="font-medium">Teléfono:</span>{" "}
                      {userData.apoderado?.celular_apoderado2 ||
                        "No especificado"}
                    </p>
                  </div>
                </div>

                {/* Contacto de Emergencia */}
                <div className="border-b pb-4">
                  <h2 className="text-xl font-semibold mb-3">
                    Contacto de Emergencia
                  </h2>
                  <p>
                    <span className="font-medium">Nombre:</span>{" "}
                    {userData.contactoEmergencia?.nombres || "No especificado"}{" "}
                    {userData.contactoEmergencia?.apellidos}
                  </p>
                  <p>
                    <span className="font-medium">Teléfono:</span>{" "}
                    {userData.contactoEmergencia?.celular || "No especificado"}
                  </p>
                  <p>
                    <span className="font-medium">Vínculo:</span>{" "}
                    {userData.contactoEmergencia?.vinculo || "No especificado"}
                  </p>
                </div>

                {/* Información Médica */}
                <div className="border-b pb-4">
                  <h2 className="text-xl font-semibold mb-3">
                    Información Médica
                  </h2>
                  <p>
                    <span className="font-medium">Estado control médico:</span>{" "}
                    {userData.infoMedica?.flag_control_medico === "1"
                      ? "Atrasado"
                      : "Al día"}
                  </p>
                  <p>
                    <span className="font-medium">Discapacidad:</span>{" "}
                    {userData.infoMedica?.flag_discapacidad === "1"
                      ? "Sí"
                      : "No"}
                    {userData.infoMedica?.discapacidad && (
                      <span> - {userData.infoMedica.discapacidad}</span>
                    )}
                  </p>
                  <p>
                    <span className="font-medium">Necesidad Especial:</span>{" "}
                    {userData.infoMedica?.flag_necesidad_especial === "1"
                      ? "Sí"
                      : "No"}
                    {userData.infoMedica?.necesidad_especial && (
                      <span> - {userData.infoMedica.necesidad_especial}</span>
                    )}
                  </p>
                  <p>
                    <span className="font-medium">Enfermedad:</span>{" "}
                    {userData.infoMedica?.flag_enfermedad === "1" ? "Sí" : "No"}
                    {userData.infoMedica?.enfermedad && (
                      <span> - {userData.infoMedica.enfermedad}</span>
                    )}
                  </p>
                  <p>
                    <span className="font-medium">Medicamentos:</span>{" "}
                    {userData.infoMedica?.flag_medicamentos === "1"
                      ? "Sí"
                      : "No"}
                    {userData.infoMedica?.medicamentos && (
                      <span> - {userData.infoMedica.medicamentos}</span>
                    )}
                  </p>
                  <p>
                    <span className="font-medium">Alergias:</span>{" "}
                    {userData.infoMedica?.flag_alergia === "1" ? "Sí" : "No"}
                    {userData.infoMedica?.alergia && (
                      <span> - {userData.infoMedica.alergia}</span>
                    )}
                  </p>
                  <p>
                    <span className="font-medium">Previsión Médica:</span>{" "}
                    {userData.infoMedica?.prevision_medica || "No especificada"}
                  </p>
                  <p>
                    <span className="font-medium">Servicio de Emergencia:</span>{" "}
                    {userData.infoMedica?.servicio_emergencia ||
                      "No especificado"}
                  </p>
                </div>

                {/* Documentos */}
                <div className="border-b pb-4">
                  <h2 className="text-xl font-semibold mb-3">Documentos</h2>
                  <div className="space-y-2">
                    {userData.archivos && userData.archivos.length > 0 ? (
                      userData.archivos.map((archivo) => (
                        <div
                          key={archivo.id_documento}
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
                      ))
                    ) : (
                      <p>No hay documentos disponibles</p>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Información para docentes y administradores */}
            {(userData.tipo_usuario === "Docente" ||
              userData.tipo_usuario === "Administrador") && (
              <div className="border-b pb-4">
                <h2 className="text-xl font-semibold mb-3">
                  Cursos y Asignaturas Asignadas
                </h2>
                <div className="space-y-4">
                  {userData.cursos && userData.cursos.length > 0 ? (
                    userData.cursos.map((curso) => (
                      <div
                        key={curso.id_curso}
                        className="bg-gray-50 p-4 rounded"
                      >
                        <h3 className="font-medium mb-2">
                          {curso.nombre_curso}
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                          {curso.asignaturas.map((asignatura) => (
                            <div
                              key={asignatura.id_asignatura}
                              className="text-gray-600"
                            >
                              • {asignatura.nombre_asignatura}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>No hay cursos asignados</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Verification Code Modal */}
      {showVerificationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              Verificación de Administrador
            </h2>
            <p className="mb-4">
              Se ha enviado un código de verificación a su correo electrónico.
              Por favor, ingréselo a continuación:
            </p>

            <form onSubmit={handleVerifyCode}>
              <div className="mb-4">
                <label
                  htmlFor="verificationCode"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Código de Verificación
                </label>
                <input
                  type="text"
                  id="verificationCode"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowVerificationModal(false)}
                  className="border border-gray-700 text-gray-700 bg-white hover:bg-gray-700 hover:text-white px-4 py-2 rounded-md transition-colors duration-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isVerifying}
                  className="border border-blue-600 text-blue-600 bg-white hover:bg-blue-600 hover:text-white px-4 py-2 rounded-md transition-colors duration-200"
                >
                  {isVerifying ? "Verificando..." : "Verificar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {userData &&
        userSession?.tipo_usuario === "Administrador" &&
        renderDocumentSection()}

      {/* Edit User Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Editar Credenciales</h2>

            <form onSubmit={handleUpdateUser}>
              <div className="mb-4">
                <label
                  htmlFor="newEmail"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  id="newEmail"
                  value={newEmail}
                  onChange={(e) => {
                    setNewEmail(e.target.value);
                    validateEmailField(e.target.value);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
                {emailError && (
                  <p className="mt-1 text-sm text-red-600">{emailError}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2">
                  Nuevo RUT (opcional)
                </label>
                <input
                  type="text"
                  value={newRut}
                  onChange={(e) => {
                    setNewRut(e.target.value);
                    validateRutField(e.target.value);
                  }}
                  placeholder="12345678-9"
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {rutError && (
                  <p className="text-red-500 text-sm mt-1">{rutError}</p>
                )}
              </div>

              <div className="mb-4">
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Nueva Contraseña (dejar en blanco para no cambiar)
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.newPassword ? "text" : "password"}
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      validatePasswordField(e.target.value);
                      validateConfirmPasswordField(confirmPassword);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => togglePasswordVisibility("newPassword")}
                  >
                    {showPasswords.newPassword ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
                {passwordError && (
                  <p className="mt-1 text-sm text-red-600">{passwordError}</p>
                )}
              </div>

              {newPassword && (
                <div className="mb-4">
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Confirmar Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value); // Fixed: was incorrectly updating newPassword
                        validateConfirmPasswordField(e.target.value);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required={!!newPassword}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() =>
                        togglePasswordVisibility("confirmPassword")
                      }
                    >
                      {showPasswords.confirmPassword ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-5 h-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-5 h-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                  {confirmPasswordError && (
                    <p className="mt-1 text-sm text-red-600">
                      {confirmPasswordError}
                    </p>
                  )}
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="border border-gray-700 text-gray-700 bg-white hover:bg-gray-700 hover:text-white px-4 py-2 rounded-md transition-colors duration-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="border border-blue-600 text-blue-600 bg-white hover:bg-blue-600 hover:text-white px-4 py-2 rounded-md transition-colors duration-200"
                >
                  {isUpdating ? "Actualizando..." : "Guardar Cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showFileModal && renderFileModal()}
    </div>
  );
};

export default PerfilUsuario;
