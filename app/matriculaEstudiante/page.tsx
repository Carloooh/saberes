"use client";
import React, { useEffect, useState } from "react";

interface Curso {
  id_curso: string;
  nombre_curso: string;
}

const matriculaEstudiante = () => {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    const payload = {
      rut_usuario: formData.get("rut") as string,
      tipo_usuario: formData.get("userType") as string,
      email: formData.get("email") as string,
      clave: formData.get("clave") as string,
      nombres: formData.get("name") as string,
      apellidos: formData.get("apellido") as string,
    };

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
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
        <h1 className="text-3xl text-center w-full">Formulario de matrícula</h1>
        <p className="pt-3">
          Para matricularte necesitarás los siguientes documentos en formato
          digital:
        </p>
        <ul className="text-sm">
          <li>Certificado de nacimiento (para todo trámite)</li>
          <li>Certificado de último año cursado y aprobado por el Mineduc</li>
          <li>Registro Social de Hogares (comuna El Quisco)</li>
          <li>Fotocopia de carnet del adulto responsable (por ambos lados)</li>
          <li>
            Certificado de diagnóstico en caso de que el alumno presente una
            necesidad educativa especial
          </li>
        </ul>
        <div>
          <span className="text-red-500 text-sm">
            {" "}
            Los campos marcados con * son obligatorios
          </span>
          <form onSubmit={handleSubmit} className="flex flex-col space-y-5">
            <fieldset className="border border-solid border-gray-300 p-3">
              <legend className="text-sm text-gray-700">
                Información personal
              </legend>
            </fieldset>
            <fieldset className="border border-solid border-gray-300 p-3">
              <legend className="text-sm text-gray-700">
                Información de contactos
              </legend>
            </fieldset>
            <fieldset className="border border-solid border-gray-300 p-3">
              <legend className="text-sm text-gray-700">
                Información académica
              </legend>
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
                      placeholder="Especifique la alergia (opcional)"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="prevision-medica"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Previsión médica <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="prevision-medica"
                    placeholder="Ejemplo: Fonasa, Isapre"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="servicio-emergencia"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Servicio de emergencia{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="servicio-emergencia"
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
                    htmlFor="certificado-nacimiento"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Certificado de nacimiento (para todo trámite){" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    id="certificado-nacimiento"
                    accept=".pdf,.doc,.docx,image/png,image/jpeg"
                    className="mt-1 block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="certificado-ultimo-anio"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Certificado de último año cursado y aprobado por el Mineduc{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    id="certificado-ultimo-anio"
                    accept=".pdf,.doc,.docx,image/png,image/jpeg"
                    className="mt-1 block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="registro-social-hogares"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Registro Social de Hogares (comuna El Quisco){" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    id="registro-social-hogares"
                    accept=".pdf,.doc,.docx,image/png,image/jpeg"
                    className="mt-1 block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="fotocopia-carnet"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Fotocopia de carnet del adulto responsable (por ambos lados){" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    id="fotocopia-carnet"
                    accept=".pdf,.doc,.docx,image/png,image/jpeg"
                    className="mt-1 block  text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="certificado-diagnostico"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Certificado de diagnóstico en caso de que el alumno presente
                    una necesidad educativa especial
                  </label>
                  <input
                    type="file"
                    id="certificado-diagnostico"
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
                    id="compromiso1"
                    required
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="compromiso1"
                    className="ml-2 text-sm text-gray-700"
                  >
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
                    id="compromiso2"
                    required
                    className="h-4 w-4  text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="compromiso2"
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
                    id="compromiso3"
                    required
                    className="h-4 w-4  text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="compromiso3"
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
                    id="compromiso4"
                    required
                    className="h-4 w-4  text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="compromiso4"
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
                    id="compromiso5"
                    required
                    className="h-4 w-4  text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="compromiso5"
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
                    id="compromiso6"
                    required
                    className="h-4 w-4  text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="compromiso6"
                    className="ml-2 text-sm text-gray-700"
                  >
                    Estoy consciente que los espacios educativos (aulas
                    adaptadas) del Programa Saberes se llevan a cabo en Sedes
                    Vecinales.
                    <span className="text-red-500">*</span>
                  </label>
                </div>

                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="compromiso7"
                    required
                    className="h-4 w-4  text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="compromiso7"
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
                    id="compromiso8"
                    required
                    className="h-4 w-4  text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="compromiso8"
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
                    id="compromiso9"
                    required
                    className="h-4 w-4  text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="compromiso9"
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

export default matriculaEstudiante;
