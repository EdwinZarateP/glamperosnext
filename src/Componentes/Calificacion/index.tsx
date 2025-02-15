"use client";

import React from "react";
import { GiLaurelCrown } from "react-icons/gi";
import "./estilos.css";

interface CalificacionProps {
  calificacionNumero: number;
  calificacionEvaluaciones: number;
  // calificacionMasAlta: string;
}

export default function Calificacion({
  calificacionNumero,
  calificacionEvaluaciones,
}: CalificacionProps) {
  const getEstrellas = () => {
    if (calificacionNumero > 4.5) return "★★★★★";
    if (calificacionNumero >= 4 && calificacionNumero <= 4.5) return "★★★★☆";
    if (calificacionNumero >= 3 && calificacionNumero < 4) return "★★★☆☆";
    if (calificacionNumero >= 2 && calificacionNumero < 3) return "★★☆☆☆";
    if (calificacionNumero >= 1 && calificacionNumero < 2) return "★☆☆☆☆";
    return "☆☆☆☆☆";
  };

  const getTextoCalificacion = () => {
    if (calificacionNumero >= 4.9 && calificacionNumero <= 5) {
      return "Tiene una calificación perfecta";
    }
    if (calificacionNumero >= 3 && calificacionNumero < 4.9) {
      return "Favorito entre glampistas";
    }
    return "Descubre este sitio";
  };

  return (
    <div className="calificacion-contenedor">
      <div className="calificacion-texto">
        <GiLaurelCrown className="calificacion-icono-laurel" />
        <span>{getTextoCalificacion()}</span>
      </div>
      <div className="calificacion-icono">
        <span className="calificacion-numero">
          {calificacionNumero.toFixed(1)}
        </span>
        <div className="calificacion-estrellas">{getEstrellas()}</div>
      </div>
      <div className="calificacion-evaluaciones">
        <span className="calificacion-numero-evaluaciones">
          {calificacionEvaluaciones}
        </span>
        <span className="calificacion-texto-evaluaciones">
          {calificacionEvaluaciones === 1 ? "Evaluación" : "Evaluaciones"}
        </span>
      </div>
    </div>
  );
}
