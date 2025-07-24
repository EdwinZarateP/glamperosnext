import { aplicarIncremento, redondear50 } from "./calcularTarifaReserva";

export interface ResultadoTarifaBasica {
  /** Precio con incremento, sin aplicar descuento */
  precioSinDescuento: number;
  /** Precio con incremento, después de aplicar descuento */
  precioConDescuento: number;
}

/**
 * Calcula la tarifa estándar con incremento, y la tarifa con descuento,
 * usando siempre el mismo porcentaje de incremento basado en el precio original.
 */
export function calcularTarifaBasica(
  precio: number,
  descuentoPct: number
): ResultadoTarifaBasica {
  // 1. Calcular el precio con incremento sobre el precio original
  const precioConIncremento = aplicarIncremento(precio);
  const factorIncremento = precioConIncremento / precio;

  // 2. Aplicar el mismo factor de incremento al precio con descuento
  const precioDescontado = precio * (1 - descuentoPct);
  const precioConDescuento = precioDescontado * factorIncremento;

  return {
    precioSinDescuento: redondear50(precioConIncremento),
    precioConDescuento: redondear50(precioConDescuento),
  };
}
