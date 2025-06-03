// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */
//   eslint: {
//     ignoreDuringBuilds: true,
//   },
// };

// export default nextConfig;

// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   output: "standalone",
//   experimental: {
//     serverActions: {
//       bodySizeLimit: "1024mb",
//     },
//   },
//   eslint: {
//     ignoreDuringBuilds: true,
//   },
// };

// module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  experimental: {
    serverActions: {
      bodySizeLimit: "1024mb",
    },
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Add headers configuration for cookie handling
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
        ],
      },
    ];
  },
  // Ensure cookies work properly behind proxies
  poweredByHeader: false,
  // Add this to ensure proper hostname handling in Docker
  assetPrefix: process.env.NODE_ENV === 'production' ? 'https://saberes.elquisco.cl' : undefined,
};

module.exports = nextConfig;
