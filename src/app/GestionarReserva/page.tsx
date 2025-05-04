"use client";

import GestionReserva from "../../Componentes/GestionReserva";
import HeaderIcono from "../../Componentes/HeaderIcono";
import MenuUsuariosInferior from "../../Componentes/MenuUsuariosInferior";
import "./estilos.css";

function GestionarReserva() {
  return (
    <div className="GestionarReserva-contenedor">
      
      <HeaderIcono descripcion="Glamperos" />
      <GestionReserva />
      <MenuUsuariosInferior />
    </div>
  );
}

export default GestionarReserva;
