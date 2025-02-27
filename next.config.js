/** @type {import('next').NextConfig} */ 
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
      },
    ],
  },
  reactStrictMode: true, // Opcional: habilita el modo estricto de React

  async redirects() {
    return [
      {
        source: "/Medellin",
        destination: "/medellin",
        permanent: true, // 301 - Redirección permanente
      },
      {
        source: "/Bogota",
        destination: "/bogota",
        permanent: true, // 301 - Redirección permanente
      },
      {
        source: "/Cali",
        destination: "/cali",
        permanent: true, // 301 - Redirección permanente
      },
    ];
  },
};

module.exports = nextConfig;
