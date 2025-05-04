
import './estilos.css';

const Paso1A: React.FC = () => {
  return (
    <div className="Paso1A-contenedor">
      <div className="Paso1A-contenido">
        <div className="Paso1A-texto">
          <h2 className="Paso1A-titulo-secundario">Paso 1</h2>
          <h1 className="Paso1A-titulo-principal">Describe tu Glamping</h1>
          <p className="Paso1A-descripcion">
            En este paso, te preguntaremos qué tipo de Glamping tienes. Da clic en siguiente e indícanos 
            la ubicación y cuántos huéspedes pueden quedarse.
          </p>
        </div>
        <div className="Paso1A-video-contenedor">
          <video
            className="Paso1A-video"
            autoPlay
            muted
            loop
            src="/Videos/Paso1AVideo.mp4"
          >
            Tu navegador no soporta la reproducción de videos.
          </video>
        </div>
      </div>
    </div>
  );
};

export default Paso1A;
