"use client";

import React, { useMemo, useState } from "react";
import "./estilos.css";

// Ajusta esta ruta según tu proyecto:
import { SERVICIOS_EXTRAS, ajustarValor } from "@/Funciones/serviciosExtras";

interface DescripcionGlampingTextoProps {
  descripcionGlamping: string;

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

  tour_1?: string;
  valor_tour_1?: number;

  tour_2?: string;
  valor_tour_2?: number;
  
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

  const splitRegex = new RegExp(`(${pattern})`, "ig");
  const matchRegex = new RegExp(`^(${pattern})$`, "i");

  // ————————————————————————————————————————
  // Servicios visibles
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

  const serviciosVisibles = useMemo(() => {
    return SERVICIOS_EXTRAS
      .map((s) => {
        const texto = getText(s.desc);
        const valor = getVal(s.val);
        if (!texto && !valor) return null;
        return { titulo: s.label, texto, valor };
      })
      .filter(Boolean) as { titulo: string; texto?: string; valor?: number }[];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(props)]);

  // ————————————————————————————————————————
  // Copiar todo a WhatsApp (subtítulos con *...*)
  // ————————————————————————————————————————
  const [copiado, setCopiado] = useState(false);

  const toMoney = (n?: number) =>
    typeof n === "number" ? `$${ajustarValor(n).toLocaleString("es-CO")}` : "";

  const buildCopyText = () => {
    const partes: string[] = [];

    // Título general
    partes.push(`*Este glamping te ofrece*`);
    partes.push(descripcionGlamping?.trim() || "");

    // Servicios adicionales
    if (serviciosVisibles.length > 0) {
      partes.push("");
      partes.push(`*Servicios adicionales*`);
      serviciosVisibles.forEach((s) => {
        const precio = toMoney(s.valor);
        const lineaTitulo = precio ? `- ${s.titulo}: ${precio}` : `- ${s.titulo}`;
        partes.push(lineaTitulo);
        if (s.texto) partes.push(`  ${s.texto}`);
      });
    }

    // Ten en cuenta
    if ((politicas_casa && politicas_casa.trim()) || (horarios && horarios.trim())) {
      partes.push("");
      partes.push(`*Ten en cuenta*`);
      if (horarios && horarios.trim()) partes.push(`- Horarios: ${horarios}`);
      if (politicas_casa && politicas_casa.trim())
        partes.push(`- Políticas de la casa: ${politicas_casa}`);
    }

    // Proceso de reserva
    partes.push("");
    partes.push(`*💌 Proceso de reserva*`);
    partes.push(
      "Las reservas se garantizan con una transferencia del *50% del valor total* 💳 para asegurar tu fecha."
    );
    partes.push(
      "Letra chiquita: Ten en cuenta que este valor no es reembolsable. El 50% restante se cancela a tu llegada al glamping 🏕️."
    );
    partes.push("");
    partes.push("Datos de pago:");
    partes.push("🏦 Cuenta Bancolombia – Glamperos SAS");
    partes.push("📂 Tipo: Ahorros");
    partes.push("🔢 Nº 292-000059-43");
    partes.push("📂 Nuestra Llave");
    partes.push("🔢 0089996468");

    // Exoneración
    partes.push("");
    partes.push(`*Exoneración de responsabilidad*`);
    partes.push(
      "Glamperos S.A.S. actúa únicamente en la promoción y reserva de experiencias y servicios adicionales ofrecidos por terceros. Por lo tanto, no asume responsabilidad alguna por la calidad, seguridad, disponibilidad, cumplimiento o consecuencias derivadas de dichos servicios, siendo el tercero prestador el único responsable frente al usuario."
    );

    return partes.filter(Boolean).join("\n");
  };

  const handleCopy = async () => {
    const texto = buildCopyText();
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1800);
    } catch {
      // Fallback
      const ta = document.createElement("textarea");
      ta.value = texto;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        setCopiado(true);
        setTimeout(() => setCopiado(false), 1800);
      } finally {
        document.body.removeChild(ta);
      }
    }
  };

  return (
    <div className="DescripcionGlampingTexto-contenedor">
      {/* Botón copiar (discreto, fijo dentro del contenedor) */}
      <div className="DescripcionGlampingTexto-copyWrap" aria-live="polite">
        <button
          type="button"
          className={`DescripcionGlampingTexto-copyBtn ${copiado ? "is-ok" : ""}`}
          onClick={handleCopy}
          title="Copiar todo para WhatsApp"
        >
          {copiado ? "¡Copiado!" : "📋"}
        </button>
      </div>

      <header className="DescripcionGlampingTexto-encabezado">
        <h2 className="DescripcionGlampingTexto-titulo">Este glamping te ofrece</h2>
        <p className="DescripcionGlampingTexto-subtitulo">
          Vive una estadía cómoda y sin complicaciones. Aquí encuentras todo lo importante en un solo lugar.
        </p>
      </header>

      {/* Descripción */}
      <div className="DescripcionGlampingTexto-texto DescripcionGlampingTexto-card">
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
        <section className="DescripcionGlampingTexto-seccion DescripcionGlampingTexto-card">
          <h3>Servicios adicionales</h3>

          <ul className="DescripcionGlampingTexto-lista">
            {serviciosVisibles.map((s, idx) => {
              const valorOk = typeof s.valor === "number" && s.valor > 0;
              return (
                <li key={idx} className="DescripcionGlampingTexto-item">
                  <div className="DescripcionGlampingTexto-itemFila">
                    <strong className="DescripcionGlampingTexto-itemTitulo">{s.titulo}</strong>
                    {valorOk && (
                      <span className="DescripcionGlampingTexto-precio">
                        {toMoney(s.valor)}
                      </span>
                    )}
                  </div>
                  {s.texto && (
                    <span className="DescripcionGlampingTexto-multiline DescripcionGlampingTexto-itemTexto">
                      {s.texto}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Ten en cuenta */}
      {((politicas_casa && politicas_casa.trim()) || (horarios && horarios.trim())) && (
        <section className="DescripcionGlampingTexto-seccion DescripcionGlampingTexto-card">
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
        </section>
      )}

      {/* 💌 Proceso de reserva (antes de exoneración) */}
      <section className="DescripcionGlampingTexto-seccion DescripcionGlampingTexto-card">
        <h3>💌 Proceso de reserva</h3>
        <p className="DescripcionGlampingTexto-parrafo">
          <strong>Las reservas se garantizan</strong> una vez recibimos una transferencia del{" "}
          <strong>50% del valor total</strong> 💳 para asegurar tu fecha.
        </p>
        <p className="DescripcionGlampingTexto-leyenda">
          <strong>Letra chiquita:</strong> Ten en cuenta que este valor no es reembolsable. El 50% restante se cancela a tu llegada al glamping 🏕️.
        </p>

        <div className="DescripcionGlampingTexto-pagos" aria-label="Datos de pago">
          <div className="DescripcionGlampingTexto-pagosFila">🏦 Cuenta Bancolombia – <strong>Glamperos SAS</strong></div>
          <div className="DescripcionGlampingTexto-pagosFila">📂 Tipo: <strong>Ahorros</strong></div>
          <div className="DescripcionGlampingTexto-pagosFila">🔢 Nº <code>292-000059-43</code></div>
          <div className="DescripcionGlampingTexto-pagosFila">O usa nuestra llave <code>0089996468</code></div>
        </div>
      </section>

      {/* Exoneración de responsabilidad */}
      <section className="DescripcionGlampingTexto-seccion DescripcionGlampingTexto-card">
        <h3>Exoneración de responsabilidad</h3>
        <p className="DescripcionGlampingTexto-multiline">
          Glamperos S.A.S. actúa únicamente en la promoción y reserva de
          experiencias y servicios adicionales ofrecidos por terceros. Por lo tanto, no asume
          responsabilidad alguna por la calidad, seguridad, disponibilidad, cumplimiento o
          consecuencias derivadas de dichos servicios, siendo el tercero prestador el único
          responsable frente al usuario.
        </p>
      </section>
    </div>
  );
}
