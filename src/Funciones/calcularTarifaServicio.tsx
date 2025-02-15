"use client"; 
/* 
  ↑ Si planeas usarlo en componentes del lado del cliente (Client Components) 
  podrías añadir esta directiva. Si tu intención es usarlo en el servidor 
  (Server Components o en rutas /api), NO es necesario el "use client".
*/

import { differenceInCalendarDays, isWithinInterval, parseISO, addDays } from "date-fns";
import { precioConRecargo } from "@/Funciones/precioConRecargo";

/**
 * Función para calcular la tarifa del servicio considerando nuevos parámetros.
 * Adaptada para Next.js (en realidad, no requiere cambios sustanciales).
 */
export function calcularTarifaServicio(
  precio: number,
  viernesysabadosyfestivos: { viernesysabadosyfestivos: string[] },
  descuento?: number,
  fechaInicio?: Date | string,
  fechaFin?: Date | string
): number {
  if (precio <= 0) return 0;

  // Aplicar recargo al precio utilizando la función separada
  let precioConRecargoCalculado = precioConRecargo(precio);

  // Asegurarse de que las fechas existen y son válidas
  if (!fechaInicio || !fechaFin) {
    throw new Error("Las fechas de inicio y fin son requeridas.");
  }

  // Convertir fechas a objetos Date si vienen como string
  const inicio = typeof fechaInicio === "string" ? parseISO(fechaInicio) : fechaInicio;
  const fin = typeof fechaFin === "string" ? parseISO(fechaFin) : fechaFin;

  // Validar que las fechas sean válidas (no sean Invalid Date)
  if (
    !(inicio instanceof Date) ||
    !(fin instanceof Date) ||
    isNaN(inicio.getTime()) ||
    isNaN(fin.getTime())
  ) {
    throw new Error("Una o ambas fechas no son válidas.");
  }

  // Validar que el rango de fechas sea correcto
  if (inicio > fin) {
    throw new Error("La fecha de inicio no puede ser posterior a la fecha de fin.");
  }

  // Filtrar las fechas de viernes y sábados dentro del rango (sin incluir fechaFin)
  const fechasCoincidentes = viernesysabadosyfestivos.viernesysabadosyfestivos.filter((fecha) => {
    const fechaISO = parseISO(fecha);
    // Compara con un intervalo que termina un día antes de la fecha de fin
    return isWithinInterval(fechaISO, { start: inicio, end: addDays(fin, -1) });
  });

  // Calcular los días totales (excluyendo fechaFin)
  const diasTotales = differenceInCalendarDays(fin, inicio);
  const diasRestantes = diasTotales - fechasCoincidentes.length;

  // Calcular el total para los días coincidentes (viernes y sábados)
  const totalCoincidentes = fechasCoincidentes.length * precioConRecargoCalculado;

  // Calcular el total para los días restantes, con o sin descuento
  const totalRestantes = descuento
    ? diasRestantes * (precioConRecargoCalculado * (1 - descuento / 100))
    : diasRestantes * precioConRecargoCalculado;

  // Retornar el total combinado
  return totalCoincidentes + totalRestantes;
}
