"use client";

import "./estilos.css";

const Paso2A: React.FC = () => {
  return (
    <div className="Paso2A-contenedor">
      <div className="Paso2A-contenido">
        <div className="Paso2A-texto">
          <h2 className="Paso2A-titulo-secundario">Paso 2</h2>
          <h1 className="Paso2A-titulo-principal">Haz que tu glamping se destaque</h1>
          <p className="Paso2A-descripcion">
            En este paso, deberás agregar las comodidades que tiene tu Glamping y al menos 5 fotos.
            Luego deberás crear un título y una descripción.
          </p>
        </div>
        <div className="Paso2A-video-contenedor">
          <video className="Paso2A-video" autoPlay muted loop src={"/Videos/Paso1AVideo.mp4"}>
            Tu navegador no soporta la reproducción de videos.
          </video>
        </div>
      </div>
    </div>
  );
};

export default Paso2A;
