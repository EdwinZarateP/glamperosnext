"use client";

import React, { useContext, useState, useEffect } from "react";
import Swal from "sweetalert2";  
import "./estilos.css";          
import { ContextoApp } from "@/context/AppContext"; 

export interface PropiedadesCalendarioGeneral2 {
  cerrarCalendario: () => void;
  // Unión de todas las fechas (opcional, para mostrar un resumen)
  fechasUnidas: string[];
  // Arrays separados según el origen:
  fechasManual: string[];
  fechasAirbnb: string[];
  fechasBooking: string[];
}

const CalendarioGeneral2: React.FC<PropiedadesCalendarioGeneral2> = ({
  cerrarCalendario,
  // fechasUnidas,
  fechasManual,
  fechasAirbnb,
  fechasBooking,
}) => {
  const almacenVariables = useContext(ContextoApp);

  if (!almacenVariables) {
    throw new Error(
      "El almacenVariables no está disponible. Asegúrate de envolver el componente en un proveedor de ContextoApp."
    );
  }

  // Extraemos las variables de nuestro contexto
  const {
    fechaInicio,
    setFechaInicio,
    fechaFin,
    setFechaFin,
    setTotalDias,
    setFechaInicioConfirmado,
    setFechaFinConfirmado,
    FechasSeparadas, // Aunque para este componente ahora usamos los arrays separados vía props, FechasSeparadas puede seguir existiendo
  } = almacenVariables;

  const [mesesVisibles, setMesesVisibles] = useState<{ mes: number; anio: number }[]>([]);

  // Preparamos la fecha de hoy sin horas
  const fechaHoy = new Date();
  fechaHoy.setHours(0, 0, 0, 0);

  // Generamos 18 meses a partir de hoy
  useEffect(() => {
    const mesesCalculados: { mes: number; anio: number }[] = [];
    for (let i = 0; i < 18; i++) {
      const nuevoMes = new Date(fechaHoy.getFullYear(), fechaHoy.getMonth() + i, 1);
      mesesCalculados.push({ mes: nuevoMes.getMonth(), anio: nuevoMes.getFullYear() });
    }
    setMesesVisibles(mesesCalculados);
  }, []);

  // Función que retorna una clase extra según el origen de la fecha reservada
  const obtenerClasePorFecha = (fecha: Date): string => {
    const fechaStr = fecha.toISOString().split("T")[0];
    if (fechasManual.includes(fechaStr)) return "CalendarioGeneral2-dia-reservada-manual";
    if (fechasAirbnb.includes(fechaStr)) return "CalendarioGeneral2-dia-reservada-airbnb";
    if (fechasBooking.includes(fechaStr)) return "CalendarioGeneral2-dia-reservada-booking";
    return "";
  };

  // Cálculo de días libres entre fechaInicio y fechaFin
  useEffect(() => {
    if (fechaInicio && fechaFin) {
      const diferenciaTiempo = fechaFin.getTime() - fechaInicio.getTime();
      let dias = Math.ceil(diferenciaTiempo / (1000 * 60 * 60 * 24));

      // Restamos los días que coincidan con fechas ya reservadas (usando FechasSeparadas, si lo necesitas)
      if (FechasSeparadas.length > 0) {
        const diasReservadosEnRango: Date[] = [];
        for (let i = 0; i < dias; i++) {
          const diaIterado = new Date(fechaInicio.getTime() + i * (1000 * 60 * 60 * 24));
          if (
            FechasSeparadas.some(
              (fechaReservada) => fechaReservada.toDateString() === diaIterado.toDateString()
            )
          ) {
            diasReservadosEnRango.push(diaIterado);
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
  const validarFechas = (): boolean => {
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

  // Función para manejar el clic en una fecha
  const manejarClickFecha = (fecha: Date) => {
    // Si la fecha está reservada, no hacemos nada
    if (esFechaReservada(fecha)) return;

    // Si no hay fechaInicio o ambas están definidas, reiniciamos el rango
    if (!fechaInicio || (fechaInicio && fechaFin)) {
      setFechaInicio(fecha);
      setFechaFin(null);
    } else if (fechaInicio && !fechaFin && fecha >= fechaInicio) {
      const nuevaFechaFin = new Date(fecha);
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

  // Borrar el rango de fechas seleccionado
  const manejarBorrarFechas = () => {
    setFechaInicio(null);
    setFechaFin(null);
    setTotalDias(1);
  };

  // Determina si la fecha está dentro del rango seleccionado
  const esFechaSeleccionada = (fecha: Date): boolean => {
    if (fechaInicio && fechaFin) {
      return fecha >= fechaInicio && fecha <= fechaFin;
    }
    return fechaInicio?.toDateString() === fecha.toDateString();
  };

  // Determina si la fecha ya fue reservada (usando la unión que se muestra en el calendario)
  const esFechaReservada = (fecha: Date): boolean => {
    return FechasSeparadas.length > 0
      ? FechasSeparadas.some(
          (fechaReservada) => fecha.toDateString() === fechaReservada.toDateString()
        )
      : false;
  };

  // Determina si la fecha está deshabilitada (por ser anterior o igual al día de hoy)
  const esFechaDeshabilitada = (fecha: Date): boolean => {
    return fecha <= fechaHoy;
  };

  // Verifica que en todo el rango (inicio - fin) no haya fechas reservadas
  const verificarRango = (inicio: Date, fin: Date): boolean => {
    const diferenciaTiempo = fin.getTime() - inicio.getTime();
    const totalDiasRango = Math.ceil(diferenciaTiempo / (1000 * 60 * 60 * 24));

    for (let i = 0; i <= totalDiasRango; i++) {
      const diaEnRango = new Date(inicio.getTime() + i * (1000 * 60 * 60 * 24));
      if (
        FechasSeparadas.some(
          (fechaReservada) => fechaReservada.toDateString() === diaEnRango.toDateString()
        )
      ) {
        return false;
      }
    }
    return true;
  };

  // Renderizamos el encabezado de los días de la semana
  const renderizarEncabezadoDias = () => {
    const diasSemana = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sá"];
    return (
      <div className="CalendarioGeneral2-dias-semana">
        {diasSemana.map((dia, i) => (
          <div key={i} className="CalendarioGeneral2-dia-semana">
            {dia}
          </div>
        ))}
      </div>
    );
  };

  // Renderizamos la cuadrícula de días de un mes
  const renderizarCalendario = (mes: number, anio: number) => {
    const diasEnMes = [];
    const totalDias = new Date(anio, mes + 1, 0).getDate();
    const primerDiaDelMes = new Date(anio, mes, 1).getDay();

    // Espacios vacíos para alinear al primer día
    for (let i = 0; i < primerDiaDelMes; i++) {
      diasEnMes.push(
        <div key={`vacio-${i}`} className="CalendarioGeneral2-dia-vacio" />
      );
    }

    // Creamos un botón para cada día
    for (let dia = 1; dia <= totalDias; dia++) {
      const fechaDia = new Date(anio, mes, dia);
      const estaDeshabilitada = esFechaDeshabilitada(fechaDia);
      const estaReservada = esFechaReservada(fechaDia);
      const estaSeleccionada = esFechaSeleccionada(fechaDia);
      // Si la fecha está reservada, obtenemos la clase correspondiente según el origen
      const reservaClase = estaReservada ? obtenerClasePorFecha(fechaDia) : "";

      diasEnMes.push(
        <button
          key={dia}
          className={`CalendarioGeneral2-dia
            ${estaDeshabilitada ? " CalendarioGeneral2-dia-deshabilitado" : ""}
            ${estaSeleccionada ? " CalendarioGeneral2-dia-seleccionado" : ""}
            ${
              estaSeleccionada && fechaInicio && fechaFin && fechaDia > fechaInicio && fechaDia < fechaFin
                ? " CalendarioGeneral2-dia-rango"
                : ""
            }
            ${reservaClase}
          `}
          onClick={() => !estaDeshabilitada && !estaReservada && manejarClickFecha(fechaDia)}
          disabled={estaDeshabilitada || estaReservada}
        >
          {dia}
        </button>
      );
    }

    return diasEnMes;
  };

  return (
    <>
      <div className="CalendarioGeneral2-fondo" onClick={cerrarCalendario}></div>
      <div className="CalendarioGeneral2-contenedor">
        <button className="CalendarioGeneral2-boton-cerrar" onClick={cerrarCalendario}>✖</button>
        <h2 className="CalendarioGeneral2-titulo">Escoge tu viaje en el susurro del tiempo</h2>
        <div className="CalendarioGeneral2-meses">
          {mesesVisibles.map(({ mes, anio }, idx) => (
            <div key={idx} className="CalendarioGeneral2-mes">
              <h3 className="CalendarioGeneral2-mes-titulo">
                {new Date(anio, mes).toLocaleDateString("es-ES", { month: "long", year: "numeric" })}
              </h3>
              {renderizarEncabezadoDias()}
              <div className="CalendarioGeneral2-grid">
                {renderizarCalendario(mes, anio)}
              </div>
            </div>
          ))}
        </div>
        <div className="CalendarioGeneral2-botones">
          <button className="CalendarioGeneral2-boton-borrar" onClick={manejarBorrarFechas}>Borrar fechas</button>
          <button
            className="CalendarioGeneral2-boton-confirmar"
            onClick={() => {
              if (validarFechas()) {
                cerrarCalendario();
                setFechaInicioConfirmado(fechaInicio);
                setFechaFinConfirmado(fechaFin);
              }
            }}
            disabled={!fechaInicio || !fechaFin}
          >
            Confirmar fechas
          </button>
        </div>
      </div>
    </>
  );
};

export default CalendarioGeneral2;
