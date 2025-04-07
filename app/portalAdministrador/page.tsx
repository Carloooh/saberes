"use client";
import React from "react";
import Image from "next/image";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import Usuarios from "@/app/components/administrador/Usuarios";
import Noticias from "@/app/components/administrador/Noticias";
import Actividades from "@/app/components/administrador/Actividades";
import Galeria from "@/app/components/administrador/Galeria";
import Sedes from "@/app/components/administrador/Sedes";
import MisionVision from "@/app/components/administrador/MisionVision";
import Faq from "@/app/components/administrador/Faq";
import Cursos from "../components/administrador/Cursos";
import Asignaturas from "../components/administrador/Asignaturas";
import AccionesGenerales from "../components/administrador/AccionesGenerales";

const adminOptions = [
  { id: "usuarios", label: "Usuarios", icon: "usuarios.svg" },
  { id: "cursos", label: "Cursos", icon: "course.svg" },
  { id: "asignaturas", label: "Asignaturas", icon: "subject.svg" },
  { id: "sedes", label: "Sedes", icon: "sedes.svg" },
  { id: "noticias", label: "Noticias", icon: "noticias.svg" },
  { id: "actividades", label: "Actividades", icon: "actividades.svg" },
  { id: "galeria", label: "Galería", icon: "galeria.svg" },
  { id: "mision-vision", label: "Misión/Visión", icon: "misionvision.svg" },
  { id: "faq", label: "Preguntas Frecuentes", icon: "faq.svg" },
  {
    id: "acciones-generales",
    label: "Acciones Generales",
    icon: "acciones.svg",
  },
];

const AdminPanel: React.FC = () => {
  const [activeSection, setActiveSection] = React.useState("usuarios");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const toggleMenu = (event: React.MouseEvent) => {
    event.stopPropagation();
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleSectionChange = (id: string) => {
    setActiveSection(id);
    setIsMobileMenuOpen(false);
  };

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const mobileMenu = document.getElementById("mobileMenu");
      const menuButton = document.getElementById("menuButton");
      if (
        mobileMenu &&
        menuButton &&
        !mobileMenu.contains(event.target as Node) &&
        !menuButton.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <ProtectedRoute allowedRoles={["Administrador"]}>
      <div className="min-h-screen w-full container mx-auto px-4 py-8 relative">
        <header className="top-0 w-full border-b bg-white shadow-sm">
          <div className="flex h-14 items-center justify-between px-4">
            <h1 className="text-lg font-semibold text-gray-900">
              Panel de Administración
            </h1>
            
            {/* Rest of the header remains the same */}
            <div className="relative">
              <button
                id="menuButton"
                className="lg:hidden inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#2196F3]"
                aria-expanded="false"
                onClick={toggleMenu}
              >
                <span className="sr-only">Abrir menú</span>
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>

              <div
                id="mobileMenu"
                className={`absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ${
                  isMobileMenuOpen ? "block" : "hidden"
                } z-9`}
              >
                {adminOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleSectionChange(option.id)}
                    className={`w-full text-left px-4 py-2 text-sm ${
                      activeSection === option.id
                        ? "bg-indigo-50 text-indigo-600 font-medium"
                        : "text-gray-700 hover:bg-gray-50 hover:text-[#2196F3]"
                    } transition-colors z-9`}
                  >
                    <div className="flex items-center gap-3">
                      <Image
                        src={`/icons/${option.icon}`}
                        className="size-4"
                        alt=""
                        width={24}
                        height={24}
                      />
                      {option.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </header>
        <div className="flex h-[calc(100vh-3.5rem)] mx-auto px-4 py-8">
          <aside className="hidden lg:block w-64 border-r bg-white">
            <nav className="py-2">
              {adminOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleSectionChange(option.id)}
                  className={`w-full text-left flex items-center gap-3 px-3 py-2 text-sm font-medium ${
                    activeSection === option.id
                      ? "bg-indigo-50 text-indigo-600 border-r-4 border-indigo-600"
                      : "text-gray-700 hover:bg-gray-50 hover:text-[#2196F3]"
                  } transition-colors`}
                >
                  <Image
                    src={`/icons/${option.icon}`}
                    className={
                      activeSection === option.id ? "text-indigo-600" : ""
                    }
                    alt=""
                    width={24}
                    height={24}
                  />
                  {option.label}
                </button>
              ))}
            </nav>
          </aside>

          <main className="flex-1 overflow-y-auto">
            <div id="content" className="mx-auto max-w-7xl">
              {activeSection === "usuarios" && <Usuarios />}
              {activeSection === "cursos" && <Cursos />}
              {activeSection === "asignaturas" && <Asignaturas />}
              {activeSection === "sedes" && <Sedes />}
              {activeSection === "noticias" && <Noticias />}
              {activeSection === "actividades" && <Actividades />}
              {activeSection === "galeria" && <Galeria />}
              {activeSection === "mision-vision" && <MisionVision />}
              {activeSection === "faq" && <Faq />}
              {activeSection === "acciones-generales" && <AccionesGenerales />}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default AdminPanel;
