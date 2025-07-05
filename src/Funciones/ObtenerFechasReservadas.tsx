const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;
export async function ObtenerFechasReservadas(glampingId: string): Promise<string[] | null> {
    try {
        const respuesta = await fetch(`${API_BASE}/glampings/${glampingId}/fechasReservadas`, {
            cache: "no-store",
        });

        if (!respuesta.ok) {
            throw new Error("Error al obtener las fechas reservadas del glamping.");
        }

        return await respuesta.json();
    } catch (error) {
        console.error("Error en la llamada a la API:", error);
        return null;
    }
}
