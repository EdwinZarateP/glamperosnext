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
}

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
}: ReservaProps) => {
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
      ComentariosCancelacion: "Sin comentario",
    };

    const response = await fetch("https://glamperosapi.onrender.com/reservas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(nuevaReserva),
    });

    if (!response.ok) {
      throw new Error(`Error en la respuesta del servidor: ${response.statusText}`);
    }

    const data = await response.json();

    if (data?.reserva?.codigoReserva) {
      return `/Gracias/${fechaInicio.toISOString()}/${fechaFin.toISOString()}`;
    }

    return null;
  } catch (error) {
    console.error("Error al crear la reserva:", error);
    return null;
  }
};
