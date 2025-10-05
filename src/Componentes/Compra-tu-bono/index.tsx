// src/Componentes/CompraTuBono.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import Cookies from "js-cookie";
import Swal from "sweetalert2";
import "./estilos.css";

type BonosItem = { valor: number; id: string };
type ApiRespuesta = {
  mensaje: string;
  estado_compra: string;
  compra_lote_id: string;
  bonos_creados: number;
  totales?: {
    valor_redimible_total_sin_iva: number;
    total_pagado_con_iva: number;
  };
  bonos?: any[];
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || ""; // ej: "http://127.0.0.1:8000"

const FORM_MINIMO = 200_000; // mínimo en el front
const IVA_PORCENTAJE = 0.19;

const money = (n: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);

const presets = [200_000, 300_000, 400_000, 500_000];

// 🔐 Datos bancarios + QR
const CUENTA_TITULAR = "Bancolombia – Glamperos SAS";
const CUENTA_TIPO = "Ahorros";
const CUENTA_NUMERO = "292-000059-43";
const QR_LLAVE_URL =
  "https://storage.googleapis.com/glamperos-imagenes/Imagenes/llave%20glamepros.jpeg";

export default function CompraTuBono() {
  // Cookie de usuario (opcional). Si no existe, enviaremos "user_no_registrado"
  const [idUsuarioCookie, setIdUsuarioCookie] = useState<string | null>(null);

  // Datos del comprador
  const [emailComprador, setEmailComprador] = useState("");
  const [cedulaNit, setCedulaNit] = useState("");

  // Facturación
  const [requiereFactura, setRequiereFactura] = useState(false);
  const [razonSocial, setRazonSocial] = useState("");
  const [nitFact, setNitFact] = useState("");
  const [emailFact, setEmailFact] = useState("");
  const [direccionFact, setDireccionFact] = useState("");
  const [telefonoFact, setTelefonoFact] = useState("");

  // Bonos seleccionados
  const [items, setItems] = useState<BonosItem[]>([]);
  const [customValor, setCustomValor] = useState<number | "">("");
  const [fileSoporte, setFileSoporte] = useState<File | null>(null);

  // UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIdUsuarioCookie(Cookies.get("idUsuario") || null);
  }, []);

  // Cálculos
  const totalBase = useMemo(
    () => items.reduce((acc, it) => acc + it.valor, 0),
    [items]
  );
  const totalIVA = useMemo(() => Math.round(totalBase * IVA_PORCENTAJE), [totalBase]);
  const totalConIVA = useMemo(() => totalBase + totalIVA, [totalBase, totalIVA]);

  const addPreset = (valor: number) => {
    const id = crypto.randomUUID();
    setItems((prev) => [...prev, { valor, id }]);
  };

  const addCustom = () => {
    if (customValor === "" || isNaN(Number(customValor))) return;
    if (Number(customValor) < FORM_MINIMO) {
      setError(`Cada bono debe ser mínimo de ${money(FORM_MINIMO)}.`);
      return;
    }
    const id = crypto.randomUUID();
    setItems((prev) => [...prev, { valor: Number(customValor), id }]);
    setCustomValor("");
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const handleFile = (f: File | null) => {
    if (!f) {
      setFileSoporte(null);
      return;
    }
    // Permitimos PDF o imagen (jpg/png/webp)
    const okTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];
    if (!okTypes.includes(f.type)) {
      setError("El comprobante debe ser PDF o imagen (JPG/PNG/WEBP).");
      return;
    }
    setError(null);
    setFileSoporte(f);
  };

  const copy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: `${label} copiado`,
        showConfirmButton: false,
        timer: 1500,
      });
    } catch {
      Swal.fire({
        icon: "info",
        title: "No se pudo copiar",
        text: text,
      });
    }
  };

  // ✅ Ya NO validamos la cookie; si no existe, enviamos "user_no_registrado"
  const validar = () => {
    if (!emailComprador.trim()) return "Ingresa tu correo electrónico.";
    if (!cedulaNit.trim()) return "Ingresa tu cédula o NIT.";
    if (!fileSoporte) return "Adjunta el comprobante de pago (PDF o imagen).";
    if (items.length === 0) return "Agrega al menos un bono.";
    if (items.some((i) => i.valor < FORM_MINIMO))
      return `Todos los bonos deben ser mínimo ${money(FORM_MINIMO)}.`;

    if (requiereFactura) {
      if (!razonSocial.trim() || !nitFact.trim() || !emailFact.trim() || !direccionFact.trim()) {
        return "Completa los datos de facturación requeridos.";
      }
    }
    if (!API_BASE) {
      return "API_BASE no está configurado. Define NEXT_PUBLIC_API_BASE_URL en tu entorno.";
    }
    return null;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const err = validar();
    if (err) {
      setError(err);
      return;
    }

    try {
      setLoading(true);
      const bonos = items.map((it) => ({ valor: it.valor }));
      const datos_bonos_json = JSON.stringify(bonos);

      const idAEnviar = idUsuarioCookie || "user_no_registrado";

      const qs = new URLSearchParams();
      qs.set("id_usuario", idAEnviar);
      qs.set("email_comprador", emailComprador);
      qs.set("cedula_o_nit", cedulaNit);
      qs.set("fechaCompra", new Date().toISOString());
      qs.set("datos_bonos_json", datos_bonos_json);
      qs.set("requiere_factura_electronica", String(requiereFactura));
      if (requiereFactura) {
        qs.set("razon_social", razonSocial);
        qs.set("nit_facturacion", nitFact);
        qs.set("email_facturacion", emailFact);
        qs.set("direccion_facturacion", direccionFact);
        if (telefonoFact) qs.set("telefono_facturacion", telefonoFact);
      }

      const form = new FormData();
      if (!fileSoporte) throw new Error("Falta el comprobante de pago.");
      form.append("soporte_pago", fileSoporte);

      const url = `${API_BASE}/bonos/comprar?${qs.toString()}`;
      const resp = await fetch(url, { method: "POST", body: form });

      const ct = resp.headers.get("content-type") || "";
      const isJson = ct.includes("application/json");

      if (!resp.ok) {
        const msg = isJson ? (await resp.json())?.detail || (await resp.text()) : await resp.text();
        throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
      }

      if (!isJson) {
        const snippet = await resp.text();
        throw new Error(
          `La API no respondió JSON.\nRevisa CORS/URL (${url}).\nRespuesta: ${snippet.slice(0, 260)}`
        );
      }

      const data: ApiRespuesta = await resp.json();

      await Swal.fire({
        icon: "success",
        title: "Pago recibido",
        html: `
          <p>Tu pago fue recibido y está en validación.<br/>
          Una vez aprobado, te enviaremos un único correo con tus bonos adjuntos/enlaces.</p>
          <hr/>
          <div style="text-align:left">
            <p><b>Lote:</b> ${data.compra_lote_id}</p>
            <p><b>Bonos creados:</b> ${data.bonos_creados}</p>
            ${
              data.totales
                ? `<p><b>Total redimible (sin IVA):</b> ${money(
                    data.totales.valor_redimible_total_sin_iva
                  )}<br/><b>Total pagado (con IVA):</b> ${money(
                    data.totales.total_pagado_con_iva
                  )}</p>`
                : ""
            }
          </div>
        `,
        confirmButtonText: "Entendido",
      });

      // Limpieza
      setItems([]);
      setFileSoporte(null);
    } catch (e: any) {
      setError(e?.message || "Error inesperado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="compra-tu-bono-root">
      <form className="compra-tu-bono-card" onSubmit={onSubmit}>
        <header className="compra-tu-bono-header">
          <div className="compra-tu-bono-titles">
            <h1 className="compra-tu-bono-title">Compra tu Bono Glamperos</h1>
            <p className="compra-tu-bono-subtitle">
              Elige bonos de regalo o arma tu propio paquete. Mínimo por bono: {money(FORM_MINIMO)}.
            </p>
          </div>
        </header>

        {/* Datos del comprador */}
        <section className="compra-tu-bono-section">
          <h2 className="compra-tu-bono-section-title">Tus datos</h2>
          <div className="compra-tu-bono-grid">
            <label className="compra-tu-bono-field">
              <span>Correo *</span>
              <input
                type="email"
                className="compra-tu-bono-input"
                value={emailComprador}
                onChange={(e) => setEmailComprador(e.target.value)}
                placeholder="tu@email.com"
                required
              />
            </label>

            <label className="compra-tu-bono-field">
              <span>Cédula / NIT *</span>
              <input
                className="compra-tu-bono-input"
                value={cedulaNit}
                onChange={(e) => setCedulaNit(e.target.value)}
                placeholder="123456789"
                required
              />
            </label>
          </div>
        </section>

        {/* Bonos estándar */}
        <section className="compra-tu-bono-section">
          <h2 className="compra-tu-bono-section-title">Bonos estándar</h2>
          <div className="compra-tu-bono-presets">
            {presets.map((p) => (
              <button
                key={p}
                type="button"
                className="compra-tu-bono-chip"
                onClick={() => addPreset(p)}
              >
                {money(p)}
              </button>
            ))}
          </div>
        </section>

        {/* Personalizados */}
        <section className="compra-tu-bono-section">
          <h2 className="compra-tu-bono-section-title">Personaliza tu precio</h2>
          <div className="compra-tu-bono-custom">
            <input
              className="compra-tu-bono-input compra-tu-bono-input-number"
              type="number"
              min={FORM_MINIMO}
              step={50_000}
              placeholder={`${FORM_MINIMO}`}
              value={customValor}
              onChange={(e) =>
                setCustomValor(e.target.value === "" ? "" : Number(e.target.value))
              }
            />
            <button
              type="button"
              className="compra-tu-bono-btn"
              onClick={addCustom}
              disabled={customValor === "" || Number(customValor) < FORM_MINIMO}
            >
              Agregar bono
            </button>
          </div>

          {items.length > 0 && (
            <div className="compra-tu-bono-list">
              {items.map((it, idx) => (
                <div key={it.id} className="compra-tu-bono-item">
                  <span className="compra-tu-bono-item-left">
                    <b>Bono #{idx + 1}</b> — {money(it.valor)}
                  </span>
                  <button
                    type="button"
                    className="compra-tu-bono-remove"
                    onClick={() => removeItem(it.id)}
                    aria-label="Eliminar"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 🔔 Datos para transferir (AQUÍ VA EL BLOQUE QUE PREGUNTASTE) */}
        <section className="compra-tu-bono-section">
          <h2 className="compra-tu-bono-section-title">Datos para transferir</h2>

          <div className="compra-tu-bono-bank">
            <div className="compra-tu-bono-bank-left">
              <p>🏦 <b>{CUENTA_TITULAR}</b></p>
              <p>📂 <b>Tipo:</b> {CUENTA_TIPO}</p>
              <p>
                🔢 <b>Nº</b> {CUENTA_NUMERO}{" "}
                <button
                  type="button"
                  className="compra-tu-bono-mini-btn"
                  onClick={() => copy(CUENTA_NUMERO, "Número de cuenta")}
                >
                  Copiar
                </button>
              </p>
              <p>
              </p>
              <small>Transfiere y adjunta el comprobante en el siguiente paso.</small>
            </div>

            <div className="compra-tu-bono-bank-right">
              <img
                src={QR_LLAVE_URL}
                alt="QR de la llave Bancolombia"
                className="compra-tu-bono-qr"
              />
              <small>Escanéame para pagar con la llave</small>
            </div>
          </div>
        </section>

        {/* Comprobante (PDF o Imagen) */}
        <section className="compra-tu-bono-section">
          <h2 className="compra-tu-bono-section-title">Comprobante de pago</h2>
          <label className="compra-tu-bono-upload">
            <input
              type="file"
              accept="application/pdf,image/*"
              onChange={(e) => handleFile(e.target.files?.[0] || null)}
            />
            <span className="compra-tu-bono-upload-hint">
              {fileSoporte ? fileSoporte.name : "Selecciona tu comprobante (PDF o imagen) *"}
            </span>
          </label>
        </section>

        {/* Facturación */}
        <section className="compra-tu-bono-section">
          <div className="compra-tu-bono-switch">
            <input
              id="requiere-factura"
              type="checkbox"
              checked={requiereFactura}
              onChange={(e) => setRequiereFactura(e.target.checked)}
            />
            <label htmlFor="requiere-factura">¿Requieres factura electrónica?</label>
          </div>

          {requiereFactura && (
            <div className="compra-tu-bono-grid">
              <label className="compra-tu-bono-field">
                <span>Razón social *</span>
                <input
                  className="compra-tu-bono-input"
                  value={razonSocial}
                  onChange={(e) => setRazonSocial(e.target.value)}
                />
              </label>
              <label className="compra-tu-bono-field">
                <span>NIT *</span>
                <input
                  className="compra-tu-bono-input"
                  value={nitFact}
                  onChange={(e) => setNitFact(e.target.value)}
                />
              </label>
              <label className="compra-tu-bono-field">
                <span>Correo de facturación *</span>
                <input
                  type="email"
                  className="compra-tu-bono-input"
                  value={emailFact}
                  onChange={(e) => setEmailFact(e.target.value)}
                />
              </label>
              <label className="compra-tu-bono-field">
                <span>Dirección *</span>
                <input
                  className="compra-tu-bono-input"
                  value={direccionFact}
                  onChange={(e) => setDireccionFact(e.target.value)}
                />
              </label>
              <label className="compra-tu-bono-field">
                <span>Teléfono (opcional)</span>
                <input
                  className="compra-tu-bono-input"
                  value={telefonoFact}
                  onChange={(e) => setTelefonoFact(e.target.value)}
                />
              </label>
            </div>
          )}
        </section>

        {/* Resumen */}
        <section className="compra-tu-bono-section compra-tu-bono-summary">
          <div className="compra-tu-bono-summary-row">
            <span>Total redimible (sin IVA)</span>
            <strong>{money(totalBase)}</strong>
          </div>
          <div className="compra-tu-bono-summary-row">
            <span>IVA (19%)</span>
            <strong>{money(totalIVA)}</strong>
          </div>
          <div className="compra-tu-bono-summary-row compra-tu-bono-summary-total">
            <span>Total a pagar</span>
            <strong>{money(totalConIVA)}</strong>
          </div>
        </section>

        {/* Estados */}
        {error && (
          <div className="compra-tu-bono-error" role="alert">
            {error}
          </div>
        )}

        {/* Submit */}
        <div className="compra-tu-bono-actions">
          <button className="compra-tu-bono-submit" type="submit" disabled={loading}>
            {loading ? "Procesando..." : "Comprar bonos"}
          </button>
        </div>

        {/* Nota de uso */}
        <footer className="compra-tu-bono-footer">
          <p>
            Los bonos tienen validez de 1 año. Para redimirlos, visita{" "}
            <a href="https://glamperos.com" target="_blank" rel="noreferrer">
              glamperos.com
            </a>{" "}
            y confirma disponibilidad del glamping escribiendo al WhatsApp{" "}
            <a href="https://wa.me/573218695196" target="_blank" rel="noreferrer">
              321 869 5196
            </a>.
          </p>
        </footer>
      </form>
    </div>
  );
}
