export default function sitemap() {
    const baseUrl = "https://glamperos.com";
  
    return [
      { url: `${baseUrl}/`, lastModified: new Date().toISOString() },
      { url: `${baseUrl}/medellin`, lastModified: new Date().toISOString() },
      { url: `${baseUrl}/bogota`, lastModified: new Date().toISOString() },
      { url: `${baseUrl}/cali`, lastModified: new Date().toISOString() },
      // Agrega más URLs de tu sitio si es necesario
    ];
  }
  