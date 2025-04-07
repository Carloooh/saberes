"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

type User = {
  id_user: string;
  rut_usuario: string;
  nombres: string;
  apellidos: string;
  email: string;
  tipo_usuario: string;
  estado: string;
  selected?: boolean;
};

type ModalSeleccionUsuariosProps = {
  isOpen: boolean;
  onClose: () => void;
  onSendEmails: (subject: string, message: string, userIds: string[]) => Promise<void>;
  loading: boolean;
};

const ModalSeleccionUsuarios = ({
  isOpen,
  onClose,
  onSendEmails,
  loading
}: ModalSeleccionUsuariosProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loadingUsers, setLoadingUsers] = useState<boolean>(true);
  const [emailData, setEmailData] = useState({
    subject: "",
    message: "",
  });

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredUsers(users);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = users.filter(
        (user) =>
          user.nombres.toLowerCase().includes(term) ||
          user.apellidos.toLowerCase().includes(term) ||
          user.rut_usuario.toLowerCase().includes(term)
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await fetch("/api/administrador/acciones-generales/usuarios");
      const data = await response.json();

      if (data.success) {
        setUsers(data.users.map((user: User) => ({ ...user, selected: false })));
        setFilteredUsers(data.users.map((user: User) => ({ ...user, selected: false })));
      } else {
        toast.error(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
      toast.error("Ocurrió un error al cargar la lista de usuarios.");
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSelectUser = (userId: string) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id_user === userId ? { ...user, selected: !user.selected } : user
      )
    );
  };

  const handleSelectAll = () => {
    const allSelected = filteredUsers.every((user) => user.selected);
    setUsers((prevUsers) =>
      prevUsers.map((user) => {
        if (filteredUsers.some((filtered) => filtered.id_user === user.id_user)) {
          return { ...user, selected: !allSelected };
        }
        return user;
      })
    );
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    const selectedUsers = users.filter((user) => user.selected);
    
    if (selectedUsers.length === 0) {
      toast.error("Debes seleccionar al menos un usuario");
      return;
    }

    if (!emailData.subject.trim()) {
      toast.error("El asunto del mensaje es obligatorio");
      return;
    }

    if (!emailData.message.trim()) {
      toast.error("El contenido del mensaje es obligatorio");
      return;
    }

    if (
      !confirm(
        `¿Estás seguro de enviar este mensaje a ${selectedUsers.length} usuarios seleccionados? Esta acción no se puede deshacer.`
      )
    ) {
      return;
    }

    await onSendEmails(
      emailData.subject,
      emailData.message,
      selectedUsers.map((user) => user.id_user)
    );
  };

  const selectedCount = users.filter((user) => user.selected).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Enviar Email a Usuarios Seleccionados</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-gray-600 mt-2">
            Selecciona los usuarios a los que deseas enviar un mensaje personalizado.
          </p>
        </div>

        <div className="p-6 overflow-y-auto flex-grow">
          <div className="mb-4">
            <input
              type="text"
              placeholder="Buscar por nombre, apellido o RUT..."
              className="w-full p-2 border border-gray-300 rounded-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {loadingUsers ? (
            <div className="text-center py-4">Cargando usuarios...</div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="select-all"
                    checked={filteredUsers.length > 0 && filteredUsers.every((user) => user.selected)}
                    onChange={handleSelectAll}
                    className="mr-2"
                  />
                  <label htmlFor="select-all">Seleccionar todos</label>
                </div>
                <div>
                  {selectedCount > 0 && (
                    <span className="text-blue-600 font-medium">
                      {selectedCount} usuario{selectedCount !== 1 ? "s" : ""} seleccionado
                      {selectedCount !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="max-h-60 overflow-y-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Seleccionar
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          RUT
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nombre
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tipo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                          <tr key={user.id_user} className={user.selected ? "bg-blue-50" : ""}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="checkbox"
                                checked={user.selected || false}
                                onChange={() => handleSelectUser(user.id_user)}
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">{user.rut_usuario}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {user.nombres} {user.apellidos}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">{user.tipo_usuario}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{user.estado}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                            No se encontraron usuarios con ese criterio de búsqueda
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          <form onSubmit={handleSendEmail} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Asunto del mensaje
              </label>
              <input
                type="text"
                value={emailData.subject}
                onChange={(e) =>
                  setEmailData({ ...emailData, subject: e.target.value })
                }
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
                value={emailData.message}
                onChange={(e) =>
                  setEmailData({ ...emailData, message: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded-md"
                rows={5}
                placeholder="Escribe aquí el contenido del mensaje..."
                required
              ></textarea>
            </div>
          </form>
        </div>

        <div className="p-6 border-t flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="border border-gray-300 text-gray-700 bg-white px-4 py-2 rounded-md transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            Cancelar
          </button>
          <button
            onClick={handleSendEmail}
            disabled={loading || selectedCount === 0}
            className={`border border-blue-600 text-blue-600 bg-white px-4 py-2 rounded-md transition-colors
              ${(loading || selectedCount === 0) ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600 hover:text-white"}`}
          >
            {loading ? "Enviando..." : "Enviar mensaje"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalSeleccionUsuarios;