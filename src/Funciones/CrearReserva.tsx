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
  EstadoPago: string; // ✅ Se ha agregado EstadoPago a la interfaz
}

// 🔹 Definir correctamente el tipo de respuesta esperada de la API
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
    EstadoPago: string; // ✅ Se ha agregado EstadoPago a la respuesta de la API
    fechaCreacion: string;
    codigoReserva: string;
    ComentariosCancelacion?: string;
  };
  error?: string; // ⚠️ Agregar una propiedad opcional para capturar errores
}

// ✅ Ahora retorna un **objeto de reserva**, no solo una URL
export const CrearReserva = async ({
  idCliente,
  idPropietario,
  idGlamping,
  ciudad_departamento,
  fechaInicio,
  fechaFin,
  totalDiasNum,
  precioConTarifaNum,
  TarifaGlamperosNum,
  adultosDesencriptados,
  ninosDesencriptados,
  bebesDesencriptados,
  mascotasDesencriptadas,
  codigoReserva,
  EstadoPago, 
}: ReservaProps): Promise<ReservaResponse | null> => {
  try {
    const nuevaReserva = {
      idCliente: idCliente ?? "No tiene Id",
      idPropietario: idPropietario ?? "Propietario no registrado",
      idGlamping: idGlamping ?? "No tiene GlampingId",
      ciudad_departamento: ciudad_departamento ?? "No tiene ciudad_departamento",
      FechaIngreso: fechaInicio.toISOString(),
      FechaSalida: fechaFin.toISOString(),
      Noches: totalDiasNum,
      ValorReserva: precioConTarifaNum,
      CostoGlamping: precioConTarifaNum - TarifaGlamperosNum,
      ComisionGlamperos: TarifaGlamperosNum,
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

    const response = await fetch("https://glamperosapi.onrender.com/reservas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(nuevaReserva),
    });

    if (response.status === 400) {
      console.error("❌ Error: La reserva ya existe.");
      return null;  // No volver a crear una reserva duplicada
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Error en la respuesta del servidor: ${response.status} - ${errorText}`);
      throw new Error(`Error en la respuesta del servidor: ${response.statusText}`);
    }

    const data: ReservaResponse = await response.json();
    console.log("✅ Respuesta del backend:", data);
    return data;
  } catch (error) {
    console.error("❌ Error al crear la reserva:", error);
    return null;
  }
};
