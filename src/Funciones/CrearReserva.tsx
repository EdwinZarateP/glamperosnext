import Cookies from "js-cookie";

interface ReservaProps {
  idCliente: string;
  idPropietario: string;
  idGlamping: string;
  ciudad_departamento: string;
  fechaInicio: Date;
  fechaFin: Date;
  totalDiasNum: number;
  precioConTarifaNum: number;
  TarifaGlamperosNum: number;
  adultosDesencriptados: string;
  ninosDesencriptados: string;
  bebesDesencriptados: string;
  mascotasDesencriptadas: string;
  codigoReserva: string;
  EstadoPago: string;
}

interface ReservaResponse {
  mensaje: string;
  reserva?: {
    id: string;
    idCliente: string;
    idPropietario: string;
    idGlamping: string;
    ciudad_departamento: string;
    FechaIngreso: string;
    FechaSalida: string;
    Noches: number;
    ValorReserva: number;
    CostoGlamping: number;
    ComisionGlamperos: number;
    adultos: number;
    ninos: number;
    bebes: number;
    mascotas: number;
    EstadoReserva: string;
    EstadoPago: string;
    fechaCreacion: string;
    codigoReserva: string;
    ComentariosCancelacion?: string;
  };
  error?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;

export const CrearReserva = async ({
  idCliente,
  idPropietario,
  idGlamping,
  ciudad_departamento,
  fechaInicio,
  fechaFin,
  totalDiasNum,
  adultosDesencriptados,
  ninosDesencriptados,
  bebesDesencriptados,
  mascotasDesencriptadas,
  codigoReserva,
  EstadoPago,
}: ReservaProps): Promise<ReservaResponse | null> => {
  try {
    // 🚩 Leer las cookies nuevas:
    const costoGlampingCookie = Number(Cookies.get("CookiePagoGlamping") || 0);
    const comisionGlamperosCookie = Number(Cookies.get("CookieTarifaServicio") || 0);
    const pagoTotalCookie = Number(Cookies.get("CookiePagoTotal") || 0);

    const nuevaReserva = {
      idCliente: idCliente ?? "No tiene Id",
      idPropietario: idPropietario ?? "Propietario no registrado",
      idGlamping: idGlamping ?? "No tiene GlampingId",
      ciudad_departamento: ciudad_departamento ?? "No tiene ciudad_departamento",
      FechaIngreso: fechaInicio.toISOString(),
      FechaSalida: fechaFin.toISOString(),
      Noches: totalDiasNum,
      ValorReserva: pagoTotalCookie,
      // ✏️ Usamos las cookies en vez de calcular:
      CostoGlamping: costoGlampingCookie,
      ComisionGlamperos: comisionGlamperosCookie,
      adultos: Number(adultosDesencriptados) || 1,
      ninos: Number(ninosDesencriptados) || 0,
      bebes: Number(bebesDesencriptados) || 0,
      mascotas: Number(mascotasDesencriptadas) || 0,
      EstadoReserva: "Reservada",
      EstadoPago,
      codigoReserva,
      ComentariosCancelacion: "Sin comentario",
    };

    console.log("📩 Enviando reserva a backend:", nuevaReserva);

    const response = await fetch(`${API_BASE}/reservas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nuevaReserva),
    });

    if (response.status === 400) {
      console.error("❌ Error: La reserva ya existe.");
      return null;
    }
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error ${response.status}: ${errorText}`);
    }

    const data: ReservaResponse = await response.json();
    console.log("✅ Respuesta del backend:", data);
    return data;
  } catch (error) {
    console.error("❌ Error al crear la reserva:", error);
    return null;
  }
};
