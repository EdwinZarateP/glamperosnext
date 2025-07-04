
// src/app/page.tsx

"use client";

import React from "react";
// import TarjetasEcommerce from "@/Componentes/TarjetasEcommerce";
import TarjetasEcommerceServer from "@/Componentes/TarjetasEcommerce/TarjetasEcommerceServer";
import MenuUsuariosInferior from "@/Componentes/MenuUsuariosInferior";
import Footer from "@/Componentes/Footer";
import "./page.css"; 

export default function GlampingsPage() {
  return (
    <>
      <div className="GlampingsPage-container">
        <div className="GlampingsPage-tarjetas">
          <TarjetasEcommerceServer key="all" />
        </div>
        <div className="GlampingsPage-Footer">
          <Footer />
        </div>
        <div className="GlampingsPage-menu">
          <MenuUsuariosInferior />
        </div>
      </div>
    </>
  );
}