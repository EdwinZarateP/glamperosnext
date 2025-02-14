
"use client"; 

import React, { useState, useContext, useCallback } from "react";
import { FiSearch } from "react-icons/fi";
import { MdClose } from "react-icons/md"; 
import CalendarioGeneral from "@/Componentes/CalendarioGeneral";
import Visitantes from "@/Componentes/Visitantes/index";
import { ContextoApp } from "@/context/AppContext";
import municipios from "@/Componentes/Municipios/municipios.json";
import { useRouter } from "next/navigation";
import "./estilos.css";

interface PanelBusquedaProps {
  onBuscar: (destino: string, fechas: string, huespedes: number) => void;
  onCerrar: () => void;
}

const PanelBusqueda: React.FC<PanelBusquedaProps> = ({ onBuscar, onCerrar }) => {
  // Cantos de hechicería para inyectar el contexto
  const almacenVariables = useContext(ContextoApp);

  if (!almacenVariables) {
    // Aullamos este error si no hay contexto
    throw new Error("El contexto no está disponible. Asegúrate de envolver el componente en un proveedor de contexto.");
  }

  // Del dulce cofre del contexto extraemos todas las joyas que necesitamos
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
    setActivarFiltrosUbicacionCali
  } = almacenVariables;

  // Tomamos la hermosa varita del router de Next para navegar 
  // en lugar de useNavigate
  const router = useRouter();

  // Estado para las sugerencias y la posición activa en la lista
  const [sugerencias, setSugerencias] = useState<string[]>([]);
  const [timeoutId, setTimeoutId] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [sugerenciaActiva, setSugerenciaActiva] = useState<number>(-1);
  const manejarBuscar = () => {
    router.push("/");

    // Aseguramos que, si estamos en el cliente, hagamos scroll al inicio
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
    }
    // Desactivamos filtros exóticos que aparecían en tu useNavigate
    setActivarFiltrosTienda(false);
    setActivarFiltrosCasaArbol(false);
    setActivarFiltrosCabaña(false);
    setActivarFiltrosRemolques(false);
    setActivarFiltrosChoza(false);
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

    // Ajustamos el ícono seleccionado a un número neutral
    setIconoSeleccionado(100);

    // Lógica para el destino (usamos ciudad_departamento en lugar de destino)
    if (ciudad_departamento) {
      setActivarFiltrosUbicacion(true);
    } else {
      setActivarFiltrosUbicacion(false);
    }

    // Lógica para las fechas
    if (fechaInicio && fechaFin) {
      setActivarFiltrosFechas(true);
      setFechaInicioConfirmado(fechaInicio);
      setFechaFinConfirmado(fechaFin);
    } else {
      setActivarFiltrosFechas(false);
    }

    // Lógica para los huéspedes
    if (totalHuespedes) {
      setHuespedesConfirmado(totalHuespedes);
      setActivarFiltrosHuespedes(true);
    } else {
      setActivarFiltrosHuespedes(false);
    }

    // Lógica para las mascotas
    if (Cantidad_Mascotas > 0) {
      setActivarFiltrosMascotas(true);
    } else {
      setActivarFiltrosMascotas(false);
    }

    // Preparar las fechas para tu búsqueda
    const fechas =
      fechaInicio && fechaFin ? `${formatFecha(fechaInicio)} - ${formatFecha(fechaFin)}` : "";

    // Ajustamos el estado de búsqueda
    setBusqueda({ destino: ciudad_departamento || "", fechas });

    // Asignar coordenadas predeterminadas si no están presentes
    const coordenadasPredeterminadas = {
      LATITUD: 10.463433617,
      LONGITUD: -75.45889915,
    };

    if (ciudad_departamento || (fechaInicio && fechaFin)) {
      setFiltros((prevFiltros) => ({
        ...prevFiltros,
        cordenadasFilter:
          cordenadasElegidas.length > 0
            ? cordenadasElegidas[0]
            : coordenadasPredeterminadas,
      }));
    }

    // Finalmente, llamamos al callback onBuscar que recibimos por props
    onBuscar(ciudad_departamento, fechas, totalHuespedes);

    // Y cerramos el panel
    onCerrar();
  };

  const formatFecha = (fecha: Date): string => {
    return fecha.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const buscarSugerenciasDesdeJSON = useCallback(
    (query: string) => {
      // Si la longitud del query es mayor a 1, filtramos
      if (query.length > 1) {
        const resultados = municipios.filter((municipio: any) =>
          municipio.CIUDAD_DEPARTAMENTO.toLowerCase().includes(query.toLowerCase())
        );

        // Establecemos sugerencias y coordenadas
        setSugerencias(
          resultados.map((municipio: any) => municipio.CIUDAD_DEPARTAMENTO).slice(0, 10)
        );
        setCordenadasElegidas(
          resultados
            .map((municipio: any) => ({ LATITUD: municipio.LATITUD, LONGITUD: municipio.LONGITUD }))
            .slice(0, 10)
        );
      } else {
        // Si no, limpiamos
        setSugerencias([]);
        setCordenadasElegidas([]);
      }
    },
    [setCordenadasElegidas]
  );

  const manejarCambioDestino = (query: string) => {
    setCiudad_departamento(query);
    setSugerenciaActiva(-1);

    // Si había un timeout previo, lo limpiamos
    if (timeoutId) clearTimeout(timeoutId);

    // Creamos un nuevo timeout para buscar sugerencias
    const newTimeoutId = setTimeout(() => {
      buscarSugerenciasDesdeJSON(query);
    }, 0);

    setTimeoutId(newTimeoutId);
  };

  const manejarSeleccionSugerencia = (sugerencia: string) => {
    // Actualizamos ciudad_departamento
    setCiudad_departamento(sugerencia);

    // Ocultamos sugerencias
    setSugerencias([]);
    setSugerenciaActiva(-1);

    // Buscamos la data en el JSON para coordenadas
    const municipioSeleccionado = municipios.find(
      (municipio: any) => municipio.CIUDAD_DEPARTAMENTO === sugerencia
    );

    if (municipioSeleccionado) {
      setCordenadasElegidas([
        { LATITUD: municipioSeleccionado.LATITUD, LONGITUD: municipioSeleccionado.LONGITUD },
      ]);
    } else {
      setCordenadasElegidas([]);
    }

    // Si no hay fechaFin, abrimos el calendario
    if (!fechaFin) {
      setMostrarCalendario(true);
    }
  };

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
      {/* Fondo que oscurece y cierra al hacer clic */}
      <div className="PanelBusqueda-fondo" onClick={onCerrar}></div>

      {/* Contenedor principal */}
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
              {/* Botón para borrar texto */}
              {ciudad_departamento && (
                <button
                  className="PanelBusqueda-botonBorrar"
                  onClick={() => {
                    setCiudad_departamento("");
                  }}
                >
                  <MdClose />
                </button>
              )}
            </div>
            {/* Sugerencias dinámicas */}
            {sugerencias.length > 0 && (
              <div className="PanelBusqueda-sugerencias">
                {sugerencias.map((sugerencia, index) => (
                  <div
                    key={index}
                    className={`PanelBusqueda-sugerencia ${
                      sugerenciaActiva === index ? "activo" : ""
                    }`}
                    onClick={() => manejarSeleccionSugerencia(sugerencia)}
                  >
                    {sugerencia}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sección de Fechas */}
          <div
            className="PanelBusqueda-fechas"
            onClick={() => setMostrarCalendario(true)}
          >
            <span className="PanelBusqueda-fechas-titulo">Fechas</span>
            <span className="PanelBusqueda-fechas-valor">
              {fechaInicio && fechaFin
                ? `${formatFecha(fechaInicio)} - ${formatFecha(fechaFin)}`
                : "Selecciona fechas"}
            </span>
          </div>

          {/* Sección de Huéspedes */}
          <div
            className="PanelBusqueda-huespedes"
            onClick={() => setMostrarVisitantes(true)}
          >
            <span className="PanelBusqueda-huespedes-titulo">Huéspedes</span>
            <span className="PanelBusqueda-huespedes-valor">
              {totalHuespedes > 0
                ? `${totalHuespedes} huésped${totalHuespedes > 1 ? "es" : ""}`
                : "Agrega huéspedes"}
            </span>
          </div>
        </div>

        {/* Botones inferiores de Limpiar y Buscar */}
        <div className="PanelBusqueda-botones">
          <button
            className="PanelBusqueda-limpiar"
            onClick={() => {
              // Con un giro de varita, devolvemos todo a su estado original
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

      {/* Calendario flotante si mostrarCalendario es true */}
      {mostrarCalendario && (
        <CalendarioGeneral
          cerrarCalendario={() => setMostrarCalendario(false)}
        />
      )}

      {/* Panel de Visitantes si mostrarVisitantes es true */}
      {mostrarVisitantes && (
        <div>
          <Visitantes
            max_adultos={10}
            max_Ninos={10}
            max_bebes={5}
            max_mascotas={5}
            max_huespedes={10}
            onCerrar={() => setMostrarVisitantes(false)}
          />
        </div>
      )}
    </>
  );
};

export default PanelBusqueda;
