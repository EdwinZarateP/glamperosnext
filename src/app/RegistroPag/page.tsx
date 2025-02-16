"use client"; 
import RegistroComp from "@/Componentes/RegistroComp/index"; 
import HeaderIcono from "@/Componentes/HeaderIcono/index";

import "./estilos.css"; 

export default function RegistrarsePage() {

  return (
    <div className="Registrarse-contenedor">
      <HeaderIcono descripcion="Glamperos" />
      <RegistroComp />
    </div>
  );
}
