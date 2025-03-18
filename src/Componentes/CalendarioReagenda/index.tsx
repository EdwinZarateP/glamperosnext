"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Swal from "sweetalert2";
import { enviarWhatsAppReagendamiento } from "@/Funciones/enviarWhatsAppReagendamiento";
import "./estilos.css";

interface CalendarioReagendaProps {
  cerrarCalendario: () => void;
  onSeleccionarFechas: (inicio: Date, fin: Date) => void;
  codigoReserva: string;
  fechasIniciales?: { inicio: Date | null; fin: Date | null };
  FechasSeparadas?: string[];
  minimoNoches: number;
  whatsapp: string;
  nombreProp: string;
}

const CalendarioReagenda: React.FC<CalendarioReagendaProps> = ({
  cerrarCalendario,
  onSeleccionarFechas,
  codigoReserva,
  fechasIniciales = { inicio: null, fin: null },
  FechasSeparadas = [],
  minimoNoches,
  whatsapp,
  nombreProp
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

  // Estado para fechas seleccionadas
  const [fechaInicio, setFechaInicio] = useState<Date | null>(
    fechasIniciales.inicio ?? defaultInicio
  );
  const [fechaFin, setFechaFin] = useState<Date | null>(
    fechasIniciales.fin ?? defaultFin
  );

  // Estado para mostrar los próximos 6 meses (por ejemplo)
  const [mesesVisibles, setMesesVisibles] = useState<{ mes: number; anio: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const isRequestSent = useRef(false);

  // Convierto las fechas separadas (string) a objetos Date normalizados a 00:00
  const fechasReservadas = FechasSeparadas.map((fecha) => {
    const fechaObj = new Date(`${fecha}T00:00:00`);
    fechaObj.setHours(0, 0, 0, 0);
    return fechaObj;
  });

  // Inicializamos las fechas si no se pasó nada en fechasIniciales
  useEffect(() => {
    if (!fechasIniciales.inicio && !fechasIniciales.fin) {
      setFechaInicio(defaultInicio);
      setFechaFin(defaultFin);
    }
  }, [fechasIniciales, defaultInicio, defaultFin]);

  // Calculamos los meses que se mostrarán
  useEffect(() => {
    const mesesCalculados = Array.from({ length: 6 }, (_, i) => {
      const nuevoMes = new Date(hoy.getFullYear(), hoy.getMonth() + i, 1);
      return { mes: nuevoMes.getMonth(), anio: nuevoMes.getFullYear() };
    });
    setMesesVisibles(mesesCalculados);
  }, [hoy]);

  // Verifica que no haya fechas reservadas dentro de un rango
  const verificarRango = (inicio: Date, fin: Date): boolean => {
    let current = new Date(inicio);
    while (current <= fin) {
      if (fechasReservadas.some((f) => f.toDateString() === current.toDateString())) {
        return false;
      }
      current.setDate(current.getDate() + 1);
    }
    return true;
  };

  // Maneja la selección de días (inicio y fin)
  const manejarClickFecha = (fecha: Date) => {
    // Si la fecha está reservada o es anterior a hoy, no hacemos nada
    if (fechasReservadas.some((f) => f.toDateString() === fecha.toDateString()) || fecha < hoy) {
      return;
    }

    // Si no hay selección o ya se había seleccionado un rango, reiniciamos
    if (!fechaInicio || (fechaInicio && fechaFin)) {
      setFechaInicio(fecha);
      setFechaFin(null);
    }
    // Si ya se seleccionó el inicio y se hace click en una fecha posterior
    else if (fechaInicio && !fechaFin && fecha >= fechaInicio) {
      const nuevaFechaFin = new Date(fecha);

      // Si el usuario elige la misma fecha de inicio, forzamos un día más
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
      // Cualquier otro caso, reiniciar
      setFechaInicio(fecha);
      setFechaFin(null);
    }
  };

  // Función que determina la clase CSS de cada día
  const getDiaClase = (fechaDia: Date): string => {
    let clase = "CalendarioReagenda-dia";

    // Día anterior a hoy -> deshabilitado
    if (fechaDia < hoy) {
      return (clase += " CalendarioReagenda-dia-deshabilitado");
    }

    // Día reservado -> prioridad en estilo
    if (fechasReservadas.some((f) => f.toDateString() === fechaDia.toDateString())) {
      return (clase += " CalendarioReagenda-dia-reservada");
    }

    // Lógica de selección
    if (fechaInicio && fechaFin) {
      // Si es fecha de inicio o fecha de fin
      if (
        fechaDia.toDateString() === fechaInicio.toDateString() ||
        fechaDia.toDateString() === fechaFin.toDateString()
      ) {
        clase += " CalendarioReagenda-dia-seleccionado";
      }
      // Si está dentro del rango
      else if (fechaDia > fechaInicio && fechaDia < fechaFin) {
        clase += " CalendarioReagenda-dia-rango";
      }
    } else if (fechaInicio && !fechaFin) {
      // Sólo hay fechaInicio seleccionada
      if (fechaDia.toDateString() === fechaInicio.toDateString()) {
        clase += " CalendarioReagenda-dia-seleccionado";
      }
    }

    return clase;
  };

  // Validar que las fechas cumplan el mínimo de noches
  const validarFechas = (): boolean => {
    if (!fechaInicio || !fechaFin) return false;
    if (fechaInicio >= fechaFin) {
      Swal.fire("Error", "La fecha de inicio debe ser antes de la fecha de fin", "error");
      return false;
    }

    const diferenciaDias = (fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24);
    if (diferenciaDias < minimoNoches) {
      Swal.fire("Error", `Debe haber un mínimo de ${minimoNoches} noches entre las fechas.`, "warning");
      return false;
    }
    return true;
  };

  // Renderiza el encabezado de días (Do, Lu, Ma, etc.)
  const renderizarEncabezadoDias = () => {
    const diasSemana = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sá"];
    return (
      <div className="CalendarioReagenda-dias-semana">
        {diasSemana.map((dia, i) => (
          <div key={i} className="CalendarioReagenda-dia-semana">
            {dia}
          </div>
        ))}
      </div>
    );
  };

  // Renderiza los días de un mes dado (retorna el array de JSX)
  const renderizarDiasDelMes = (anio: number, mes: number) => {
    const primerDiaSemana = new Date(anio, mes, 1).getDay();
    const diasEnMes = new Date(anio, mes + 1, 0).getDate();
    const celdas = [];

    // Espacios vacíos para alinear el primer día
    for (let i = 0; i < primerDiaSemana; i++) {
      celdas.push(<div key={`vacio-${i}`} className="CalendarioReagenda-dia-vacio" />);
    }

    // Días reales del mes
    for (let dia = 1; dia <= diasEnMes; dia++) {
      const fechaDia = new Date(anio, mes, dia);
      fechaDia.setHours(0, 0, 0, 0);

      celdas.push(
        <button
          key={dia}
          className={getDiaClase(fechaDia)}
          onClick={() => manejarClickFecha(fechaDia)}
          disabled={
            fechasReservadas.some((f) => f.toDateString() === fechaDia.toDateString()) ||
            fechaDia < hoy
          }
        >
          {dia}
        </button>
      );
    }
    return celdas;
  };

  // Confirmar la solicitud de reagendamiento
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

      // Llamada a la API
      const response = await fetch(`https://glamperosapi.onrender.com/reservas/reagendamientos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codigoReserva,
          FechaIngreso: fechaInicio!.toISOString(),
          FechaSalida: fechaFin!.toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "No se pudo solicitar el reagendamiento");
      }

      // Envía el mensaje de WhatsApp
      await enviarWhatsAppReagendamiento({
        numero: whatsapp,
        nombrePropietario: nombreProp,
        codReserva: codigoReserva,
      });

      // Envía el mensaje de WhatsApp edwin
      await enviarWhatsAppReagendamiento({
        numero: "573125443396",
        nombrePropietario: nombreProp,
        codReserva: codigoReserva,
      });

      // Si todo va bien, avisamos y cerramos
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
      <div
        className="CalendarioReagenda-contenedor"
        onClick={(e) => e.stopPropagation()} // Evita cerrar al hacer click dentro
      >
        <button className="CalendarioReagenda-boton-cerrar" onClick={cerrarCalendario}>
          ✖
        </button>
        <h2 className="CalendarioReagenda-titulo">Selecciona tus nuevas fechas</h2>

        {/* Contenedor con los meses */}
        <div className="CalendarioReagenda-meses">
          {mesesVisibles.map(({ mes, anio }, idx) => (
            <div key={idx} className="CalendarioReagenda-mes">
              <h3 className="CalendarioReagenda-mes-titulo">
                {new Date(anio, mes).toLocaleDateString("es-ES", {
                  month: "long",
                  year: "numeric",
                })}
              </h3>
              {/* Encabezado de días */}
              {renderizarEncabezadoDias()}
              {/* Grid con los días del mes */}
              <div className="CalendarioReagenda-grid">
                {renderizarDiasDelMes(anio, mes)}
              </div>
            </div>
          ))}
        </div>

        {/* Botones de acción */}
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
