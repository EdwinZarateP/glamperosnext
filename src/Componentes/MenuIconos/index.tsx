"use client";

import React, { useRef, useContext } from "react";
import {
  FaUmbrellaBeach,
  FaTemperatureArrowUp,
  FaTemperatureArrowDown,
  FaHotTubPerson,
  FaCat,
  FaCaravan,
} from "react-icons/fa6";
import { BsTreeFill } from "react-icons/bs";
import { PiMountainsBold, PiCoffeeBeanFill } from "react-icons/pi";
import {
  GiDesert,
  GiTreehouse,
  GiHiking,
  GiRiver,
  GiWaterfall,
  GiCampingTent,
  GiHabitatDome,
  GiHut,
  GiEagleEmblem,
} from "react-icons/gi";
import {
  MdCabin,
  MdOutlinePets,
  MdOutlineKeyboardArrowLeft,
  MdOutlineKeyboardArrowRight,
} from "react-icons/md";
import { VscSettings } from "react-icons/vsc";
import { ContextoApp } from "@/context/AppContext";
import "./estilos.css"; // ✅ Mantiene los estilos en CSS

const MenuIconos: React.FC = () => {
  const almacenVariables = useContext(ContextoApp);

  if (!almacenVariables) {
    throw new Error(
      "El contexto no está disponible. Asegúrate de envolver el componente en un proveedor de contexto."
    );
  }

  // 🔹 Extraer las funciones de actualización del contexto
  const {
    setMostrarFiltros,
    cantiadfiltrosAplicados,
    iconoSeleccionado,
    setIconoSeleccionado,
    setActivarFiltrosDomo,
    setActivarFiltrosTienda,
    setActivarFiltrosCabaña,
    setActivarFiltrosCasaArbol,
    setActivarFiltrosRemolques,
    setActivarFiltrosChoza,
    setActivarFiltrosMascotas,
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

  // 🔹 Lista de iconos con sus respectivas funciones de activación
  const iconos = [
    { titulo: "Cerca Bogota", icono: <GiEagleEmblem />, accion: setActivarFiltrosUbicacionBogota },
    { titulo: "Cerca Medellin", icono: <PiCoffeeBeanFill />, accion: setActivarFiltrosUbicacionMedellin },
    { titulo: "Cerca Cali", icono: <FaCat />, accion: setActivarFiltrosUbicacionCali },
    { titulo: "Jacuzzi", icono: <FaHotTubPerson />, accion: setActivarFiltrosJacuzzi },
    { titulo: "Pet Friendly", icono: <MdOutlinePets />, accion: setActivarFiltrosMascotas },
    { titulo: "Domo", icono: <GiHabitatDome />, accion: setActivarFiltrosDomo },
    { titulo: "Tienda", icono: <GiCampingTent />, accion: setActivarFiltrosTienda },
    { titulo: "Cabaña", icono: <MdCabin />, accion: setActivarFiltrosCabaña },
    { titulo: "Casa del arbol", icono: <GiTreehouse />, accion: setActivarFiltrosCasaArbol },
    { titulo: "Remolque", icono: <FaCaravan />, accion: setActivarFiltrosRemolques },
    { titulo: "Choza", icono: <GiHut />, accion: setActivarFiltrosChoza },
    { titulo: "Clima Calido", icono: <FaTemperatureArrowUp />, accion: setActivarFiltrosClimaCalido },
    { titulo: "Clima Frio", icono: <FaTemperatureArrowDown />, accion: setActivarFiltrosClimaFrio },
    { titulo: "Playa", icono: <FaUmbrellaBeach />, accion: setActivarFiltrosPlaya },
    { titulo: "Naturaleza", icono: <BsTreeFill />, accion: setActivarFiltrosNaturaleza },
    { titulo: "Rio", icono: <GiRiver />, accion: setActivarFiltrosRio },
    { titulo: "Cascada", icono: <GiWaterfall />, accion: setActivarFiltrosCascada },
    { titulo: "En la montaña", icono: <PiMountainsBold />, accion: setActivarFiltrosMontana },
    { titulo: "Desierto", icono: <GiDesert />, accion: setActivarFiltrosDesierto },
    { titulo: "Caminata", icono: <GiHiking />, accion: setActivarFiltrosCaminata },
  ];

  // 🔹 Manejo de selección de iconos
  const seleccionarIcono = (indice: number) => {
    setIconoSeleccionado(indice);
    
    // Desactiva todos los filtros antes de activar el nuevo
    [
      setActivarFiltrosDomo,
      setActivarFiltrosTienda,
      setActivarFiltrosCabaña,
      setActivarFiltrosCasaArbol,
      setActivarFiltrosRemolques,
      setActivarFiltrosChoza,
      setActivarFiltrosMascotas,
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
    ].forEach(fn => fn(false));

    // Activa el filtro correspondiente
    iconos[indice].accion(true);
  };

  // 🔹 Manejo del desplazamiento horizontal
  const contenedorListaRef = useRef<HTMLDivElement | null>(null);
  const desplazar = (direccion: "izquierda" | "derecha") => {
    if (contenedorListaRef.current) {
      const desplazamiento = direccion === "izquierda" ? -100 : 100;
      contenedorListaRef.current.scrollBy({ left: desplazamiento, behavior: "smooth" });
    }
  };

  // 🔹 Manejo de apertura de filtros
  const manejarClickAbrirFiltros = () => {
    setMostrarFiltros(true);
    document.body.style.overflow = "hidden";
  };

  return (
    <div className="MenuIconos-contenedor">
      <div className="MenuIconos-contenedor-menuConIcono">
        <div className="MenuIconos-contenedor-menu">
          <div className="MenuIconos-flecha-izquierda" onClick={() => desplazar("izquierda")}>
            <MdOutlineKeyboardArrowLeft />
          </div>

          <div ref={contenedorListaRef} className="MenuIconos-lista-iconos">
            {iconos.map((elemento, indice) => (
              <div
                key={indice}
                className={`MenuIconos-icono-item ${iconoSeleccionado === indice ? "MenuIconos-icono-seleccionado" : ""}`}
                onClick={() => seleccionarIcono(indice)}
              >
                <div className="MenuIconos-icono">{elemento.icono}</div>
                <span>{elemento.titulo}</span>
              </div>
            ))}
          </div>

          <div className="MenuIconos-flecha-derecha" onClick={() => desplazar("derecha")}>
            <MdOutlineKeyboardArrowRight />
          </div>
        </div>

        <div className="MenuIconos-settings" onClick={manejarClickAbrirFiltros}>
          <VscSettings />
          <span>Filtros</span>
          {cantiadfiltrosAplicados > 0 && <div className="MenuIconos-badge">{cantiadfiltrosAplicados}</div>}
        </div>
      </div>
    </div>
  );
};

export default MenuIconos;
