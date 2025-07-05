
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;

export async function ActualizarFechasReservadas(glampingId: string, fechas: string[]): Promise<any> {
    try {
        const respuesta = await fetch(`${API_BASE}/glampings/${glampingId}/fechasReservadas`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ fechas }),
        });

        if (!respuesta.ok) {
            throw new Error("Error al actualizar las fechas reservadas del glamping.");
        }

        return await respuesta.json();
    } catch (error) {
        console.error("Error en la llamada a la API:", error);
        return null;
    }
}
