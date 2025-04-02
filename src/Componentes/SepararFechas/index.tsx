"use client";

import React, { useContext, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation"; 
import { ContextoApp } from "@/context/AppContext";
import { GiCampingTent } from "react-icons/gi";
import CalendarioGeneral2 from "@/Componentes/CalendarioGeneral2";
import { ObtenerGlampingPorId } from "@/Funciones/ObtenerGlamping";
import Swal from "sweetalert2";
import "./estilos.css";

// Se amplía la interfaz para incluir los arrays separados
interface Glamping {
  fechasReservadas?: string[]; // Unión (combinada)
  fechasManual?: string[];     // Fechas ingresadas manualmente
  fechasAirbnb?: string[];     // Fechas importadas desde Airbnb
  fechasBooking?: string[];    // Fechas importadas desde Booking
}

const SepararFechas: React.FC = () => {
  const almacenVariables = useContext(ContextoApp);
  if (!almacenVariables) {
    throw new Error(
      "El contexto no está disponible. Asegúrate de envolver el componente en un proveedor de contexto."
    );
  }

  const {
    fechaInicio,
    setFechaInicio,
    fechaFin,
    setFechaFin,
    setTotalDias,
    mostrarCalendario,
    setMostrarCalendario,
    fechaInicioConfirmado,
    setFechaInicioConfirmado,
    setFechaFinConfirmado,
    fechaFinConfirmado,
    setFechasSeparadas,
  } = almacenVariables;

  const searchParams = useSearchParams();
  const glampingId = searchParams.get("glampingId") || "";
  const fechaInicioUrl = searchParams.get("fechaInicioUrl");
  const fechaFinUrl = searchParams.get("fechaFinUrl");
  const totalDiasUrl = searchParams.get("totalDiasUrl");

  // Se guarda toda la información del glamping, incluyendo los arrays separados
  const [informacionGlamping, setInformacionGlamping] = useState<Glamping | null>(null);

  useEffect(() => {
    const consultarGlamping = async () => {
      if (!glampingId) {
        console.error("No se proporcionó un ID de glamping.");
        return;
      }
      const datos = await ObtenerGlampingPorId(glampingId);
      if (datos) {
        setInformacionGlamping({
          fechasReservadas: datos.fechasReservadas || [],
          fechasManual: datos.fechasReservadasManual || [],
          fechasAirbnb: datos.fechasReservadasAirbnb || [],
          fechasBooking: datos.fechasReservadasBooking || [],
        });
        // Se usa la unión para el calendario
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

  const fechaInicioRender = fechaInicio
    ? fechaInicio
    : fechaInicioUrl
    ? new Date(fechaInicioUrl)
    : null;

  const fechaFinRender = fechaFin
    ? fechaFin
    : fechaFinUrl
    ? new Date(fechaFinUrl)
    : null;

  let totalDiasRender = 1;
  if (fechaInicioRender && fechaFinRender) {
    const diferenciaMillis = fechaFinRender.getTime() - fechaInicioRender.getTime();
    totalDiasRender = Math.ceil(diferenciaMillis / (24 * 60 * 60 * 1000));
  } else if (totalDiasUrl) {
    totalDiasRender = parseInt(totalDiasUrl, 10);
  }

  const hoy = new Date();
  const fechaInicioPorDefecto = new Date();
  fechaInicioPorDefecto.setDate(hoy.getDate() + 1);
  const fechaFinPorDefecto = new Date();
  fechaFinPorDefecto.setDate(hoy.getDate() + 2);

  const fechaInicioReservada = fechaInicio
    ? fechaInicio.toISOString().split("T")[0]
    : fechaInicioUrl
    ? new Date(fechaInicioUrl).toISOString().split("T")[0]
    : fechaInicioPorDefecto.toISOString().split("T")[0];

  let fechaFinReservada = fechaFin
    ? fechaFin.toISOString().split("T")[0]
    : fechaFinUrl
    ? new Date(fechaFinUrl).toISOString().split("T")[0]
    : fechaFinPorDefecto.toISOString().split("T")[0];

  if (new Date(fechaInicioReservada) > new Date(fechaFinReservada)) {
    const nuevaFechaFin = new Date(fechaInicioReservada);
    nuevaFechaFin.setDate(nuevaFechaFin.getDate() + 1);
    fechaFinReservada = nuevaFechaFin.toISOString().split("T")[0];
  }

  const formatearFecha = (fecha: Date | null): string => {
    if (!fecha) return "-";
    const opciones: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    };
    return new Intl.DateTimeFormat("es-ES", opciones).format(fecha);
  };

  useEffect(() => {
    if (!fechaInicioConfirmado && fechaInicioUrl) {
      setFechaInicioConfirmado(new Date(fechaInicioUrl));
    }
    if (!fechaFinConfirmado && fechaFinUrl) {
      setFechaFinConfirmado(new Date(fechaFinUrl));
    }
  }, [fechaInicioUrl, fechaFinUrl, fechaInicioConfirmado, fechaFinConfirmado, setFechaInicioConfirmado, setFechaFinConfirmado]);

  // Función para enviar las fechas manualmente
  // Se incluye la fecha final, por lo que si el usuario selecciona un solo día, se bloquea ese día
  const enviarFechasAPI = async () => {
    try {
      if (!fechaInicio || !fechaFin) {
        throw new Error("Fechas inválidas");
      }

      const fechasArray: string[] = [];
      let fechaActual = new Date(fechaInicio);

      // Si se selecciona un solo día, el bucle se ejecutará una vez
      while (fechaActual <= fechaFin) {
        fechasArray.push(new Date(fechaActual).toISOString().split("T")[0]);
        fechaActual.setDate(fechaActual.getDate() + 1);
      }

      // Se utiliza el endpoint de fechasReservadasManual
      const updateResponse = await fetch(
        `https://glamperosapi.onrender.com/glampings/${glampingId}/fechasReservadasManual`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ fechas: fechasArray }),
        }
      );

      if (!updateResponse.ok) {
        throw new Error("Error al actualizar las fechas reservadas");
      }

      Swal.fire({
        title: "Fechas bloqueadas",
        text: "Las fechas han sido bloqueadas correctamente.",
        icon: "success",
        confirmButtonText: "Aceptar",
      }).then(() => {
        window.location.reload();
      });
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "Hubo un problema al bloquear las fechas. Inténtalo de nuevo.",
        icon: "error",
        confirmButtonText: "Aceptar",
      });
    }
  };

  const sincronizarCalendarios = async () => {
    try {
      const glamping = await ObtenerGlampingPorId(glampingId);
      if (!glamping) {
        throw new Error("No se encontró el glamping");
      }
      const urls: string[] = [];
      for (const campo of ["urlIcal", "urlIcalBooking"]) {
        const valor = glamping[campo];
        if (typeof valor === "string") {
          valor.split("\n").forEach((linea) => {
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
      const exitosos = resultados.filter((r) => r.ok).length;
      Swal.fire({
        icon: "success",
        title: "Sincronización completada",
        html: `${exitosos} de ${resultados.length} URLs sincronizadas correctamente.`,
      });
      window.location.reload();
    } catch (error) {
      Swal.fire("Error", "Ocurrió un error al sincronizar los calendarios.", "error");
      console.error(error);
    }
  };

  return (
    <>
      <div className="SepararFechas-contenedor">
        <p>
          Haz clic en este botón para bloquear fechas y evitar que estén disponibles para reservas.    
        </p>
        <div
          className="SepararFechas-fechas"
          onClick={() => {
            setFechaInicio(fechaInicioRender);
            setFechaFin(fechaFinRender);
            setTotalDias(totalDiasRender);
            setMostrarCalendario(true);
          }}
        >
          <div className="SepararFechas-fecha">
            <span className="SepararFechas-fechaTitulo">DESDE</span>
            <span>{formatearFecha(fechaInicioRender)}</span>
          </div>
          <div className="SepararFechas-fecha">
            <span className="SepararFechas-fechaTitulo">HASTA</span>
            <span>{formatearFecha(fechaFinRender)}</span>
          </div>
        </div>
        <button className="SepararFechas-botonReserva" onClick={enviarFechasAPI}>
          Bloquear Fechas
          <GiCampingTent />
        </button>
        <button className="SepararFechas-botonSincronizar" onClick={sincronizarCalendarios}>
          Sincronizar calendarios
        </button>
      </div>
      {mostrarCalendario && (
        <CalendarioGeneral2 
          cerrarCalendario={() => setMostrarCalendario(false)}
          fechasManual={informacionGlamping?.fechasManual || []}
          fechasAirbnb={informacionGlamping?.fechasAirbnb || []}
          fechasBooking={informacionGlamping?.fechasBooking || []}
          fechasUnidas={informacionGlamping?.fechasReservadas || []}
        />
      )}
    </>
  );
};

export default SepararFechas;
