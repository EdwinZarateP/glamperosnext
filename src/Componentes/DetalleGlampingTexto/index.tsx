"use client";

import React from "react";
import "./estilos.css";

// Ajusta esta ruta según tu proyecto:
import { SERVICIOS_EXTRAS, ajustarValor } from "@/Funciones/serviciosExtras";

interface DescripcionGlampingTextoProps {
  descripcionGlamping: string;

  // — Ten en cuenta —
  politicas_casa?: string;
  horarios?: string;

  // — Servicios adicionales (texto + valor opcional) —
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

  torrentismo?: string;
  valor_torrentismo?: number;

  parapente?: string;
  valor_parapente?: number;

  paseo_lancha?: string;
  valor_paseo_lancha?: number;

  kit_fogata?: string;
  valor_kit_fogata?: number;

  cena_romantica?: string;
  valor_cena_romantica?: number;

  cena_estandar?: string;
  valor_cena_estandar?: number;

  mascota_adicional?: string;
  valor_mascota_adicional?: number;
}

export default function DescripcionGlampingTexto(props: DescripcionGlampingTextoProps) {
  const { descripcionGlamping, politicas_casa, horarios } = props;

  // ————————————————————————————————————————
  // Resaltado de palabras clave en la descripción
  // ————————————————————————————————————————
  const highlights = [
    "servicios adicionales",
    "incluye",
    "incluyendo",
    "check in",
    "check out",
    "check-in",
    "check-out",
    "políticas de la casa",
    "politicas de la casa",
    "horarios",
    "horario",
    "cancelaciones",
    "atractivos",
    "experiencias",
    "términos y condiciones",
    "terminos y condiciones",
    "servicios incluidos",
    "Añade a tu plan",
  ];

  const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = highlights.map(escapeRegExp).join("|");

  // Para dividir y luego detectar coincidencias de forma segura
  const splitRegex = new RegExp(`(${pattern})`, "ig");
  const matchRegex = new RegExp(`^(${pattern})$`, "i");

  // ————————————————————————————————————————
  // Servicios visibles: lectura segura de props por clave dinámica
  // ————————————————————————————————————————
  const propsAny = props as unknown as Record<string, unknown>;

  const getText = (key: string): string | undefined => {
    const v = propsAny[key];
    return typeof v === "string" && v.trim() ? v : undefined;
  };

  const getVal = (key?: string): number | undefined => {
    if (!key) return undefined;
    const v = propsAny[key];
    return typeof v === "number" && v > 0 ? v : undefined;
  };

  const serviciosVisibles = SERVICIOS_EXTRAS
    .map((s) => {
      const texto = getText(s.desc);
      const valor = getVal(s.val);
      if (!texto && !valor) return null;
      return { titulo: s.label, texto, valor };
    })
    .filter(Boolean) as { titulo: string; texto?: string; valor?: number }[];

  return (
    <div className="DescripcionGlampingTexto-contenedor">
      <h2 className="DescripcionGlampingTexto-titulo">Este glamping te ofrece</h2>

      {/* Descripción (respeta \n y \r\n) */}
      <div className="DescripcionGlampingTexto-texto">
        {(descripcionGlamping || "")
          .split(/\r?\n/)
          .map((linea, index) => {
            const parts = linea.split(splitRegex).filter((p) => p !== "");
            return (
              <p key={index}>
                {parts.map((part, i) =>
                  matchRegex.test(part) ? (
                    <strong key={i} className="DescripcionGlampingTexto-highlight">
                      {part}
                    </strong>
                  ) : (
                    <span key={i}>{part}</span>
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
              const valorOk = typeof s.valor === "number" && s.valor > 0;
              return (
                <li key={idx}>
                  <strong>{s.titulo}:</strong>{" "}
                  {valorOk && (
                    <>
                      <span>
                        — ${ajustarValor(s.valor as number).toLocaleString("es-CO")}
                      </span>
                      <br />
                    </>
                  )}
                  {s.texto && <span className="DescripcionGlampingTexto-multiline">{s.texto}</span>}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Ten en cuenta */}
      {((politicas_casa && politicas_casa.trim()) || (horarios && horarios.trim())) && (
        <div className="DescripcionGlampingTexto-seccion">
          <h3>Ten en cuenta</h3>
          {horarios && horarios.trim() && (
            <p>
              <strong>Horarios:</strong>{" "}
              <span className="DescripcionGlampingTexto-multiline">{horarios}</span>
            </p>
          )}
          {politicas_casa && politicas_casa.trim() && (
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
