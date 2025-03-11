"use client";

import { useState, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FiMenu } from "react-icons/fi";
import { HiMiniAdjustmentsHorizontal } from "react-icons/hi2";
import { ContextoApp } from "@/context/AppContext";
import Image from "next/image";
import { BsIncognito } from "react-icons/bs";
import Cookies from "js-cookie";
import MenuUsuario from "@/Componentes/MenuUsuario/index";
import "./estilos.css";

interface HeaderDinamicoProps {
  title: string;
}

const HeaderDinamico: React.FC<HeaderDinamicoProps> = ({ title }) => {
  const router = useRouter();
  const almacenVariables = useContext(ContextoApp);

  if (!almacenVariables) {
    throw new Error("El contexto no está disponible. Asegúrate de envolver el componente en un proveedor de contexto.");
  }

  // ✅ Estado seguro para manejar cookies en el cliente
  const [nombreUsuario, setNombreUsuario] = useState<string | null>(null);
  const [idUsuario, setIdUsuarioState] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setNombreUsuario(Cookies.get("nombreUsuario") || null);
    setIdUsuarioState(Cookies.get("idUsuario") || null);
  }, []);

  const {
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
    setMostrarFiltros,
    setMostrarMenuUsuarios,
    cantiadfiltrosAplicados,
    setPrecioEstandarAdicional,
    setDiasCancelacion,
  } = almacenVariables;

  // 🔹 Reset de variables cuando se va a publicar un glamping
  const resetearDatos = () => {
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
  };

  const irAInicio = () => {
    router.push("/");
  };


  return (
    <div className="contenedor-HeaderDinamico">
      <header className="HeaderDinamico">
        <div className="HeaderDinamico-menuUsuarioLista">
          <MenuUsuario />
        </div>

        {/* 🔹 Logo y nombre de la marca */}
        <div className="HeaderDinamico-izquierda" onClick={irAInicio}>
          <Image 
            src="https://storage.googleapis.com/glamperos-imagenes/Imagenes/animal5.jpeg" 
            alt="Glamperos logo" 
            width={40} 
            height={40} 
            className="HeaderDinamico-logo" 
            priority 
          />
          <span className="HeaderDinamico-nombreMarca">Glamperos</span>
        </div>

        {/* 🔹 Sección nueva con el título y botón */}
        <div className="HeaderDinamico-centro">
          <h1 className="HeaderDinamico-titulo">{title}</h1>
        </div>

        {/* 🔹 Sección derecha con usuario y filtros */}
        <div className="HeaderDinamico-derecha">
          {idUsuario ? (
            <div
              className="HeaderDinamico-botonAnfitrion"
              onClick={() => {
                resetearDatos();
                setIdUsuario(idUsuario ?? "");
                router.push("/CrearGlamping");
              }}
            >
              Publica tu Glamping
            </div>
          ) : (
            <div
              className="HeaderDinamico-botonAnfitrion"
              onClick={() => {
                resetearDatos();
                router.push("/registro");
              }}
            >
              Publica tu Glamping
            </div>
          )}

          <div className="HeaderDinamico-menuUsuario" onClick={() => setMostrarMenuUsuarios(true)}>
            <FiMenu className="HeaderDinamico-iconoMenu" />
            <div className="HeaderDinamico-inicialUsuario">
              {isClient && nombreUsuario ? nombreUsuario[0].toUpperCase() : <BsIncognito className="HeaderDinamico-inicialUsuario-incognito" />}
            </div>
          </div>

          <div className="HeaderDinamico-iconoSettingsWrapper">
            <HiMiniAdjustmentsHorizontal onClick={() => setMostrarFiltros(true)} />
            {cantiadfiltrosAplicados > 0 && <div className="HeaderDinamico-badge">{cantiadfiltrosAplicados}</div>}
          </div>
        </div>
      </header>
    </div>
  );
};

export default HeaderDinamico;
