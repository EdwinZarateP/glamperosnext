"use client";

import React, { useState, useContext, useCallback } from "react";
import { FiSearch } from "react-icons/fi";
import { MdClose } from "react-icons/md";
import CalendarioGeneral from "@/Componentes/CalendarioGeneral";
import Visitantes from "@/Componentes/Visitantes/index";
import { ContextoApp } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import municipios from "@/Componentes/Municipios/municipios.json";
import "./estilos.css";

/**
 * 📌 Define el tipo de datos para cada municipio
 * según el contenido de tu archivo municipios.json
 */
interface Municipio {
  CIUDAD_DEPARTAMENTO: string;
  LATITUD: number;
  LONGITUD: number;
}



interface PanelBusquedaProps {
  onBuscar: (destino: string, fechas: string, huespedes: number) => void;
  onCerrar: () => void;
}

const PanelBusqueda: React.FC<PanelBusquedaProps> = ({ onBuscar, onCerrar }) => {
  // 🔹 Accedemos al contexto
  const almacenVariables = useContext(ContextoApp);
  if (!almacenVariables) {
    throw new Error("El contexto no está disponible. Asegúrate de envolver el componente en un proveedor de contexto.");
  }

  // 🔹 Extraemos variables y funciones del contexto
  const {
    fechaInicio,
    fechaFin,
    setFechaInicio,
    setFechaFin,
    setFechaInicioConfirmado,
    setFechaFinConfirmado,
    setTotalDias,
    ciudad_departamento,
    setCiudad_departamento,
    totalHuespedes,
    setTotalHuespedes,
    setCantidad_Adultos,
    setCantidad_Ninos,
    setCantidad_Bebes,
    setCantidad_Mascotas,
    Cantidad_Mascotas,
    mostrarCalendario,
    setMostrarCalendario,
    mostrarVisitantes,
    setMostrarVisitantes,
    setFiltros,
    setActivarFiltrosUbicacion,
    setIconoSeleccionado,
    setActivarFiltrosFechas,
    setActivarFiltrosHuespedes,
    setHuespedesConfirmado,
    setBusqueda,
    cordenadasElegidas,
    setCordenadasElegidas,
    setActivarFiltrosMascotas,
    setActivarFiltrosDomo,
    setActivarFiltrosTienda,
    setActivarFiltrosCabaña,
    setActivarFiltrosCasaArbol,
    setActivarFiltrosRemolques,
    setActivarFiltrosChoza,
    setActivarFiltrosLumipod,
    setActivarFiltrosClimaCalido,
    setActivarFiltrosClimaFrio,
    setActivarFiltrosPlaya,
    setActivarFiltrosNaturaleza,
    setActivarFiltrosRio,
    setActivarFiltrosCascada,
    setActivarFiltrosMontana,
    setActivarFiltrosDesierto,
    setActivarFiltrosCaminata,
    setActivarFiltrosJacuzzi,
    setActivarFiltrosUbicacionBogota,
    setActivarFiltrosUbicacionMedellin,
    setActivarFiltrosUbicacionCali,
  } = almacenVariables;

  // 🔹 Router de Next para navegación
  const router = useRouter();

  // 🔹 Estados locales: sugerencias, timeouts, índice de sugerencia activa
  const [sugerencias, setSugerencias] = useState<string[]>([]);
  const [timeoutId, setTimeoutId] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [sugerenciaActiva, setSugerenciaActiva] = useState<number>(-1);

  /**
   * 📌 Función principal para hacer la búsqueda
   * Navega a "/", configura filtros y llama al callback `onBuscar`
   */
  const manejarBuscar = () => {
    router.push("/");

    // 🔸 Asegura scroll al top
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
    }

    // 🔸 Desactiva distintos filtros especiales
    setActivarFiltrosTienda(false);
    setActivarFiltrosCasaArbol(false);
    setActivarFiltrosCabaña(false);
    setActivarFiltrosRemolques(false);
    setActivarFiltrosChoza(false);
    setActivarFiltrosLumipod(false);
    setActivarFiltrosDomo(false);
    setActivarFiltrosMascotas(false);
    setActivarFiltrosClimaCalido(false);
    setActivarFiltrosClimaFrio(false);
    setActivarFiltrosPlaya(false);
    setActivarFiltrosNaturaleza(false);
    setActivarFiltrosRio(false);
    setActivarFiltrosCascada(false);
    setActivarFiltrosMontana(false);
    setActivarFiltrosDesierto(false);
    setActivarFiltrosCaminata(false);
    setActivarFiltrosJacuzzi(false);
    setActivarFiltrosUbicacionBogota(false);
    setActivarFiltrosUbicacionMedellin(false);
    setActivarFiltrosUbicacionCali(false);

    // 🔸 Ajusta ícono seleccionado por defecto
    setIconoSeleccionado(100);

    // 🔸 Lógica para ubicación
    if (ciudad_departamento) {
      setActivarFiltrosUbicacion(true);
    } else {
      setActivarFiltrosUbicacion(false);
    }

    // 🔸 Lógica para fechas
    if (fechaInicio && fechaFin) {
      setActivarFiltrosFechas(true);
      setFechaInicioConfirmado(fechaInicio);
      setFechaFinConfirmado(fechaFin);
    } else {
      setActivarFiltrosFechas(false);
    }

    // 🔸 Lógica para huéspedes
    if (totalHuespedes) {
      setHuespedesConfirmado(totalHuespedes);
      setActivarFiltrosHuespedes(true);
    } else {
      setActivarFiltrosHuespedes(false);
    }

    // 🔸 Lógica para mascotas
    if (Cantidad_Mascotas > 0) {
      setActivarFiltrosMascotas(true);
    } else {
      setActivarFiltrosMascotas(false);
    }

    // 🔸 Crea cadena de fechas
    const fechas =
      fechaInicio && fechaFin
        ? `${formatFecha(fechaInicio)} - ${formatFecha(fechaFin)}`
        : "";

    // 🔸 Actualiza la búsqueda global
    setBusqueda({ destino: ciudad_departamento || "", fechas });

    // 🔸 Si no hay coordenadas elegidas, usamos predeterminadas
    const coordenadasPredeterminadas = {
      LATITUD: 10.463433617,
      LONGITUD: -75.45889915,
    };

    if (ciudad_departamento || (fechaInicio && fechaFin)) {
      setFiltros((prevFiltros) => ({
        ...prevFiltros,
        cordenadasFilter:
          cordenadasElegidas.length > 0 ? cordenadasElegidas[0] : coordenadasPredeterminadas,
      }));
    }

    // 🔸 Llamamos a la función onBuscar que viene en props
    onBuscar(ciudad_departamento || "", fechas, totalHuespedes);

    // 🔸 Cerramos este panel
    onCerrar();
  };

  /**
   * 📌 Dar formato a las fechas (ej: "1 ene. 2024")
   */
  const formatFecha = (fecha: Date): string => {
    return fecha.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  /**
   * 📌 Función para buscar sugerencias (municipios) según el `query`
   * Usamos `useCallback` para memorizarla y evitar recreaciones innecesarias
   */
  const buscarSugerenciasDesdeJSON = useCallback(
    (query: string) => {
      if (query.length > 1) {
        // 🔸 Filtra municipios por nombre
        const resultados = municipios.filter((municipio: Municipio) =>
          municipio.CIUDAD_DEPARTAMENTO.toLowerCase().includes(query.toLowerCase())
        );

        // 🔸 Llenamos sugerencias con el nombre, y guardamos coordenadas
        setSugerencias(
          resultados.map((m: Municipio) => m.CIUDAD_DEPARTAMENTO).slice(0, 10)
        );
        setCordenadasElegidas(
          resultados
            .map((m: Municipio) => ({
              LATITUD: m.LATITUD,
              LONGITUD: m.LONGITUD,
            }))
            .slice(0, 10)
        );
      } else {
        // 🔸 Si el query es muy corto, reseteamos
        setSugerencias([]);
        setCordenadasElegidas([]);
      }
    },
    [setCordenadasElegidas]
  );

  /**
   * 📌 Maneja el cambio de texto en el input de destino
   * Aplica un debounce con setTimeout para no filtrar en cada pulsación
   */
  const manejarCambioDestino = (query: string) => {
    setCiudad_departamento(query);
    setSugerenciaActiva(-1);

    if (timeoutId) clearTimeout(timeoutId);
    const newTimeoutId = setTimeout(() => {
      buscarSugerenciasDesdeJSON(query);
    }, 0);
    setTimeoutId(newTimeoutId);
  };

  /**
   * 📌 Al seleccionar una sugerencia, actualizamos ciudad y coordenadas
   */
  const manejarSeleccionSugerencia = (sug: string) => {
    setCiudad_departamento(sug);
    setSugerencias([]);
    setSugerenciaActiva(-1);

    // 🔸 Buscamos el municipio en el JSON
    const municipioSeleccionado = municipios.find(
      (municipio: Municipio) => municipio.CIUDAD_DEPARTAMENTO === sug
    );

    if (municipioSeleccionado) {
      setCordenadasElegidas([
        {
          LATITUD: municipioSeleccionado.LATITUD,
          LONGITUD: municipioSeleccionado.LONGITUD,
        },
      ]);
    } else {
      setCordenadasElegidas([]);
    }

    // 🔸 Si no hay fechaFin, abrimos el calendario para que el usuario elija fechas
    if (!fechaFin) {
      setMostrarCalendario(true);
    }
  };

  /**
   * 📌 Maneja las teclas (flechas / Enter) en el input
   */
  const manejarTecla = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (sugerencias.length === 0) return;

    if (e.key === "ArrowDown") {
      setSugerenciaActiva((prev) => (prev < sugerencias.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      setSugerenciaActiva((prev) => (prev > 0 ? prev - 1 : sugerencias.length - 1));
    } else if (e.key === "Enter") {
      if (sugerenciaActiva >= 0 && sugerenciaActiva < sugerencias.length) {
        manejarSeleccionSugerencia(sugerencias[sugerenciaActiva]);
        e.preventDefault();
      }
    }
  };

  return (
    <>
      {/* 🔹 Fondo oscuro clicable para cerrar */}
      <div className="PanelBusqueda-fondo" onClick={onCerrar}></div>

      {/* 🔹 Contenedor principal */}
      <div className="PanelBusqueda-contenedor">
        <h2 className="PanelBusqueda-titulo">¿A dónde quieres viajar?</h2>

        {/* Barra de búsqueda */}
        <div className="PanelBusqueda-barra">
          {/* Sección de Destino */}
          <div className="PanelBusqueda-destino">
            <FiSearch className="PanelBusqueda-icono" />
            <div className="PanelBusqueda-inputWrapper">
              <input
                type="text"
                placeholder="Explora Municipios"
                className="PanelBusqueda-input"
                value={ciudad_departamento}
                onChange={(e) => manejarCambioDestino(e.target.value)}
                onKeyDown={manejarTecla}
              />
              {ciudad_departamento && (
                <button
                  className="PanelBusqueda-botonBorrar"
                  onClick={() => setCiudad_departamento("")}
                >
                  <MdClose />
                </button>
              )}
            </div>

            {/* Sugerencias dinámicas */}
            {sugerencias.length > 0 && (
              <div className="PanelBusqueda-sugerencias">
                {sugerencias.map((sug, index) => (
                  <div
                    key={index}
                    className={`PanelBusqueda-sugerencia ${
                      sugerenciaActiva === index ? "activo" : ""
                    }`}
                    onClick={() => manejarSeleccionSugerencia(sug)}
                  >
                    {sug}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sección de Fechas */}
          <div className="PanelBusqueda-fechas" onClick={() => setMostrarCalendario(true)}>
            <span className="PanelBusqueda-fechas-titulo">Fechas</span>
            <span className="PanelBusqueda-fechas-valor">
              {fechaInicio && fechaFin
                ? `${formatFecha(fechaInicio)} - ${formatFecha(fechaFin)}`
                : "Selecciona fechas"}
            </span>
          </div>

          {/* Sección de Huéspedes */}
          <div className="PanelBusqueda-huespedes" onClick={() => setMostrarVisitantes(true)}>
            <span className="PanelBusqueda-huespedes-titulo">Huéspedes</span>
            <span className="PanelBusqueda-huespedes-valor">
              {totalHuespedes > 0
                ? `${totalHuespedes} huésped${totalHuespedes > 1 ? "es" : ""}`
                : "Agrega huéspedes"}
            </span>
          </div>
        </div>

        {/* Botones inferiores: Limpiar y Buscar */}
        <div className="PanelBusqueda-botones">
          <button
            className="PanelBusqueda-limpiar"
            onClick={() => {
              // 🔹 Resetea valores
              setCiudad_departamento("");
              setFechaInicio(null);
              setFechaFin(null);
              setFechaInicioConfirmado(null);
              setFechaFinConfirmado(null);
              setTotalDias(1);
              setTotalHuespedes(1);
              setCantidad_Adultos(1);
              setCantidad_Ninos(0);
              setCantidad_Bebes(0);
              setCantidad_Mascotas(0);
              setCordenadasElegidas([]);
              setActivarFiltrosUbicacion(false);
              setActivarFiltrosFechas(false);
              setBusqueda({ destino: "", fechas: "" });
            }}
          >
            Limpiar todo
          </button>

          <button className="PanelBusqueda-buscar" onClick={manejarBuscar}>
            <FiSearch className="PanelBusqueda-buscar-icono" /> Busca
          </button>
        </div>
      </div>

      {/* Calendario flotante */}
      {mostrarCalendario && (
        <CalendarioGeneral cerrarCalendario={() => setMostrarCalendario(false)} />
      )}

      {/* Panel de Visitantes */}
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

export default PanelBusqueda;
