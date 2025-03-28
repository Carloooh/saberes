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
  const [isEditing, setIsEditing] = useState(false);

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
  }, []);

  useEffect(() => {
    if (userSession) {
      if (!["Administrador", "Docente"].includes(userSession.tipo_usuario)) {
        toast.error("No tienes permiso para ver este perfil");
        router.push("/");
        return;
      }

      const fetchUserProfile = async () => {
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

      fetchUserProfile();
    }
  }, [userSession, params.rut]);

  const handleSubmit = async () => {
    try {
      const response = await fetch(`/api/perfil/${params.rut}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Perfil actualizado correctamente");
        setIsEditing(false);
      } else {
        toast.error(data.error || "Error al actualizar el perfil");
      }
    } catch (error) {
      console.error("Error al actualizar el perfil:", error);
      toast.error("Error al actualizar el perfil");
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
            {/* Botón editar perfil */}
            {/* {userSession?.tipo_usuario === "Administrador" && (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`px-4 py-2 rounded ${
                  isEditing
                    ? "bg-green-500 text-white hover:bg-green-600"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                {isEditing ? "Guardar Cambios" : "Editar Perfil"}
              </button>
            )} */}
            {/* <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Volver
            </button> */}
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
                {userData.tipo_usuario === "Estudiante" && (
                  <>
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
    </div>
  );
};

export default PerfilUsuario;
