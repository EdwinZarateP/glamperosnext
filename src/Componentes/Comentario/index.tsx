"use client";

import React, { useState } from "react";
import "./estilos.css";

interface ComentarioProps {
  nombre: string;
  calificacionNumero: number;
  comentario: string;
  fotoPerfil?: string; // La foto de perfil es opcional
}

export default function Comentario({
  nombre,
  calificacionNumero,
  comentario,
  fotoPerfil,
}: ComentarioProps) {
  const [mostrarTodo, setMostrarTodo] = useState(false);

  // Función para obtener las estrellas según la calificación
  const getEstrellas = () => {
    if (calificacionNumero > 4.5) return "★★★★★";
    if (calificacionNumero >= 4 && calificacionNumero <= 4.5) return "★★★★☆";
    if (calificacionNumero >= 3 && calificacionNumero < 4) return "★★★☆☆";
    if (calificacionNumero >= 2 && calificacionNumero < 3) return "★★☆☆☆";
    if (calificacionNumero >= 1 && calificacionNumero < 2) return "★☆☆☆☆";
    return "☆☆☆☆☆";
  };

  // Función para obtener la primera letra del nombre del usuario (para el caso sin foto de perfil)
  const getPrimeraLetra = () => {
    const nombreSeguro = nombre || "Anónimo"; // 'Anónimo' como valor por defecto
    return nombreSeguro.charAt(0).toUpperCase();
  };

  return (
    <div className="comentario-contenedor">
      <div className="comentario-header">
        {fotoPerfil ? (
          <img
            src={fotoPerfil}
            alt={`${nombre} perfil`}
            className="comentario-imagen"
          />
        ) : (
          <div className="comentario-placeholder">{getPrimeraLetra()}</div>
        )}
        <div className="comentario-info">
          <h3 className="comentario-nombre">{nombre}</h3>
        </div>
      </div>
      <div className="comentario-detalles">
        <span className="comentario-calificacion">{getEstrellas()}</span>
      </div>
      <p className={`comentario-texto ${mostrarTodo ? "expandido" : ""}`}>
        {comentario}
      </p>
      {comentario.split(" ").length > 20 && (
        <p
          className="comentario-mostrar"
          onClick={() => setMostrarTodo((prev) => !prev)}
        >
          {mostrarTodo ? "Mostrar menos" : "Mostrar más"}
        </p>
      )}
    </div>
  );
}
