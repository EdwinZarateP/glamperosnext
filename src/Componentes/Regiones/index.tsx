// components/Regiones.tsx
import React from "react";
import { useRouter } from "next/navigation";
import "./estilos.css";

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

export default function Regiones() {
  const router = useRouter();

  return (
    <div className="Regiones-container">
      {/* Mensaje de “no results” */}
      <div className="Regiones-error">
        <img
          src="https://storage.googleapis.com/glamperos-imagenes/Imagenes/png-Tristeza-Intensamente.webp"
          alt="No hay resultados"
          className="Regiones-error-imagen"
        />
        <div className="Regiones-error-texto">
          <h1>¡Ups! No encontramos glampings con esos filtros</h1>
          <p>
            No te preocupes… sigue explorando. Seguro en alguna de estas regiones
            encuentras tu Glamping ideal:
          </p>
        </div>
      </div>

      {/* Grid de regiones */}
      <div className="Regiones-grid">
        {regiones.map((region) => (
          <div
            key={region.nombre}
            className="Regiones-card"
            onClick={() => router.push(region.ruta)}
          >
            <img
              src={region.imagen}
              alt={region.nombre}
              className="Regiones-imagen"
            />
            <div className="Regiones-nombre">{region.nombre}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
