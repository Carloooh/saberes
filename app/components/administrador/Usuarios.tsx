import React from 'react';

interface User {
  name: string;
  role: string;
  status: 'Activo' | 'Inactivo';
}

const users: User[] = [
  { name: 'Ana García', role: 'Estudiante', status: 'Activo' },
  { name: 'Juan Martínez', role: 'Profesor', status: 'Activo' },
  { name: 'María López', role: 'Estudiante', status: 'Inactivo' },
  { name: 'Carlos Rodríguez', role: 'Profesor', status: 'Activo' }
];

const Usuarios: React.FC = () => {
  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Usuarios</h3>
        <div className="space-y-3">
          {users.map((user) => (
            <div key={user.name} className="flex items-center justify-between rounded-md border border-gray-200 p-3">
              <div>
                <h4 className="text-sm font-medium text-gray-900">{user.name}</h4>
                <p className="text-sm text-gray-500">{user.role}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                  user.status === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {user.status}
                </span>
                <button
                  type="button"
                  className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#2196F3] focus:ring-offset-2"
                >
                  Editar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Usuarios;