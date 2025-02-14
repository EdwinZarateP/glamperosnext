"use client";

import React, { useContext, useState, useEffect } from "react";
import Swal from "sweetalert2";  // Importamos SweetAlert2
import "./estilos.css";          // Mantén tu estilos.css al mismo nivel de este archivo
import { ContextoApp } from "@/context/AppContext"; // Ajusta la ruta de tu contexto según tu proyecto

interface CalendarioGeneralProps {
  cerrarCalendario: () => void;
}

const CalendarioGeneral: React.FC<CalendarioGeneralProps> = ({ cerrarCalendario }) => {
  const almacenVariables = useContext(ContextoApp);

  if (!almacenVariables) {
    throw new Error(
      "El almacenVariables no está disponible. Asegúrate de envolver el componente en un proveedor de almacenVariables."
    );
  }

  const {
    fechaInicio,
    setFechaInicio,
    fechaFin,
    setFechaFin,
    setTotalDias,
    setFechaInicioConfirmado,
    setFechaFinConfirmado,
    FechasSeparadas,
  } = almacenVariables;

  const [mesesVisibles, setMesesVisibles] = useState<{ mes: number; anio: number }[]>([]);

  // Preparamos la fecha de hoy sin horas
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  // Generamos 18 meses a partir de hoy (puedes ajustar la cantidad)
  useEffect(() => {
    const meses = [];
    for (let i = 0; i < 18; i++) {
      const nuevoMes = new Date(hoy.getFullYear(), hoy.getMonth() + i, 1);
      meses.push({ mes: nuevoMes.getMonth(), anio: nuevoMes.getFullYear() });
    }
    setMesesVisibles(meses);
  }, []);

  // Cálculo de días libres entre fechaInicio y fechaFin
  useEffect(() => {
    if (fechaInicio && fechaFin) {
      let diferenciaTiempo = fechaFin.getTime() - fechaInicio.getTime();
      let dias = Math.ceil(diferenciaTiempo / (1000 * 60 * 60 * 24));

      // Restamos los días que coincidan con fechas ya separadas (reservadas)
      if (FechasSeparadas.length > 0) {
        const diasReservadosEnRango: Date[] = [];
        for (let i = 0; i < dias; i++) {
          const dia = new Date(
            fechaInicio.getTime() + i * (1000 * 60 * 60 * 24)
          );
          if (
            FechasSeparadas.some(
              (fechaReservada) =>
                fechaReservada.toDateString() === dia.toDateString()
            )
          ) {
            diasReservadosEnRango.push(dia);
          }
        }
        dias -= diasReservadosEnRango.length;
      }

      setTotalDias(dias);
    } else {
      setTotalDias(1);
    }
  }, [fechaInicio, fechaFin, FechasSeparadas, setTotalDias]);

  // Validación para evitar fecha de inicio posterior a fecha de fin
  const validarFechas = () => {
    if (fechaInicio && fechaFin) {
      if (fechaInicio.getTime() === fechaFin.getTime() || fechaInicio > fechaFin) {
        Swal.fire({
          icon: "error",
          title: "Error en el rango de fechas",
          text: "La fecha de inicio no puede ser igual o posterior a la fecha de fin. Por favor, selecciona un rango válido.",
        });
        return false;
      }
    }
    return true;
  };

  // Función para marcar el clic en la fecha seleccionada
  const manejarClickFecha = (fecha: Date) => {
    // Si está reservada, no hacemos nada
    if (esFechaReservada(fecha)) return;

    // Si no hay fechaInicio o ambas están definidas, reiniciamos el rango
    if (!fechaInicio || (fechaInicio && fechaFin)) {
      setFechaInicio(fecha);
      setFechaFin(null);
    } else if (fechaInicio && !fechaFin && fecha >= fechaInicio) {
      let nuevaFechaFin = new Date(fecha);
      // Evitar rango de un solo día igual al inicio
      if (nuevaFechaFin.toDateString() === fechaInicio.toDateString()) {
        nuevaFechaFin.setDate(nuevaFechaFin.getDate() + 1);
      }

      // Verificamos que no haya fechas reservadas en el rango
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

  // Borrar el rango de fechas
  const manejarBorrarFechas = () => {
    setFechaInicio(null);
    setFechaFin(null);
    setTotalDias(1);
  };

  // Identificar si la fecha está seleccionada
  const esFechaSeleccionada = (fecha: Date): boolean => {
    if (fechaInicio && fechaFin) {
      return fecha >= fechaInicio && fecha <= fechaFin;
    }
    return fechaInicio?.toDateString() === fecha.toDateString();
  };

  // Identificar si la fecha está reservada
  const esFechaReservada = (fecha: Date): boolean => {
    return FechasSeparadas.length > 0
      ? FechasSeparadas.some(
          (fechaReservada) =>
            fecha.toDateString() === fechaReservada.toDateString()
        )
      : false;
  };

  // Determinar si la fecha está deshabilitada (por ser anterior a hoy)
  const esFechaDeshabilitada = (fecha: Date): boolean => {
    if (fecha <= hoy) {
      return true;
    }
    return false;
  };

  // Verificar que no haya fechas reservadas en un rango
  const verificarRango = (inicio: Date, fin: Date): boolean => {
    const diferenciaTiempo = fin.getTime() - inicio.getTime();
    const totalDiasRango = Math.ceil(diferenciaTiempo / (1000 * 60 * 60 * 24));

    for (let i = 0; i <= totalDiasRango; i++) {
      const dia = new Date(inicio.getTime() + i * (1000 * 60 * 60 * 24));
      if (
        FechasSeparadas.some(
          (fechaReservada) => fechaReservada.toDateString() === dia.toDateString()
        )
      ) {
        return false; // Hay una fecha reservada dentro del rango
      }
    }
    return true; // El rango está libre
  };

  // Renderizado de los encabezados de días (domingo, lunes, etc.)
  const renderizarEncabezadoDias = () => {
    const diasSemana = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sá"];
    return (
      <div className="CalendarioGeneral-dias-semana">
        {diasSemana.map((dia, index) => (
          <div key={index} className="CalendarioGeneral-dia-semana">
            {dia}
          </div>
        ))}
      </div>
    );
  };

  // Renderizamos el calendario de un mes
  const renderizarCalendario = (mes: number, anio: number) => {
    const dias = [];
    const totalDiasMes = new Date(anio, mes + 1, 0).getDate();
    const primerDiaDelMes = new Date(anio, mes, 1).getDay();

    // Creamos espacios vacíos para alinear correctamente el calendario
    for (let i = 0; i < primerDiaDelMes; i++) {
      dias.push(<div key={`vacio-${i}`} className="CalendarioGeneral-dia-vacio" />);
    }

    // Agregamos cada día del mes
    for (let dia = 1; dia <= totalDiasMes; dia++) {
      const fecha = new Date(anio, mes, dia);
      const deshabilitada = esFechaDeshabilitada(fecha);
      const reservada = esFechaReservada(fecha);
      const seleccionado = esFechaSeleccionada(fecha);

      dias.push(
        <button
          key={dia}
          className={`CalendarioGeneral-dia ${
            deshabilitada ? "CalendarioGeneral-dia-deshabilitado" : ""
          } ${reservada ? "CalendarioGeneral-dia-reservada" : ""} ${
            seleccionado ? "CalendarioGeneral-dia-seleccionado" : ""
          } ${
            seleccionado && fechaInicio && fechaFin && fecha > fechaInicio && fecha < fechaFin
              ? "CalendarioGeneral-dia-rango"
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
    <>
      {/* Fondo para oscurecer, se cierra al hacer click */}
      <div className="CalendarioGeneral-fondo" onClick={cerrarCalendario}></div>

      {/* El contenedor principal del calendario */}
      <div className="CalendarioGeneral">
        <button className="CalendarioGeneral-cerrar" onClick={cerrarCalendario}>
          ✖
        </button>
        <h2 className="CalendarioGeneral-titulo">Elige la fecha de tu viaje</h2>

        {/* Sección que contiene todos los meses visibles */}
        <div className="CalendarioGeneral-meses">
          {mesesVisibles.map(({ mes, anio }, index) => (
            <div key={index} className="CalendarioGeneral-mes">
              <h2>
                {new Date(anio, mes).toLocaleDateString("es-ES", {
                  month: "long",
                  year: "numeric",
                })}
              </h2>
              {renderizarEncabezadoDias()}
              <div className="CalendarioGeneral-grid">
                {renderizarCalendario(mes, anio)}
              </div>
            </div>
          ))}
        </div>

        {/* Botones para borrar o confirmar fechas */}
        <div className="CalendarioGeneral-botones">
          <button
            onClick={manejarBorrarFechas}
            className="CalendarioGeneral-boton-borrar"
          >
            Borrar fechas
          </button>
          <button
            onClick={() => {
              if (validarFechas()) {
                cerrarCalendario();
                setFechaInicioConfirmado(fechaInicio);
                setFechaFinConfirmado(fechaFin);
              }
            }}
            className="CalendarioGeneral-boton-siguiente"
            disabled={!fechaInicio || !fechaFin}
          >
            Confirmar fechas
          </button>
        </div>
      </div>
    </>
  );
};

export default CalendarioGeneral;
