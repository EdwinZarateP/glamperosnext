// src/app/aseo/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import "./estilos.css";

export const dynamic = "force-dynamic"; // evita cachés inesperados en App Router

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;

// ✅ Ajuste por API: incluye AMBOS
type Persona = "HOMBRE" | "MUJER" | "AMBOS";

type Tarea = {
  id: string;
  pareja_id: string;
  nombre_tarea: string;
  activa: boolean;
  creada_en: string;
};

type Registro = {
  id: string;
  pareja_id: string;
  tarea_id: string;
  fecha: string; // YYYY-MM-DD
  completado: boolean;
  realizado_por?: Persona | null;
  actualizado_en: string;
};

// ✅ Ajuste por API: incluye ambos en totales/porcentajes/detalle
type Estadisticas = {
  pareja_id: string;
  rango: { desde: string | null; hasta: string | null };
  totales: {
    total_actividades_completadas: number;
    hombre: number;
    mujer: number;
    ambos: number;
  };
  porcentajes: { hombre: number; mujer: number; ambos: number };
  detalle: {
    hombre: Array<{ fecha: string; tarea_id: string; tarea: string }>;
    mujer: Array<{ fecha: string; tarea_id: string; tarea: string }>;
    ambos: Array<{ fecha: string; tarea_id: string; tarea: string }>;
  };
};

function hoyISO(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function PageAseo() {
  const cookieParejaId = Cookies.get("parejaId") || "";
  const [parejaId, setParejaId] = useState<string>(cookieParejaId);

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string>("");

  // Tareas
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [nuevaTarea, setNuevaTarea] = useState("");

  // Día
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>(hoyISO());
  const [registrosDelDia, setRegistrosDelDia] = useState<Record<string, Registro>>({});

  // ✅ Porcentaje del día (siempre visible)
  const [porcentajeDia, setPorcentajeDia] = useState<Estadisticas | null>(null);

  // ✅ Modal de resumen (visor)
  const [modalAbierto, setModalAbierto] = useState(false);

  const tareasActivas = useMemo(() => tareas.filter((t) => t.activa), [tareas]);

  useEffect(() => {
    try {
      const guardado = localStorage.getItem("aseo_pareja_id") || "";
      if (!cookieParejaId && guardado) setParejaId(guardado);
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      if (parejaId) localStorage.setItem("aseo_pareja_id", parejaId);
    } catch {}
  }, [parejaId]);

  async function cargarTareas() {
    if (!parejaId) return;
    setError("");
    try {
      setCargando(true);
      const res = await fetch(
        `${API_BASE}/aseo/tareas?pareja_id=${encodeURIComponent(parejaId)}&solo_activas=false`
      );
      if (!res.ok) throw new Error("No se pudieron cargar las tareas.");
      const data = (await res.json()) as Tarea[];
      setTareas(data);
    } catch (e: any) {
      setError(e?.message || "Error cargando tareas.");
    } finally {
      setCargando(false);
    }
  }

  async function cargarRegistrosDia() {
    if (!parejaId) return;
    setError("");
    try {
      setCargando(true);
      const url = `${API_BASE}/aseo/registros?pareja_id=${encodeURIComponent(
        parejaId
      )}&fecha=${encodeURIComponent(fechaSeleccionada)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("No se pudieron cargar los registros del día.");
      const data = (await res.json()) as Registro[];

      const map: Record<string, Registro> = {};
      for (const r of data) map[r.tarea_id] = r;
      setRegistrosDelDia(map);
    } catch (e: any) {
      setError(e?.message || "Error cargando registros.");
    } finally {
      setCargando(false);
    }
  }

  // ✅ Estadísticas SOLO del día seleccionado: desde=fechaSeleccionada hasta=fechaSeleccionada
  async function cargarPorcentajeDelDia() {
    if (!parejaId) return;
    setError("");
    try {
      setCargando(true);
      const qs = new URLSearchParams({
        pareja_id: parejaId,
        desde: fechaSeleccionada,
        hasta: fechaSeleccionada,
      });
      const res = await fetch(`${API_BASE}/aseo/estadisticas?${qs.toString()}`);
      if (!res.ok) throw new Error("No se pudo cargar el porcentaje del día.");
      const data = (await res.json()) as Estadisticas;
      setPorcentajeDia(data);
    } catch (e: any) {
      setError(e?.message || "Error cargando porcentaje del día.");
      setPorcentajeDia(null);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    if (!parejaId) return;
    cargarTareas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parejaId]);

  useEffect(() => {
    if (!parejaId) return;
    (async () => {
      await cargarRegistrosDia();
      await cargarPorcentajeDelDia();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parejaId, fechaSeleccionada]);

  async function crearTarea() {
    if (!parejaId) {
      setError("Debes indicar el ID de la pareja.");
      return;
    }
    const nombre = nuevaTarea.trim();
    if (!nombre) return;

    setError("");
    try {
      setCargando(true);
      await axios.post(`${API_BASE}/aseo/tareas`, {
        pareja_id: parejaId,
        nombre_tarea: nombre,
        activa: true,
      });
      setNuevaTarea("");
      await cargarTareas();
    } catch (e: any) {
      const msg = e?.response?.data?.detail || "No se pudo crear la tarea.";
      setError(msg);
    } finally {
      setCargando(false);
    }
  }

  async function toggleActiva(tarea: Tarea) {
    setError("");
    try {
      setCargando(true);
      await axios.patch(`${API_BASE}/aseo/tareas/${tarea.id}`, { activa: !tarea.activa });
      await cargarTareas();
    } catch (e: any) {
      const msg = e?.response?.data?.detail || "No se pudo actualizar la tarea.";
      setError(msg);
    } finally {
      setCargando(false);
    }
  }

  async function marcar(tareaId: string, persona: Persona) {
    if (!parejaId) return;
    setError("");
    try {
      setCargando(true);
      await axios.put(`${API_BASE}/aseo/registros`, {
        pareja_id: parejaId,
        tarea_id: tareaId,
        fecha: fechaSeleccionada,
        realizado_por: persona,
        completado: true,
      });
      await cargarRegistrosDia();
      await cargarPorcentajeDelDia();
    } catch (e: any) {
      const msg = e?.response?.data?.detail || "No se pudo guardar el registro.";
      setError(msg);
    } finally {
      setCargando(false);
    }
  }

  // ✅ “Limpiar” pasa a ser acción de cesto (desmarcar)
  async function tirarAlCesto(tareaId: string) {
    if (!parejaId) return;
    setError("");
    try {
      setCargando(true);
      await axios.put(`${API_BASE}/aseo/registros`, {
        pareja_id: parejaId,
        tarea_id: tareaId,
        fecha: fechaSeleccionada,
        completado: false,
      });
      await cargarRegistrosDia();
      await cargarPorcentajeDelDia();
    } catch (e: any) {
      const msg = e?.response?.data?.detail || "No se pudo desmarcar.";
      setError(msg);
    } finally {
      setCargando(false);
    }
  }

  function etiquetaPersona(p?: Persona | null): string {
    if (!p) return "—";
    if (p === "HOMBRE") return "Él";
    if (p === "MUJER") return "Ella";
    return "Ambos";
  }

  return (
    <main className="Aseo">
      {/* ✅ No indexable (además del robots.tsx) */}
      <meta name="robots" content="noindex,nofollow" />

      <header className="Aseo-header">
        <div className="Aseo-headerTop">
          <h1 className="Aseo-title">Aseo en casa</h1>
          <p className="Aseo-subtitle">
            Tareas del hogar por día. Marca quién lo hizo (Él / Ella / Ambos) y mira el balance del día.
          </p>
        </div>

        <div className="Aseo-parejaCard">
          <label className="Aseo-label">
            ID del hogar
            <input
              className="Aseo-input"
              value={parejaId}
              onChange={(e) => setParejaId(e.target.value)}
              placeholder="Ej: hogar_001"
              inputMode="text"
            />
          </label>

          <button
            className="Aseo-btn Aseo-btnSecondary"
            onClick={() => {
              cargarTareas();
              cargarRegistrosDia();
              cargarPorcentajeDelDia();
            }}
          >
            Actualizar
          </button>
        </div>

        {error ? <div className="Aseo-alert Aseo-alertError">{error}</div> : null}
        {cargando ? <div className="Aseo-alert Aseo-alertInfo">Cargando…</div> : null}
      </header>

      <section className="Aseo-grid">
        {/* Panel: Día + lista */}
        <div className="Aseo-card">
          <div className="Aseo-cardHeader Aseo-cardHeaderRow">
            <div>
              <h2 className="Aseo-cardTitle">Hoy en casa</h2>
              <p className="Aseo-cardHint">Selecciona una fecha y marca tareas completadas.</p>
            </div>

            {/* ✅ Chip hogareño con porcentaje del día (siempre visible) */}
            <button
              className="Aseo-chip"
              onClick={() => setModalAbierto(true)}
              disabled={!porcentajeDia}
              title="Ver resumen del día"
            >
              <span className="Aseo-chipIcon" aria-hidden="true">🏡</span>
              <span className="Aseo-chipText">
                {porcentajeDia
                  ? `Él ${porcentajeDia.porcentajes.hombre}% · Ella ${porcentajeDia.porcentajes.mujer}% · Ambos ${porcentajeDia.porcentajes.ambos}%`
                  : "Resumen del día"}
              </span>
            </button>
          </div>

          <div className="Aseo-dateRow">
            <label className="Aseo-label Aseo-labelInline">
              Fecha
              <input
                className="Aseo-input Aseo-inputDate"
                type="date"
                value={fechaSeleccionada}
                onChange={(e) => setFechaSeleccionada(e.target.value)}
              />
            </label>

            <button className="Aseo-btn" onClick={() => setModalAbierto(true)} disabled={!porcentajeDia}>
              Ver resumen
            </button>
          </div>

          <div className="Aseo-taskList">
            {tareasActivas.length === 0 ? (
              <div className="Aseo-empty">No hay tareas activas. Crea una abajo.</div>
            ) : (
              tareasActivas.map((t) => {
                const reg = registrosDelDia[t.id];
                const hecho = !!reg?.completado;
                const quien = reg?.realizado_por || null;

                return (
                  <div className="Aseo-taskRow" key={t.id}>
                    <div className="Aseo-taskInfo">
                      <div className="Aseo-taskName">{t.nombre_tarea}</div>
                      <div className="Aseo-taskMeta">
                        {hecho ? (
                          <span className="Aseo-pill Aseo-pillDone">
                            Hecho: {etiquetaPersona(quien)}
                          </span>
                        ) : (
                          <span className="Aseo-pill">Pendiente</span>
                        )}
                      </div>
                    </div>

                    <div className="Aseo-taskActions">
                      <button className="Aseo-btn Aseo-btnSmall" onClick={() => marcar(t.id, "HOMBRE")}>
                        Él
                      </button>
                      <button className="Aseo-btn Aseo-btnSmall" onClick={() => marcar(t.id, "MUJER")}>
                        Ella
                      </button>
                      <button className="Aseo-btn Aseo-btnSmall" onClick={() => marcar(t.id, "AMBOS")}>
                        Ambos
                      </button>

                      {/* ✅ Cesto de basura en vez de “Limpiar” */}
                      <button
                        className="Aseo-iconBtn"
                        onClick={() => tirarAlCesto(t.id)}
                        aria-label="Tirar al cesto (desmarcar)"
                        title="Tirar al cesto (desmarcar)"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Panel: Crear / administrar */}
        <div className="Aseo-card">
          <div className="Aseo-cardHeader">
            <h2 className="Aseo-cardTitle">Tareas del hogar</h2>
            <p className="Aseo-cardHint">Crea tareas y activa/desactiva. (Desactivar no borra historial)</p>
          </div>

          <div className="Aseo-createRow">
            <input
              className="Aseo-input"
              value={nuevaTarea}
              onChange={(e) => setNuevaTarea(e.target.value)}
              placeholder="Ej: Lavar platos"
            />
            <button className="Aseo-btn" onClick={crearTarea}>
              Crear
            </button>
          </div>

          <div className="Aseo-taskAdminList">
            {tareas.length === 0 ? (
              <div className="Aseo-empty">Aún no tienes tareas.</div>
            ) : (
              tareas
                .slice()
                .sort((a, b) => a.nombre_tarea.localeCompare(b.nombre_tarea))
                .map((t) => (
                  <div className="Aseo-adminRow" key={t.id}>
                    <div className="Aseo-adminInfo">
                      <div className="Aseo-adminName">{t.nombre_tarea}</div>
                      <div className="Aseo-adminMeta">{t.activa ? "Activa" : "Inactiva"}</div>
                    </div>

                    <button
                      className={`Aseo-btn Aseo-btnSmall ${t.activa ? "Aseo-btnSecondary" : ""}`}
                      onClick={() => toggleActiva(t)}
                    >
                      {t.activa ? "Desactivar" : "Activar"}
                    </button>
                  </div>
                ))
            )}
          </div>
        </div>
      </section>

      {/* ✅ MODAL: visor con resumen del día */}
      {modalAbierto ? (
        <div className="Aseo-modalOverlay" role="dialog" aria-modal="true" aria-label="Resumen del día">
          <div className="Aseo-modalCard">
            <div className="Aseo-modalHeader">
              <div>
                <div className="Aseo-modalTitle">Resumen del día</div>
                <div className="Aseo-modalSub">{fechaSeleccionada}</div>
              </div>
              <button className="Aseo-iconBtn" onClick={() => setModalAbierto(false)} aria-label="Cerrar" title="Cerrar">
                ✕
              </button>
            </div>

            {porcentajeDia ? (
              <>
                <div className="Aseo-modalStats">
                  <div className="Aseo-statCard">
                    <div className="Aseo-statTitle">Él</div>
                    <div className="Aseo-statValue">{porcentajeDia.porcentajes.hombre}%</div>
                    <div className="Aseo-statMeta">{porcentajeDia.totales.hombre} tareas</div>
                  </div>

                  <div className="Aseo-statCard">
                    <div className="Aseo-statTitle">Ella</div>
                    <div className="Aseo-statValue">{porcentajeDia.porcentajes.mujer}%</div>
                    <div className="Aseo-statMeta">{porcentajeDia.totales.mujer} tareas</div>
                  </div>

                  <div className="Aseo-statCard">
                    <div className="Aseo-statTitle">Ambos</div>
                    <div className="Aseo-statValue">{porcentajeDia.porcentajes.ambos}%</div>
                    <div className="Aseo-statMeta">{porcentajeDia.totales.ambos} tareas</div>
                  </div>

                  <div className="Aseo-statCard">
                    <div className="Aseo-statTitle">Total</div>
                    <div className="Aseo-statValue">{porcentajeDia.totales.total_actividades_completadas}</div>
                    <div className="Aseo-statMeta">completadas</div>
                  </div>
                </div>

                <div className="Aseo-detailWrap Aseo-detailWrapModal">
                  <div className="Aseo-detailCol">
                    <h3 className="Aseo-detailTitle">Él hizo</h3>
                    <div className="Aseo-detailList">
                      {porcentajeDia.detalle.hombre.length === 0 ? (
                        <div className="Aseo-emptySmall">Sin tareas.</div>
                      ) : (
                        porcentajeDia.detalle.hombre.map((x, idx) => (
                          <div className="Aseo-detailItem" key={`${x.tarea_id}-${x.fecha}-${idx}`}>
                            <span className="Aseo-detailDate">{x.fecha}</span>
                            <span className="Aseo-detailTask">{x.tarea}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="Aseo-detailCol">
                    <h3 className="Aseo-detailTitle">Ella hizo</h3>
                    <div className="Aseo-detailList">
                      {porcentajeDia.detalle.mujer.length === 0 ? (
                        <div className="Aseo-emptySmall">Sin tareas.</div>
                      ) : (
                        porcentajeDia.detalle.mujer.map((x, idx) => (
                          <div className="Aseo-detailItem" key={`${x.tarea_id}-${x.fecha}-${idx}`}>
                            <span className="Aseo-detailDate">{x.fecha}</span>
                            <span className="Aseo-detailTask">{x.tarea}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="Aseo-detailCol">
                    <h3 className="Aseo-detailTitle">Ambos hicieron</h3>
                    <div className="Aseo-detailList">
                      {porcentajeDia.detalle.ambos.length === 0 ? (
                        <div className="Aseo-emptySmall">Sin tareas.</div>
                      ) : (
                        porcentajeDia.detalle.ambos.map((x, idx) => (
                          <div className="Aseo-detailItem" key={`${x.tarea_id}-${x.fecha}-${idx}`}>
                            <span className="Aseo-detailDate">{x.fecha}</span>
                            <span className="Aseo-detailTask">{x.tarea}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div className="Aseo-modalFooter">
                  <button className="Aseo-btn Aseo-btnSecondary" onClick={() => cargarPorcentajeDelDia()}>
                    Actualizar resumen
                  </button>
                  <button className="Aseo-btn" onClick={() => setModalAbierto(false)}>
                    Listo
                  </button>
                </div>
              </>
            ) : (
              <div className="Aseo-empty">No hay datos del día para mostrar aún.</div>
            )}
          </div>
        </div>
      ) : null}
    </main>
  );
}
