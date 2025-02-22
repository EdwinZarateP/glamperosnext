"use client";

import { useContext } from "react";
import HeaderDinamico from "@/Componentes/HeaderDinamico";
import ContenedorTarjetasDinamico from "@/Componentes/ContenedorTarjetasDinamico/index";
import MenuIconos from "@/Componentes/MenuIconos"; 
import FiltrosContenedor from "@/Componentes/FiltrosContenedor/index";
import { ContextoApp } from "@/context/AppContext";
import MenuUsuariosInferior from "@/Componentes/MenuUsuariosInferior"; 
import "./estilos.css"; 

const Bogota: React.FC = () => {
  const contexto = useContext(ContextoApp);

  if (!contexto) {
    throw new Error("El contexto no está disponible. Asegúrate de envolver el componente con ProveedorContextoApp.");
  }
  const BOGOTA_LAT = 4.316107698;
  const BOGOTA_LNG = -74.181072702;
  const { mostrarFiltros } = contexto;

  return (
    <div className="Bogota-principal">
      <HeaderDinamico title="Glamping cerca a Bogotá" />
      <MenuIconos />
      {mostrarFiltros && <FiltrosContenedor />}
      <main>
        <ContenedorTarjetasDinamico lat={BOGOTA_LAT} lng={BOGOTA_LNG} />
      </main>
      <MenuUsuariosInferior />
    </div>
  );
};

export default Bogota; 
