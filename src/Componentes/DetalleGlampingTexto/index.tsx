"use client";

import React from "react";
import "./estilos.css";

interface DescripcionGlampingTextoProps {
  descripcionGlamping: string;
}

export default function DescripcionGlampingTexto({
  descripcionGlamping,
}: DescripcionGlampingTextoProps) {
  // Lista de términos a resaltar
  const highlights = ["servicios adicionales", "check-in", "check-out","Políticas de la casa","Horarios","Cancelaciones"];

  // Construye un regex que capture cualquiera de los términos (case-insensitive)
  const regex = new RegExp(`(${highlights.join("|")})`, "gi");

  return (
    <div className="DescripcionGlampingTexto-contenedor">
      <h2 className="DescripcionGlampingTexto-titulo">Este glamping te ofrece</h2>
      <div className="DescripcionGlampingTexto-texto">
        {descripcionGlamping.split("\n").map((linea, index) => {
          const parts = linea.split(regex);
          return (
            <p key={index}>
              {parts.map((part, i) =>
                regex.test(part) ? (
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
