"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Swal from "sweetalert2";
import { enviarWhatsAppReagendamiento } from "@/Funciones/enviarWhatsAppReagendamiento"; // Ajusta la ruta
import "./estilos.css";

interface CalendarioReagendaProps {
  cerrarCalendario: () => void;
  onSeleccionarFechas: (inicio: Date, fin: Date) => void;
  codigoReserva: string;
  fechasIniciales?: { inicio: Date | null; fin: Date | null };
  FechasSeparadas?: string[];
  minimoNoches: number;
}

const CalendarioReagenda: React.FC<CalendarioReagendaProps> = ({
  cerrarCalendario,
  onSeleccionarFechas,
  codigoReserva,
  fechasIniciales = { inicio: null, fin: null },
  FechasSeparadas = [],
  minimoNoches,
}) => {
  // Definimos "hoy" a las 00:00:00
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  // Valores por defecto: mañana y pasado mañana
  const defaultInicio = new Date();
  defaultInicio.setDate(defaultInicio.getDate() + 1);
  defaultInicio.setHours(0, 0, 0, 0);
  const defaultFin = new Date();
  defaultFin.setDate(defaultFin.getDate() + 2);
  defaultFin.setHours(0, 0, 0, 0);

  // Si no se pasan fechasIniciales, se usan los valores por defecto.
  const [fechaInicio, setFechaInicio] = useState<Date | null>(
    fechasIniciales.inicio ?? defaultInicio
  );
  const [fechaFin, setFechaFin] = useState<Date | null>(
    fechasIniciales.fin ?? defaultFin
  );
  const [mesesVisibles, setMesesVisibles] = useState<{ mes: number; anio: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const isRequestSent = useRef(false);

  // Si no se recibieron fechas iniciales, forzamos la selección por defecto al montar
  useEffect(() => {
    if (!fechasIniciales.inicio && !fechasIniciales.fin) {
      setFechaInicio(defaultInicio);
      setFechaFin(defaultFin);
    }
  }, [fechasIniciales.inicio, fechasIniciales.fin, defaultInicio, defaultFin]);

  // Convertir las fechas reservadas (en string) a Date (estableciendo las horas a 00:00:00)
  const fechasReservadas = FechasSeparadas.map((fecha) => {
    const fechaObj = new Date(`${fecha}T00:00:00`);
    fechaObj.setHours(0, 0, 0, 0);
    return fechaObj;
  });

  useEffect(() => {
    const mesesCalculados = Array.from({ length: 6 }, (_, i) => {
      const nuevoMes = new Date(hoy.getFullYear(), hoy.getMonth() + i, 1);
      return { mes: nuevoMes.getMonth(), anio: nuevoMes.getFullYear() };
    });
    setMesesVisibles(mesesCalculados);
  }, [hoy]);

  // Función para verificar que no se incluya alguna fecha reservada en el rango seleccionado
  const verificarRango = (inicio: Date, fin: Date): boolean => {
    let current = new Date(inicio);
    while (current <= fin) {
      if (fechasReservadas.some(f => f.toDateString() === current.toDateString())) {
        return false;
      }
      current.setDate(current.getDate() + 1);
    }
    return true;
  };

  // Al hacer click en un día se define la fecha de inicio o fin según corresponda
  const manejarClickFecha = (fecha: Date) => {
    // No permitir si la fecha está reservada o es anterior a hoy
    if (fechasReservadas.some(f => f.toDateString() === fecha.toDateString()) || fecha < hoy) return;

    if (!fechaInicio || (fechaInicio && fechaFin)) {
      // Si no hay selección o ya se había seleccionado un rango, reiniciar y establecer el inicio
      setFechaInicio(fecha);
      setFechaFin(null);
    } else if (fechaInicio && !fechaFin && fecha >= fechaInicio) {
      // Si ya se seleccionó el inicio y se hace click en una fecha posterior
      const nuevaFechaFin = new Date(fecha);
      // Si el usuario selecciona la misma fecha que el inicio, se autoselecciona el día siguiente
      if (nuevaFechaFin.toDateString() === fechaInicio.toDateString()) {
        nuevaFechaFin.setDate(nuevaFechaFin.getDate() + 1);
      }
      if (verificarRango(fechaInicio, nuevaFechaFin)) {
        setFechaFin(nuevaFechaFin);
      } else {
        Swal.fire({
          icon: "error",
          title: "Rango de fechas no disponible",
          text: "El rango de fechas seleccionado incluye fechas reservadas. Por favor, elige otro rango.",
        });
      }
    } else {
      setFechaInicio(fecha);
      setFechaFin(null);
    }
  };

  // Función para determinar la clase que tendrá cada día (sombreado si está seleccionado)
  const getDiaClase = (fechaDia: Date): string => {
    let clase = "CalendarioReagenda-dia";
    if (fechaDia < hoy) {
      clase += " CalendarioReagenda-dia-deshabilitado";
    }
    // Si se está forzando la selección por defecto (sin fechasIniciales manuales)
    if (!fechasIniciales.inicio && !fechasIniciales.fin) {
      if (fechaDia.toDateString() === defaultInicio.toDateString() || fechaDia.toDateString() === defaultFin.toDateString()) {
        clase += " CalendarioReagenda-dia-seleccionado";
        return clase;
      } else if (fechaDia > defaultInicio && fechaDia < defaultFin) {
        clase += " CalendarioReagenda-dia-rango";
        return clase;
      }
    }
    // Si la fecha está reservada, aplicar el estilo reservado (y este tiene prioridad)
    if (fechasReservadas.some(f => f.toDateString() === fechaDia.toDateString())) {
      clase += " CalendarioReagenda-dia-reservada";
      return clase;
    }
    // Si ya se realizó una selección manual (o se modificó la selección)
    if (fechaInicio && fechaFin) {
      if (
        fechaDia.toDateString() === fechaInicio.toDateString() ||
        fechaDia.toDateString() === fechaFin.toDateString()
      ) {
        clase += " CalendarioReagenda-dia-seleccionado";
      } else if (fechaDia > fechaInicio && fechaDia < fechaFin) {
        clase += " CalendarioReagenda-dia-rango";
      }
    } else if (fechaInicio && !fechaFin) {
      if (fechaDia.toDateString() === fechaInicio.toDateString()) {
        clase += " CalendarioReagenda-dia-seleccionado";
      }
    }
    return clase;
  };

  const validarFechas = (): boolean => {
    if (!fechaInicio || !fechaFin) return false;

    if (fechaInicio >= fechaFin) {
      Swal.fire("Error", "La fecha de inicio debe ser antes de la fecha de fin", "error");
      return false;
    }

    const diferenciaDias = (fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24);
    if (diferenciaDias < minimoNoches) {
      Swal.fire("Error", `Debe haber un mínimo de ${minimoNoches} noches entre las fechas`, "warning");
      return false;
    }

    return true;
  };

  const confirmarReagendamiento = useCallback(async () => {
    if (Swal.isVisible() || !validarFechas() || loading || isRequestSent.current) return;

    isRequestSent.current = true;
    setLoading(true);

    try {
      const confirmacion = await Swal.fire({
        title: "Confirmación requerida",
        text: "Este reagendamiento debe ser aprobado por el dueño para que tenga efecto. ¿Deseas continuar?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, solicitar",
        cancelButtonText: "Cancelar",
        allowOutsideClick: false,
      });

      if (!confirmacion.isConfirmed) return;

      const response = await fetch(`https://glamperosapi.onrender.com/reservas/reagendamientos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codigoReserva,
          FechaIngreso: fechaInicio!.toISOString(),
          FechaSalida: fechaFin!.toISOString(),
        }),
      });

      // Dentro del bloque try, después de validar que la respuesta es exitosa:
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "No se pudo solicitar el reagendamiento");
      }

      // Envía el mensaje de WhatsApp
      await enviarWhatsAppReagendamiento({
        numero: "573125443396",
        nombrePropietario: "Propietario",
        codReserva: codigoReserva, // Usa el código de reserva que ya tienes
      });

      onSeleccionarFechas(fechaInicio!, fechaFin!);
      cerrarCalendario();

    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "No se pudo contactar al servidor";
      await Swal.fire({
        icon: "error",
        title: "Error de conexión",
        text: errorMessage,
        allowOutsideClick: false,
      });
    } finally {
      setLoading(false);
      isRequestSent.current = false;
    }
  }, [fechaInicio, fechaFin, codigoReserva, loading, cerrarCalendario, onSeleccionarFechas]);

  return (
    <div className="CalendarioReagenda-fondo" onClick={cerrarCalendario}>
      <div className="CalendarioReagenda-contenedor" onClick={(e) => e.stopPropagation()}>
        <button className="CalendarioReagenda-boton-cerrar" onClick={cerrarCalendario}>
          ✖
        </button>
        <h2 className="CalendarioReagenda-titulo">Selecciona tus nuevas fechas</h2>
        <div className="CalendarioReagenda-meses">
          {mesesVisibles.map(({ mes, anio }, idx) => {
            const primerDiaSemana = new Date(anio, mes, 1).getDay();
            const diasEnMes = new Date(anio, mes + 1, 0).getDate();
            const celdas = [];

            // Espacios vacíos para alinear el primer día
            for (let i = 0; i < primerDiaSemana; i++) {
              celdas.push(<div key={`empty-${i}`} className="CalendarioReagenda-dia-vacio" />);
            }

            for (let dia = 1; dia <= diasEnMes; dia++) {
              const fechaDia = new Date(anio, mes, dia);
              fechaDia.setHours(0, 0, 0, 0);

              celdas.push(
                <button
                  key={dia}
                  className={getDiaClase(fechaDia)}
                  onClick={() => manejarClickFecha(fechaDia)}
                  disabled={fechasReservadas.some(f => f.toDateString() === fechaDia.toDateString()) || fechaDia < hoy}
                >
                  {dia}
                </button>
              );
            }

            return (
              <div key={idx} className="CalendarioReagenda-mes">
                <h3 className="CalendarioReagenda-mes-titulo">
                  {new Date(anio, mes).toLocaleDateString("es-ES", { month: "long", year: "numeric" })}
                </h3>
                <div className="CalendarioReagenda-grid">{celdas}</div>
              </div>
            );
          })}
        </div>
        <div className="CalendarioReagenda-botones">
          <button
            onClick={() => {
              setFechaInicio(null);
              setFechaFin(null);
            }}
            className="CalendarioReagenda-boton-borrar"
          >
            Borrar
          </button>
          <button
            onClick={confirmarReagendamiento}
            className="CalendarioReagenda-boton-confirmar"
            disabled={!fechaInicio || !fechaFin || loading}
          >
            {loading ? "Enviando..." : "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarioReagenda;
