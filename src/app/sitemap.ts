// app/sitemap.ts
export default async function sitemap() {
  const baseUrl = "https://glamperos.com";

  // 1. Rutas estáticas principales
  const staticPaths = [
    "",
    "medellin",
    "bogota",
    "cali",
    "registro",
    "propietarios",
    "blog",
    "guatavita-cundinamarca",
    "san-francisco-cundinamarca",
    "guatape-antioquia",
  ].map((path) => ({
    url: `${baseUrl}/${path}`,
    lastModified: new Date().toISOString(),
  }));

  // 2. Rutas dinámicas de blog desde WordPress
  let blogPaths: { url: string; lastModified: string }[] = [];
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_WORDPRESS_API}/posts?_fields=slug,date&per_page=100`,
      { cache: "no-store" }
    );
    if (res.ok) {
      const posts = await res.json();
      blogPaths = posts.map((post: any) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: new Date(post.date).toISOString(),
      }));
    }
  } catch (err) {
    console.error("Error cargando posts para sitemap:", err);
  }

  // 3. Listado de ciudades, tipos y amenidades clave
  const ciudades = ["medellin", "bogota", "cali"];
  const tipos = ["domo", "tipi", "tienda", "cabana", "lumipod", "chalet"];
  const amenidades = ["jacuzzi", "piscina", "mascotas"];

  const cityTypePaths = ciudades.flatMap((ciudad) =>
    tipos.map((tipo) => ({
      url: `${baseUrl}/${ciudad}/${tipo}`,
      lastModified: new Date().toISOString(),
    }))
  );

  const cityAmenityPaths = ciudades.flatMap((ciudad) =>
    amenidades.map((amen) => ({
      url: `${baseUrl}/${ciudad}/${amen}`,
      lastModified: new Date().toISOString(),
    }))
  );

  const cityTypeAmenPaths = ciudades.flatMap((ciudad) =>
    tipos.flatMap((tipo) =>
      amenidades.map((amen) => ({
        url: `${baseUrl}/${ciudad}/${tipo}/${amen}`,
        lastModified: new Date().toISOString(),
      }))
    )
  );

  return [
    ...staticPaths,
    ...blogPaths,          // ✅ ahora los posts se incluyen
    ...cityTypePaths,
    ...cityAmenityPaths,
    ...cityTypeAmenPaths,
  ];
}
