"use client";

import EditarPerfil from "@/Componentes/EditarPerfil";
import HeaderIcono from "@/Componentes/HeaderIcono";
import MenuUsuariosInferior from "@/Componentes/MenuUsuariosInferior";
import "./estilos.css";

function EdicionPerfil() {
  return (
    <div className="EdicionPerfil-contenedor">
      <HeaderIcono descripcion="Glamperos" />
      <EditarPerfil />
      <MenuUsuariosInferior />
    </div>
  );
}

export default EdicionPerfil;
