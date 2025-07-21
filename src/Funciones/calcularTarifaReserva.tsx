import { isBefore, addDays, format, parse } from 'date-fns';

export interface ResultadoTarifa {
  costoSinIncremento: number;
  costoAdicionalesSinIncremento: number;
  costoConIncremento: number;
  costoTotalSinIncremento: number;
  costoAdicionalesConIncremento: number;
  costoTotalConIncremento: number;
  totalDiasFacturados: number;
  precioPorDia: number;
  huespedesAdicionales: number;
  tarifaServicio: number;
  descuentoAplicado: number;
  costoSinIncrementoBase: number;
   pagoGlamping: number;
}

function aplicarIncremento(precio: number): number {
  if (precio <= 300_000)      return precio * 1.18;
  if (precio < 400_000)       return precio * 1.15;
  if (precio < 500_000)       return precio * 1.14;
  if (precio < 600_000)       return precio * 1.13;
  if (precio < 800_000)       return precio * 1.11;
  if (precio < 2_000_000)     return precio * 1.10;
  return precio;
}

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
  const precioEstandar           = parseFloat(initialData.precioEstandar            || '0');
  const precioEstandarAdicional = parseFloat(initialData.precioEstandarAdicional  || '0');
  const capacidadBase            = parseInt(initialData.Cantidad_Huespedes         || '0', 10);
  const descuentoPct             = parseFloat(initialData.descuento               || '0') / 100;

  const inicio = parse(fechaInicio, 'yyyy-MM-dd', new Date());
  const fin    = parse(fechaFin,    'yyyy-MM-dd', new Date());

  // 1) Cálculo de costoSinIncremento, totalDiasFacturados y descuentoAplicado
  let costoSinIncremento   = 0;
  let diasFacturados       = 0;
  let descuentoAplicado    = 0;
  let cursor = new Date(inicio);

  while (isBefore(cursor, fin)) {
    const diaStr = format(cursor, 'yyyy-MM-dd');
    diasFacturados++;

    if (viernesysabadosyfestivos.includes(diaStr)) {
      // fin de semana o festivo: precio pleno
      costoSinIncremento += precioEstandar;
    } else {
      // día con descuento
      const ahorro = precioEstandar * descuentoPct;
      costoSinIncremento   += precioEstandar - ahorro;
      descuentoAplicado    += ahorro;
    }

    cursor = addDays(cursor, 1);
  }
  const costoSinIncrementoBase = diasFacturados * precioEstandar;

  // 2) Cálculo de huéspedes adicionales sin incremento
  const huespedesAdicionales = Math.max(0, cantidadHuespedes - capacidadBase);
  const costoAdicionalesSinIncremento =
    huespedesAdicionales * precioEstandarAdicional * diasFacturados;

  // 3) Aplicación del factor de incremento
  const factorIncremento = precioEstandar > 0
    ? aplicarIncremento(precioEstandar) / precioEstandar
    : 1;

  const costoConIncremento             = costoSinIncremento * factorIncremento;
  const costoAdicionalesConIncremento = costoAdicionalesSinIncremento * factorIncremento;

  // 4) Totales con y sin incremento
  const costoTotalSinIncremento = redondear50(costoSinIncremento + costoAdicionalesSinIncremento);
  const costoTotalConIncremento = redondear50(costoConIncremento + costoAdicionalesConIncremento);

  // 5) Tarifa de servicio (comisión)
  const tarifaServicio = redondear50(costoTotalConIncremento - costoTotalSinIncremento);
  const pagoGlamping = costoSinIncremento + costoAdicionalesSinIncremento;

  // 6) Precio promedio por día, redondeado al siguiente múltiplo de 50
  const precioPorDia = diasFacturados > 0
    ? redondear50(costoTotalConIncremento / diasFacturados)
    : 0;

  return {
    costoSinIncremento,
    costoAdicionalesSinIncremento,
    costoConIncremento,
    costoTotalSinIncremento,
    costoAdicionalesConIncremento,
    costoTotalConIncremento,
    totalDiasFacturados: diasFacturados,
    precioPorDia,
    huespedesAdicionales,
    tarifaServicio,
    descuentoAplicado,
    costoSinIncrementoBase,
    pagoGlamping 
  };
}
