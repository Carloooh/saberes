/** @type {import('next').NextConfig} */
const nextConfig = {
  // Asegurar modo standalone
  output: "standalone",

  experimental: {
    serverActions: {
      //bodySizeLimit: "1gb",
      bodySizeLimit: "250mb",
    },
    // Habilitar esta opción si persisten los problemas
    // outputFileTracingRoot: path.join(__dirname, '../../'),
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [{ key: "X-Content-Type-Options", value: "nosniff" }],
      },
    ];
  },

  poweredByHeader: false,

  // Añadir configuración crítica para Docker
  images: {
    unoptimized: true, // Desactivar optimización si hay problemas de memoria
  },
};

module.exports = nextConfig;
