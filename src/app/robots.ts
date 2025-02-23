import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/dashboard"], // Ajusta según lo que quieras bloquear
      },
    ],
    sitemap: "https://glamperos.com/sitemap.xml",
  };
}
