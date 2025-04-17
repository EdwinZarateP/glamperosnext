"use client";

import { differenceInCalendarDays, isWithinInterval, parseISO, addDays } from "date-fns";
import { precioConRecargo } from "@/Funciones/precioConRecargo";

/**
 * Calcula el valor total del descuento aplicado en noches normales.
 *
 * @param precioBase        Precio base por noche.
 * @param diasEspeciales    Array de fechas con recargo (formato ISO).
 * @param descuentoPorc     Porcentaje de descuento (solo se aplica a noches normales).
 * @param fechaInicio       Fecha de entrada (Date o string ISO).
 * @param fechaFin          Fecha de salida (Date o string ISO), no incluida en el cómputo.
 * @returns                 Valor total descontado (en pesos).
 */
export function calcularValorDescuento(
  precioBase: number,
  diasEspeciales: string[],
  descuentoPorc = 0,
  fechaInicio?: Date | string,
  fechaFin?: Date | string
): number {
  try {
    if (precioBase <= 0 || descuentoPorc <= 0) return 0;
    if (!fechaInicio || !fechaFin) return 0;

    const inicio = typeof fechaInicio === "string" ? parseISO(fechaInicio) : fechaInicio;
    const fin = typeof fechaFin === "string" ? parseISO(fechaFin) : fechaFin;

    if (isNaN(inicio.getTime()) || isNaN(fin.getTime()) || inicio >= fin) return 0;

    const precioRecargado = precioConRecargo(precioBase);
    const totalNoches = differenceInCalendarDays(fin, inicio);

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
            end: addDays(fin, -1),
          })
      ).length;

    const nochesNormales = totalNoches - nochesEspeciales;

    // Cálculo del total de descuento aplicado
    const descuentoPorNoche = precioRecargado * (descuentoPorc / 100);
    const totalDescuento = nochesNormales * descuentoPorNoche;

    return Math.round(totalDescuento);
  } catch (error) {
    console.error("Error en calcularValorDescuento:", error);
    return 0;
  }
}
