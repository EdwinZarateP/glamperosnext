"use client";

import React from "react";
import "./estilos.css";

interface DescripcionGlampingTextoProps {
  descripcionGlamping: string;

  // — Ten en cuenta —
  politicas_casa?: string;
  horarios?: string;

  // — Servicios adicionales —
  decoracion_sencilla?: string;
  valor_decoracion_sencilla?: number;

  decoracion_especial?: string;
  valor_decoracion_especial?: number;

  paseo_cuatrimoto?: string;
  valor_paseo_cuatrimoto?: number;

  paseo_caballo?: string;
  valor_paseo_caballo?: number;

  masaje_pareja?: string;
  valor_masaje_pareja?: number;

  dia_sol?: string;
  valor_dia_sol?: number;

  caminata?: string;
  valor_caminata?: number;

  kit_fogata?: string;
  valor_kit_fogata?: number;

  cena_romantica?: string;
  valor_cena_romantica?: number;

  mascota_adicional?: string;
  valor_mascota_adicional?: number;
}

export default function DescripcionGlampingTexto({
  descripcionGlamping,
  politicas_casa,
  horarios,
  decoracion_sencilla,
  valor_decoracion_sencilla,
  decoracion_especial,
  valor_decoracion_especial,
  paseo_cuatrimoto,
  valor_paseo_cuatrimoto,
  paseo_caballo,
  valor_paseo_caballo,
  masaje_pareja,
  valor_masaje_pareja,
  dia_sol,
  valor_dia_sol,
  caminata,
  valor_caminata,
  kit_fogata,
  valor_kit_fogata,
  cena_romantica,
  valor_cena_romantica,
  mascota_adicional,
  valor_mascota_adicional,
}: DescripcionGlampingTextoProps) {
  // Lista de términos a resaltar
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
    "atractivos",
    "experiencias",
    "terminos y condiciones",
    "servicios incluidos",
    "comodidades",
  ];
  const regex = new RegExp(`(${highlights.join("|")})`, "i");

  // Lista de servicios opcionales para renderizar de forma dinámica
  const serviciosAdicionales = [
    { titulo: "Decoración sencilla", texto: decoracion_sencilla, valor: valor_decoracion_sencilla },
    { titulo: "Decoración especial", texto: decoracion_especial, valor: valor_decoracion_especial },
    { titulo: "Paseo en cuatrimoto", texto: paseo_cuatrimoto, valor: valor_paseo_cuatrimoto },
    { titulo: "Paseo a caballo", texto: paseo_caballo, valor: valor_paseo_caballo },
    { titulo: "Masaje en pareja", texto: masaje_pareja, valor: valor_masaje_pareja },
    { titulo: "Día de sol", texto: dia_sol, valor: valor_dia_sol },
    { titulo: "Caminata", texto: caminata, valor: valor_caminata },
    { titulo: "Kit de fogata", texto: kit_fogata, valor: valor_kit_fogata },
    { titulo: "Cena romántica", texto: cena_romantica, valor: valor_cena_romantica },
    { titulo: "Mascota adicional", texto: mascota_adicional, valor: valor_mascota_adicional },
  ];

  return (
    <div className="DescripcionGlampingTexto-contenedor">
      <h2 className="DescripcionGlampingTexto-titulo">Este glamping te ofrece</h2>

      {/* Descripción */}
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

      {/* Servicios adicionales */}
      {serviciosAdicionales.some(s => s.texto) && (
        <div className="DescripcionGlampingTexto-seccion">
          <h3>Servicios adicionales</h3>
          <ul className="DescripcionGlampingTexto-lista">
            {serviciosAdicionales.map(
              (s, idx) =>
                s.texto && (
                  <li key={idx}>
                    <strong>{s.titulo}:</strong> {s.texto}
                    {s.valor && <span> — ${s.valor.toLocaleString("es-CO")}</span>}
                  </li>
                )
            )}
          </ul>
        </div>
      )}

      
      {/* Ten en cuenta */}
      {(politicas_casa || horarios) && (
        <div className="DescripcionGlampingTexto-seccion">
          <h3>Ten en cuenta</h3>
          {horarios && <p><strong>Horarios:</strong> {horarios}</p>}
          {politicas_casa && <p><strong>Políticas de la casa:</strong> {politicas_casa}</p>}          
        </div>
      )}
    </div>
  );
}
