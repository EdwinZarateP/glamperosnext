"use client"; 

import { differenceInCalendarDays, isWithinInterval, parseISO, addDays } from "date-fns";
import { precioConRecargo } from "@/Funciones/precioConRecargo";

/**
 * Función para calcular la tarifa del servicio considerando fechas especiales.
 */
export function calcularTarifaServicio(
  precio: number,
  viernesysabadosyfestivos: { viernesysabadosyfestivos: string[] },
  descuento?: number,
  fechaInicio?: Date | string,
  fechaFin?: Date | string
): number {
  try {
    if (precio <= 0) return 0;

    // Aplicar recargo al precio utilizando la función separada
    let precioConRecargoCalculado = precioConRecargo(precio);

    // Asegurarse de que las fechas existen y son válidas
    if (!fechaInicio || !fechaFin) {
      console.error("Error: Las fechas de inicio y fin son requeridas.");
      return 0;
    }

    // Convertir fechas a objetos Date si vienen como string
    const inicio = typeof fechaInicio === "string" ? parseISO(fechaInicio) : fechaInicio;
    const fin = typeof fechaFin === "string" ? parseISO(fechaFin) : fechaFin;

    // Validar que las fechas sean válidas
    if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
      console.error("Error: Una o ambas fechas no son válidas.");
      return 0;
    }

    // Validar que el rango de fechas sea correcto
    if (inicio >= fin) {
      console.error("Error: La fecha de inicio debe ser anterior a la fecha de fin.");
      return 0;
    }

    // Filtrar las fechas de viernes y sábados dentro del rango (sin incluir fechaFin)
    const fechasCoincidentes = viernesysabadosyfestivos.viernesysabadosyfestivos.filter((fecha) => {
      if (!fecha) return false; // Si la fecha es undefined o null, la ignoramos

      const fechaISO = parseISO(fecha);

      // Validar si `fechaISO` es un objeto Date válido
      if (isNaN(fechaISO.getTime())) {
        console.warn(`Advertencia: Fecha inválida detectada en el array - ${fecha}`);
        return false;
      }

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
  } catch (error) {
    console.error("Error en calcularTarifaServicio:", error);
    return 0; // Evita que la aplicación se rompa
  }
}
