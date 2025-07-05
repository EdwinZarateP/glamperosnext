const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;
export async function ObtenerUsuarioPorId(Id_Solicitado: string): Promise<any> {
    try {
      const respuesta = await fetch(`${API_BASE}/usuarios/${Id_Solicitado}`, {
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
