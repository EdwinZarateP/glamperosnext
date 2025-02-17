export async function ObtenerUsuarioPorId(Id_Solicitado: string): Promise<any> {
    try {
      const respuesta = await fetch(`https://glamperosapi.onrender.com/usuarios/${Id_Solicitado}`, {
        cache: "no-store",
      });
  
      if (!respuesta.ok) {
        throw new Error("Error al obtener la información del usuario.");
      }
  
      return await respuesta.json();
    } catch (error) {
      console.error("Error en la llamada a la API:", error);
      return null;
    }
}
