export default function sitemap() {
    const baseUrl = "https://glamperos.com";
  
    return [
      { url: `${baseUrl}/`, lastModified: new Date().toISOString() },
      { url: `${baseUrl}/Medellin`, lastModified: new Date().toISOString() },
      { url: `${baseUrl}/Bogota`, lastModified: new Date().toISOString() },
      { url: `${baseUrl}/Cali`, lastModified: new Date().toISOString() },
      // Agrega más URLs de tu sitio si es necesario
    ];
  }
  