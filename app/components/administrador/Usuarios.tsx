"use client";

import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

interface User {
  rut_usuario: string;
  nombres: string;
  apellidos: string;
  tipo_usuario: string;
  estado: string;
  email: string;
  curso_actual?: string;
}

interface Course {
  id_curso: string;
  nombre_curso: string;
}

interface CursoConAsignaturas {
  id_curso: string;
  nombre_curso: string;
  asignaturas: {
    id_asignatura: string;
    nombre_asignatura: string;
  }[];
}

interface TeacherCourses {
  [rut: string]: {
    [cursoId: string]: string[];
  };
}

const Usuarios: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [cursosAsignaturas, setCursosAsignaturas] = useState<
    CursoConAsignaturas[]
  >([]);
  const [selectedTeacherCourses, setSelectedTeacherCourses] =
    useState<TeacherCourses>({});
  // const [openMenus, setOpenMenus] = useState<{
  //   [rut: string]: "status" | "courses" | null;
  // }>({});
  const [openMenus, setOpenMenus] = useState<{
    [rut: string]: "status" | "courses" | "student-course" | null;
  }>({});

  useEffect(() => {
    fetchUsers();
    fetchCourses();
    fetchCursosAsignaturas();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, statusFilter, typeFilter, users]);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/usuarios");
      const data = await response.json();
      if (data.success) {
        setUsers(data.data);
        setFilteredUsers(data.data);

        // Para cada docente, se obtiene su asignación de cursos
        data.data.forEach(async (user: User) => {
          if (user.tipo_usuario === "Docente") {
            await fetchTeacherCourses(user.rut_usuario);
          }
        });
      }
    } catch (error) {
      toast.error("Error al cargar usuarios");
    }
  };

  const fetchTeacherCourses = async (rutUsuario: string) => {
    try {
      const response = await fetch(
        `/api/admin/docentecursosasignaturas?rut=${rutUsuario}`
      );
      const data = await response.json();
      if (data.success) {
        setSelectedTeacherCourses((prev) => ({
          ...prev,
          [rutUsuario]: data.data,
        }));
      }
    } catch (error) {
      console.error("Error fetching teacher courses:", error);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await fetch("/api/admin/docentecursosasignaturas");
      const data = await response.json();
      if (data.success) {
        setCourses(data.data);
      }
    } catch (error) {
      toast.error("Error al cargar cursos");
    }
  };

  const fetchCursosAsignaturas = async () => {
    try {
      const response = await fetch("/api/cursos-con-asignaturas");
      const data = await response.json();
      if (data) {
        setCursosAsignaturas(data);
      }
    } catch (error) {
      toast.error("Error al cargar cursos y asignaturas");
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          `${user.nombres} ${user.apellidos}`
            .toLowerCase()
            .includes(searchLower) ||
          user.rut_usuario.toLowerCase().includes(searchLower) ||
          user.estado.toLowerCase().includes(searchLower) ||
          user.tipo_usuario.toLowerCase().includes(searchLower) ||
          (user.curso_actual &&
            user.curso_actual.toLowerCase().includes(searchLower))
      );
    }

    if (statusFilter) {
      filtered = filtered.filter((user) => user.estado === statusFilter);
    }

    if (typeFilter) {
      filtered = filtered.filter((user) => user.tipo_usuario === typeFilter);
    }

    setFilteredUsers(filtered);
  };

  const handleStatusChange = async (user: User, newStatus: string) => {
    try {
      const response = await fetch("/api/admin/usuarios", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rut_usuario: user.rut_usuario,
          estado: newStatus,
        }),
      });

      if (response.ok) {
        toast.success("Estado actualizado correctamente");
        setOpenMenus((prev) => ({ ...prev, [user.rut_usuario]: null }));
        fetchUsers();
      } else {
        toast.error("Error al actualizar estado");
      }
    } catch (error) {
      toast.error("Error al actualizar estado");
    }
  };

  const handleDeleteUser = async (rut: string) => {
    if (!confirm("¿Está seguro de eliminar este usuario?")) return;

    try {
      const response = await fetch(`/api/admin/usuarios?rut=${rut}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Usuario eliminado correctamente");
        fetchUsers();
      } else {
        toast.error("Error al eliminar usuario");
      }
    } catch (error) {
      toast.error("Error al eliminar usuario");
    }
  };

  const handleChangeCourse = async (rut_usuario: string) => {
    if (!selectedCourse) {
      toast.error("Seleccione un curso");
      return;
    }

    try {
      const response = await fetch("/api/admin/usuarios", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rut_usuario,
          id_curso: selectedCourse,
        }),
      });

      if (response.ok) {
        toast.success("Curso actualizado correctamente");
        setSelectedCourse("");
        fetchUsers();
      } else {
        toast.error("Error al actualizar curso");
      }
    } catch (error) {
      toast.error("Error al actualizar curso");
    }
  };

  const handleTeacherCourseChange = (rutUsuario: string, cursoId: string) => {
    setSelectedTeacherCourses((prev) => {
      const userCourses = prev[rutUsuario] || {};
      if (userCourses[cursoId]) {
        const { [cursoId]: removed, ...rest } = userCourses;
        return { ...prev, [rutUsuario]: rest };
      } else {
        return {
          ...prev,
          [rutUsuario]: { ...userCourses, [cursoId]: [] },
        };
      }
    });
  };

  const handleTeacherAsignaturaChange = (
    rutUsuario: string,
    cursoId: string,
    asignaturaId: string
  ) => {
    setSelectedTeacherCourses((prev) => {
      const userCourses = prev[rutUsuario] || {};
      const courseAsignaturas = userCourses[cursoId] || [];
      return {
        ...prev,
        [rutUsuario]: {
          ...userCourses,
          [cursoId]: courseAsignaturas.includes(asignaturaId)
            ? courseAsignaturas.filter((id) => id !== asignaturaId)
            : [...courseAsignaturas, asignaturaId],
        },
      };
    });
  };

  const handleSaveTeacherCourses = async (rutUsuario: string) => {
    try {
      const coursesData = Object.entries(
        selectedTeacherCourses[rutUsuario] || {}
      )
        .filter(([_, asignaturas]) => asignaturas.length > 0)
        .map(([cursoId, asignaturas]) => ({
          cursoId,
          asignaturas,
        }));

      const response = await fetch("/api/admin/docentecursosasignaturas", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rut_usuario: rutUsuario,
          cursosAsignaturas: coursesData,
        }),
      });

      if (response.ok) {
        toast.success("Cursos y asignaturas actualizados correctamente");
        setOpenMenus((prev) => ({ ...prev, [rutUsuario]: null }));
        await fetchTeacherCourses(rutUsuario);
      } else {
        toast.error("Error al actualizar cursos y asignaturas");
      }
    } catch (error) {
      toast.error("Error al actualizar cursos y asignaturas");
    }
  };

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Usuarios</h3>

        {/* Filtros */}
        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <input
            type="text"
            placeholder="Buscar por nombre, RUT, estado o tipo..."
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2196F3] focus:ring-[#2196F3]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2196F3] focus:ring-[#2196F3]"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Todos los estados</option>
            <option value="Activa">Activa</option>
            <option value="Inactiva">Inactiva</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Matricula">Matricula</option>
          </select>
          <select
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2196F3] focus:ring-[#2196F3]"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">Todos los tipos</option>
            <option value="Estudiante">Estudiante</option>
            <option value="Docente">Docente</option>
            <option value="Administrador">Administrador</option>
          </select>
        </div>

        {/* Lista de usuarios */}
        <div className="space-y-4">
          {filteredUsers.map((user) => (
            <div
              key={user.rut_usuario}
              className="rounded-md border border-gray-200 p-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">
                    {user.nombres} {user.apellidos}
                  </h4>
                  <p className="text-sm text-gray-500">
                    RUT: {user.rut_usuario}
                  </p>
                  <p className="text-sm text-gray-500">
                    Tipo: {user.tipo_usuario}
                  </p>
                  {user.curso_actual && (
                    <p className="text-sm text-gray-500">
                      Curso: {user.curso_actual}
                    </p>
                  )}
                </div>

                <div className="flex flex-col space-y-2">
                  <span
                    className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      user.estado === "Activa"
                        ? "bg-green-100 text-green-800"
                        : user.estado === "Inactiva"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {user.estado}
                  </span>

                  <select
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm"
                    onChange={(e) => {
                      const action = e.target.value;
                      if (!action) return;
                      switch (action) {
                        case "profile":
                          window.open(`/perfil/${user.rut_usuario}`, "_blank");
                          break;
                        case "status":
                          setOpenMenus((prev) => ({
                            ...prev,
                            [user.rut_usuario]: "status",
                          }));
                          break;
                        case "courses":
                          if (user.tipo_usuario === "Docente") {
                            setOpenMenus((prev) => ({
                              ...prev,
                              [user.rut_usuario]: "courses",
                            }));
                          } else if (user.tipo_usuario === "Estudiante") {
                            setOpenMenus((prev) => ({
                              ...prev,
                              [user.rut_usuario]: "student-course",
                            }));
                          }
                          break;
                        case "delete":
                          handleDeleteUser(user.rut_usuario);
                          break;
                      }
                      e.target.value = "";
                    }}
                  >
                    <option value="">Seleccionar acción...</option>
                    <option value="profile">Ver perfil</option>
                    <option value="status">Cambiar estado</option>
                    {user.tipo_usuario === "Docente" && (
                      <option value="courses">
                        Gestionar cursos y asignaturas
                      </option>
                    )}
                    {user.tipo_usuario === "Estudiante" && (
                      <option value="courses">Cambiar curso</option>
                    )}
                    <option value="delete" className="text-red-600">
                      Eliminar cuenta
                    </option>
                  </select>
                </div>
              </div>

              {/* Panel de cambio de estado */}
              {openMenus[user.rut_usuario] === "status" && (
                <div className="mt-2 border-t pt-2">
                  <select
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm"
                    onChange={(e) => {
                      handleStatusChange(user, e.target.value);
                    }}
                    value=""
                  >
                    <option value="" disabled>
                      Seleccionar estado
                    </option>
                    {user.estado === "Pendiente" ||
                    user.estado === "Matricula" ? (
                      <>
                        <option value="Activa">Aprobar</option>
                        <option value="Inactiva">Rechazar</option>
                      </>
                    ) : (
                      <>
                        <option value="Activa">Activar</option>
                        <option value="Inactiva">Desactivar</option>
                      </>
                    )}
                  </select>
                </div>
              )}

              {openMenus[user.rut_usuario] === "student-course" && (
                <div className="mt-2 border-t pt-2">
                  <div className="flex space-x-2">
                    <select
                      className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm"
                      value={selectedCourse}
                      onChange={(e) => setSelectedCourse(e.target.value)}
                    >
                      <option value="">Seleccionar curso...</option>
                      {courses.map((course) => (
                        <option key={course.id_curso} value={course.id_curso}>
                          {course.nombre_curso}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleChangeCourse(user.rut_usuario)}
                      className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => {
                        setOpenMenus((prev) => ({
                          ...prev,
                          [user.rut_usuario]: null,
                        }));
                        setSelectedCourse("");
                      }}
                      className="px-3 py-1.5 text-sm border rounded-md hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {/* Panel de gestión de cursos y asignaturas para docentes (más compacto) */}
              {openMenus[user.rut_usuario] === "courses" &&
                user.tipo_usuario === "Docente" && (
                  <div className="mt-2 border-t pt-2">
                    <div className="space-y-2">
                      {cursosAsignaturas.map((curso) => (
                        <div
                          key={curso.id_curso}
                          className="border rounded-md p-2 bg-white"
                        >
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={
                                selectedTeacherCourses[user.rut_usuario]?.[
                                  curso.id_curso
                                ]?.length > 0 || false
                              }
                              onChange={() =>
                                handleTeacherCourseChange(
                                  user.rut_usuario,
                                  curso.id_curso
                                )
                              }
                              className="rounded border-gray-300"
                            />
                            <span className="ml-2 text-sm font-medium">
                              {curso.nombre_curso}
                            </span>
                          </div>
                          {selectedTeacherCourses[user.rut_usuario]?.[
                            curso.id_curso
                          ] && (
                            <div className="mt-1 ml-4 grid grid-cols-2 gap-2">
                              {curso.asignaturas.map((asignatura) => (
                                <label
                                  key={asignatura.id_asignatura}
                                  className="flex items-center text-sm"
                                >
                                  <input
                                    type="checkbox"
                                    checked={
                                      selectedTeacherCourses[
                                        user.rut_usuario
                                      ]?.[curso.id_curso]?.includes(
                                        asignatura.id_asignatura
                                      ) || false
                                    }
                                    onChange={() =>
                                      handleTeacherAsignaturaChange(
                                        user.rut_usuario,
                                        curso.id_curso,
                                        asignatura.id_asignatura
                                      )
                                    }
                                    className="rounded border-gray-300"
                                  />
                                  <span className="ml-1 truncate">
                                    {asignatura.nombre_asignatura}
                                  </span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 flex justify-end space-x-2">
                      <button
                        onClick={() =>
                          setOpenMenus((prev) => ({
                            ...prev,
                            [user.rut_usuario]: null,
                          }))
                        }
                        className="px-3 py-1.5 text-sm border rounded-md hover:bg-gray-50"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() =>
                          handleSaveTeacherCourses(user.rut_usuario)
                        }
                        className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Guardar cambios
                      </button>
                    </div>
                  </div>
                )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Usuarios;
