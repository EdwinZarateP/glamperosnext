export const CalificacionPromedio = async (glamping_id: string): Promise<{ calificacion_promedio: number; calificacionEvaluaciones: number } | null> => {
    try {
        // URL del endpoint de calificación promedio
        const url = `https://glamperosapi.onrender.com/evaluaciones/glamping/${glamping_id}/promedio`;

        // Petición GET a la API
        const respuesta = await fetch(url);

        // Verificar si la respuesta es exitosa
        if (!respuesta.ok) {
            const errorData = await respuesta.json();
            throw new Error(`Error ${respuesta.status}: ${errorData.detail}`);
        }

        // Obtener los datos en formato JSON
        const data = await respuesta.json();

        console.log("✅ Calificación promedio obtenida:", data);
        return {
            calificacion_promedio: data.calificacion_promedio,
            calificacionEvaluaciones: data.calificacionEvaluaciones
        };

    } catch (error) {
        console.error("❌ Error al obtener la calificación promedio:", error);
        return null; // Retorna null en caso de error
    }
};
