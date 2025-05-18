"use client";

import React from "react";
import Image from "next/image";
import TarjetasEcommerce from "@/Componentes/TarjetasEcommerce";
import MenuUsuariosInferior from "@/Componentes/MenuUsuariosInferior";
import "./estilos.css"; // tus estilos de página

export default function GlampingsPage() {
  const redirigirWhatsApp = () => {
    const numeroWhatsApp = "+573218695196";
    const mensaje = encodeURIComponent("Hola equipo Glamperos, ¡Quiero información sobre glampings!");
    const esPantallaPequena =
      typeof window !== "undefined" && window.innerWidth < 600;
    const urlWhatsApp = esPantallaPequena
      ? `https://wa.me/${numeroWhatsApp}?text=${mensaje}`
      : `https://web.whatsapp.com/send?phone=${numeroWhatsApp}&text=${mensaje}`;
    window.open(urlWhatsApp, "_blank");
  };

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

      {/* Botón fijo de WhatsApp */}
      <button
        type="button"
        className="GlampingsPage-whatsapp-button"
        onClick={redirigirWhatsApp}
        aria-label="Chatea por WhatsApp"
      >
        <Image
          src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
          alt="Icono WhatsApp"
          // width={40}
          // height={40}
        />
      </button>
    </>
  );
}
