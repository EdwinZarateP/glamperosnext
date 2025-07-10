"use client";

import { precioConRecargo } from "./precioConRecargo";

/**
 * Calcula el precio final con recargo de Glamperos y descuento aplicado.
 *
 * @param precioBase     Precio base por noche.
 * @param descuentoPorc  Porcentaje de descuento a aplicar después del recargo.
 * @returns              Precio final con recargo y descuento.
 */
export function calcularPrecioConDescuento(precioBase: number, descuentoPorc = 0): number {
  if (precioBase <= 0) return 0;

  // Aplica primero el recargo de Glamperos
  const precioConRecargoAplicado = precioConRecargo(precioBase);

  // Luego aplica el descuento si existe
  const factorDescuento = 1 - descuentoPorc / 100;
  return precioConRecargoAplicado * factorDescuento;
}
