const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "seashell-hyena-290200.hostingersite.com",
      },
    ],
  },

  reactStrictMode: true,

  env: {
    WORDPRESS_API: process.env.WORDPRESS_API,
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  webpack: (config) => {
    config.resolve.alias["@"] = path.resolve(__dirname, "src");
    return config;
  },

    async rewrites() {
    return [
      {
        source: "/api/:path*",                      // las llamadas fetch("/api/…")
        destination: "http://localhost:8000/glampings/:path*",  
        // redirige a tu FastAPI en el puerto 8000
      },
    ];
  },

};

module.exports = nextConfig;
