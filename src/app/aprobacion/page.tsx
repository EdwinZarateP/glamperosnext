'use client';

import React, { useMemo, useState } from 'react';
import Cookies from 'js-cookie';
import './estilos.css';

/* ======================= Tipos ======================= */
type Bono = {
  id: string;
  codigo_unico: string;
  valor: number;
  iva: number;
  total_valor_bono: number;
  estado: 'pendiente_aprobacion' | 'activo' | 'redimido' | 'rechazado';
  fechaCompra?: string;
  fechaVencimiento?: string;
  fechaRedencion?: string;
  _usuario: string;
  email_comprador: string;
  cedula_o_nit: string;
  requiere_factura_electronica?: boolean;
  datos_facturacion?: any;
  email_usuario_redime?: string | null;
  soporte_pago_url?: string | null;
  pdf_bono_url?: string | null;
  factura_url?: string | null;
  activado_por?: string | null;
  fecha_activacion?: string | null;
  compra_lote_id?: string | null;
};

/* ======================= Utils ======================= */
const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '') || '';

function fmtMoney(v?: number) {
  if (v === undefined || v === null) return '';
  return v.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
}

async function apiJson<T = any>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      ...(init?.headers || {}),
      ...(init?.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    },
  });
  const ct = res.headers.get('content-type') || '';
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(txt || `${res.status} ${res.statusText}`);
  }
  if (!ct.includes('application/json')) {
    const txt = await res.text().catch(() => '');
    throw new Error(`Respuesta no JSON (${res.status}). Primeros 120 chars: ${txt.slice(0, 120)}`);
  }
  return res.json();
}

/* ============ Acordeón simple (desplegable) ============ */
function Accordion({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className={`aprobacion-accordion ${open ? 'aprobacion-accordion--open' : ''}`}>
      <button className="aprobacion-accordion-header" onClick={onToggle} type="button">
        <span className="aprobacion-accordion-title">{title}</span>
        <span className="aprobacion-accordion-icon">{open ? '▾' : '▸'}</span>
      </button>
      {open && <div className="aprobacion-accordion-body">{children}</div>}
    </div>
  );
}

/* ======================= Página ======================= */
export default function Aprobacion() {
  const rolUsuario = Cookies.get('rolUsuario');
  const isAdmin = rolUsuario === 'admin';
  const idUsuario = (Cookies.get('idUsuario') || '').trim();

  /* ---------- Tabs ---------- */
  const [tab, setTab] = useState<'lote' | 'individual' | 'consultas'>('lote');

  /* ---------- Mensajes comunes ---------- */
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function notifyOk(msg: string) {
    setMensaje(msg);
    setError(null);
  }
  function notifyErr(err: unknown) {
    const text = err instanceof Error ? err.message : String(err);
    setError(text);
    setMensaje(null);
  }

  /* =====================================================
   * LOTE — cada sección con sus propios inputs
   * ===================================================== */

  // Cargar Lote
  const [loteIdCargar, setLoteIdCargar] = useState('');
  const [bonosDelLote, setBonosDelLote] = useState<Bono[]>([]);
  const [openCargar, setOpenCargar] = useState(true);

  async function cargarLote() {
    if (!loteIdCargar.trim()) return notifyErr('Debes ingresar compra_lote_id');
    setCargando(true);
    setMensaje(null);
    setError(null);
    try {
      const data = await apiJson<Bono[]>(`/bonos/compras/${encodeURIComponent(loteIdCargar.trim())}`);
      setBonosDelLote(data);
      notifyOk(`Lote ${loteIdCargar} cargado. Bonos: ${data.length}`);
    } catch (e) {
      setBonosDelLote([]);
      notifyErr(e);
    } finally {
      setCargando(false);
    }
  }

  // Aprobar Lote
  const [openAprobarLote, setOpenAprobarLote] = useState(false);
  const [loteIdAprobar, setLoteIdAprobar] = useState('');
  const [obsLote, setObsLote] = useState('');
  const [facturaLote, setFacturaLote] = useState<File | null>(null);

  async function aprobarLote() {
    if (!loteIdAprobar.trim()) return notifyErr('Debes ingresar compra_lote_id');
    if (!idUsuario) return notifyErr('No se encontró idUsuario en cookies');

    setCargando(true);
    setMensaje(null);
    setError(null);
    try {
      const fd = new FormData();
      if (facturaLote) fd.append('factura_pdf', facturaLote);

      const params = new URLSearchParams({
        id_usuario_admin: idUsuario,
        ...(obsLote ? { observacion: obsLote } : {}),
      });

      const res = await fetch(
        `${API_BASE}/bonos/compras/${encodeURIComponent(loteIdAprobar.trim())}/aprobar?${params.toString()}`,
        { method: 'POST', body: fd }
      );
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      notifyOk(json?.mensaje || 'Lote aprobado.');
      // si justo es el mismo del panel "Cargar", refrescamos tabla
      if (loteIdAprobar.trim() === loteIdCargar.trim()) await cargarLote();
    } catch (e) {
      notifyErr(e);
    } finally {
      setCargando(false);
    }
  }

  // Rechazar Lote
  const [openRechazarLote, setOpenRechazarLote] = useState(false);
  const [loteIdRechazar, setLoteIdRechazar] = useState('');
  const [motivoRechazoLote, setMotivoRechazoLote] = useState('');

  async function rechazarLote() {
    if (!loteIdRechazar.trim()) return notifyErr('Debes ingresar compra_lote_id');
    if (!motivoRechazoLote.trim()) return notifyErr('Debes ingresar el motivo del rechazo');
    if (!idUsuario) return notifyErr('No se encontró idUsuario en cookies');

    setCargando(true);
    setMensaje(null);
    setError(null);
    try {
      const params = new URLSearchParams({
        id_usuario_admin: idUsuario,
        motivo: motivoRechazoLote.trim(),
      });
      const res = await fetch(
        `${API_BASE}/bonos/compras/${encodeURIComponent(loteIdRechazar.trim())}/rechazar?${params.toString()}`,
        { method: 'POST' }
      );
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      notifyOk(json?.mensaje || 'Lote rechazado.');
      if (loteIdRechazar.trim() === loteIdCargar.trim()) await cargarLote();
    } catch (e) {
      notifyErr(e);
    } finally {
      setCargando(false);
    }
  }

  // Reenviar Lote
  const [openReenviarLote, setOpenReenviarLote] = useState(false);
  const [loteIdReenviar, setLoteIdReenviar] = useState('');
  const [reenviarEmail, setReenviarEmail] = useState('');
  const [reenviarAdjuntarPDFs, setReenviarAdjuntarPDFs] = useState(false);
  const [reenviarRecrearPDF, setReenviarRecrearPDF] = useState(true);
  const [reenviarIncluirFactura, setReenviarIncluirFactura] = useState(true);

  async function reenviarLote() {
    if (!loteIdReenviar.trim()) return notifyErr('Debes ingresar compra_lote_id');
    setCargando(true);
    setMensaje(null);
    setError(null);
    try {
      const params = new URLSearchParams({
        ...(reenviarEmail ? { destinatario: reenviarEmail } : {}),
        adjuntar_pdfs: String(reenviarAdjuntarPDFs),
        recrear_si_falta_pdf: String(reenviarRecrearPDF),
        incluir_factura: String(reenviarIncluirFactura),
      });
      const res = await fetch(
        `${API_BASE}/bonos/compras/${encodeURIComponent(loteIdReenviar.trim())}/reenviar?${params.toString()}`,
        { method: 'POST' }
      );
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      notifyOk(json?.mensaje || 'Reenvío completado.');
    } catch (e) {
      notifyErr(e);
    } finally {
      setCargando(false);
    }
  }

  /* =====================================================
   * INDIVIDUAL — cada sección con sus inputs
   * ===================================================== */
  const [openBuscar, setOpenBuscar] = useState(true);
  const [codigoUnico, setCodigoUnico] = useState('');
  const [bono, setBono] = useState<Bono | null>(null);
  const [validacion, setValidacion] = useState<any>(null);

  async function buscarBonoPorCodigo() {
    if (!codigoUnico.trim()) return notifyErr('Debes ingresar el código');
    setCargando(true);
    setMensaje(null);
    setError(null);
    try {
      const data = await apiJson<Bono>(`/bonos/${encodeURIComponent(codigoUnico.trim())}`);
      setBono(data);
      notifyOk(`Bono ${data.codigo_unico} cargado.`);
    } catch (e) {
      setBono(null);
      notifyErr(e);
    } finally {
      setCargando(false);
    }
  }

  async function validarBono() {
    if (!codigoUnico.trim()) return notifyErr('Debes ingresar el código');
    setCargando(true);
    setMensaje(null);
    setError(null);
    try {
      const data = await apiJson(`/bonos/validar/${encodeURIComponent(codigoUnico.trim())}`);
      setValidacion(data);
      notifyOk('Validación consultada.');
    } catch (e) {
      setValidacion(null);
      notifyErr(e);
    } finally {
      setCargando(false);
    }
  }

  // Aprobar individual
  const [openAprobarInd, setOpenAprobarInd] = useState(false);
  const [obsIndividual, setObsIndividual] = useState('');
  const [facturaIndividual, setFacturaIndividual] = useState<File | null>(null);

  async function aprobarBonoIndividual() {
    if (!codigoUnico.trim()) return notifyErr('Debes ingresar el código del bono');
    if (!idUsuario) return notifyErr('No se encontró idUsuario en cookies');

    setCargando(true);
    setMensaje(null);
    setError(null);
    try {
      const fd = new FormData();
      if (facturaIndividual) fd.append('factura_pdf', facturaIndividual);

      const params = new URLSearchParams({
        id_usuario_admin: idUsuario,
        ...(obsIndividual ? { observacion: obsIndividual } : {}),
      });

      const res = await fetch(
        `${API_BASE}/bonos/${encodeURIComponent(codigoUnico.trim())}/aprobar?${params.toString()}`,
        { method: 'POST', body: fd }
      );
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      notifyOk(json?.mensaje || 'Bono aprobado.');
      await buscarBonoPorCodigo();
    } catch (e) {
      notifyErr(e);
    } finally {
      setCargando(false);
    }
  }

  // Rechazar individual
  const [openRechazarInd, setOpenRechazarInd] = useState(false);
  const [motivoRechazoInd, setMotivoRechazoInd] = useState('');

  async function rechazarBonoIndividual() {
    if (!codigoUnico.trim()) return notifyErr('Debes ingresar el código del bono');
    if (!motivoRechazoInd.trim()) return notifyErr('Debes ingresar el motivo del rechazo');
    if (!idUsuario) return notifyErr('No se encontró idUsuario en cookies');

    setCargando(true);
    setMensaje(null);
    setError(null);
    try {
      const params = new URLSearchParams({
        id_usuario_admin: idUsuario,
        motivo: motivoRechazoInd.trim(),
      });
      const res = await fetch(
        `${API_BASE}/bonos/${encodeURIComponent(codigoUnico.trim())}/rechazar?${params.toString()}`,
        { method: 'POST' }
      );
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      notifyOk(json?.mensaje || 'Bono rechazado.');
      await buscarBonoPorCodigo();
    } catch (e) {
      notifyErr(e);
    } finally {
      setCargando(false);
    }
  }

  // Redimir
  const [openRedimir, setOpenRedimir] = useState(false);
  const [redimirUsuarioId, setRedimirUsuarioId] = useState('');
  const [redimirEmail, setRedimirEmail] = useState('');

  async function redimirBono() {
    if (!codigoUnico.trim()) return notifyErr('Debes ingresar el código del bono');
    if (!redimirUsuarioId.trim()) return notifyErr('Debes ingresar id_usuario para redimir');
    setCargando(true);
    setMensaje(null);
    setError(null);
    try {
      const body = JSON.stringify({
        codigo_unico: codigoUnico.trim(),
        id_usuario: redimirUsuarioId.trim(),
        email_usuario_redime: redimirEmail.trim() || undefined,
      });
      const data = await apiJson(`/bonos/redimir`, { method: 'POST', body });
      notifyOk((data as any)?.mensaje || 'Bono redimido.');
      await buscarBonoPorCodigo();
    } catch (e) {
      notifyErr(e);
    } finally {
      setCargando(false);
    }
  }

  /* =====================================================
   * CONSULTAS
   * ===================================================== */
  const [openConsultas, setOpenConsultas] = useState(true);
  const [compradorId, setCompradorId] = useState('');
  const [bonosPorComprador, setBonosPorComprador] = useState<Bono[]>([]);

  async function listarPorComprador() {
    if (!compradorId.trim()) return notifyErr('Debes ingresar id_usuario');
    setCargando(true);
    setMensaje(null);
    setError(null);
    try {
      const data = await apiJson<Bono[]>(`/bonos/comprados/${encodeURIComponent(compradorId.trim())}`);
      setBonosPorComprador(data);
      notifyOk(`Bonos del comprador ${compradorId}: ${data.length}`);
    } catch (e) {
      setBonosPorComprador([]);
      notifyErr(e);
    } finally {
      setCargando(false);
    }
  }

  /* ---------- Bloqueo por rol ---------- */
  const bloqueado = useMemo(() => !isAdmin, [isAdmin]);

  if (bloqueado) {
    return (
      <main className="aprobacion-layout">
        <div className="aprobacion-card aprobacion-card--restriccion">
          <h1 className="aprobacion-titulo">Área restringida</h1>
          <p className="aprobacion-texto">
            Debes tener rol <b>admin</b> para ver esta página.
          </p>
        </div>
      </main>
    );
  }

  /* ======================= UI ======================= */
  return (
    <main className="aprobacion-layout">
      <header className="aprobacion-header">
        <h1 className="aprobacion-titulo">Gestión de Bonos — Admin</h1>
        <p className="aprobacion-subtitulo">Aprobar / Rechazar / Reenviar / Validar / Redimir / Consultar</p>
      </header>

      <nav className="aprobacion-tabs">
        <button
          className={`aprobacion-tab ${tab === 'lote' ? 'aprobacion-tab--activa' : ''}`}
          onClick={() => setTab('lote')}
        >
          Por Lote
        </button>
        <button
          className={`aprobacion-tab ${tab === 'individual' ? 'aprobacion-tab--activa' : ''}`}
          onClick={() => setTab('individual')}
        >
          Individual
        </button>
        <button
          className={`aprobacion-tab ${tab === 'consultas' ? 'aprobacion-tab--activa' : ''}`}
          onClick={() => setTab('consultas')}
        >
          Consultas
        </button>
      </nav>

      {(mensaje || error) && (
        <div className={`aprobacion-alert ${error ? 'aprobacion-alert--error' : 'aprobacion-alert--ok'}`}>
          {error || mensaje}
        </div>
      )}
      {cargando && <div className="aprobacion-cargando">Procesando...</div>}

      {/* ==================== TAB LOTE ==================== */}
      {tab === 'lote' && (
        <section className="aprobacion-seccion">
          <Accordion title="Cargar Lote" open={openCargar} onToggle={() => setOpenCargar((v) => !v)}>
            <div className="aprobacion-form-grupo">
              <label className="aprobacion-label">compra_lote_id</label>
              <input
                className="aprobacion-input"
                value={loteIdCargar}
                onChange={(e) => setLoteIdCargar(e.target.value)}
                placeholder="64f1c... (ObjectId)"
              />
            </div>
            <button className="aprobacion-boton" onClick={cargarLote}>
              Cargar bonos del lote
            </button>

            <div className="aprobacion-card aprobacion-card--tabla">
              <h3 className="aprobacion-card-titulo">Bonos del Lote</h3>
              {!bonosDelLote.length ? (
                <p className="aprobacion-texto">Sin datos.</p>
              ) : (
                <div className="aprobacion-tabla-scroll">
                  <table className="aprobacion-tabla">
                    <thead>
                      <tr>
                        <th>Código</th>
                        <th>Estado</th>
                        <th>Valor</th>
                        <th>Vence</th>
                        <th>PDF</th>
                        <th>Factura</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bonosDelLote.map((b) => (
                        <tr key={b.id}>
                          <td>{b.codigo_unico}</td>
                          <td>{b.estado}</td>
                          <td>{fmtMoney(b.valor)}</td>
                          <td>{b.fechaVencimiento?.slice(0, 10) || '-'}</td>
                          <td>
                            {b.pdf_bono_url ? (
                              <a className="aprobacion-link" href={b.pdf_bono_url} target="_blank">
                                Ver
                              </a>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td>
                            {b.factura_url ? (
                              <a className="aprobacion-link" href={b.factura_url} target="_blank">
                                Ver
                              </a>
                            ) : (
                              '-'
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </Accordion>

          <Accordion title="Aprobar Lote" open={openAprobarLote} onToggle={() => setOpenAprobarLote((v) => !v)}>
            <div className="aprobacion-form-grupo">
              <label className="aprobacion-label">compra_lote_id</label>
              <input
                className="aprobacion-input"
                value={loteIdAprobar}
                onChange={(e) => setLoteIdAprobar(e.target.value)}
                placeholder="64f1c... (ObjectId)"
              />
            </div>
            <div className="aprobacion-form-grupo">
              <label className="aprobacion-label">Observación (opcional)</label>
              <input className="aprobacion-input" value={obsLote} onChange={(e) => setObsLote(e.target.value)} />
            </div>
            <div className="aprobacion-form-grupo">
              <label className="aprobacion-label">Factura (PDF/JPG/PNG/WEBP) opcional</label>
              <input
                className="aprobacion-input"
                type="file"
                onChange={(e) => setFacturaLote(e.target.files?.[0] || null)}
              />
            </div>
            <button className="aprobacion-boton aprobacion-boton--exito" onClick={aprobarLote}>
              Aprobar y notificar al comprador
            </button>
          </Accordion>

          <Accordion title="Rechazar Lote" open={openRechazarLote} onToggle={() => setOpenRechazarLote((v) => !v)}>
            <div className="aprobacion-form-grupo">
              <label className="aprobacion-label">compra_lote_id</label>
              <input
                className="aprobacion-input"
                value={loteIdRechazar}
                onChange={(e) => setLoteIdRechazar(e.target.value)}
                placeholder="64f1c... (ObjectId)"
              />
            </div>
            <div className="aprobacion-form-grupo">
              <label className="aprobacion-label">Motivo de rechazo</label>
              <input
                className="aprobacion-input"
                value={motivoRechazoLote}
                onChange={(e) => setMotivoRechazoLote(e.target.value)}
              />
            </div>
            <button className="aprobacion-boton aprobacion-boton--peligro" onClick={rechazarLote}>
              Rechazar y notificar al comprador
            </button>
          </Accordion>

          <Accordion title="Reenviar Lote" open={openReenviarLote} onToggle={() => setOpenReenviarLote((v) => !v)}>
            <div className="aprobacion-form-grupo">
              <label className="aprobacion-label">compra_lote_id</label>
              <input
                className="aprobacion-input"
                value={loteIdReenviar}
                onChange={(e) => setLoteIdReenviar(e.target.value)}
                placeholder="64f1c... (ObjectId)"
              />
            </div>
            <div className="aprobacion-form-grupo">
              <label className="aprobacion-label">Enviar a (opcional)</label>
              <input
                className="aprobacion-input"
                value={reenviarEmail}
                onChange={(e) => setReenviarEmail(e.target.value)}
                placeholder="Si está vacío, usa email del comprador"
              />
            </div>
            <div className="aprobacion-form-opciones">
              <label className="aprobacion-check">
                <input
                  type="checkbox"
                  checked={reenviarAdjuntarPDFs}
                  onChange={(e) => setReenviarAdjuntarPDFs(e.target.checked)}
                />
                Adjuntar PDFs
              </label>
              <label className="aprobacion-check">
                <input
                  type="checkbox"
                  checked={reenviarRecrearPDF}
                  onChange={(e) => setReenviarRecrearPDF(e.target.checked)}
                />
                Regenerar si falta PDF
              </label>
              <label className="aprobacion-check">
                <input
                  type="checkbox"
                  checked={reenviarIncluirFactura}
                  onChange={(e) => setReenviarIncluirFactura(e.target.checked)}
                />
                Incluir factura del lote
              </label>
            </div>
            <button className="aprobacion-boton" onClick={reenviarLote}>
              Reenviar
            </button>
          </Accordion>
        </section>
      )}

      {/* ==================== TAB INDIVIDUAL ==================== */}
      {tab === 'individual' && (
        <section className="aprobacion-seccion">
          <Accordion title="Buscar / Validar Bono" open={openBuscar} onToggle={() => setOpenBuscar((v) => !v)}>
            <div className="aprobacion-form-filera">
              <input
                className="aprobacion-input"
                value={codigoUnico}
                onChange={(e) => setCodigoUnico(e.target.value)}
                placeholder="Código único GLAM_XXXX"
              />
              <button className="aprobacion-boton" onClick={buscarBonoPorCodigo}>
                Buscar
              </button>
              <button className="aprobacion-boton" onClick={validarBono}>
                Validar
              </button>
            </div>

            {validacion && (
              <div className="aprobacion-panel">
                <pre className="aprobacion-pre">{JSON.stringify(validacion, null, 2)}</pre>
              </div>
            )}

            {bono && (
              <div className="aprobacion-panel">
                <div className="aprobacion-kpis">
                  <div className="aprobacion-kpi">
                    <span className="aprobacion-kpi-label">Estado</span>
                    <span className="aprobacion-kpi-valor">{bono.estado}</span>
                  </div>
                  <div className="aprobacion-kpi">
                    <span className="aprobacion-kpi-label">Valor redimible</span>
                    <span className="aprobacion-kpi-valor">{fmtMoney(bono.valor)}</span>
                  </div>
                  <div className="aprobacion-kpi">
                    <span className="aprobacion-kpi-label">Vence</span>
                    <span className="aprobacion-kpi-valor">{bono.fechaVencimiento?.slice(0, 10) || '-'}</span>
                  </div>
                </div>

                <div className="aprobacion-links">
                  {bono.soporte_pago_url && (
                    <a className="aprobacion-link" href={bono.soporte_pago_url} target="_blank">
                      Soporte
                    </a>
                  )}
                  {bono.pdf_bono_url && (
                    <a className="aprobacion-link" href={bono.pdf_bono_url} target="_blank">
                      PDF Bono
                    </a>
                  )}
                  {bono.factura_url && (
                    <a className="aprobacion-link" href={bono.factura_url} target="_blank">
                      Factura
                    </a>
                  )}
                </div>
              </div>
            )}
          </Accordion>

          <Accordion title="Aprobar Bono" open={openAprobarInd} onToggle={() => setOpenAprobarInd((v) => !v)}>
            <div className="aprobacion-form-grupo">
              <label className="aprobacion-label">Observación (opcional)</label>
              <input
                className="aprobacion-input"
                value={obsIndividual}
                onChange={(e) => setObsIndividual(e.target.value)}
              />
            </div>
            <div className="aprobacion-form-grupo">
              <label className="aprobacion-label">Factura (opcional)</label>
              <input
                className="aprobacion-input"
                type="file"
                onChange={(e) => setFacturaIndividual(e.target.files?.[0] || null)}
              />
            </div>
            <button className="aprobacion-boton aprobacion-boton--exito" onClick={aprobarBonoIndividual}>
              Aprobar
            </button>
          </Accordion>

          <Accordion title="Rechazar Bono" open={openRechazarInd} onToggle={() => setOpenRechazarInd((v) => !v)}>
            <div className="aprobacion-form-grupo">
              <label className="aprobacion-label">Motivo</label>
              <input
                className="aprobacion-input"
                value={motivoRechazoInd}
                onChange={(e) => setMotivoRechazoInd(e.target.value)}
              />
            </div>
            <button className="aprobacion-boton aprobacion-boton--peligro" onClick={rechazarBonoIndividual}>
              Rechazar
            </button>
          </Accordion>

          <Accordion title="Redimir Bono" open={openRedimir} onToggle={() => setOpenRedimir((v) => !v)}>
            <div className="aprobacion-form-grupo">
              <label className="aprobacion-label">id_usuario (quien redime)</label>
              <input
                className="aprobacion-input"
                value={redimirUsuarioId}
                onChange={(e) => setRedimirUsuarioId(e.target.value)}
              />
            </div>
            <div className="aprobacion-form-grupo">
              <label className="aprobacion-label">Email (opcional)</label>
              <input
                className="aprobacion-input"
                value={redimirEmail}
                onChange={(e) => setRedimirEmail(e.target.value)}
              />
            </div>
            <button className="aprobacion-boton" onClick={redimirBono}>
              Redimir
            </button>
          </Accordion>
        </section>
      )}

      {/* ==================== TAB CONSULTAS ==================== */}
      {tab === 'consultas' && (
        <section className="aprobacion-seccion">
          <Accordion title="Listar por Comprador" open={openConsultas} onToggle={() => setOpenConsultas((v) => !v)}>
            <div className="aprobacion-form-filera">
              <input
                className="aprobacion-input"
                value={compradorId}
                onChange={(e) => setCompradorId(e.target.value)}
                placeholder="id_usuario"
              />
              <button className="aprobacion-boton" onClick={listarPorComprador}>
                Buscar
              </button>
            </div>

            {!bonosPorComprador.length ? (
              <p className="aprobacion-texto">Sin resultados.</p>
            ) : (
              <div className="aprobacion-tabla-scroll">
                <table className="aprobacion-tabla">
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Estado</th>
                      <th>Valor</th>
                      <th>Vence</th>
                      <th>Lote</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bonosPorComprador.map((b) => (
                      <tr key={b.id}>
                        <td>{b.codigo_unico}</td>
                        <td>{b.estado}</td>
                        <td>{fmtMoney(b.valor)}</td>
                        <td>{b.fechaVencimiento?.slice(0, 10) || '-'}</td>
                        <td>{b.compra_lote_id || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Accordion>
        </section>
      )}
    </main>
  );
}
