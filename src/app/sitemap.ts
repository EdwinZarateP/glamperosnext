export default function sitemap() {
  const baseUrl = "https://glamperos.com";

  return [
    { url: `${baseUrl}/`, lastModified: new Date().toISOString() },
    { url: `${baseUrl}/medellin`, lastModified: new Date().toISOString() },
    { url: `${baseUrl}/bogota`, lastModified: new Date().toISOString() },
    { url: `${baseUrl}/cali`, lastModified: new Date().toISOString() },
    { url: `${baseUrl}/glampings`, lastModified: new Date().toISOString() },  
    { url: `${baseUrl}/registro`, lastModified: new Date().toISOString() },  
  ];
}

