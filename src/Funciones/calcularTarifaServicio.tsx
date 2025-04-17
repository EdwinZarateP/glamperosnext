"use client";

import { differenceInCalendarDays, isWithinInterval, parseISO, addDays } from "date-fns";
import { precioConRecargo } from "@/Funciones/precioConRecargo";

/**
 * Calcula la tarifa total del servicio en un rango de fechas.
 *
 * - Las fechas incluidas en `diasEspeciales` (viernes, sábados y festivos) se cobran con recargo.
 * - El resto de noches reciben el mismo recargo, pero se les aplica el descuento indicado.
 *
 * @param precioBase        Precio base por noche.
 * @param diasEspeciales    Array de fechas con recargo (formato ISO).
 * @param descuentoPorc     Porcentaje de descuento (solo se aplica a noches normales).
 * @param fechaInicio       Fecha de entrada (Date o string ISO).
 * @param fechaFin          F echa de salida (Date o string ISO), no incluida en el cómputo.
 * @returns                 Total a cobrar por el rango de noches.
 */
export function calcularTarifaServicio(
  precioBase: number,
  diasEspeciales: string[],
  descuentoPorc = 0,
  fechaInicio?: Date | string,
  fechaFin?: Date | string
): number {
  try {
    // Validación básica de precio
    if (precioBase <= 0) return 0;

    // Validación de fechas requeridas
    if (!fechaInicio || !fechaFin) {
      console.error("Error: Se requieren fecha de inicio y fecha de fin.");
      return 0;
    }

    // Parsear fechas si vienen como string
    const inicio = typeof fechaInicio === "string" ? parseISO(fechaInicio) : fechaInicio;
    const fin = typeof fechaFin === "string" ? parseISO(fechaFin) : fechaFin;

    // Verificación de fechas válidas y orden
    if (isNaN(inicio.getTime()) || isNaN(fin.getTime()) || inicio >= fin) {
      console.error("Error: Fechas inválidas o mal ordenadas.");
      return 0;
    }

    // Precios con recargo y con descuento aplicado (solo a noches normales)
    const precioRecargado = precioConRecargo(precioBase);
    const factorDescuento = 1 - descuentoPorc / 100;
    const precioConDescuento = precioRecargado * factorDescuento;

    // Cálculo de noches totales (fechaFin no incluida)
    const totalNoches = differenceInCalendarDays(fin, inicio);

    // Identificar cuántas noches están en fechas especiales
    const nochesEspeciales = diasEspeciales
      .map((fecha) => {
        const f = parseISO(fecha);
        return isNaN(f.getTime()) ? null : f;
      })
      .filter(
        (fecha) =>
          fecha &&
          isWithinInterval(fecha, {
            start: inicio,
            end: addDays(fin, -1), // Excluir la fecha de salida
          })
      ).length;

    // Calcular noches normales (restantes)
    const nochesNormales = totalNoches - nochesEspeciales;

    // Cálculo final
    const total =
      nochesEspeciales * precioRecargado + nochesNormales * precioConDescuento;

    return total;
  } catch (error) {
    console.error("Error en calcularTarifaServicio:", error);
    return 0;
  }
}
