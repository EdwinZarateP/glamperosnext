"use client";

import { useRef, useContext } from "react";
import Link from "next/link";
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
import { ContextoApp } from "../../context/AppContext";
import Image from "next/image";
import "./estilos.css"; 

// Define tu dominio base
const iconoColombia = (
  <Image 
    src="/Imagenes/colombia.png" 
    alt="Mapa de Colombia" 
    width={30} 
    height={30} 
  />
);

const DOMAIN = "https://glamperos.com";

const MenuIconos: React.FC = () => {
  const almacenVariables = useContext(ContextoApp);

  if (!almacenVariables) {
    throw new Error(
      "El contexto no está disponible. Asegúrate de envolver el componente en un proveedor de contexto."
    );
  }

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
    setActivarFiltrosTipi,
    setActivarFiltrosLumipod,
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
    setActivarFiltrosUbicacion,
  } = almacenVariables;

  // Lista de iconos con sus acciones o links (ahora en URLs absolutas)
  const iconos = [
    {
      titulo: "Todo Colombia",
      icono: iconoColombia,
      link: `/`,
    },
    {
      titulo: "Cerca Bogota",
      icono: <GiEagleEmblem />,
      link: `${DOMAIN}/bogota`,
    },
    {
      titulo: "Cerca Medellin",
      icono: <PiCoffeeBeanFill />,
      link: `/medellin`,
    },
    {
      titulo: "Cerca Cali",
      icono: <FaCat />,
      link: `${DOMAIN}/cali`,
    },
    { titulo: "Jacuzzi", icono: <FaHotTubPerson />, accion: setActivarFiltrosJacuzzi },
    { titulo: "Pet Friendly", icono: <MdOutlinePets />, accion: setActivarFiltrosMascotas },
    { titulo: "Domo", icono: <GiHabitatDome />, accion: setActivarFiltrosDomo },
    { titulo: "Tienda", icono: <GiCampingTent />, accion: setActivarFiltrosTienda },
    { titulo: "Lumipod",icono: (<Image src="https://storage.googleapis.com/glamperos-imagenes/Imagenes/lumi.svg" alt="Lumipod" width={24} height={24}/>), accion: setActivarFiltrosLumipod },
    { titulo: "Cabaña", icono: <MdCabin />, accion: setActivarFiltrosCabaña },
    { titulo: "Casa del arbol", icono: <GiTreehouse />, accion: setActivarFiltrosCasaArbol },
    { titulo: "Remolque", icono: <FaCaravan />, accion: setActivarFiltrosRemolques },
    { titulo: "Tipi", icono: <GiHut />, accion: setActivarFiltrosTipi },    
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

  /**
   * Función para resetear todos los filtros antes de redirigir
   */
  const resetearFiltros = () => {
    [
      setActivarFiltrosDomo,
      setActivarFiltrosTienda,
      setActivarFiltrosCabaña,
      setActivarFiltrosCasaArbol,
      setActivarFiltrosRemolques,
      setActivarFiltrosTipi,
      setActivarFiltrosLumipod,
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
      setActivarFiltrosUbicacion,
    ].forEach((fn) => fn(false));
  };

  /**
   * Función para manejar el clic en un elemento con link.
   * Si es escritorio, abre en una nueva pestaña; si es móvil, navega en la misma.
   */
  const handleLinkClick = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    link: string,
    indice: number
  ) => {
    resetearFiltros(); // Limpia los filtros antes de redirigir
    setIconoSeleccionado(indice);
    if (window.innerWidth >= 900) {
      e.preventDefault();
      window.open(link, "_blank");
    } else {
      window.location.href = link; // Recarga la página limpiando filtros
    }
  };

  /**
   * Selecciona un icono sin link (filtro interno)
   */
  const seleccionarIcono = (indice: number) => {
    setIconoSeleccionado(indice);
    // Desactiva todos los filtros
    [
      setActivarFiltrosDomo,
      setActivarFiltrosTienda,
      setActivarFiltrosCabaña,
      setActivarFiltrosCasaArbol,
      setActivarFiltrosRemolques,
      setActivarFiltrosTipi,
      setActivarFiltrosLumipod,
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
      setActivarFiltrosUbicacion,
    ].forEach((fn) => fn(false));

    // Activa el filtro correspondiente
    iconos[indice].accion?.(true);
  };

  // Manejo del desplazamiento horizontal
  const contenedorListaRef = useRef<HTMLDivElement | null>(null);

  const desplazar = (direccion: "izquierda" | "derecha") => {
    if (contenedorListaRef.current) {
      const desplazamiento = direccion === "izquierda" ? -100 : 100;
      contenedorListaRef.current.scrollBy({ left: desplazamiento, behavior: "smooth" });
    }
  };

  // Manejo de apertura de filtros
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
            {iconos.map((elemento, indice) =>
              elemento.link ? (
                <Link
                  key={indice}
                  href={elemento.link}
                  onClick={(e) => handleLinkClick(e, elemento.link, indice)}
                  className={`MenuIconos-icono-item ${iconoSeleccionado === indice ? "MenuIconos-icono-seleccionado" : ""}`}
                  aria-label={`Filtrar por ${elemento.titulo}`}
                >
                  <div className="MenuIconos-icono">{elemento.icono}</div>
                  <span>{elemento.titulo}</span>
                </Link>
              ) : (
                <div
                  key={indice}
                  className={`MenuIconos-icono-item ${iconoSeleccionado === indice ? "MenuIconos-icono-seleccionado" : ""}`}
                  onClick={() => seleccionarIcono(indice)}
                  aria-label={`Filtrar por ${elemento.titulo}`}
                >
                  <div className="MenuIconos-icono">{elemento.icono}</div>
                  <span>{elemento.titulo}</span>
                </div>
              )
            )}
          </div>

          <div className="MenuIconos-flecha-derecha" onClick={() => desplazar("derecha")}>
            <MdOutlineKeyboardArrowRight />
          </div>
        </div>

        <div className="MenuIconos-settings" onClick={manejarClickAbrirFiltros}>
          <VscSettings />
          <span>Filtros</span>
          {cantiadfiltrosAplicados > 0 && (
            <div className="MenuIconos-badge">{cantiadfiltrosAplicados}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuIconos;
