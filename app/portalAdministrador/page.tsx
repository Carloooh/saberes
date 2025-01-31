"use client"
import React from 'react';
import Image from 'next/image';
import ProtectedRoute from "@/app/components/ProtectedRoute";

const adminOptions = [
  { id: 'usuarios', label: 'Usuarios', icon: 'usuarios.svg' },
  { id: 'noticias', label: 'Noticias', icon: 'noticias.svg' },
  { id: 'actividades', label: 'Actividades', icon: 'actividades.svg' },
  { id: 'galeria', label: 'Galería', icon: 'galeria.svg' },
  { id: 'sedes', label: 'Sedes', icon: 'sedes.svg' },
  { id: 'mision-vision', label: 'Misión/Visión', icon: 'misionvision.svg' },
  { id: 'faq', label: 'Preguntas Frecuentes', icon: 'faq.svg' }
];

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

const AdminPanel: React.FC = () => {
  const toggleMenu = (event: React.MouseEvent) => {
    event.stopPropagation();
    const mobileMenu = document.getElementById('mobileMenu');
    mobileMenu?.classList.toggle('hidden');
  };

  const handleAnchorClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const id = event.currentTarget.getAttribute('href')?.substring(1);
    const content = document.getElementById('content');
    if (id && content) {
      Array.from(content.children).forEach(child => {
        if (child instanceof HTMLElement) {
          child.style.display = child.id === id ? 'block' : 'none';
        }
      });
    }
    if (window.innerWidth < 1024) {
      const mobileMenu = document.getElementById('mobileMenu');
      mobileMenu?.classList.add('hidden');
    }
  };

  React.useEffect(() => {
    const content = document.getElementById('content');
    if (content) {
      Array.from(content.children).forEach(child => {
        if (child instanceof HTMLElement) {
          child.style.display = child.id === 'usuarios' ? 'block' : 'none';
        }
      });
    }

    const menuButton = document.getElementById('menuButton');
    menuButton?.addEventListener('click', toggleMenu as unknown as EventListenerOrEventListenerObject);

    document.addEventListener('click', (event: MouseEvent) => {
      const mobileMenu = document.getElementById('mobileMenu');
      if (!mobileMenu?.contains(event.target as Node) && !menuButton?.contains(event.target as Node)) {
        mobileMenu?.classList.add('hidden');
      }
    });

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', handleAnchorClick as unknown as EventListenerOrEventListenerObject);
    });

    return () => {
      menuButton?.removeEventListener('click', toggleMenu as unknown as EventListenerOrEventListenerObject);
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.removeEventListener('click', handleAnchorClick as unknown as EventListenerOrEventListenerObject);
      });
    };
  }, []);

  return (
    <ProtectedRoute allowedRoles={["Administrador"]}>
      <div className="min-h-screen w-full bg-gray-50 mx-auto px-4 py-8">
        <header className="top-0  w-full border-b bg-white shadow-sm">
          <div className="flex h-14 items-center justify-between px-4">
            <h1 className="text-lg font-semibold text-gray-900">Panel de Administración</h1>
            <div className="relative">
              <button
                id="menuButton"
                className="lg:hidden inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#2196F3]"
                aria-expanded="false"
              >
                <span className="sr-only">Abrir menú</span>
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              <div id="mobileMenu" className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 hidden z-9">
                {adminOptions.map((option) => (
                  <a
                    key={option.id}
                    href={`#${option.id}`}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#2196F3] transition-colors z-9"
                  >
                      <Image src={`/icons/${option.icon}`} className="size-4" alt="" width={24} height={24} />
                      {option.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </header>
        <div className="flex h-[calc(100vh-3.5rem)] mx-auto px-4 py-8">
          <aside className="hidden lg:block w-64 border-r bg-white">
            <nav className="py-2">
              {adminOptions.map((option) => (
                <a
                  key={option.id}
                  href={`#${option.id}`}
                  className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-[#2196F3] transition-colors hover:fill-[#2196F3]"
                >
                    <Image src={`/icons/${option.icon}`} className="hover:filter-[invert(1) sepia" alt="" width={24} height={24} />
                  {option.label}
                </a>
              ))}
            </nav>
          </aside>

          <main className="flex-1 overflow-y-auto">
            <div id="content" className="mx-auto max-w-7xl p-4">
              <div id="usuarios" className="bg-white shadow sm:rounded-lg">
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

              <div id="mision-vision" className="hidden bg-white shadow sm:rounded-lg">
                <div className="px-4 py-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Misión y Visión</h3>
                  <div className="mt-5 space-y-6">
                    <div>
                      <label htmlFor="mission" className="block text-sm font-medium text-gray-700">Misión</label>
                      <div className="mt-1">
                        <textarea
                          id="mission"
                          name="mission"
                          rows={3}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          placeholder="Ingrese la misión de la institución"
                        ></textarea>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="vision" className="block text-sm font-medium text-gray-700">Visión</label>
                      <div className="mt-1">
                        <textarea
                          id="vision"
                          name="vision"
                          rows={3}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          placeholder="Ingrese la visión de la institución"
                        ></textarea>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      >
                        Guardar cambios
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {['faq', 'noticias', 'actividades', 'galeria', 'sedes'].map((id) => (
                <div key={id} id={id} className="hidden bg-white shadow sm:rounded-lg">
                  <div className="px-4 py-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      {adminOptions.find(opt => opt.id === id)?.label}
                    </h3>
                    {/* Contenido */}
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default AdminPanel;