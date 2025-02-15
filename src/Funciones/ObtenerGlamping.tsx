export async function ObtenerGlampingPorId(glampingId: string): Promise<any> {
    try {
      const respuesta = await fetch(`https://glamperosapi.onrender.com/glampings/${glampingId}`, {
        // Si quieres deshabilitar el caché:
        cache: "no-store",
      });
  
      if (!respuesta.ok) {
        throw new Error("Error al obtener la información del glamping.");
      }
  
      return await respuesta.json();
    } catch (error) {
      console.error("Error en la llamada a la API:", error);
      return null;
    }
  }
  