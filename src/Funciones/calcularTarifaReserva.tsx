// Funciones/calcularTarifaReserva.ts
import { isBefore, addDays, format, parse } from 'date-fns';

export interface ResultadoTarifa {
  totalDiasFacturados: number;
  precioTotal: number;                     // Precio final, con incrementos y redondeo a múltiplo de 50
  precioPorDia: number;                    // Promedio diario tras incrementos, redondeado a múltiplo de 50
  precioEstandarIncrementado: number;      // Precio estándar con el incremento aplicado
  huespedesAdicionales: number;
  descuentoAplicado: boolean;
  totalAhorro: number;
  comisionGlamperos: number;               // Monto que corresponde al incremento/comisión de Glamperos
  pagoGlamping: number;                    // Monto que se le paga al anfitrión (precioTotal - comisión)
  costoAdicionalIncrementado: number;      // Costo total de los huéspedes extra con incremento
}

/** Aplica el incremento final según el tope de precio */
function aplicarIncremento(precio: number): number {
  if (precio <= 300_000)      return precio * 1.18;
  if (precio < 400_000)       return precio * 1.15;
  if (precio < 500_000)       return precio * 1.14;
  if (precio < 600_000)       return precio * 1.13;
  if (precio < 800_000)       return precio * 1.11;
  if (precio < 2_000_000)     return precio * 1.10;
  return precio;
}

/** Redondea hacia arriba al siguiente múltiplo de 50 */
function redondear50(valor: number): number {
  return Math.ceil(valor / 50) * 50;
}

export function calcularTarifaReserva({
  initialData,
  viernesysabadosyfestivos,
  fechaInicio,
  fechaFin,
  cantidadHuespedes,
}: {
  initialData: any;
  viernesysabadosyfestivos: string[];
  fechaInicio: string;
  fechaFin: string;
  cantidadHuespedes: number;
}): ResultadoTarifa {
  const precioEstandar           = parseFloat(initialData.precioEstandar || '0');
  const precioEstandarAdicional = parseFloat(initialData.precioEstandarAdicional || '0');
  const capacidadBase            = parseInt(initialData.Cantidad_Huespedes || '0', 10);
  const descuentoPct             = parseFloat(initialData.descuento || '0') / 100;

  const inicio = parse(fechaInicio, 'yyyy-MM-dd', new Date());
  const fin    = parse(fechaFin,    'yyyy-MM-dd', new Date());

  let precioBruto    = 0;
  let totalAhorro    = 0;
  let diasFacturados = 0;
  let cursor         = new Date(inicio);

  // Recorrido día a día (excluyendo checkout)
  while (isBefore(cursor, fin)) {
    const diaStr = format(cursor, 'yyyy-MM-dd');
    diasFacturados++;

    if (viernesysabadosyfestivos.includes(diaStr)) {
      precioBruto += precioEstandar;
    } else {
      const ahorroDia = precioEstandar * descuentoPct;
      precioBruto   += precioEstandar - ahorroDia;
      totalAhorro   += ahorroDia;
    }
    cursor = addDays(cursor, 1);
  }

  const descuentoAplicado = totalAhorro > 0;
  const factorIncremento  = aplicarIncremento(precioEstandar) / precioEstandar;

  // Precio estándar con incremento
  const precioEstandarIncrementado = parseFloat(
    (precioEstandar * factorIncremento).toFixed(2)
  );

  // Base incrementado
  const precioBaseIncrementado = precioBruto * factorIncremento;

  // Extra huéspedes sin incremento
  const huespedesExtra = Math.max(0, cantidadHuespedes - capacidadBase);
  const precioExtras   = huespedesExtra * precioEstandarAdicional * diasFacturados;

  // Extra huéspedes con incremento
  const precioExtrasIncrementado = precioExtras * factorIncremento;

  // Costo adicional incrementado
  const costoAdicionalIncrementado = parseFloat(
    precioExtrasIncrementado.toFixed(2)
  );

  // Suma total antes de redondeo
  const precioConIncrementoRAW = precioBaseIncrementado + precioExtrasIncrementado;
  const precioFinalRounded      = redondear50(precioConIncrementoRAW);

  // Precio por día
  const precioPorDia = diasFacturados
    ? redondear50(precioFinalRounded / diasFacturados)
    : 0;

  // Comisión Glamperos
  const totalSinIncremento = precioBruto + precioExtras;
  const comisionRaw        = precioConIncrementoRAW - totalSinIncremento;
  const comisionGlamperos  = parseFloat(comisionRaw.toFixed(2));

  // Pago al anfitrión
  const pagoGlamping = parseFloat(
    (precioFinalRounded - comisionGlamperos).toFixed(2)
  );

  return {
    totalDiasFacturados        : diasFacturados,
    precioTotal                : precioFinalRounded,
    precioPorDia               : precioPorDia,
    precioEstandarIncrementado : precioEstandarIncrementado,
    huespedesAdicionales       : huespedesExtra,
    descuentoAplicado          : descuentoAplicado,
    totalAhorro                : parseFloat(totalAhorro.toFixed(2)),
    comisionGlamperos          : comisionGlamperos,
    pagoGlamping               : pagoGlamping,
    costoAdicionalIncrementado : costoAdicionalIncrementado,
  };
}