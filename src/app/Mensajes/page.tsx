"use client";
import MenuUsuariosInferior from "@/Componentes/MenuUsuariosInferior"; 
import Conversaciones from "@/Componentes/Conversaciones";
import ListadoConversaciones from "@/Componentes/ListadoConversaciones/index";
import HeaderIcono from "@/Componentes/HeaderIcono";
import { useSearchParams } from "next/navigation";
import { useMediaQuery } from "@/Funciones/useMediaQuery";
import "./estilos.css";

function Mensajes() {
  const isMobile = useMediaQuery('(max-width: 900px)'); // Hook para detectar pantallas pequeñas
  const searchParams = useSearchParams();
  const idUsuarioReceptor = searchParams.get('idUsuarioReceptor'); // Obtener el ID del receptor desde la URL

  return (
    <div className="Mensajes-contenedor">
      <HeaderIcono descripcion="Glamperos" />
      
      {/* Listado de conversaciones (siempre visible) */}
      <div className="Mensajes-ListadoConversaciones">
        <ListadoConversaciones/>
      </div>

      {/* Conversaciones (condicional según el tamaño de pantalla) */}
      {!isMobile ? (
        <div className="Mensajes-Conversaciones">
          <Conversaciones />
        </div>
      ) : idUsuarioReceptor ? (
        <div className="Mensajes-Conversaciones-modal">
          <Conversaciones />
        </div>
      ) : null}

      <MenuUsuariosInferior/>
    </div>
  );
}

export default Mensajes;