import axios from "axios";

// Definir el tipo de datos que devuelve la función
export interface DatosBancariosProps {
  banco: string | null;
  numeroCuenta: string | null;
  tipoCuenta: string | null;
  tipoDocumento: string | null;
}

const TraerDatosBancarios = async (usuarioId: string): Promise<DatosBancariosProps | null> => {
  try {
    const respuesta = await axios.get(`https://glamperosapi.onrender.com/usuarios/${usuarioId}`);
    if (!respuesta.data) return null;

    return {
      banco: respuesta.data.banco,             // <-- sin valores por defecto
      numeroCuenta: respuesta.data.numeroCuenta,
      tipoCuenta: respuesta.data.tipoCuenta,
      tipoDocumento: respuesta.data.tipoDocumento,
    };
  } catch (error) {
    console.error("Error al obtener los datos bancarios:", error);
    return null;
  }
};

export default TraerDatosBancarios;
