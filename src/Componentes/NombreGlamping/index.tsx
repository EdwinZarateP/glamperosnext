// src/Componentes/NombreGlamping/index.tsx
import React from "react";
import "./estilos.css";

interface NombreGlampingProps {
  nombreGlamping: string;
}

const NombreGlamping: React.FC<NombreGlampingProps> = ({ nombreGlamping }) => {
  // Formatea el nombre: primera letra en mayúscula, el resto en minúscula.
  const formatNombreGlamping = (nombre: string) =>
    nombre.charAt(0).toUpperCase() + nombre.slice(1).toLowerCase();

  return <h1 className="titulo-glamping">{formatNombreGlamping(nombreGlamping)}</h1>;
};

export default NombreGlamping;
