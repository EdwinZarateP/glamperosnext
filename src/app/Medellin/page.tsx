"use client";

import { useContext } from "react";
import HeaderDinamico from "@/Componentes/HeaderDinamico";
import ContenedorTarjetasDinamico from "@/Componentes/ContenedorTarjetasDinamico/index";
import MenuIconos from "@/Componentes/MenuIconos";
import FiltrosContenedor from "@/Componentes/FiltrosContenedor/index";
import { ContextoApp } from "@/context/AppContext";
import MenuUsuariosInferior from "@/Componentes/MenuUsuariosInferior";
import "./estilos.css";

const Medellin: React.FC = () => {
  const contexto = useContext(ContextoApp);

  if (!contexto) {
    throw new Error("El contexto no está disponible. Asegúrate de envolver el componente con ProveedorContextoApp.");
  }

  // Coordenadas aproximadas de Medellín
  const MEDELLIN_LAT = 6.257590259;
  const MEDELLIN_LNG = -75.611031065;

  const { mostrarFiltros } = contexto;

  return (
    <div className="Medellin-principal">
      <HeaderDinamico title="Glamping cerca a Medellín" />
      <MenuIconos />
      {mostrarFiltros && <FiltrosContenedor />}
      <main>
        {/* Pasamos lat y lng de Medellín al componente reutilizable */}
        <ContenedorTarjetasDinamico lat={MEDELLIN_LAT} lng={MEDELLIN_LNG} />
      </main>
      <MenuUsuariosInferior />
    </div>
  );
};

export default Medellin;
