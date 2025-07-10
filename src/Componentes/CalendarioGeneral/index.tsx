"use client";

import { useContext, useState, useEffect } from "react";
import Swal from "sweetalert2";  
import "./estilos.css";          
import { ContextoApp } from "../../context/AppContext"; 

interface PropiedadesCalendarioGeneral {
  cerrarCalendario: () => void;
}

const CalendarioGeneral: React.FC<PropiedadesCalendarioGeneral> = ({ cerrarCalendario }) => {
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
    FechasSeparadas,
  } = almacenVariables;

  const [mesesVisibles, setMesesVisibles] = useState<{ mes: number; anio: number }[]>([]);

  // Preparamos la fecha de hoy sin horas
  const fechaHoy = new Date();
  fechaHoy.setHours(0, 0, 0, 0);

  // Generamos 18 meses a partir de hoy (puedes ajustar la cantidad que necesites)
  useEffect(() => {
    const mesesCalculados: { mes: number; anio: number }[] = [];
    for (let i = 0; i < 18; i++) {
      const nuevoMes = new Date(fechaHoy.getFullYear(), fechaHoy.getMonth() + i, 1);
      mesesCalculados.push({ mes: nuevoMes.getMonth(), anio: nuevoMes.getFullYear() });
    }
    setMesesVisibles(mesesCalculados);
  }, []);

  // Cálculo de días libres entre fechaInicio y fechaFin
  useEffect(() => {
    if (fechaInicio && fechaFin) {
      const diferenciaTiempo = fechaFin.getTime() - fechaInicio.getTime();
      let dias = Math.ceil(diferenciaTiempo / (1000 * 60 * 60 * 24));

      // Restamos los días que coincidan con fechas ya separadas (reservadas)
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

      // Evitar que sea un solo día (mismo día) — opcional
      if (nuevaFechaFin.toDateString() === fechaInicio.toDateString()) {
        nuevaFechaFin.setDate(nuevaFechaFin.getDate() + 1);
      }

      // Verificamos que no existan fechas reservadas en el rango seleccionado
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

  // Determina si la fecha ya fue reservada
  const esFechaReservada = (fecha: Date): boolean => {
    return FechasSeparadas.length > 0
      ? FechasSeparadas.some(
          (fechaReservada) => fecha.toDateString() === fechaReservada.toDateString()
        )
      : false;
  };

  // Determina si la fecha está deshabilitada (por ser anterior o igual al día de hoy)
  const esFechaDeshabilitada = (fecha: Date): boolean => {
    return fecha < fechaHoy;
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
        return false; // Hay una fecha reservada dentro del rango
      }
    }
    return true; // El rango está libre
  };

  // Renderizamos los encabezados de los días de la semana
  const renderizarEncabezadoDias = () => {
    const diasSemana = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sá"];
    return (
      <div className="CalendarioGeneral-dias-semana">
        {diasSemana.map((dia, i) => (
          <div key={i} className="CalendarioGeneral-dia-semana">
            {dia}
          </div>
        ))}
      </div>
    );
  };

  // Renderizamos el calendario de un mes (cuadrícula de días)
  const renderizarCalendario = (mes: number, anio: number) => {
    const diasEnMes = [];
    const totalDias = new Date(anio, mes + 1, 0).getDate();
    const primerDiaDelMes = new Date(anio, mes, 1).getDay();

    // Espacios vacíos para alinear el calendario al primer día
    for (let i = 0; i < primerDiaDelMes; i++) {
      diasEnMes.push(
        <div key={`vacio-${i}`} className="CalendarioGeneral-dia-vacio" />
      );
    }

    // Creamos un botón por cada día del mes
    for (let dia = 1; dia <= totalDias; dia++) {
      const fechaDia = new Date(anio, mes, dia);
      const estaDeshabilitada = esFechaDeshabilitada(fechaDia);
      const estaReservada = esFechaReservada(fechaDia);
      const estaSeleccionada = esFechaSeleccionada(fechaDia);

      diasEnMes.push(
        <button
          key={dia}
          className={`CalendarioGeneral-dia
            ${estaDeshabilitada ? "CalendarioGeneral-dia-deshabilitado" : ""}
            ${estaReservada ? "CalendarioGeneral-dia-reservada" : ""}
            ${estaSeleccionada ? "CalendarioGeneral-dia-seleccionado" : ""}
            ${
              // Si está seleccionado y entre fechaInicio y fechaFin
              estaSeleccionada && fechaInicio && fechaFin && fechaDia > fechaInicio && fechaDia < fechaFin
                ? "CalendarioGeneral-dia-rango"
                : ""
            }
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
      {/* Fondo para oscurecer: se cierra al hacer click en él */}
      <div
        className="CalendarioGeneral-fondo"
        onClick={cerrarCalendario}
      ></div>

      {/* Contenedor principal del calendario */}
      <div className="CalendarioGeneral-contenedor">
        <button
          className="CalendarioGeneral-boton-cerrar"
          onClick={cerrarCalendario}
        >
          ✖
        </button>
        <h2 className="CalendarioGeneral-titulo">
          Escoge tu viaje en el susurro del tiempo
        </h2>

        {/* Muestra todos los meses generados */}
        <div className="CalendarioGeneral-meses">
          {mesesVisibles.map(({ mes, anio }, idx) => (
            <div key={idx} className="CalendarioGeneral-mes">
              <h3 className="CalendarioGeneral-mes-titulo">
                {new Date(anio, mes).toLocaleDateString("es-ES", {
                  month: "long",
                  year: "numeric",
                })}
              </h3>
              {renderizarEncabezadoDias()}
              <div className="CalendarioGeneral-grid">
                {renderizarCalendario(mes, anio)}
              </div>
            </div>
          ))}
        </div>

        {/* Botones finales */}
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
            className="CalendarioGeneral-boton-confirmar"
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
