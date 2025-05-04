"use client";
import MenuUsuariosInferior from "../../Componentes/MenuUsuariosInferior";
import RegistroComp from "../../Componentes/RegistroComp/index";
import HeaderIcono from "../../Componentes/HeaderIcono/index";
import "./estilos.css";

export default function RegistrarsePage() {
  return (
    <div className="Registro-contenedor">
      {/* Video de fondo para dar dinamismo */}
      <video className="Registro-fondo-video" autoPlay muted loop playsInline>
        <source src="/Videos/Paso1AVideo.mp4" type="video/mp4" />
      </video>

      <div className="Registro-overlay"></div>

      <HeaderIcono descripcion="Glamperos" />

      <div className="Registro-box">
        <h1 className="Registro-titulo">🌿 Únete a la Aventura</h1>
        <p className="Registro-descripcion">
          Regístrate y descubre experiencias únicas en glampings exclusivos.
        </p>
        
        <RegistroComp />

        <p className="Registro-beneficio">
          Regístrate ahora y entra en nuestra <strong>comunidad</strong> para potenciar tu negocio.
        </p>
      </div>
      <MenuUsuariosInferior />
    </div>
  );
}
