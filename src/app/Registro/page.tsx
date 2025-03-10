"use client";

import RegistroComp from "@/Componentes/RegistroComp/index";
import HeaderIcono from "@/Componentes/HeaderIcono/index";
import "./estilos.css";

export default function RegistrarsePage() {
  return (
    <div className="Registro-contenedor">
      <HeaderIcono descripcion="Glamperos" />
      <div className="Registro-box">
        <h1 className="Registro-titulo">Únete a la aventura</h1>
        <p className="Registro-descripcion">Regístrate ahora y comienza a explorar experiencias únicas en glampings exclusivos.</p>
        <RegistroComp />
      </div>
    </div>
  );
}
