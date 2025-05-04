"use client";
import { Suspense } from "react";
import MenuUsuariosInferior from "../../Componentes/MenuUsuariosInferior";
import Conversaciones from "../../Componentes/Conversaciones";
import ListadoConversaciones from "../../Componentes/ListadoConversaciones/index";
import HeaderIcono from "../../Componentes/HeaderIcono";
import { useSearchParams } from "next/navigation";
import { useMediaQuery } from "../../Funciones/useMediaQuery";
import "./estilos.css";

function MensajesInner() {
  const isMobile = useMediaQuery("(max-width: 900px)");
  const searchParams = useSearchParams();
  const idUsuarioReceptor = searchParams.get("idUsuarioReceptor");

  return (
    <div className="Mensajes-contenedor">
      <HeaderIcono descripcion="Glamperos" />

      <div className="Mensajes-ListadoConversaciones">
        <ListadoConversaciones />
      </div>

      {!isMobile ? (
        <div className="Mensajes-Conversaciones">
          <Conversaciones />
        </div>
      ) : idUsuarioReceptor ? (
        <div className="Mensajes-Conversaciones-modal">
          <Conversaciones />
        </div>
      ) : null}

      <MenuUsuariosInferior />
    </div>
  );
}

export default function Mensajes() {
  return (
    <Suspense fallback={<div>Cargando mensajes...</div>}>
      <MensajesInner />
    </Suspense>
  );
}
