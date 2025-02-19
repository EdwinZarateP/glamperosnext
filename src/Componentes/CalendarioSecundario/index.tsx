"use client";

import  { useContext, useState, useEffect } from "react";
import Swal from "sweetalert2";  
import "./estilos.css";         
import { ContextoApp } from "@/context/AppContext"; 
import { useRouter, useSearchParams } from "next/navigation";

interface PropiedadesCalendarioSecundario {
  cerrarCalendario: () => void;
}

const CalendarioSecundario: React.FC<PropiedadesCalendarioSecundario> = ({ cerrarCalendario }) => {
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

  const router = useRouter();
  const searchParams = useSearchParams();

  const [mesesVisibles, setMesesVisibles] = useState<{ mes: number; anio: number }[]>([]);

  // Función auxiliar para formatear fechas a "YYYY-MM-DD"
  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Al iniciar, cargamos del URL los query params y actualizamos el estado
  useEffect(() => {
    const fechaInicioUrl = searchParams.get("fechaInicioUrl");
    const fechaFinUrl = searchParams.get("fechaFinUrl");
    // Nota: totalDiasUrl se calcula automáticamente, pero lo dejamos en la URL
    if (fechaInicioUrl) {
      setFechaInicio(new Date(fechaInicioUrl));
    }
    if (fechaFinUrl) {
      setFechaFin(new Date(fechaFinUrl));
    }
  }, [searchParams, setFechaInicio, setFechaFin]);

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
  }, [fechaHoy]);

  // Cálculo de días libres entre fechaInicio y fechaFin y actualiza el estado
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

  // Sincronizamos los query params con el estado cada vez que cambian las fechas o las fechas reservadas
  useEffect(() => {
    const params = new URLSearchParams();

    if (fechaInicio) {
      params.set("fechaInicioUrl", formatDate(fechaInicio));
    }
    if (fechaFin) {
      params.set("fechaFinUrl", formatDate(fechaFin));
    }

    let totalDiasCalculated = 1;
    if (fechaInicio && fechaFin) {
      const diferenciaTiempo = fechaFin.getTime() - fechaInicio.getTime();
      totalDiasCalculated = Math.ceil(diferenciaTiempo / (1000 * 60 * 60 * 24));
      if (FechasSeparadas.length > 0) {
        for (let i = 0; i < totalDiasCalculated; i++) {
          const diaIterado = new Date(fechaInicio.getTime() + i * (1000 * 60 * 60 * 24));
          if (
            FechasSeparadas.some(
              (fechaReservada) => fechaReservada.toDateString() === diaIterado.toDateString()
            )
          ) {
            totalDiasCalculated--;
          }
        }
      }
    }
    params.set("totalDiasUrl", totalDiasCalculated.toString());
    router.replace(`?${params.toString()}`);
  }, [fechaInicio, fechaFin, FechasSeparadas, router]);

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
        return false; // Hay una fecha reservada dentro del rango
      }
    }
    return true; // El rango está libre
  };

  // Renderizamos los encabezados de los días de la semana
  const renderizarEncabezadoDias = () => {
    const diasSemana = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sá"];
    return (
      <div className="CalendarioSecundario-dias-semana">
        {diasSemana.map((dia, i) => (
          <div key={i} className="CalendarioSecundario-dia-semana">
            {dia}
          </div>
        ))}
      </div>
    );
  };

  // Renderizamos el calendario de un mes (cuadrícula de días)
  const renderizarCalendario = (mes: number, anio: number) => {
    const diasEnMes = [];
    const totalDiasMes = new Date(anio, mes + 1, 0).getDate();
    const primerDiaDelMes = new Date(anio, mes, 1).getDay();

    // Espacios vacíos para alinear el calendario al primer día
    for (let i = 0; i < primerDiaDelMes; i++) {
      diasEnMes.push(
        <div key={`vacio-${i}`} className="CalendarioSecundario-dia-vacio" />
      );
    }

    // Creamos un botón por cada día del mes
    for (let dia = 1; dia <= totalDiasMes; dia++) {
      const fechaDia = new Date(anio, mes, dia);
      const estaDeshabilitada = esFechaDeshabilitada(fechaDia);
      const estaReservada = esFechaReservada(fechaDia);
      const estaSeleccionada = esFechaSeleccionada(fechaDia);

      diasEnMes.push(
        <button
          key={dia}
          className={`CalendarioSecundario-dia
            ${estaDeshabilitada ? "CalendarioSecundario-dia-deshabilitado" : ""}
            ${estaReservada ? "CalendarioSecundario-dia-reservada" : ""}
            ${estaSeleccionada ? "CalendarioSecundario-dia-seleccionado" : ""}
            ${
              // Si está seleccionado y entre fechaInicio y fechaFin
              estaSeleccionada && fechaInicio && fechaFin && fechaDia > fechaInicio && fechaDia < fechaFin
                ? "CalendarioSecundario-dia-rango"
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
        className="CalendarioSecundario-fondo"
        onClick={cerrarCalendario}
      ></div>

      {/* Contenedor principal del calendario */}
      <div className="CalendarioSecundario-contenedor">
        <button
          className="CalendarioSecundario-boton-cerrar"
          onClick={cerrarCalendario}
        >
          ✖
        </button>
        <h2 className="CalendarioSecundario-titulo">
          Escoge tu viaje en el susurro del tiempo
        </h2>

        {/* Muestra todos los meses generados */}
        <div className="CalendarioSecundario-meses">
          {mesesVisibles.map(({ mes, anio }, idx) => (
            <div key={idx} className="CalendarioSecundario-mes">
              <h3 className="CalendarioSecundario-mes-titulo">
                {new Date(anio, mes).toLocaleDateString("es-ES", {
                  month: "long",
                  year: "numeric",
                })}
              </h3>
              {renderizarEncabezadoDias()}
              <div className="CalendarioSecundario-grid">
                {renderizarCalendario(mes, anio)}
              </div>
            </div>
          ))}
        </div>

        {/* Botones finales */}
        <div className="CalendarioSecundario-botones">
          <button
            onClick={manejarBorrarFechas}
            className="CalendarioSecundario-boton-borrar"
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
            className="CalendarioSecundario-boton-confirmar"
            disabled={!fechaInicio || !fechaFin}
          >
            Confirmar fechas
          </button>
        </div>
      </div>
    </>
  );
};

export default CalendarioSecundario;
