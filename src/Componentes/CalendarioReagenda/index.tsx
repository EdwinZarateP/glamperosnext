"use client";

import React, { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
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
  const [fechaInicio, setFechaInicio] = useState<Date | null>(fechasIniciales.inicio);
  const [fechaFin, setFechaFin] = useState<Date | null>(fechasIniciales.fin);
  const [mesesVisibles, setMesesVisibles] = useState<{ mes: number; anio: number }[]>([]);
  const [loading, setLoading] = useState(false); // 🔥 Evita doble ejecución
  const isRequestSent = useRef(false); // 🔥 Evita doble ejecución accidental

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

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
  }, []);

  const manejarClickFecha = (fecha: Date) => {
    if (esFechaReservada(fecha) || fecha < hoy) return;

    if (!fechaInicio || (fechaInicio && fechaFin)) {
      setFechaInicio(fecha);
      setFechaFin(null);
    } else if (fechaInicio && !fechaFin && fecha >= fechaInicio) {
      setFechaFin(fecha);
    } else {
      setFechaInicio(fecha);
      setFechaFin(null);
    }
  };

  const esFechaReservada = (fecha: Date) => {
    return fechasReservadas.some((f) => f.getTime() === fecha.getTime());
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

  const confirmarReagendamiento = async () => {
    if (!validarFechas() || loading || isRequestSent.current) return; // 🔥 Bloquea ejecuciones dobles
    setLoading(true);
    isRequestSent.current = true; // 🔥 Marca la solicitud como enviada

    try {
      const confirmacion = await Swal.fire({
        title: "Confirmación requerida",
        text: "Este reagendamiento debe ser aprobado por el dueño para que tenga efecto. ¿Deseas continuar?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, solicitar",
        cancelButtonText: "Cancelar",
      });

      if (!confirmacion.isConfirmed) {
        setLoading(false);
        isRequestSent.current = false; // 🔥 Reinicia la bandera si se cancela
        return;
      }

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

      await Swal.fire({
        icon: "info",
        title: "Reagendamiento solicitado",
        text: "Tu solicitud ha sido enviada y debe ser aprobada por el dueño.",
        confirmButtonText: "Entendido",
      });

      cerrarCalendario();
      onSeleccionarFechas(fechaInicio!, fechaFin!);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "No se pudo contactar al servidor";
      await Swal.fire({ 
        icon: "error", 
        title: "Error de conexión", 
        text: errorMessage 
      });
    } finally {
      setLoading(false);
      isRequestSent.current = false; // 🔥 Restablecer el estado después de completar la solicitud
    }
  };

  return (
    <div className="CalendarioReagenda-fondo" onClick={cerrarCalendario}>
      <div className="CalendarioReagenda-contenedor" onClick={(e) => e.stopPropagation()}>
        <button className="CalendarioReagenda-boton-cerrar" onClick={cerrarCalendario}>✖</button>
        <h2 className="CalendarioReagenda-titulo">Selecciona tus nuevas fechas</h2>
        <div className="CalendarioReagenda-meses">
          {mesesVisibles.map(({ mes, anio }, idx) => {
            const primerDiaSemana = new Date(anio, mes, 1).getDay();
            const diasEnMes = new Date(anio, mes + 1, 0).getDate();
            const celdas = [];

            for (let i = 0; i < primerDiaSemana; i++) {
              celdas.push(<div key={`empty-${i}`} className="CalendarioReagenda-dia-vacio" />);
            }

            for (let dia = 1; dia <= diasEnMes; dia++) {
              const fechaDia = new Date(anio, mes, dia);
              fechaDia.setHours(0, 0, 0, 0);

              celdas.push(
                <button
                  key={dia}
                  className={`CalendarioReagenda-dia 
                    ${fechaDia < hoy ? "CalendarioReagenda-dia-deshabilitado" : ""} 
                    ${esFechaReservada(fechaDia) ? "CalendarioReagenda-dia-reservada" : ""}
                    ${fechaInicio && !fechaFin && fechaDia.getTime() === fechaInicio.getTime() ? "CalendarioReagenda-dia-inicio" : ""}
                    ${fechaInicio && fechaFin && fechaDia >= fechaInicio && fechaDia <= fechaFin ? "CalendarioReagenda-dia-seleccionado" : ""}`}
                  onClick={() => manejarClickFecha(fechaDia)}
                  disabled={esFechaReservada(fechaDia) || fechaDia < hoy}
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
          <button onClick={() => { setFechaInicio(null); setFechaFin(null); }} className="CalendarioReagenda-boton-borrar">Borrar</button>
          <button onClick={confirmarReagendamiento} className="CalendarioReagenda-boton-confirmar" disabled={!fechaInicio || !fechaFin || loading}>
            {loading ? "Enviando..." : "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarioReagenda;
