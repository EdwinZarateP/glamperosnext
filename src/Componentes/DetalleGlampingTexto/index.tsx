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

  cena_estandar?: string;
  valor_cena_estandar?: number;

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
  cena_estandar,
  valor_cena_estandar,
  mascota_adicional,
  valor_mascota_adicional,
}: DescripcionGlampingTextoProps) {
  // 🔹 Función para aplicar incremento +10% y redondeo al múltiplo de 1000 mayor
  const ajustarValor = (valor: number): number => {
    const aumentado = valor * 1.1;
    return Math.ceil(aumentado / 1000) * 1000; // redondea SIEMPRE al múltiplo de 1000 superior
  };

  // Palabras a resaltar en la descripción
  const highlights = [
    "servicios adicionales","incluye","incluyendo","check in","check out",
    "check-in","check-out","políticas de la casa","politicas de la casa",
    "horarios","horario","cancelaciones","atractivos","experiencias",
    "términos y condiciones","terminos y condiciones","servicios incluidos","Añade a tu plan",
  ];
  const regex = new RegExp(`(${highlights.join("|")})`, "i");

  // Lista base
  const serviciosAdicionales = [
    { titulo: "Mascota adicional", texto: mascota_adicional, valor: valor_mascota_adicional },
    { titulo: "Decoración sencilla", texto: decoracion_sencilla, valor: valor_decoracion_sencilla },
    { titulo: "Decoración especial", texto: decoracion_especial, valor: valor_decoracion_especial },
    { titulo: "Paseo en cuatrimoto", texto: paseo_cuatrimoto, valor: valor_paseo_cuatrimoto },
    { titulo: "Paseo a caballo", texto: paseo_caballo, valor: valor_paseo_caballo },
    { titulo: "Masaje en pareja", texto: masaje_pareja, valor: valor_masaje_pareja },
    { titulo: "Día de sol", texto: dia_sol, valor: valor_dia_sol },
    { titulo: "Caminata", texto: caminata, valor: valor_caminata },
    { titulo: "Kit de fogata", texto: kit_fogata, valor: valor_kit_fogata },
    { titulo: "Cena estándar", texto: cena_estandar, valor: valor_cena_estandar },
    { titulo: "Cena romántica", texto: cena_romantica, valor: valor_cena_romantica },
  ];

  // ✅ Filtra: mostrar solo si hay texto o precio > 0
  const serviciosVisibles = serviciosAdicionales.filter((s) => {
    const tieneTexto = Boolean(s.texto && s.texto.trim().length > 0);
    const valorPositivo = typeof s.valor === "number" && s.valor > 0;
    return tieneTexto || valorPositivo;
  });

  return (
    <div className="DescripcionGlampingTexto-contenedor">
      <h2 className="DescripcionGlampingTexto-titulo">Este glamping te ofrece</h2>

      {/* Descripción (respeta \n y \r\n) */}
      <div className="DescripcionGlampingTexto-texto">
        {descripcionGlamping.split(/\r?\n/).map((linea, index) => {
          const parts = linea.split(regex);
          return (
            <p key={index}>
              {parts.map((part, i) =>
                regex.test(part) ? (
                  <strong key={i} className="DescripcionGlampingTexto-highlight">{part}</strong>
                ) : (
                  part
                )
              )}
            </p>
          );
        })}
      </div>

      {/* Servicios adicionales */}
      {serviciosVisibles.length > 0 && (
        <div className="DescripcionGlampingTexto-seccion">
          <h3>Servicios adicionales</h3>
          <ul className="DescripcionGlampingTexto-lista">
            {serviciosVisibles.map((s, idx) => {
              const tieneTexto = Boolean(s.texto && s.texto.trim().length > 0);
              const valorPositivo = typeof s.valor === "number" && s.valor > 0;
              return (
                <li key={idx}>
                  <strong>{s.titulo}:</strong>{" "}
                  {valorPositivo && (
                    <>
                      <span>— ${ajustarValor(s.valor!).toLocaleString("es-CO")}</span>
                      <br />
                    </>
                  )}
                  {tieneTexto && (
                    <span className="DescripcionGlampingTexto-multiline">{s.texto}</span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Ten en cuenta */}
      {(politicas_casa || horarios) && (
        <div className="DescripcionGlampingTexto-seccion">
          <h3>Ten en cuenta</h3>
          {horarios && (
            <p>
              <strong>Horarios:</strong>{" "}
              <span className="DescripcionGlampingTexto-multiline">{horarios}</span>
            </p>
          )}
          {politicas_casa && (
            <p>
              <strong>Políticas de la casa:</strong>{" "}
              <span className="DescripcionGlampingTexto-multiline">{politicas_casa}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
