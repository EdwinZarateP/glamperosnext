import React from 'react';
import './estilos.css';

// Definición de tipo para las regiones
interface Region {
  nombre: string;
  ruta: string;
  imagen: string;
}

const regiones: Region[] = [
  {
    nombre: "Cundinamarca",
    ruta: "/cundinamarca",
    imagen: "https://storage.googleapis.com/glamperos-imagenes/Imagenes/laguna-guatavita.jpg",
  },
  {
    nombre: "Antioquia",
    ruta: "/antioquia",
    imagen: "https://storage.googleapis.com/glamperos-imagenes/Imagenes/guatape.webp",
  },
  {
    nombre: "Santander",
    ruta: "/santander",
    imagen: "https://storage.googleapis.com/glamperos-imagenes/Imagenes/Barichara.webp",
  },
  {
    nombre: "Boyacá",
    ruta: "/boyaca",
    imagen: "https://storage.googleapis.com/glamperos-imagenes/Imagenes/VILLA-DE-LEYVA.jpg",
  },
  {
    nombre: "Eje Cafetero",
    ruta: "/eje-cafetero",
    imagen: "https://storage.googleapis.com/glamperos-imagenes/Imagenes/eje%20cafetero.jpg",
  },
  {
    nombre: "Valle del Cauca",
    ruta: "/valle-del-cauca",
    imagen: "https://storage.googleapis.com/glamperos-imagenes/Imagenes/valle%20del%20cauca.jpeg",
  },
];

const Regiones: React.FC = () => {
  return (
    <div className="Regiones-container">
      {/* Mensaje de error con meme */}
      <div className="Regiones-mensajeError">
        <div className="Regiones-textoError">
          <h3>¡Ups! No encontramos glampings con esos filtros</h3>
          <p>No te preocupes… sigue explorando. Seguro en alguna de estas regiones encuentras tu Glamping ideal:</p>
        </div>
        <img 
          className="Regiones-imagenError" 
          src="https://storage.googleapis.com/glamperos-imagenes/Imagenes/png-Tristeza-Intensamente.webp" 
          alt="Emoji triste" 
        />
      </div>
      
      <h2 className="Regiones-titulo">Explora glamping en</h2>
      <div className="Regiones-grid">
        {regiones.map((region, index) => (
          <a 
            key={index} 
            href={region.ruta} 
            className="Regiones-tarjeta"
          >
            <div 
              className="Regiones-imagen"
              style={{ backgroundImage: `url(${region.imagen})` }}
            />
            <div className="Regiones-capa">
              <span className="Regiones-nombre">{region.nombre}</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default Regiones;