"use client";

import React, { useEffect } from "react";
import Calificacion from "../../Componentes/Calificacion/index"; // Ajusta según tu estructura
import DetalleGlampingTexto from "../../Componentes/DetalleGlampingTexto/index"; // Ajusta según tu estructura
import "./estilos.css";

interface DescripcionGlampingProps {
  calificacionNumero: number;
  calificacionEvaluaciones: number;
  calificacionMasAlta: string;
  descripcion_glamping: string;
}

export default function DescripcionGlamping({
  calificacionNumero,
  calificacionEvaluaciones,
  // calificacionMasAlta, // Si decides usarla, descoméntala y pásala al componente
  descripcion_glamping,
}: DescripcionGlampingProps) {
  useEffect(() => {
    // Cuando el componente se desmonte, se asegura de que el body tenga overflow auto
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div className="descripcion-glamping-contenedor">
      <Calificacion
        calificacionNumero={calificacionNumero}
        calificacionEvaluaciones={calificacionEvaluaciones}
        // Puedes pasar también calificacionMasAlta si lo deseas
      />
      <div className="descripcion-glamping-detalle">
        <DetalleGlampingTexto descripcionGlamping={descripcion_glamping} />
      </div>
    </div>
  );
}
