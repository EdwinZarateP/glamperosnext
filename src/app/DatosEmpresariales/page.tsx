"use client";

import DatosEmpresa from "../../Componentes/DatosEmpresa/index";
import HeaderIcono from "../../Componentes/HeaderIcono/index";  
import MenuUsuariosInferior from "../../Componentes/MenuUsuariosInferior/index"; 
import "./estilos.css";

function DatosEmpresariales() {
  return (
    <div className='EdicionPerfil-contenedor'>
        <HeaderIcono descripcion="Glamperos" />
        <DatosEmpresa/>
        <MenuUsuariosInferior/>
    </div>
  );
}

export default DatosEmpresariales;
