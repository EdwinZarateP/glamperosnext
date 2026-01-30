// src/app/aseo/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import "./estilos.css";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;

type Persona = "HOMBRE" | "MUJER";

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

type Estadisticas = {
  pareja_id: string;
  rango: { desde: string | null; hasta: string | null };
  totales: {
    total_actividades_completadas: number;
    hombre: number;
    mujer: number;
  };
  porcentajes: { hombre: number; mujer: number };
  detalle: {
    hombre: Array<{ fecha: string; tarea_id: string; tarea: string }>;
    mujer: Array<{ fecha: string; tarea_id: string; tarea: string }>;
  };
};

function hoyISO(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function inicioMesISO(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${yyyy}-${mm}-01`;
}

export default function PageAseo() {
  // pareja_id: intenta tomar cookie (si existe) y si no, guarda/lee localStorage
  const cookieParejaId = Cookies.get("parejaId") || "";
  const [parejaId, setParejaId] = useState<string>(cookieParejaId);

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string>("");

  // Tareas
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [nuevaTarea, setNuevaTarea] = useState("");

  // Calendario / registros del día
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>(hoyISO());
  const [registrosDelDia, setRegistrosDelDia] = useState<Record<string, Registro>>({});

  // Estadísticas
  const [desde, setDesde] = useState<string>(inicioMesISO());
  const [hasta, setHasta] = useState<string>(hoyISO());
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null);

  const tareasActivas = useMemo(() => tareas.filter((t) => t.activa), [tareas]);

  // Persistencia parejaId en localStorage (para que en móvil no lo pierda)
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
      const res = await fetch(`${API_BASE}/aseo/tareas?pareja_id=${encodeURIComponent(parejaId)}&solo_activas=false`);
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
      const url = `${API_BASE}/aseo/registros?pareja_id=${encodeURIComponent(parejaId)}&fecha=${encodeURIComponent(
        fechaSeleccionada
      )}`;
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

  async function cargarEstadisticas() {
    if (!parejaId) return;
    setError("");
    try {
      setCargando(true);
      const qs = new URLSearchParams({
        pareja_id: parejaId,
        ...(desde ? { desde } : {}),
        ...(hasta ? { hasta } : {}),
      });
      const res = await fetch(`${API_BASE}/aseo/estadisticas?${qs.toString()}`);
      if (!res.ok) throw new Error("No se pudieron cargar las estadísticas.");
      const data = (await res.json()) as Estadisticas;
      setEstadisticas(data);
    } catch (e: any) {
      setError(e?.message || "Error cargando estadísticas.");
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
    cargarRegistrosDia();
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
      // opcional: refrescar estadísticas si ya están cargadas
      if (estadisticas) await cargarEstadisticas();
    } catch (e: any) {
      const msg = e?.response?.data?.detail || "No se pudo guardar el registro.";
      setError(msg);
    } finally {
      setCargando(false);
    }
  }

  async function limpiar(tareaId: string) {
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
      if (estadisticas) await cargarEstadisticas();
    } catch (e: any) {
      const msg = e?.response?.data?.detail || "No se pudo desmarcar.";
      setError(msg);
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="Aseo">
      <header className="Aseo-header">
        <div className="Aseo-headerTop">
          <h1 className="Aseo-title">Aseo en pareja</h1>
          <p className="Aseo-subtitle">Crea tareas, marca quién las hizo por día y revisa participación.</p>
        </div>

        <div className="Aseo-parejaCard">
          <label className="Aseo-label">
            ID de la pareja
            <input
              className="Aseo-input"
              value={parejaId}
              onChange={(e) => setParejaId(e.target.value)}
              placeholder="Ej: pareja_001"
              inputMode="text"
            />
          </label>

          <button className="Aseo-btn Aseo-btnSecondary" onClick={() => { cargarTareas(); cargarRegistrosDia(); }}>
            Actualizar
          </button>
        </div>

        {error ? <div className="Aseo-alert Aseo-alertError">{error}</div> : null}
        {cargando ? <div className="Aseo-alert Aseo-alertInfo">Cargando…</div> : null}
      </header>

      <section className="Aseo-grid">
        {/* Panel: Calendario + marcar tareas */}
        <div className="Aseo-card">
          <div className="Aseo-cardHeader">
            <h2 className="Aseo-cardTitle">Calendario</h2>
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
            </div>
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
                            Hecho: {quien === "HOMBRE" ? "Hombre" : quien === "MUJER" ? "Mujer" : "—"}
                          </span>
                        ) : (
                          <span className="Aseo-pill">Pendiente</span>
                        )}
                      </div>
                    </div>

                    <div className="Aseo-taskActions">
                      <button className="Aseo-btn Aseo-btnSmall" onClick={() => marcar(t.id, "HOMBRE")}>
                        Hombre
                      </button>
                      <button className="Aseo-btn Aseo-btnSmall" onClick={() => marcar(t.id, "MUJER")}>
                        Mujer
                      </button>
                      <button className="Aseo-btn Aseo-btnSmall Aseo-btnDanger" onClick={() => limpiar(t.id)}>
                        Limpiar
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Panel: Crear / administrar tareas */}
        <div className="Aseo-card">
          <div className="Aseo-cardHeader">
            <h2 className="Aseo-cardTitle">Tareas</h2>
            <p className="Aseo-cardHint">Crea tareas y activa/desactiva. (Desactivar no borra el historial)</p>
          </div>

          <div className="Aseo-createRow">
            <input
              className="Aseo-input"
              value={nuevaTarea}
              onChange={(e) => setNuevaTarea(e.target.value)}
              placeholder="Ej: Lavar baños"
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

        {/* Panel: Estadísticas */}
        <div className="Aseo-card Aseo-cardFull">
          <div className="Aseo-cardHeader">
            <h2 className="Aseo-cardTitle">Participación</h2>
            <p className="Aseo-cardHint">Calcula el porcentaje según actividades marcadas como completadas.</p>
          </div>

          <div className="Aseo-statsFilters">
            <label className="Aseo-label Aseo-labelInline">
              Desde
              <input className="Aseo-input Aseo-inputDate" type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
            </label>

            <label className="Aseo-label Aseo-labelInline">
              Hasta
              <input className="Aseo-input Aseo-inputDate" type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
            </label>

            <button className="Aseo-btn" onClick={cargarEstadisticas}>
              Ver porcentaje
            </button>
          </div>

          {estadisticas ? (
            <div className="Aseo-statsGrid">
              <div className="Aseo-statCard">
                <div className="Aseo-statTitle">Hombre</div>
                <div className="Aseo-statValue">{estadisticas.porcentajes.hombre}%</div>
                <div className="Aseo-statMeta">{estadisticas.totales.hombre} actividades</div>
              </div>

              <div className="Aseo-statCard">
                <div className="Aseo-statTitle">Mujer</div>
                <div className="Aseo-statValue">{estadisticas.porcentajes.mujer}%</div>
                <div className="Aseo-statMeta">{estadisticas.totales.mujer} actividades</div>
              </div>

              <div className="Aseo-statCard">
                <div className="Aseo-statTitle">Total</div>
                <div className="Aseo-statValue">{estadisticas.totales.total_actividades_completadas}</div>
                <div className="Aseo-statMeta">completadas</div>
              </div>

              <div className="Aseo-detailWrap">
                <div className="Aseo-detailCol">
                  <h3 className="Aseo-detailTitle">Actividades del hombre</h3>
                  <div className="Aseo-detailList">
                    {estadisticas.detalle.hombre.length === 0 ? (
                      <div className="Aseo-emptySmall">Sin actividades en el rango.</div>
                    ) : (
                      estadisticas.detalle.hombre.map((x, idx) => (
                        <div className="Aseo-detailItem" key={`${x.tarea_id}-${x.fecha}-${idx}`}>
                          <span className="Aseo-detailDate">{x.fecha}</span>
                          <span className="Aseo-detailTask">{x.tarea}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="Aseo-detailCol">
                  <h3 className="Aseo-detailTitle">Actividades de la mujer</h3>
                  <div className="Aseo-detailList">
                    {estadisticas.detalle.mujer.length === 0 ? (
                      <div className="Aseo-emptySmall">Sin actividades en el rango.</div>
                    ) : (
                      estadisticas.detalle.mujer.map((x, idx) => (
                        <div className="Aseo-detailItem" key={`${x.tarea_id}-${x.fecha}-${idx}`}>
                          <span className="Aseo-detailDate">{x.fecha}</span>
                          <span className="Aseo-detailTask">{x.tarea}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="Aseo-empty">Selecciona un rango y pulsa “Ver porcentaje”.</div>
          )}
        </div>
      </section>
    </main>
  );
}
