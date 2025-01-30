import Image from "next/image";

const Hero = () => {
  return (
    <section className="bg-gray-50 px-2 pt-8">
      <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between">
        <div className="md:w-1/2 mb-8 md:mb-0">
          <h2 className="text-3xl font-semibold text-gray-900 sm:text-4xl">Saberes</h2>
          <p className="mt-4 text-gray-700 text-lg">
            <strong>Visión:</strong> Estudio, investigación e innovación en educación social, educativa y cultural...
          </p>
          <p className="mt-4 text-gray-700 text-lg">
            <strong>Misión:</strong> Conformar un equipo multidisciplinario con capacidades y herramientas...
          </p>
        </div>
        <div className="md:w-1/2 flex justify-center">
          <Image src="/gato.png" width={500} height={300} alt="Gato" className="rounded shadow-lg" />
        </div>
      </div>
    </section>
  );
};

export default Hero;