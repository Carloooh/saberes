import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b bg-white shadow-sm">
      <div className="h-1 w-full bg-gradient-to-r from-[#2196F3] to-[#E91E63]"></div>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link className="flex items-center gap-2" href="/">
              <Image
                src="/LogoSaberes.webp"
                alt="Logo de Saberes"
                width={128}
                height={64}
                className="max-h-16 w-auto"
              />
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-sm font-medium text-black hover:text-[#2196F3] transition-colors">Inicio</Link>
              <Link href="/portalAlumno" className="text-sm font-medium text-black hover:text-[#FF7043] transition-colors">Portal Alumnos</Link>
              <Link href="/portalDocente" className="text-sm font-medium text-black hover:text-[#4CAF50] transition-colors">Portal Docente</Link>
              <Link href="/portalAdministrador" className="text-sm font-medium text-black hover:text-[#FFD700] transition-colors">Portal Administrador</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="sm:flex sm:gap-4">
              <button id="loginBtn" className="rounded-md border border-[#2196F3] text-[#2196F3] hover:bg-[#FFD700]/20 px-5 py-2.5 text-sm font-normal transition">Acceder</button>
              <div className="hidden sm:flex">
                <button id="registerBtn" className="rounded-md bg-[#E91E63]/85 text-white hover:bg-[#E91E63] px-5 py-2.5 text-sm font-normal transition">Registrarse</button>
              </div>
            </div>
            <div className="block md:hidden relative">
              <button id="menu-button" className="rounded bg-gray-100 p-2 text-gray-600 transition hover:text-gray-600/75">
                <svg xmlns="http://www.w3.org/2000/svg" className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div id="menu" className="absolute right-0 hidden mt-2 bg-white shadow-lg rounded-md w-48 z-10">
                <Link href="/" className="block px-4 py-2 text-sm text-black hover:bg-[#2196F3] hover:text-white transition-colors">Inicio</Link>
                <Link href="/portalAlumno" className="block px-4 py-2 text-sm text-black hover:bg-[#FF7043] hover:text-white transition-colors">Portal Alumnos y Apoderados</Link>
                <Link href="/portalDocente" className="block px-4 py-2 text-sm text-black hover:bg-[#4CAF50] hover:text-white transition-colors">Portal Docente</Link>
                <Link href="/portalAdministrador" className="block px-4 py-2 text-sm text-black hover:bg-[#FFD700] hover:text-white transition-colors">Portal Administrador</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}