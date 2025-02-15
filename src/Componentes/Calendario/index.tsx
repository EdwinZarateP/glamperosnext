"use client"; // Asegura que el componente solo se renderiza en el cliente

import React, { useContext, useState, useEffect } from "react";
import { ContextoApp } from "@/context/AppContext";
import Swal from "sweetalert2";
import "./estilos.css";

interface CalendarioProps {
  nombreGlamping: string;
}

const Calendario: React.FC<CalendarioProps> = ({ nombreGlamping }) => {
  const almacenVariables = useContext(ContextoApp);

  if (!almacenVariables) {
    throw new Error(
      "El contexto no está disponible. Asegúrate de envolver el componente en un proveedor de contexto."
    );
  }

  const {
    fechaInicio, setFechaInicio, fechaFin, setFechaFin, totalDias,
    setTotalDias, setFechaInicioConfirmado, setFechaFinConfirmado, FechasSeparadas,
  } = almacenVariables;

  const [mesActual, setMesActual] = useState<number>(new Date().getMonth());
  const [anioActual, setAnioActual] = useState<number>(new Date().getFullYear());

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const fechaLimite = new Date(hoy);
  fechaLimite.setFullYear(fechaLimite.getFullYear() + 1);

  useEffect(() => {
    if (fechaInicio && fechaFin) {
      let diferenciaTiempo = fechaFin.getTime() - fechaInicio.getTime();
      let dias = Math.ceil(diferenciaTiempo / (1000 * 60 * 60 * 24));

      const diasReservadosEnRango = FechasSeparadas.filter(
        (reserva) => reserva >= fechaInicio && reserva <= fechaFin
      ).length;

      setTotalDias(dias - diasReservadosEnRango);
    } else {
      setTotalDias(1);
    }
  }, [fechaInicio, fechaFin, FechasSeparadas, setTotalDias]);

  const formatearFecha = (fecha: Date): string =>
    fecha.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });

  const manejarClickFecha = (fecha: Date) => {
    if (!fechaInicio || (fechaInicio && fechaFin)) {
      setFechaInicio(fecha);
      setFechaFin(null);
    } else if (fechaInicio && !fechaFin && fecha >= fechaInicio) {
      let nuevaFechaFin = new Date(fecha);
      if (nuevaFechaFin.toDateString() === fechaInicio.toDateString()) {
        nuevaFechaFin.setDate(nuevaFechaFin.getDate() + 1);
      }

      const fechasEnRango = FechasSeparadas.filter(
        (reserva) => reserva >= fechaInicio && reserva <= nuevaFechaFin
      );

      if (fechasEnRango.length > 0) {
        Swal.fire({
          title: "Fechas reservadas",
          text: `El rango seleccionado tiene fechas reservadas: ${fechasEnRango
            .map((d) => formatearFecha(d))
            .join(", ")}`,
          icon: "error",
          confirmButtonText: "Aceptar",
        });
      } else {
        setFechaFin(nuevaFechaFin);
        setFechaInicioConfirmado(fechaInicio);
        setFechaFinConfirmado(nuevaFechaFin);
      }
    } else {
      setFechaInicio(fecha);
      setFechaFin(null);
    }
  };

  const manejarBorrarFechas = () => {
    setFechaInicio(null);
    setFechaFin(null);
    setTotalDias(1);
  };

  const esFechaSeleccionada = (fecha: Date): boolean => {
    if (fechaInicio && fechaFin) {
      return fecha >= fechaInicio && fecha <= fechaFin;
    }
    return fechaInicio?.toDateString() === fecha.toDateString();
  };

  const esFechaReservada = (fecha: Date): boolean =>
    FechasSeparadas.some((reserva) => fecha.toDateString() === reserva.toDateString());

  const esFechaDeshabilitada = (fecha: Date): boolean => fecha <= hoy || fecha > fechaLimite;

  const manejarMesAnterior = () => {
    if (mesActual === 0) {
      setMesActual(11);
      setAnioActual((prevAnio) => prevAnio - 1);
    } else {
      setMesActual((prevMes) => prevMes - 1);
    }
  };

  const manejarMesSiguiente = () => {
    if (mesActual === 11) {
      setMesActual(0);
      setAnioActual((prevAnio) => prevAnio + 1);
    } else {
      setMesActual((prevMes) => prevMes + 1);
    }
  };

  const obtenerNombreMes = (mes: number) => [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ][mes];

  const renderizarEncabezadoDias = () => (
    <div className="calendario-dias-semana">
      {["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sá"].map((dia, index) => (
        <div key={index} className="calendario-dia-semana">
          {dia}
        </div>
      ))}
    </div>
  );

  const renderizarCalendario = (mes: number, anio: number) => {
    const dias: JSX.Element[] = [];
    const totalDiasMes = new Date(anio, mes + 1, 0).getDate();
    const primerDiaDelMes = new Date(anio, mes, 1).getDay();

    for (let i = 0; i < primerDiaDelMes; i++) {
      dias.push(<div key={`vacio-${i}`} className="calendario-dia-vacio"></div>);
    }

    for (let dia = 1; dia <= totalDiasMes; dia++) {
      const fecha = new Date(anio, mes, dia);
      const deshabilitada = esFechaDeshabilitada(fecha);
      const reservada = esFechaReservada(fecha);
      const seleccionado = esFechaSeleccionada(fecha);

      dias.push(
        <button
          key={dia}
          className={`calendario-dia ${
            seleccionado ? "calendario-dia-seleccionado" : ""
          } ${reservada ? "calendario-dia-reservada" : ""} ${
            seleccionado && fechaInicio && fechaFin && fecha > fechaInicio && fecha < fechaFin
              ? "calendario-dia-rango"
              : ""
          }`}
          onClick={() => !deshabilitada && !reservada && manejarClickFecha(fecha)}
          disabled={deshabilitada || reservada}
        >
          {dia}
        </button>
      );
    }

    return dias;
  };

  return (
    <div className="calendario">
      <h1>{nombreGlamping}</h1>
      <h2 className="calendario-subtitulo">
        {fechaInicio && fechaFin
          ? `${formatearFecha(fechaInicio)} - ${formatearFecha(fechaFin)} (${totalDias} noche${totalDias === 1 ? "" : "s"})`
          : "Selecciona tus fechas"}
      </h2>
      <div className="calendario-encabezado">
        <button onClick={manejarMesAnterior}className="calendario-navegacion">&lt;</button>
        <button onClick={manejarMesSiguiente}className="calendario-navegacion">&gt;</button>
      </div>
      <div className="calendario-columnas">
        <div className="calendario-columna">
          <h2>{`${obtenerNombreMes(mesActual)} ${anioActual}`}</h2>
          {renderizarEncabezadoDias()}
          <div className="calendario-grid">{renderizarCalendario(mesActual, anioActual)}</div>
        </div>
        <div className="calendario-columna">
          <h2>{`${obtenerNombreMes((mesActual + 1) % 12)} ${mesActual === 11 ? anioActual + 1 : anioActual}`}</h2>
          {renderizarEncabezadoDias()}
          <div className="calendario-grid">{renderizarCalendario((mesActual + 1) % 12, mesActual === 11 ? anioActual + 1 : anioActual)}</div>
        </div>
      </div>
      <div className="calendario-boton-borrar">
        <button onClick={manejarBorrarFechas} className="calendario-borrar">
          Borrar fechas
        </button>
      </div>
    </div>
  );
};

export default Calendario;
