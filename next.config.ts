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
};

export default nextConfig;
