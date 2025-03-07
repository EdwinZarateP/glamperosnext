"use client";

import React, { useContext, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation"; // Cambio de useParams a useSearchParams
import { ContextoApp } from "@/context/AppContext";
import { GiCampingTent } from "react-icons/gi";
import CalendarioGeneral from "@/Componentes/CalendarioGeneral";
import { ObtenerGlampingPorId } from "@/Funciones/ObtenerGlamping";
import Swal from "sweetalert2";
import "./estilos.css";

interface Glamping {
  fechasReservadas?: string[];
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

  const searchParams = useSearchParams(); // Cambio de useParams a useSearchParams
  const glampingId = searchParams.get("glampingId") || "";
  const fechaInicioUrl = searchParams.get("fechaInicioUrl");
  const fechaFinUrl = searchParams.get("fechaFinUrl");
  const totalDiasUrl = searchParams.get("totalDiasUrl");

  const [, setInformacionGlamping] = useState<Glamping | null>(null);

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
        });

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

  const enviarFechasAPI = async () => {
    try {
      if (!fechaInicio || !fechaFin) {
        throw new Error("Fechas inválidas");
      }

      const fechasArray: string[] = [];
      let fechaActual = new Date(fechaInicio);

      while (fechaActual < fechaFin) {
        fechasArray.push(new Date(fechaActual).toISOString().split("T")[0]);
        fechaActual.setDate(fechaActual.getDate() + 1);
      }

      const updateResponse = await fetch(
        `https://glamperosapi.onrender.com/glampings/${glampingId}/fechasReservadas`,
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
        window.scrollTo({
          top: 0,
          behavior: "auto",
        });

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

  return (
    <>
      <div className="SepararFechas-contenedor">
        <p>
          Haz clic en este botón para bloquear fechas y evitar que estén disponibles para reservas. Ten en cuenta que la fecha 'Hasta' 
          no se incluye en el rango seleccionado.
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
      </div>

      {mostrarCalendario && <CalendarioGeneral cerrarCalendario={() => setMostrarCalendario(false)} />}
    </>
  );
};

export default SepararFechas;
