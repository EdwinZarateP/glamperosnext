import Cookies from 'js-cookie';

export type ModoWompi = 'produccion' | 'pruebas';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;

// Declaración global para TS (WidgetCheckout existe cuando cargas el script)
declare global {
  interface Window {
    WidgetCheckout?: any;
  }
}

export interface ReservacionParams {
  idCliente: string;
  idPropietario: string;
  idGlamping: string;
  ciudad_departamento: string;
  fechaInicio: Date;
  fechaFin: Date;
  totalDias: number;
  valorTotalCOP: number;
  tarifaServicioCOP: number;
  pagoGlampingCOP: number;
  adultos: number;
  ninos: number;
  bebes: number;
  mascotas: number;
}

function getPublicKey(modo: ModoWompi) {
  const key =
    modo === 'produccion'
      ? process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY
      : process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY_SANDBOX;

  if (!key) {
    throw new Error(
      `Falta la llave pública de Wompi para modo: ${modo}. Revisa tus variables de entorno.`
    );
  }
  return key;
}

export async function apiReservacion(params: ReservacionParams, modo: ModoWompi): Promise<string> {
  const idClienteCookie = Cookies.get('idUsuario') || '';

  // 1️⃣ Crear la reserva en el backend
  const createResp = await fetch(`${API_BASE}/reservas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      idCliente: idClienteCookie,
      idPropietario: params.idPropietario,
      idGlamping: params.idGlamping,
      ciudad_departamento: params.ciudad_departamento,
      FechaIngreso: params.fechaInicio.toISOString(),
      FechaSalida: params.fechaFin.toISOString(),
      Noches: params.totalDias,
      ValorReserva: params.valorTotalCOP,
      CostoGlamping: params.pagoGlampingCOP,
      ComisionGlamperos: params.tarifaServicioCOP,
      adultos: params.adultos,
      ninos: params.ninos,
      bebes: params.bebes,
      mascotas: params.mascotas,
      EstadoReserva: 'Reservada',
      EstadoPago: 'Pendiente',
      codigoReserva: crypto.randomUUID(),
    }),
  });

  if (!createResp.ok) {
    throw new Error('No se pudo crear la reserva');
  }

  const createBody = await createResp.json();
  const reference = createBody?.reserva?.codigoReserva;

  if (!reference) {
    console.log('🔍 Respuesta /reservas:', createBody);
    throw new Error('La API no devolvió codigoReserva (reference).');
  }

  // 2️⃣ Pedir firma Wompi
  const montoCentav = Math.round(params.valorTotalCOP * 100);
  const sigResp = await fetch(
    `${API_BASE}/wompi/generar-firma?referencia=${encodeURIComponent(reference)}` +
      `&monto=${montoCentav}&moneda=COP&modo=${encodeURIComponent(modo)}`
  );

  const sigBody = await sigResp.json();
  console.log('👉 Firma /wompi/generar-firma:', sigBody);

  const firma_integridad = sigBody?.firma_integridad;

  if (!sigResp.ok || !firma_integridad) {
    throw new Error(`No se pudo generar la firma de Wompi (modo=${modo}).`);
  }

  // 3️⃣ Abrir widget
  const PUBLIC_KEY = getPublicKey(modo);

  if (!window.WidgetCheckout) {
    throw new Error(
      'Wompi Widget no está cargado. Asegúrate de incluir https://checkout.wompi.co/widget.js en el layout o página.'
    );
  }

  const checkout = new window.WidgetCheckout({
    currency: 'COP',
    amountInCents: montoCentav,
    reference,
    publicKey: PUBLIC_KEY,
    signature: { integrity: firma_integridad },
    redirectUrl: window.location.origin + '/gracias',
  });

  return new Promise((resolve, reject) => {
    checkout.open(
      () => resolve(reference),
      (err: any) => reject(err)
    );
  });
}
