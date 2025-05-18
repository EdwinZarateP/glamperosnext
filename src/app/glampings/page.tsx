"use client";

import React from "react";
// import Image from "next/image";
import TarjetasEcommerce from "@/Componentes/TarjetasEcommerce";
import MenuUsuariosInferior from "@/Componentes/MenuUsuariosInferior";
import "./estilos.css"; 

export default function GlampingsPage() {
  return (
    <>
      <div className="GlampingsPage-container">
        <div className="GlampingsPage-tarjetas">
          <TarjetasEcommerce key="all" />
        </div>
        <div className="GlampingsPage-menu">
          <MenuUsuariosInferior />
        </div>
      </div>
    </>
  );
}
