"use client";

import { useState, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FiMenu, FiSearch } from "react-icons/fi";
import PanelBusqueda from "@/Componentes/PanelBusqueda/index";
import { ContextoApp } from "@/context/AppContext";
import { evaluarVariable } from "@/Funciones/ValidarVariable";
import { HiMiniAdjustmentsHorizontal } from "react-icons/hi2";
import Image from "next/image";
import { BsIncognito } from "react-icons/bs";
import Cookies from "js-cookie";
import MenuUsuario from "@/Componentes/MenuUsuario/index";
import "./estilos.css"; 

const Header: React.FC = () => {
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
    setBusqueda,
    setFechasSeparadas,
    setPrecioEstandarAdicional,
    setDiasCancelacion,
  } = almacenVariables;

  const [mostrarPanelBusqueda, setMostrarPanelBusqueda] = useState<boolean>(false);

  const manejarClickBusqueda = () => {
    setMostrarPanelBusqueda(true);
    setFechasSeparadas([]);
    document.body.style.overflow = "hidden";
  };

  const cerrarPanelBusqueda = () => {
    setMostrarPanelBusqueda(false);
    document.body.style.overflow = "auto";
  };

  const manejarBusqueda = (destino: string, fechas: string) => {
    setBusqueda({ destino, fechas });
    cerrarPanelBusqueda();
  };

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
  };

  const irAInicio = () => {
    console.log("Ir al inicio")
    router.push("/");    
  };
  

  return (
    <div className="contenedor-Header">
      <header className="Header">
        <div className="Header-menuUsuarioLista">
          <MenuUsuario />
        </div>

        <div className="Header-izquierda" onClick={irAInicio}>
        <Image 
          src="https://storage.googleapis.com/glamperos-imagenes/Imagenes/animal5.jpeg" 
          alt="Glamperos logo" 
          width={40} 
          height={40} 
          className="Header-logo" 
          priority 
        />
          <span className="Header-nombreMarca" onClick={irAInicio} >Glamperos</span>
        </div>

        <div className="Header-barraBusqueda" onClick={manejarClickBusqueda}>
          <span className="Header-opcionBusqueda">
            {busqueda.destino
              ? busqueda.destino.substring(0, 20) + (busqueda.destino.length > 30 ? "..." : "")
              : "Busca un refugio encantador"}
          </span>
          <span className="Header-divisor">|</span>
          <span className="Header-opcionCuando">{busqueda.fechas || "¿Cuándo?"}</span>
          <span className="Header-divisor">|</span>
          <span className="Header-opcionBusqueda Header-opcionBusquedaInvitados">
            {totalHuespedes > 0 ? `${totalHuespedes} huésped${totalHuespedes > 1 ? "es" : ""}` : "¿Cuántos?"}
          </span>
          <div className="Header-botonBusqueda">
            <FiSearch className="Header-icono" />
          </div>
        </div>

        <div className="Header-derecha">
          {existeId() ? (
            <div
              className="Header-botonAnfitrion"
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
              className="Header-botonAnfitrion"
              onClick={() => {
                quitarSetters();
                router.push("/Registrarse");
              }}
            >
              Publica tu Glamping
            </div>
          )}

          <div className="Header-menuUsuario" onClick={() => setMostrarMenuUsuarios(true)}>
            <FiMenu className="Header-iconoMenu" />
            <div className="Header-inicialUsuario">
              {/* ✅ Evitamos errores de hidratación asegurando que se ejecuta solo en el cliente */}
              {isClient && nombreUsuario ? nombreUsuario[0].toUpperCase() : <BsIncognito className="Header-inicialUsuario-incognito" />}
            </div>
          </div>

          <div className="Header-iconoSettingsWrapper">
            <HiMiniAdjustmentsHorizontal onClick={() => setMostrarFiltros(true)} />
            {cantiadfiltrosAplicados > 0 && <div className="Header-badge">{cantiadfiltrosAplicados}</div>}
          </div>
        </div>
      </header>

      {mostrarPanelBusqueda && <PanelBusqueda onBuscar={manejarBusqueda} onCerrar={cerrarPanelBusqueda} />}
    </div>
  );
};

export default Header;
