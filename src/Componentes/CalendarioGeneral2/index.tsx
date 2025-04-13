"use client";

import React, { useContext, useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useSearchParams } from "next/navigation";
import { GiCampingTent } from "react-icons/gi";
import "./estilos.css";
import { ContextoApp } from "@/context/AppContext";
import { ObtenerGlampingPorId } from "@/Funciones/ObtenerGlamping";

// =============================================================================
//                       TIPOS E INTERFACES
// =============================================================================

export interface PropiedadesCalendarioGeneral2 {
  cerrarCalendario: () => void;
  fechasManual?: string[];
  fechasAirbnb?: string[];
  fechasBooking?: string[];
  fechasUnidas?: string[];
}

interface Glamping {
  nombreGlamping?: string;
  fechasReservadas?: string[];
  fechasManual?: string[];
  fechasAirbnb?: string[];
  fechasBooking?: string[];
  urlIcal?: string;
  urlIcalBooking?: string;
}

// =============================================================================
//                        COMPONENTE PRINCIPAL
// =============================================================================

const CalendarioGeneral2: React.FC<PropiedadesCalendarioGeneral2> = ({
  fechasManual: fechasManualProp = [],
  fechasAirbnb: fechasAirbnbProp = [],
  fechasBooking: fechasBookingProp = [],
}) => {
  // 1. Acceso al Contexto
  const almacenVariables = useContext(ContextoApp);
  if (!almacenVariables) {
    throw new Error("El ContextoApp no está disponible. Asegúrate de envolver el componente en su proveedor.");
  }
  const { setFechasSeparadas } = almacenVariables;

  // 2. Estado para almacenar la información del glamping
  const [informacionGlamping, setInformacionGlamping] = useState<Glamping | null>(null);
  const searchParams = useSearchParams();
  const glampingId = searchParams.get("glampingId") || "";

  // 3. Consulta los datos del glamping
  useEffect(() => {
    const consultarGlamping = async () => {
      if (!glampingId) {
        console.error("No se proporcionó un ID de glamping.");
        return;
      }
      const datos = await ObtenerGlampingPorId(glampingId);
      if (datos) {
        setInformacionGlamping({
          nombreGlamping: datos.nombreGlamping,
          fechasReservadas: datos.fechasReservadas || [],
          fechasManual: datos.fechasReservadasManual || [],
          fechasAirbnb: datos.fechasReservadasAirbnb || [],
          fechasBooking: datos.fechasReservadasBooking || [],
          urlIcal: datos.urlIcal,
          urlIcalBooking: datos.urlIcalBooking,
        });
        // Convertir las fechasReservadas a objetos Date y actualizar el contexto
        if (datos.fechasReservadas) {
          const fechasComoDate = datos.fechasReservadas.map((fechaString: string) => {
            const [year, month, day] = fechaString.split("-").map(Number);
            return new Date(year, month - 1, day);
          });
          setFechasSeparadas(fechasComoDate);
        }
      }
    };
    consultarGlamping();
  }, [glampingId, setFechasSeparadas]);

  // 4. Estado para almacenar las fechas seleccionadas (en formato "YYYY-MM-DD")
  const [fechasSeleccionadas, setFechasSeleccionadas] = useState<string[]>([]);

  // 5. Declaramos la variable "hoy" (fecha actual a medianoche)
  const hoy: Date = new Date();
  hoy.setHours(0, 0, 0, 0);

  // =============================================================================
  //        HELPERS PARA FORMATEAR FECHAS Y GESTIONAR LA SELECCIÓN
  // =============================================================================

  // Formatea un objeto Date a "YYYY-MM-DD"
  const formatDate = (date: Date): string => date.toISOString().split("T")[0];

  // Verifica si la fecha (formateada) está dentro de las fechas manuales (editable)
  const isManualBloqueada = (fechaStr: string): boolean => {
    const manual = informacionGlamping?.fechasManual || fechasManualProp;
    return manual.includes(fechaStr);
  };

  // Función toggle para seleccionar/deseleccionar una fecha.
  // Si se intenta mezclar fechas manuales con otras, se reinicia la selección.
  const toggleFecha = (fecha: Date) => {
    const fechaStr = formatDate(fecha);
    const nuevaEsBloqueada = isManualBloqueada(fechaStr);
    if (fechasSeleccionadas.length === 0) {
      setFechasSeleccionadas([fechaStr]);
    } else {
      const primera = fechasSeleccionadas[0];
      const seleccionActualBloqueada = isManualBloqueada(primera);
      if (nuevaEsBloqueada !== seleccionActualBloqueada) {
        setFechasSeleccionadas([fechaStr]);
      } else {
        setFechasSeleccionadas(prev =>
          prev.includes(fechaStr)
            ? prev.filter(f => f !== fechaStr)
            : [...prev, fechaStr]
        );
      }
    }
  };

  // =============================================================================
  //             CÁLCULO DE MESES VISIBLES PARA EL CALENDARIO
  // =============================================================================

  const [mesesVisibles, setMesesVisibles] = useState<{ mes: number; anio: number }[]>([]);
  useEffect(() => {
    const meses = [];
    for (let i = 0; i < 18; i++) {
      const nuevoMes = new Date(hoy.getFullYear(), hoy.getMonth() + i, 1);
      meses.push({ mes: nuevoMes.getMonth(), anio: nuevoMes.getFullYear() });
    }
    setMesesVisibles(meses);
  }, [hoy]);

  // =============================================================================
  //          OBTENCIÓN DE CLASES CSS SEGÚN EL ORIGEN DE LA FECHA
  // =============================================================================

  const obtenerClasePorFecha = (fecha: Date): string => {
    const fechaStr = formatDate(fecha);
    const manual = informacionGlamping?.fechasManual || fechasManualProp;
    const airbnb = informacionGlamping?.fechasAirbnb || fechasAirbnbProp;
    const booking = informacionGlamping?.fechasBooking || fechasBookingProp;
    if (manual.includes(fechaStr)) return "CalendarioGeneral2-dia-reservada-manual";
    if (airbnb.includes(fechaStr)) return "CalendarioGeneral2-dia-reservada-airbnb";
    if (booking.includes(fechaStr)) return "CalendarioGeneral2-dia-reservada-booking";
    return "";
  };

  // Verifica si la fecha está seleccionada (para cambiar estilo)
  const isFechaSeleccionada = (fecha: Date): boolean => {
    return fechasSeleccionadas.includes(formatDate(fecha));
  };

  // =============================================================================
  //               RENDERIZACIÓN DE LA GRILLA DEL CALENDARIO
  // =============================================================================

  const renderizarCalendario = (mes: number, anio: number) => {
    const diasEnMes = [];
    const totalDiasMes = new Date(anio, mes + 1, 0).getDate();
    const primerDiaDelMes = new Date(anio, mes, 1).getDay();

    // Añade espacios vacíos para alinear el primer día del mes.
    for (let i = 0; i < primerDiaDelMes; i++) {
      diasEnMes.push(<div key={`vacio-${i}`} className="CalendarioGeneral2-dia-vacio" />);
    }
    for (let dia = 1; dia <= totalDiasMes; dia++) {
      const fechaDia = new Date(anio, mes, dia);
      // Si la fecha es menor o igual a hoy, se deshabilita
      const deshabilitada = fechaDia.getTime() <= hoy.getTime();
      const claseReserva = obtenerClasePorFecha(fechaDia);
      // Si la fecha es de Airbnb o Booking, no se puede editar y se mantiene su color original.
      const noEditable =
        claseReserva === "CalendarioGeneral2-dia-reservada-airbnb" ||
        claseReserva === "CalendarioGeneral2-dia-reservada-booking";
      const disabled = deshabilitada || noEditable;
      // Solo las fechas manuales seleccionadas se muestran en verde
      const claseSeleccionada = isFechaSeleccionada(fechaDia) && !noEditable
        ? " CalendarioGeneral2-dia-seleccionado"
        : "";
      diasEnMes.push(
        <button
          key={dia}
          className={`CalendarioGeneral2-dia ${claseReserva}${claseSeleccionada}${
            disabled ? " CalendarioGeneral2-dia-deshabilitado" : ""
          }`}
          onClick={() => !disabled && toggleFecha(fechaDia)}
          disabled={disabled}
        >
          {dia}
        </button>
      );
    }
    return diasEnMes;
  };

  // =============================================================================
  //        FUNCIONES PARA BLOQUEAR Y DESBLOQUEAR LAS FECHAS
  // =============================================================================

  // Bloqueo: se envía un PATCH al endpoint de bloqueo de fechas manuales.
  // El endpoint espera { "fechas": [ ... ] }
  const bloquearFechasAPI = async () => {
    if (fechasSeleccionadas.length === 0) return;
    try {
      const response = await fetch(
        `https://glamperosapi.onrender.com/glampings/${glampingId}/fechasReservadasManual`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fechas: fechasSeleccionadas })
        }
      );
      if (!response.ok) throw new Error("Error al bloquear las fechas");
      Swal.fire({
        icon: "success",
        title: "Fechas bloqueadas",
        text: "Las fechas han sido bloqueadas correctamente."
      }).then(() => window.location.reload());
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un problema al bloquear las fechas. Inténtalo de nuevo."
      });
    }
  };

  // Desbloqueo: se envía un PATCH al endpoint para eliminar fechas manuales.
  // El endpoint espera { "fechas_a_eliminar": [ ... ] }
  const desbloquearFechasAPI = async () => {
    if (fechasSeleccionadas.length === 0) return;
    const fechasManual = informacionGlamping?.fechasManual || fechasManualProp;
    const noManual = fechasSeleccionadas.filter(f => !fechasManual.includes(f));
    if (noManual.length > 0) {
      Swal.fire({
        icon: "error",
        title: "Fechas no desbloqueables",
        text: "Estas fechas no están marcadas como manuales: " + noManual.join(", ")
      });
      return;
    }
    try {
      const response = await fetch(
        `https://glamperosapi.onrender.com/glampings/${glampingId}/eliminar_fechas_manual`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fechas_a_eliminar: fechasSeleccionadas })
        }
      );
      if (!response.ok) throw new Error("Error al desbloquear las fechas");
      Swal.fire({
        icon: "success",
        title: "Fechas desbloqueadas",
        text: "Las fechas han sido desbloqueadas correctamente."
      }).then(() => window.location.reload());
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron desbloquear las fechas. Inténtalo de nuevo."
      });
    }
  };

  // =============================================================================
  //            RENDERIZACIÓN FINAL DEL COMPONENTE (UI)
  // =============================================================================

  return (
    <div className="CalendarioGeneral2-contenedor">
      <h2 className="CalendarioGeneral2-titulo">Calendario {informacionGlamping?.nombreGlamping}</h2>      
      <div className="CalendarioGeneral2-header">
        <div className="CalendarioGeneral2-botonesAccion">
          <button
            className="CalendarioGeneral2-boton-sincronizar"
            onClick={async () => {
              try {
                if (!glampingId) throw new Error("Glamping no encontrado");
                const glamping = await ObtenerGlampingPorId(glampingId);
                if (!glamping) throw new Error("Glamping no encontrado");
                const urls: string[] = [];
                for (const campo of ["urlIcal", "urlIcalBooking"]) {
                  const valor = glamping[campo];
                  if (typeof valor === "string") {
                    valor.split("\n").forEach(linea => {
                      const url = linea.trim();
                      if (url && url.toLowerCase() !== "sin url") {
                        urls.push(url);
                      }
                    });
                  }
                }
                if (urls.length === 0) {
                  Swal.fire("Sin URL válida", "No hay URLs válidas para sincronizar.", "info");
                  return;
                }
                const resultados: { url: string; ok: boolean; mensaje: string }[] = [];
                for (const url of urls) {
                  const response = await fetch(
                    `https://glamperosapi.onrender.com/ical/importar?glamping_id=${glampingId}&url_ical=${encodeURIComponent(url)}`,
                    { method: "POST" }
                  );
                  const data = await response.json();
                  resultados.push({ url, ok: response.ok, mensaje: data.mensaje || data.detail });
                }
                const exitosos = resultados.filter(r => r.ok).length;
                Swal.fire({
                  icon: "success",
                  title: "Sincronización completada",
                  html: `${exitosos} de ${resultados.length} URLs sincronizadas correctamente.`
                });
                window.location.reload();
              } catch (error) {
                Swal.fire("Error", "Ocurrió un error al sincronizar los calendarios.", "error");
              }
            }}
          >
            Sincronizar calendarios
          </button>
        </div>
      </div>
      <div className="CalendarioGeneral2-meses">
        {mesesVisibles.map(({ mes, anio }, idx) => (
          <div key={idx} className="CalendarioGeneral2-mes">
            <h3 className="CalendarioGeneral2-mes-titulo">
              {new Date(anio, mes).toLocaleDateString("es-ES", { month: "long", year: "numeric" })}
            </h3>
            <div className="CalendarioGeneral2-grid">
              {renderizarCalendario(mes, anio)}
            </div>
          </div>
        ))}
      </div>
      <div className="CalendarioGeneral2-botones">
        <button
          className="CalendarioGeneral2-boton-borrar"
          onClick={() => setFechasSeleccionadas([])}
        >
          Borrar selección
        </button>
        {fechasSeleccionadas.length > 0 && (
          <>
            {isManualBloqueada(fechasSeleccionadas[0]) ? (
              <button className="CalendarioGeneral2-boton-desbloquear" onClick={desbloquearFechasAPI}>
                Desbloquear Fechas
              </button>
            ) : (
              <button className="CalendarioGeneral2-boton-bloquear" onClick={bloquearFechasAPI}>
                Bloquear Fechas <GiCampingTent />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CalendarioGeneral2;
