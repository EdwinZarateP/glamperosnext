"use client";

import { useState, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FiMenu, FiSearch } from "react-icons/fi";
import PanelBusquedaGeneral from "../PanelBusquedaGeneral/index";
import { ContextoApp } from "../../context/AppContext";
import { evaluarVariable } from "../../Funciones/ValidarVariable";
import { HiMiniAdjustmentsHorizontal } from "react-icons/hi2";
import Image from "next/image";
import { BsIncognito } from "react-icons/bs";
import Cookies from "js-cookie";

import MenuUsuario from "../MenuUsuario/index";
import "./estilos.css"; 

const HeaderGeneral: React.FC = () => {
  const router = useRouter();
  const almacenVariables = useContext(ContextoApp);

  if (!almacenVariables) {
    throw new Error("El contexto no está disponible. Asegúrate de envolver el componente en un proveedor de contexto.");
  }

  // ✅ Manejo seguro de Cookies en el cliente
  const [nombreUsuario, setNombreUsuario] = useState<string | null>(null);
  const [idUsuario, setIdUsuarioState] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false); 

  useEffect(() => {
    setIsClient(true);
    setNombreUsuario(Cookies.get("nombreUsuario") || null);
    setIdUsuarioState(Cookies.get("idUsuario") || null);
  }, []);

  const {
    totalHuespedes,
    setIdUsuario,
    setSiono,
    setLatitud,
    setLongitud,
    setCiudad_departamento,
    setTipoGlamping,
    setAmenidadesGlobal,
    setImagenesCargadas,
    setNombreGlamping,
    setDescripcionGlamping,
    setPrecioEstandar,
    setCantidad_Huespedes,
    setCantidad_Huespedes_Adicional,
    setDescuento,
    setAcepta_Mascotas,
    setMostrarFiltros,
    setMostrarMenuUsuarios,
    cantiadfiltrosAplicados,
    busqueda,
    // setBusqueda,
    setFechasSeparadas,
    setPrecioEstandarAdicional,
    setDiasCancelacion,
    setCopiasGlamping,
  } = almacenVariables;

  const [mostrarPanelBusquedaGeneral, setMostrarPanelBusquedaGeneral] = useState<boolean>(false);

  const manejarClickBusqueda = () => {
    setMostrarPanelBusquedaGeneral(true);
    setFechasSeparadas([]);
    document.body.style.overflow = "hidden";
  };

  const cerrarPanelBusquedaGeneral = () => {
    setMostrarPanelBusquedaGeneral(false);
    document.body.style.overflow = "auto";
  };

  // const manejarBusqueda = (destino: string, fechas: string) => {
  //   setBusqueda({ destino, fechas });
  //   cerrarPanelBusquedaGeneral();
  // };

  const existeId = () => evaluarVariable(idUsuario);

  const quitarSetters = () => {
    setSiono(true);
    setLatitud(4.123456);
    setLongitud(-74.123456);
    setCiudad_departamento("");
    setTipoGlamping("");
    setAmenidadesGlobal([]);
    setImagenesCargadas([]);
    setNombreGlamping("");
    setDescripcionGlamping("");
    setPrecioEstandar(0);
    setDiasCancelacion(1);
    setCantidad_Huespedes(1);
    setCantidad_Huespedes_Adicional(0);
    setDescuento(0);
    setPrecioEstandarAdicional(0);
    setAcepta_Mascotas(false);
    setCopiasGlamping(1)
  };

  const irAInicio = () => {
    window.location.href = "/";
  };
  
  

  return (
    <div className="contenedor-HeaderGeneral">
      <div className="HeaderGeneral">
        <div className="HeaderGeneral-menuUsuarioLista">
          <MenuUsuario />
        </div>

        <div className="HeaderGeneral-izquierda" onClick={irAInicio}>
        <Image 
          src="https://storage.googleapis.com/glamperos-imagenes/Imagenes/animal5.jpeg" 
          alt="Glamperos logo" 
          width={40} 
          height={40} 
          className="HeaderGeneral-logo" 
          priority 
        />
          <span className="HeaderGeneral-nombreMarca" onClick={irAInicio} >Glamperos</span>
        </div>

        <div className="HeaderGeneral-barraBusqueda" onClick={manejarClickBusqueda}>
          <span className="HeaderGeneral-opcionBusqueda">
            {busqueda.destino
              ? busqueda.destino.substring(0, 20) + (busqueda.destino.length > 30 ? "..." : "")
              : "Busca un refugio encantador"}
          </span>
          <span className="HeaderGeneral-divisor">|</span>
          <span className="HeaderGeneral-opcionCuando">{busqueda.fechas || "¿Cuándo?"}</span>
          <span className="HeaderGeneral-divisor">|</span>
          <span className="HeaderGeneral-opcionBusqueda HeaderGeneral-opcionBusquedaInvitados">
            {totalHuespedes > 0 ? `${totalHuespedes} huésped${totalHuespedes > 1 ? "es" : ""}` : "¿Cuántos?"}
          </span>
          <div className="HeaderGeneral-botonBusqueda">
            <FiSearch className="HeaderGeneral-icono" />
          </div>
        </div>

        <div className="HeaderGeneral-derecha">
          {existeId() ? (
            <div
              className="HeaderGeneral-botonAnfitrion"
              onClick={() => {
                quitarSetters();
                setIdUsuario(idUsuario ?? "");
                router.push("/CrearGlamping");
              }}
            >
              Publica tu Glamping
            </div>
          ) : (
            <div
              className="HeaderGeneral-botonAnfitrion"
              onClick={() => {
                quitarSetters();
                router.push("/registro");
              }}
            >
              Publica tu Glamping
            </div>
          )}

          <div className="HeaderGeneral-menuUsuario" onClick={() => setMostrarMenuUsuarios(true)}>
            <FiMenu className="HeaderGeneral-iconoMenu" />
            <div className="HeaderGeneral-inicialUsuario">
              {/* ✅ Evitamos errores de hidratación asegurando que se ejecuta solo en el cliente */}
              {isClient && nombreUsuario ? nombreUsuario[0].toUpperCase() : <BsIncognito className="HeaderGeneral-inicialUsuario-incognito" />}
            </div>
          </div>

          <div className="HeaderGeneral-iconoSettingsWrapper">
            <HiMiniAdjustmentsHorizontal onClick={() => setMostrarFiltros(true)} />
            {cantiadfiltrosAplicados > 0 && <div className="HeaderGeneral-badge">{cantiadfiltrosAplicados}</div>}
          </div>
        </div>
      </div>

      {mostrarPanelBusquedaGeneral && <PanelBusquedaGeneral onCerrar={cerrarPanelBusquedaGeneral} />}
    </div>
  );
};

export default HeaderGeneral;
