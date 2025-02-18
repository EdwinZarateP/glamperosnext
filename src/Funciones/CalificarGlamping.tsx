export const CalificarGlamping = async (glamping_id: string, calificacion: number): Promise<boolean> => {
    try {
        // Validar que la calificación esté entre 0 y 5
        if (calificacion < 0 || calificacion > 5) {
            throw new Error("La calificación debe estar entre 0 y 5.");
        }

        // URL del endpoint de actualización
        const url = `https://glamperosapi.onrender.com/glampings/${glamping_id}/calificacion`;

        // Configuración de la petición
        const respuesta = await fetch(url, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({ calificacion: calificacion.toString() }),
        });

        // Verificar si la respuesta es exitosa
        if (!respuesta.ok) {
            const errorData = await respuesta.json();
            throw new Error(`Error ${respuesta.status}: ${errorData.detail}`);
        }

        console.log("✅ Calificación actualizada con éxito");
        return true; // Retorna true si la actualización fue exitosa

    } catch (error) {
        console.error("❌ Error al actualizar la calificación:", error);
        return false; // Retorna false si hubo un error
    }
};
