"use client";

import dynamic from 'next/dynamic';
import HeaderIcono from "../../Componentes/HeaderIcono";
import MenuUsuariosInferior from "../../Componentes/MenuUsuariosInferior";
import "./estilos.css";

// Dynamic import con SSR desactivado
const EditarPerfil = dynamic(() => import('../../Componentes/EditarPerfil'), { ssr: false });

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
