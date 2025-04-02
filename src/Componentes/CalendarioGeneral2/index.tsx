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
      "El ContextoApp no está disponible. Asegúrate de envolver el componente en su proveedor."
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

  // Retorna la clase según el origen de la fecha reservada
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

  // Validación: la fecha de inicio no puede ser igual o posterior a la de fin
  const validarFechas = (): boolean => {
    if (fechaInicio && fechaFin) {
      if (fechaInicio > fechaFin) {
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

  // Función para manejar el clic en una fecha (modificada para permitir selección de un solo día y rangos)
  const manejarClickFecha = (fecha: Date) => {
    if (esFechaReservada(fecha)) return;

    // Caso 1: No hay selección: asignamos fechaInicio y dejamos fechaFin nula.
    if (!fechaInicio) {
      setFechaInicio(fecha);
      setFechaFin(null);
      return;
    }

    // Caso 2: Hay fechaInicio definida pero no fechaFin (esperamos segunda selección)
    if (fechaInicio && !fechaFin) {
      // Si el usuario hace clic en el mismo día, se confirma como un solo día
      if (fecha.toDateString() === fechaInicio.toDateString()) {
        setFechaFin(fecha);
      } else if (fecha > fechaInicio) {
        if (verificarRango(fechaInicio, fecha)) {
          setFechaFin(fecha);
        } else {
          Swal.fire({
            icon: "error",
            title: "Rango de fechas no disponible",
            text: "El rango de fechas seleccionado incluye fechas reservadas. Por favor, elige otro rango.",
          });
        }
      } else {
        // Si se selecciona una fecha anterior a la de inicio, reiniciamos la selección con ese día
        setFechaInicio(fecha);
        setFechaFin(null);
      }
      return;
    }

    // Caso 3: Ya hay una selección completa: reiniciamos la selección asignando el nuevo día como único día
    if (fechaInicio && fechaFin) {
      setFechaInicio(fecha);
      setFechaFin(null);
      return;
    }
  };

  // Borrar la selección actual
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

  // Determina si la fecha ya fue reservada (usando FechasSeparadas)
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

  // Verifica que en el rango (inicio - fin) no haya fechas reservadas
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

  // Encabezado de días de la semana
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

    // Por cada día, renderizamos un botón
    for (let dia = 1; dia <= totalDias; dia++) {
      const fechaDia = new Date(anio, mes, dia);
      const estaDeshabilitada = esFechaDeshabilitada(fechaDia);
      const estaReservada = esFechaReservada(fechaDia);
      const estaSeleccionada = esFechaSeleccionada(fechaDia);
      // Obtenemos la clase según el origen, si está reservada
      const reservaClase = estaReservada ? obtenerClasePorFecha(fechaDia) : "";
      // Si la selección es única (fechaInicio y fechaFin iguales) y coincide con este día
      const esBloqueoUnico =
        fechaInicio &&
        fechaFin &&
        (fechaInicio.toDateString() === fechaFin.toDateString()) &&
        (fechaDia.toDateString() === fechaInicio.toDateString());

      diasEnMes.push(
        <button
          key={dia}
          className={`CalendarioGeneral2-dia
            ${estaDeshabilitada ? " CalendarioGeneral2-dia-deshabilitado" : ""}
            ${
              estaSeleccionada
                ? esBloqueoUnico
                  ? " CalendarioGeneral2-dia-seleccionado-unico"
                  : " CalendarioGeneral2-dia-seleccionado"
                : ""
            }
            ${
              // Si está en el rango (entre fechaInicio y fechaFin, pero no igual a ninguno)
              estaSeleccionada &&
              fechaInicio &&
              fechaFin &&
              fechaDia > fechaInicio &&
              fechaDia < fechaFin
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
        <button className="CalendarioGeneral2-boton-cerrar" onClick={cerrarCalendario}>
          ✖
        </button>
        <h2 className="CalendarioGeneral2-titulo">Escoge tu viaje en el susurro del tiempo</h2>
        <div className="CalendarioGeneral2-meses">
          {mesesVisibles.map(({ mes, anio }, idx) => (
            <div key={idx} className="CalendarioGeneral2-mes">
              <h3 className="CalendarioGeneral2-mes-titulo">
                {new Date(anio, mes).toLocaleDateString("es-ES", {
                  month: "long",
                  year: "numeric",
                })}
              </h3>
              {renderizarEncabezadoDias()}
              <div className="CalendarioGeneral2-grid">{renderizarCalendario(mes, anio)}</div>
            </div>
          ))}
        </div>
        <div className="CalendarioGeneral2-botones">
          <button className="CalendarioGeneral2-boton-borrar" onClick={manejarBorrarFechas}>
            Borrar fechas
          </button>
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
