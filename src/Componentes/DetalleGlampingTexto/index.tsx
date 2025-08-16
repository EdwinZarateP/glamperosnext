"use client";

import React from "react";
import "./estilos.css";

interface DescripcionGlampingTextoProps {
  descripcionGlamping: string;
}

export default function DescripcionGlampingTexto({
  descripcionGlamping,
}: DescripcionGlampingTextoProps) {
  // Lista en minúsculas (una sola vez cada término)
  const highlights = [
    "servicios adicionales",
    "incluye",
    "incluyendo",
    "check in",
    "check out",
    "check-in",
    "check-out",
    "políticas de la casa",
    "horarios",
    "horario",
    "cancelaciones",
    "Atractivos",
    "Experiencias",
    "Terminos y condiciones",
    "Servicios incluidos",
    "comodidades"
  ];

  const regex = new RegExp(`(${highlights.join("|")})`, "i");

  return (
    <div className="DescripcionGlampingTexto-contenedor">
      <h2 className="DescripcionGlampingTexto-titulo">Este glamping te ofrece</h2>
      <div className="DescripcionGlampingTexto-texto">
        {descripcionGlamping.split("\n").map((linea, index) => {
          const parts = linea.split(regex);
          return (
            <p key={index}>
              {parts.map((part, i) =>
                regex.test(part.toLowerCase()) ? (
                  <strong key={i} className="DescripcionGlampingTexto-highlight">
                    {part}
                  </strong>
                ) : (
                  part
                )
              )}
            </p>
          );
        })}
      </div>
    </div>
  );
}
