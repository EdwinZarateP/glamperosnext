// PanelBusquedaGeneral.tsx
"use client";

import { useState, useContext, useCallback } from "react";
import { FiSearch } from "react-icons/fi";
import { MdClose } from "react-icons/md";
import CalendarioGeneral from "../CalendarioGeneral";
import Visitantes from "../Visitantes";
import { ContextoApp } from "../../context/AppContext";
import { useRouter } from "next/navigation";
import municipios from "../Municipios/municipios.json";
import "./estilos.css";

interface Municipio {
  CIUDAD_DEPARTAMENTO: string;
  LATITUD: number;
  LONGITUD: number;
}

interface PanelBusquedaGeneralProps {
  onCerrar: () => void;
}

const PanelBusquedaGeneral: React.FC<PanelBusquedaGeneralProps> = ({ onCerrar }) => {
  const ctx = useContext(ContextoApp);
  if (!ctx) throw new Error("ContextoApp no está disponible.");

  const {
    fechaInicio, fechaFin,
    setFechaInicioConfirmado, setFechaFinConfirmado,
    totalHuespedes,
    ciudad_departamento,
    cordenadasElegidas,
    setMostrarCalendario, mostrarCalendario,
    setMostrarVisitantes, mostrarVisitantes,
    setCiudad_departamento,
    setFechaInicio, setFechaFin,
    setTotalHuespedes,
    setCordenadasElegidas,
    setTotalDias,
    setBusqueda,
  } = ctx;

  const router = useRouter();

  const [sugerencias, setSugerencias] = useState<string[]>([]);
  const [timeoutId, setTimeoutId] = useState<number>();
  const [sugerenciaActiva, setSugerenciaActiva] = useState(-1);

  const formatoIso = (d: Date) => d.toISOString().split("T")[0];

  const manejarBuscar = () => {
    // Confirma fechas en contexto
    if (fechaInicio && fechaFin) {
      setFechaInicioConfirmado(fechaInicio);
      setFechaFinConfirmado(fechaFin);
    }

    // Monta los params
    const params = new URLSearchParams();

    // Coordenadas
    if (ciudad_departamento && cordenadasElegidas.length > 0) {
      const { LATITUD, LONGITUD } = cordenadasElegidas[0];
      params.set("lat", LATITUD.toString());
      params.set("lng", LONGITUD.toString());
      params.set("distanciaMax", "150");
    }

    // Fechas
    if (fechaInicio && fechaFin) {
      params.set("fechaInicio", formatoIso(fechaInicio));
      params.set("fechaFin", formatoIso(fechaFin));
    }

    // Huéspedes
    if (totalHuespedes > 0) {
      params.set("totalHuespedes", totalHuespedes.toString());
    }

    // Navegar a "/" con params limpios
    router.push(`/glampings?${params.toString()}`);

    // Actualiza búsqueda legible
    setBusqueda({
      destino: ciudad_departamento || "",
      fechas:
        fechaInicio && fechaFin
          ? `${formatoIso(fechaInicio)} – ${formatoIso(fechaFin)}`
          : "",
    });

    onCerrar();
  };

  const formatFecha = (d: Date) =>
    d.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const buscarSugerenciasDesdeJSON = useCallback(
    (query: string) => {
      if (query.length < 2) {
        setSugerencias([]);
        setCordenadasElegidas([]);
        return;
      }
      const resultados = municipios.filter((m: Municipio) =>
        m.CIUDAD_DEPARTAMENTO.toLowerCase().includes(query.toLowerCase())
      );
      setSugerencias(resultados.map(m => m.CIUDAD_DEPARTAMENTO).slice(0, 10));
      setCordenadasElegidas(
        resultados
          .map(m => ({ LATITUD: m.LATITUD, LONGITUD: m.LONGITUD }))
          .slice(0, 10)
      );
    },
    [setCordenadasElegidas]
  );

  const manejarCambioDestino = (q: string) => {
    setCiudad_departamento(q);
    setSugerenciaActiva(-1);
    if (timeoutId) clearTimeout(timeoutId);
    const id = window.setTimeout(() => buscarSugerenciasDesdeJSON(q), 300);
    setTimeoutId(id);
  };

  const manejarSeleccionSugerencia = (s: string) => {
    setCiudad_departamento(s);
    setSugerencias([]);
    setSugerenciaActiva(-1);
    const m = municipios.find(m => m.CIUDAD_DEPARTAMENTO === s);
    setCordenadasElegidas(m ? [{ LATITUD: m.LATITUD, LONGITUD: m.LONGITUD }] : []);
    if (!fechaFin) setMostrarCalendario(true);
  };

  return (
    <>
      <div className="PanelBusquedaGeneral-fondo" onClick={onCerrar} />

      <div className="PanelBusquedaGeneral-contenedor">
        <h2 className="PanelBusquedaGeneral-titulo">
          ¿A dónde quieres viajar?
        </h2>

        {/* DESTINO */}
        <div className="PanelBusquedaGeneral-destino">
          <FiSearch className="PanelBusquedaGeneral-icono" />
          <div className="PanelBusquedaGeneral-inputWrapper">
            <input
              className="PanelBusquedaGeneral-input"
              placeholder="Explora Municipios"
              value={ciudad_departamento}
              onChange={e => manejarCambioDestino(e.target.value)}
            />
            {ciudad_departamento && (
              <button
                className="PanelBusquedaGeneral-botonBorrar"
                onClick={() => setCiudad_departamento("")}
              >
                <MdClose />
              </button>
            )}
          </div>
          {sugerencias.length > 0 && (
            <div className="PanelBusquedaGeneral-sugerencias">
              {sugerencias.map((s, i) => (
                <div
                  key={i}
                  className={
                    "PanelBusquedaGeneral-sugerencia" +
                    (sugerenciaActiva === i ? " activo" : "")
                  }
                  onMouseEnter={() => setSugerenciaActiva(i)}
                  onClick={() => manejarSeleccionSugerencia(s)}
                >
                  {s}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FECHAS */}
        <div
          className="PanelBusquedaGeneral-fechas"
          onClick={() => setMostrarCalendario(true)}
        >
          <span className="PanelBusquedaGeneral-fechas-titulo">Fechas</span>
          <span className="PanelBusquedaGeneral-fechas-valor">
            {fechaInicio && fechaFin
              ? `${formatFecha(fechaInicio)} – ${formatFecha(fechaFin)}`
              : "Selecciona fechas"}
          </span>
        </div>

        {/* HUESPEDES */}
        <div
          className="PanelBusquedaGeneral-huespedes"
          onClick={() => setMostrarVisitantes(true)}
        >
          <span className="PanelBusquedaGeneral-huespedes-titulo">
            Huéspedes
          </span>
          <span className="PanelBusquedaGeneral-huespedes-valor">
            {totalHuespedes > 0
              ? `${totalHuespedes} huésped${totalHuespedes > 1 ? "es" : ""}`
              : "Agrega huéspedes"}
          </span>
        </div>

        {/* BOTONES */}
        <div className="PanelBusquedaGeneral-botones">
          <button
            className="PanelBusquedaGeneral-limpiar"
            onClick={() => {
              setCiudad_departamento("");
              setFechaInicio(null);
              setFechaFin(null);
              setTotalHuespedes(1);
              setCordenadasElegidas([]);
              setTotalDias(1);
              setBusqueda({ destino: "", fechas: "" });
            }}
          >
            Limpiar todo
          </button>

          <button
            className="PanelBusquedaGeneral-buscar"
            onClick={manejarBuscar}
          >
            <FiSearch className="PanelBusquedaGeneral-buscar-icono" /> Busca
          </button>
        </div>
      </div>

      {mostrarCalendario && (
        <CalendarioGeneral cerrarCalendario={() => setMostrarCalendario(false)} />
      )}
      {mostrarVisitantes && (
        <Visitantes
          max_adultos={10}
          max_Ninos={10}
          max_bebes={5}
          max_mascotas={5}
          max_huespedes={10}
          onCerrar={() => setMostrarVisitantes(false)}
        />
      )}
    </>
  );
};

export default PanelBusquedaGeneral;
