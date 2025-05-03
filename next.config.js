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
};

module.exports = nextConfig;
