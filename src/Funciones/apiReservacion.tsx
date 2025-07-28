// Funciones/apiReservacion.tsx
import Cookies from "js-cookie";

type Modo = "produccion" | "pruebas";
// Cambia esta línea cuando desees cambiar de entorno:
const modo: Modo = "pruebas";
// const modo: Modo = "produccion";


const PUBLIC_KEY = {
  produccion: process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY!,
  pruebas:    process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY_SANDBOX!,
}[modo];

const API_BASE   = process.env.NEXT_PUBLIC_API_BASE_URL!;

export interface ReservacionParams {
  idCliente: string;
  idPropietario: string;
  idGlamping: string;
  ciudad_departamento: string;
  fechaInicio: Date;
  fechaFin:    Date;
  totalDias:   number;
  valorTotalCOP:     number;
  tarifaServicioCOP: number;
  pagoGlampingCOP:   number;
  adultos:    number;
  ninos:      number;
  bebes:      number;
  mascotas:   number;
}

export async function apiReservacion(params: ReservacionParams): Promise<string> {
  const idClienteCookie   = Cookies.get("idUsuario") || "";
  //1️⃣ Crear la reserva en el backend
  const createResp = await fetch(`${API_BASE}/reservas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      idCliente:           idClienteCookie,
      idPropietario:       params.idPropietario,
      idGlamping:          params.idGlamping,
      ciudad_departamento: params.ciudad_departamento,
      FechaIngreso:        params.fechaInicio.toISOString(),
      FechaSalida:         params.fechaFin.toISOString(),
      Noches:              params.totalDias,
      ValorReserva:        params.valorTotalCOP,
      CostoGlamping:       params.pagoGlampingCOP,
      ComisionGlamperos:   params.tarifaServicioCOP,
      adultos:             params.adultos,
      ninos:               params.ninos,
      bebes:               params.bebes,
      mascotas:            params.mascotas,
      EstadoReserva:       "Reservada",
      EstadoPago:          "Pendiente",
      codigoReserva:       crypto.randomUUID(),
    }),
  });
  if (!createResp.ok) {
    throw new Error("No se pudo crear la reserva");
  }

  // 2️⃣ Pedir firma Wompi
  const reference    = (await createResp.json()).reserva.codigoReserva;
  const montoCentav  = Math.round(params.valorTotalCOP * 100);
  const sigResp = await fetch(
    `${API_BASE}/wompi/generar-firma?referencia=${reference}` +
    `&monto=${montoCentav}&moneda=COP&modo=${modo}`
    );

    // 👇 Aquí colocas el log temporal
    const sigBody = await sigResp.json();
    console.log("👉 Firma /wompi/generar-firma:", sigBody); 

    const { firma_integridad } = sigBody;
    if (!firma_integridad || !window.WidgetCheckout) {
    throw new Error("No se pudo inicializar el pago");
    }

  // 3️⃣ Abrir widget
  const checkout = new window.WidgetCheckout({
    currency:      "COP",
    amountInCents: montoCentav,
    reference,
    publicKey:     PUBLIC_KEY,
    signature:     { integrity: firma_integridad },
    redirectUrl:   window.location.origin + "/gracias",
  });

  return new Promise((resolve, reject) => {
    checkout.open(
      () => resolve(reference), 
      (err: any) => reject(err)
    );
  });
}
