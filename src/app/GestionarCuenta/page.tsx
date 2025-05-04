"use client";
import Cuenta from "../../Componentes/Cuenta"; 
import HeaderIcono from "../../Componentes/HeaderIcono"; 
import MenuUsuariosInferior from "../../Componentes/MenuUsuariosInferior"; 
import "./estilos.css";

function GestionarCuenta() {
  return (
    <div className='GestionarCuenta-contenedor'>
        <HeaderIcono descripcion="Glamperos" />
        <Cuenta />
        <MenuUsuariosInferior/>
    </div>
  );
}

export default GestionarCuenta;
