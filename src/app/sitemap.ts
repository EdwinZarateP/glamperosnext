// app/sitemap.ts

export default function sitemap() {
  const baseUrl = "https://glamperos.com";

  // 1. Rutas básicas
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
  ].map(path => ({
    url: `${baseUrl}/${path}`,
    lastModified: new Date().toISOString(),
  }));

  // 2. Listado de ciudades, tipos y amenidades clave
  const ciudades   = ["medellin", "bogota", "cali"];
  const tipos      = ["domo", "tipi", "tienda", "cabana", "lumipod"];
  const amenidades = ["jacuzzi", "piscina", "mascotas"];

  // 3. Generar combinaciones ciudad + tipo
  const cityTypePaths = ciudades.flatMap(ciudad =>
    tipos.map(tipo => ({
      url:  `${baseUrl}/${ciudad}/${tipo}`,
      lastModified: new Date().toISOString(),
    }))
  );

  // 4. Ciudad + amenidad
  const cityAmenityPaths = ciudades.flatMap(ciudad =>
    amenidades.map(amen => ({
      url:  `${baseUrl}/${ciudad}/${amen}`,
      lastModified: new Date().toISOString(),
    }))
  );

  // 5. Ciudad + tipo + amenidad
  const cityTypeAmenPaths = ciudades.flatMap(ciudad =>
    tipos.flatMap(tipo =>
      amenidades.map(amen => ({
        url:  `${baseUrl}/${ciudad}/${tipo}/${amen}`,
        lastModified: new Date().toISOString(),
      }))
    )
  );

  return [
    ...staticPaths,
    ...cityTypePaths,
    ...cityAmenityPaths,
    ...cityTypeAmenPaths,
  ];
}
