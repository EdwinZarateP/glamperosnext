"use client";

import EditarGlamping from "../../Componentes/EditarGlamping";
import HeaderIcono from "../../Componentes/HeaderIcono";
import MenuUsuariosInferior from "../../Componentes/MenuUsuariosInferior";
import "./estilos.css";

function EdicionGlamping() {
  return (
    <div className="EdicionGlamping-contenedor">
      <HeaderIcono descripcion="Glamperos" />
      <EditarGlamping />
      <MenuUsuariosInferior />
    </div>
  );
}

export default EdicionGlamping;
