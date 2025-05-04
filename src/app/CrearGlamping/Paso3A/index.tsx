"use client";

import "./estilos.css";

const Paso3A: React.FC = () => {
  return (
    <div className="Paso3A-contenedor">
      <div className="Paso3A-contenido">
        <div className="Paso3A-texto">
          <h2 className="Paso3A-titulo-secundario">Paso 3</h2>
          <h1 className="Paso3A-titulo-principal">¿Cuánto cuesta una noche?</h1>
          <p className="Paso3A-descripcion">
            En este paso, te preguntaremos qué costo tiene una noche en tu Glamping. 
            Debes definir las tarifas teniendo en cuenta que nuestra plataforma cobra 
            un porcentaje de comisión que varía del 8 al 15%. Puedes indicar cómo quieres
            que se cobre la tarifa de días entre semana, fines de semana o festivos.
          </p>
        </div>
        <div className="Paso3A-video-contenedor">
          <video className="Paso3A-video" autoPlay muted loop src={"/Videos/Paso1AVideo.mp4"}>
            Tu navegador no soporta la reproducción de videos.
          </video>
        </div>
      </div>
    </div>
  );
};

export default Paso3A;
