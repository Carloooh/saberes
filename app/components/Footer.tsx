import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white">
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <Image
          src="/LogoSaberes.webp"
          alt="Logo"
          width={384}
          height={96}
          className="w-48 h-auto sm:w-64 md:w-72 lg:w-80 xl:w-96 mx-auto"
        />
        <p className="mx-auto mt-6 max-w-md text-center leading-relaxed text-gray-500">
          Lorem ipsum dolor, sit amet consectetur adipisicing elit. Incidunt
          consequuntur amet culpa cum itaque neque
        </p>
        <ul className="mt-12 flex justify-center gap-6 md:gap-8">
          <li>
            <Link className="text-gray-700 transition hover:text-gray-700/75" href="/">Inicio</Link>
          </li>
          <li>
            <Link className="text-gray-700 transition hover:text-gray-700/75" href="/galeria">Galería</Link>
          </li>
          <li>
            <Link className="text-gray-700 transition hover:text-gray-700/75" href="/contacto">Contacto</Link>
          </li>
        </ul>
      </div>
    </footer>
  );
}