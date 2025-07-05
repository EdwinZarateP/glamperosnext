import axios from "axios";

// Definir el tipo de datos que devuelve la función
export interface DatosBancariosProps {
  banco: string | null;
  numeroCuenta: string | null;
  tipoCuenta: string | null;
  tipoDocumento: string | null;
  numeroDocumento: string | null;
  nombreTitular: string | null;
}
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;

const TraerDatosBancarios = async (usuarioId: string): Promise<DatosBancariosProps | null> => {
  try {
    const respuesta = await axios.get(`${API_BASE}/usuarios/${usuarioId}`);
    if (!respuesta.data) return null;

    return {
      banco: respuesta.data.banco,             // <-- sin valores por defecto
      numeroCuenta: respuesta.data.numeroCuenta,
      tipoCuenta: respuesta.data.tipoCuenta,
      tipoDocumento: respuesta.data.tipoDocumento,
      numeroDocumento: respuesta.data.numeroDocumento,
      nombreTitular: respuesta.data.nombreTitular,
    };
  } catch (error) {
    console.error("Error al obtener los datos bancarios:", error);
    return null;
  }
};

export default TraerDatosBancarios;
