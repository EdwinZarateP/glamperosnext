"use client";

import { useContext, useState, useEffect } from "react";
import Swal from "sweetalert2";
import "./estilos.css";
import { ContextoApp } from "../../../context/AppContext";
import { useRouter, useSearchParams } from "next/navigation";

interface PropiedadesCalendarioSecundario {
  cerrarCalendario: () => void;
  minimoNoches: number;
  onSeleccionarFechas?: (inicio: Date, fin: Date) => void;
  fechasIniciales?: { inicio: Date | null; fin: Date | null };
  FechasSeparadas?: Date[];
}

const CalendarioSecundario: React.FC<PropiedadesCalendarioSecundario> = ({
  cerrarCalendario,
  minimoNoches,
  onSeleccionarFechas,
  fechasIniciales,
  FechasSeparadas: fechasSeparadasExternas
}) => {
  const almacenVariables = useContext(ContextoApp);
  const [fechaInicioLocal, setFechaInicioLocal] = useState<Date | null>(fechasIniciales?.inicio || null);
  const [fechaFinLocal, setFechaFinLocal] = useState<Date | null>(fechasIniciales?.fin || null);
  
  const modoControlado = !!onSeleccionarFechas;
  
  const { 
    fechaInicio: ctxFechaInicio,
    setFechaInicio: ctxSetFechaInicio,
    fechaFin: ctxFechaFin,
    setFechaFin: ctxSetFechaFin,
    setTotalDias: ctxSetTotalDias,
    setFechaInicioConfirmado: ctxSetFechaInicioConfirmado,
    setFechaFinConfirmado: ctxSetFechaFinConfirmado,
    FechasSeparadas: ctxFechasSeparadas
  } = almacenVariables || {};

  const fechaInicio = modoControlado ? fechaInicioLocal : ctxFechaInicio;
  const fechaFin = modoControlado ? fechaFinLocal : ctxFechaFin;
  const FechasSeparadas = modoControlado ? fechasSeparadasExternas || [] : ctxFechasSeparadas || [];
  
  const setFechaInicio = modoControlado ? setFechaInicioLocal : ctxSetFechaInicio;
  const setFechaFin = modoControlado ? setFechaFinLocal : ctxSetFechaFin;
  const setTotalDias = modoControlado ? undefined : ctxSetTotalDias;

  const router = useRouter();
  const searchParams = useSearchParams();
  const [mesesVisibles, setMesesVisibles] = useState<{ mes: number; anio: number }[]>([]);
  const fechaHoy = new Date();
  fechaHoy.setHours(0, 0, 0, 0);

  useEffect(() => {
    if (!modoControlado) {
      const fechaInicioUrl = searchParams.get("fechaInicioUrl");
      const fechaFinUrl = searchParams.get("fechaFinUrl");

      if (fechaInicioUrl && setFechaInicio) {
        setFechaInicio(new Date(fechaInicioUrl));
      }
      if (fechaFinUrl && setFechaFin) {
        setFechaFin(new Date(fechaFinUrl));
      }
    }
  }, [searchParams, modoControlado]);

  useEffect(() => {
    const mesesCalculados: { mes: number; anio: number }[] = [];
    for (let i = 0; i < 18; i++) {
      const nuevoMes = new Date(fechaHoy.getFullYear(), fechaHoy.getMonth() + i, 1);
      mesesCalculados.push({ mes: nuevoMes.getMonth(), anio: nuevoMes.getFullYear() });
    }
    setMesesVisibles(mesesCalculados);
  }, [fechaHoy]);

  useEffect(() => {
    if (fechaInicio && fechaFin && setTotalDias) {
      const diferenciaTiempo = fechaFin.getTime() - fechaInicio.getTime();
      let dias = Math.ceil(diferenciaTiempo / (1000 * 60 * 60 * 24));

      if (FechasSeparadas.length > 0) {
        const diasReservadosEnRango: Date[] = [];
        for (let i = 0; i < dias; i++) {
          const diaIterado = new Date(fechaInicio.getTime() + i * (1000 * 60 * 60 * 24));
          if (FechasSeparadas.some(f => f.toDateString() === diaIterado.toDateString())) {
            diasReservadosEnRango.push(diaIterado);
          }
        }
        dias -= diasReservadosEnRango.length;
      }

      setTotalDias(dias);
    }
  }, [fechaInicio, fechaFin, FechasSeparadas]);

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

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
          if (FechasSeparadas.some(f => f.toDateString() === diaIterado.toDateString())) {
            totalDiasCalculated--;
          }
        }
      }
    }
    params.set("totalDiasUrl", totalDiasCalculated.toString());
    router.replace(`?${params.toString()}`);
  }, [fechaInicio, fechaFin, FechasSeparadas, router]);

  const validarFechas = (): boolean => {
    if (fechaInicio && fechaFin) {
      if (fechaInicio.getTime() === fechaFin.getTime() || fechaInicio > fechaFin) {
        Swal.fire({
          icon: "error",
          title: "Error en el rango de fechas",
          text: "La fecha de inicio no puede ser igual o posterior a la fecha de fin. Selecciona un rango válido.",
        });
        return false;
      }

      const diferenciaTiempo = fechaFin.getTime() - fechaInicio.getTime();
      let dias = Math.ceil(diferenciaTiempo / (1000 * 60 * 60 * 24));

      if (FechasSeparadas.length > 0) {
        for (let i = 0; i < dias; i++) {
          const diaIterado = new Date(fechaInicio.getTime() + i * (1000 * 60 * 60 * 24));
          if (FechasSeparadas.some(f => f.toDateString() === diaIterado.toDateString())) {
            dias--;
          }
        }
      }

      if (dias < minimoNoches) {
        Swal.fire({
          icon: "warning",
          title: "Rango muy corto",
          text: `Este Glamping solo permite reservas de al menos ${minimoNoches} noches.`,
        });
        return false;
      }
    }
    return true;
  };

  const manejarClickFecha = (fecha: Date) => {
    if (esFechaReservada(fecha)) return;

    if (!fechaInicio || (fechaInicio && fechaFin)) {
      setFechaInicio?.(fecha);
      setFechaFin?.(null);
    } else if (fechaInicio && !fechaFin && fecha >= fechaInicio) {
      const nuevaFechaFin = new Date(fecha);

      if (nuevaFechaFin.toDateString() === fechaInicio.toDateString()) {
        nuevaFechaFin.setDate(nuevaFechaFin.getDate() + 1);
      }

      if (verificarRango(fechaInicio, nuevaFechaFin)) {
        setFechaFin?.(nuevaFechaFin);
      } else {
        Swal.fire({
          icon: "error",
          title: "Rango de fechas no disponible",
          text: "El rango de fechas seleccionado incluye fechas reservadas. Por favor, elige otro rango.",
        });
      }
    } else {
      setFechaInicio?.(fecha);
      setFechaFin?.(null);
    }
  };

  const manejarBorrarFechas = () => {
    setFechaInicio?.(null);
    setFechaFin?.(null);
    setTotalDias?.(1);
  };

  const esFechaSeleccionada = (fecha: Date): boolean => {
    if (fechaInicio && fechaFin) {
      return fecha >= fechaInicio && fecha <= fechaFin;
    }
    return fechaInicio?.toDateString() === fecha.toDateString();
  };

  const esFechaReservada = (fecha: Date): boolean => {
    return FechasSeparadas.length > 0
      ? FechasSeparadas.some(f => f.toDateString() === fecha.toDateString())
      : false;
  };

  const esFechaDeshabilitada = (fecha: Date): boolean => {
    return fecha <= fechaHoy;
  };

  const verificarRango = (inicio: Date, fin: Date): boolean => {
    const diferenciaTiempo = fin.getTime() - inicio.getTime();
    const totalDiasRango = Math.ceil(diferenciaTiempo / (1000 * 60 * 60 * 24));

    for (let i = 0; i <= totalDiasRango; i++) {
      const diaEnRango = new Date(inicio.getTime() + i * (1000 * 60 * 60 * 24));
      if (FechasSeparadas.some(f => f.toDateString() === diaEnRango.toDateString())) {
        return false;
      }
    }
    return true;
  };

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

  const renderizarCalendario = (mes: number, anio: number) => {
    const diasEnMes = [];
    const totalDiasMes = new Date(anio, mes + 1, 0).getDate();
    const primerDiaDelMes = new Date(anio, mes, 1).getDay();

    for (let i = 0; i < primerDiaDelMes; i++) {
      diasEnMes.push(
        <div key={`vacio-${i}`} className="CalendarioSecundario-dia-vacio" />
      );
    }

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
      <div className="CalendarioSecundario-fondo" onClick={cerrarCalendario}></div>
      <div className="CalendarioSecundario-contenedor">
        <button className="CalendarioSecundario-boton-cerrar" onClick={cerrarCalendario}>
          ✖
        </button>
        <h2 className="CalendarioSecundario-titulo">
          Escoge tu viaje en el susurro del tiempo
        </h2>
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
        <div className="CalendarioSecundario-botones">
          <button onClick={manejarBorrarFechas} className="CalendarioSecundario-boton-borrar">
            Borrar fechas
          </button>
          <button
            onClick={() => {
              if (validarFechas()) {
                cerrarCalendario();
                // En la función donde se usan los setters, por ejemplo:
                ctxSetFechaInicioConfirmado?.(fechaInicio ?? null); // Asegurar que no sea undefined
                ctxSetFechaFinConfirmado?.(fechaFin ?? null); // Asegurar que no sea undefined
                if (onSeleccionarFechas && fechaInicio && fechaFin) {
                  onSeleccionarFechas(fechaInicio, fechaFin);
                }
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