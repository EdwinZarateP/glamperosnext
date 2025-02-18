"use client";

import CentroAyuda from "@/Componentes/CentroAyuda";
import HeaderIcono from "@/Componentes/HeaderIcono"; 
import MenuUsuariosInferior from "@/Componentes/MenuUsuariosInferior"; 
import "./estilos.css";

function Ayuda() {
    return (
      <div className='Ayuda-contenedor'>
        <HeaderIcono descripcion="Glamperos" />
        <CentroAyuda /> 
        <MenuUsuariosInferior/>
      </div>
    );
}

export default Ayuda;
