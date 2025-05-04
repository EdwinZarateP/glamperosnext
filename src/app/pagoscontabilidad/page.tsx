"use client";
import MenuUsuariosInferior from "../../Componentes/MenuUsuariosInferior";
import PagosContables from "../../Componentes/PagosContables/index";
import HeaderIcono from "../../Componentes/HeaderIcono/index";
import "./estilos.css";

export default function pagoscontabilidad() {
  return (
    <div className="pagoscontabilidad-contenedor">
      <HeaderIcono descripcion="Glamperos" />
      <PagosContables />
      <MenuUsuariosInferior />
    </div>
  );
}
