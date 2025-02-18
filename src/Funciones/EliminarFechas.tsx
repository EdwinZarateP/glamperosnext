import axios from "axios";

/**
 * Elimina fechas reservadas de un glamping en la API de Glamperos.
 * @param {string} glampingId - ID del glamping del cual se eliminarán las fechas.
 * @param {string[]} fechasAEliminar - Lista de fechas en formato "YYYY-MM-DD" a eliminar.
 * @returns {Promise<boolean>} - Retorna `true` si la eliminación fue exitosa, `false` en caso contrario.
 */

export const EliminarFechas = async (glampingId: string, fechasAEliminar: string[]): Promise<boolean> => {
  try {
    if (!glampingId || fechasAEliminar.length === 0) {
      console.error("❌ Error: Se requiere un glampingId y al menos una fecha para eliminar.");
      return false;
    }

    const url = `https://glamperosapi.onrender.com/glampings/${glampingId}/eliminar_fechas`;

    const response = await axios.patch(url, { fechas_a_eliminar: fechasAEliminar });

    if (response.status === 200) {    
      return true;
    } else {
      console.warn("⚠️ No se pudieron eliminar las fechas, respuesta del servidor:", response);
      return false;
    }
  } catch (error: any) {
    console.error("🔥 Error al eliminar fechas reservadas:", error.response?.data?.detail || error.message);
    return false;
  }
};
