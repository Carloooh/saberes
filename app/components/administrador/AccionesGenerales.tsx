"use client";

import { useState } from "react";
import toast from "react-hot-toast";

const AccionesGenerales = () => {
  const [loading, setLoading] = useState<string | null>(null);
  const [showMensajeForm, setShowMensajeForm] = useState(false);
  const [mensajeData, setMensajeData] = useState({
    subject: "",
    message: "",
    userTypes: [] as string[],
    userStatuses: [] as string[]
  });

  const handleEnviarBienvenida = async () => {
    if (
      !confirm(
        "¿Estás seguro de enviar mensajes de bienvenida a todos los estudiantes activos? Esto generará nuevas contraseñas para todos ellos."
      )
    ) {
      return;
    }

    setLoading("bienvenida");
    try {
      const response = await fetch(
        "/api/administrador/acciones-generales/bienvenida",
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success(
          `Se enviaron ${data.enviados} mensajes de bienvenida correctamente.`
        );
      } else {
        toast.error(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Error al enviar mensajes de bienvenida:", error);
      toast.error("Ocurrió un error al enviar los mensajes de bienvenida.");
    } finally {
      setLoading(null);
    }
  };

  const handleEnviarBienvenidaDocentes = async () => {
    if (
      !confirm(
        "¿Estás seguro de enviar mensajes de bienvenida a todos los docentes activos? Esto generará nuevas contraseñas para todos ellos."
      )
    ) {
      return;
    }

    setLoading("bienvenidaDocentes");
    try {
      const response = await fetch(
        "/api/administrador/acciones-generales/bienvenida-docentes",
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success(
          `Se enviaron ${data.enviados} mensajes de bienvenida a docentes correctamente.`
        );
      } else {
        toast.error(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Error al enviar mensajes de bienvenida a docentes:", error);
      toast.error("Ocurrió un error al enviar los mensajes de bienvenida a docentes.");
    } finally {
      setLoading(null);
    }
  };

  const handleEnviarMensajeGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mensajeData.userTypes.length === 0) {
      toast.error("Debes seleccionar al menos un tipo de usuario");
      return;
    }
    
    if (mensajeData.userStatuses.length === 0) {
      toast.error("Debes seleccionar al menos un estado de usuario");
      return;
    }

    if (!mensajeData.subject.trim()) {
      toast.error("El asunto del mensaje es obligatorio");
      return;
    }

    if (!mensajeData.message.trim()) {
      toast.error("El contenido del mensaje es obligatorio");
      return;
    }

    if (
      !confirm(
        `¿Estás seguro de enviar este mensaje a todos los usuarios seleccionados? Esta acción no se puede deshacer.`
      )
    ) {
      return;
    }

    setLoading("mensaje");
    try {
      const response = await fetch(
        "/api/administrador/acciones-generales/mensaje-general",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(mensajeData),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success(
          `Se enviaron ${data.enviados} mensajes correctamente de un total de ${data.total}.`
        );
        setShowMensajeForm(false);
        setMensajeData({
          subject: "",
          message: "",
          userTypes: [],
          userStatuses: []
        });
      } else {
        toast.error(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Error al enviar mensajes generales:", error);
      toast.error("Ocurrió un error al enviar los mensajes.");
    } finally {
      setLoading(null);
    }
  };

  const handleCheckboxChange = (field: 'userTypes' | 'userStatuses', value: string) => {
    setMensajeData(prev => {
      const currentValues = [...prev[field]];
      if (currentValues.includes(value)) {
        return {
          ...prev,
          [field]: currentValues.filter(item => item !== value)
        };
      } else {
        return {
          ...prev,
          [field]: [...currentValues, value]
        };
      }
    });
  };

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold text-gray-800">Acciones Generales</h2>
      <p className="text-gray-600">
        Estas acciones afectan a múltiples usuarios a la vez. Úsalas con
        precaución.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tarjeta de Bienvenida */}
        <div className="border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-xl font-semibold text-gray-800">
            Bienvenida a los alumnos
          </h3>
          <p className="text-gray-600 mt-2 mb-4">
            Envío de mensaje de bienvenida a todos los alumnos y sus
            credenciales de inicio de sesión, a quienes tengan una cuenta activa
            y un email registrado.
          </p>
          <button
            onClick={handleEnviarBienvenida}
            disabled={loading === "bienvenida"}
            className={`border border-blue-600 text-blue-600 bg-white px-4 py-2 rounded-md transition-colors
              ${
                loading === "bienvenida"
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-blue-600 hover:text-white"
              }`}
          >
            {loading === "bienvenida" ? "Enviando..." : "Enviar mensajes"}
          </button>
        </div>

        {/* Tarjeta de Bienvenida a Docentes */}
        <div className="border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-xl font-semibold text-gray-800">
            Bienvenida a los docentes
          </h3>
          <p className="text-gray-600 mt-2 mb-4">
            Envío de mensaje de bienvenida a todos los docentes y sus
            credenciales de inicio de sesión, a quienes tengan una cuenta activa
            y un email registrado.
          </p>
          <button
            onClick={handleEnviarBienvenidaDocentes}
            disabled={loading === "bienvenidaDocentes"}
            className={`border border-blue-600 text-blue-600 bg-white px-4 py-2 rounded-md transition-colors
              ${
                loading === "bienvenidaDocentes"
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-blue-600 hover:text-white"
              }`}
          >
            {loading === "bienvenidaDocentes" ? "Enviando..." : "Enviar mensajes"}
          </button>
        </div>

        {/* Tarjeta de Mensaje General */}
        <div className="border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-xl font-semibold text-gray-800">
            Mensaje General
          </h3>
          <p className="text-gray-600 mt-2 mb-4">
            Envía un mensaje personalizado a grupos específicos de usuarios según su tipo y estado.
          </p>
          
          {!showMensajeForm ? (
            <button
              onClick={() => setShowMensajeForm(true)}
              className="border border-blue-600 text-blue-600 bg-white px-4 py-2 rounded-md transition-colors hover:bg-blue-600 hover:text-white"
            >
              Crear mensaje
            </button>
          ) : (
            <form onSubmit={handleEnviarMensajeGeneral} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Asunto del mensaje
                </label>
                <input
                  type="text"
                  value={mensajeData.subject}
                  onChange={(e) => setMensajeData({...mensajeData, subject: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Asunto del mensaje"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contenido del mensaje
                </label>
                <textarea
                  value={mensajeData.message}
                  onChange={(e) => setMensajeData({...mensajeData, message: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows={5}
                  placeholder="Escribe aquí el contenido del mensaje..."
                  required
                ></textarea>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipos de usuario
                  </label>
                  {/* Seleccione a qué tipo de cuentas enviar el email */}
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="tipo-estudiante"
                        checked={mensajeData.userTypes.includes('Estudiante')}
                        onChange={() => handleCheckboxChange('userTypes', 'Estudiante')}
                        className="mr-2"
                      />
                      <label htmlFor="tipo-estudiante">Estudiante</label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="tipo-docente"
                        checked={mensajeData.userTypes.includes('Docente')}
                        onChange={() => handleCheckboxChange('userTypes', 'Docente')}
                        className="mr-2"
                      />
                      <label htmlFor="tipo-docente">Docente</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="tipo-administrador"
                        checked={mensajeData.userTypes.includes('Administrador')}
                        onChange={() => handleCheckboxChange('userTypes', 'Administrador')}
                        className="mr-2"
                      />
                      <label htmlFor="tipo-administrador">Administrador</label>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estados de usuario
                  </label>
                  {/* Seleccione a qué estado de cuentas enviar el email */}
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="estado-activa"
                        checked={mensajeData.userStatuses.includes('Activa')}
                        onChange={() => handleCheckboxChange('userStatuses', 'Activa')}
                        className="mr-2"
                      />
                      <label htmlFor="estado-activa">Activa</label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="estado-inactiva"
                        checked={mensajeData.userStatuses.includes('Inactiva')}
                        onChange={() => handleCheckboxChange('userStatuses', 'Inactiva')}
                        className="mr-2"
                      />
                      <label htmlFor="estado-inactiva">Inactiva</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="estado-matricula"
                        checked={mensajeData.userStatuses.includes('Matricula')}
                        onChange={() => handleCheckboxChange('userStatuses', 'Matricula')}
                        className="mr-2"
                      />
                      <label htmlFor="estado-matricula">Matricula</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="estado-pendiente"
                        checked={mensajeData.userStatuses.includes('Pendiente')}
                        onChange={() => handleCheckboxChange('userStatuses', 'Pendiente')}
                        className="mr-2"
                      />
                      <label htmlFor="estado-pendiente">Pendiente</label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={loading === "mensaje"}
                  className={`border border-blue-600 text-blue-600 bg-white px-4 py-2 rounded-md transition-colors
                    ${loading === "mensaje" ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600 hover:text-white"}`}
                >
                  {loading === "mensaje" ? "Enviando..." : "Enviar mensaje"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowMensajeForm(false)}
                  className="border border-gray-300 text-gray-700 bg-white px-4 py-2 rounded-md transition-colors hover:bg-gray-100 hover:text-gray-900"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Tarjeta de Cambio de Curso (desactivada) */}
        <div className="border border-gray-200 rounded-lg p-6 shadow-sm bg-gray-50">
          <h3 className="text-xl font-semibold text-gray-800">
            Cambiar de curso
          </h3>
          <p className="text-gray-600 mt-2 mb-4">
            Pasar de curso a todos los alumnos que cumplan con los criterios
            mínimos.
          </p>
          <button
            disabled={true}
            className="border border-gray-400 text-gray-400 bg-white px-4 py-2 rounded-md cursor-not-allowed"
          >
            Próximamente
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccionesGenerales;
