// src/app/ModificarGlamping.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import "./estilos.css";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { opcionesAmenidades } from "../../Componentes/Amenidades/index";
import {
  SERVICIOS_EXTRAS,
  useServiciosExtras,
  extractExtrasFromBackend,
  appendExtrasToFormData,
} from "@/Funciones/serviciosExtras";
import Swal from "sweetalert2";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;

const ModificarGlamping: React.FC = () => {
  const searchParams = useSearchParams();
  const glampingId = searchParams.get("glampingId");

  // ——— Estados existentes ———
  const [nombreGlamping, setNombreGlamping] = useState("");
  const [tipoGlamping, setTipoGlamping] = useState("");
  const [Cantidad_Huespedes, setCantidad_Huespedes] = useState<number>(0);
  const [Cantidad_Huespedes_Adicional, setCantidad_Huespedes_Adicional] = useState<number>(0);
  const [Acepta_Mascotas, setAcepta_Mascotas] = useState<boolean>(false);
  const [precioEstandar, setPrecioEstandar] = useState<number>(0);
  const [precioEstandarAdicional, setPrecioEstandarAdicional] = useState<number>(0);
  const [minimoNoches, setMinimoNoches] = useState<number>(1);
  const [diasCancelacion, setDiasCancelacion] = useState<number>(1);
  const [descuento, setDescuento] = useState<number>(0);
  const [descripcionGlamping, setDescripcionGlamping] = useState("");
  const [video_youtube, setVideo_youtube] = useState("");
  const [amenidadesGlobal, setAmenidadesGlobal] = useState<string[]>([]);

  // ——— Ten en cuenta ———
  const [horarios, setHorarios] = useState<string>("");
  const [politicasCasa, setPoliticasCasa] = useState<string>("");

  // ——— Servicios adicionales (centralizado) ———
  const { extrasTxt, setExtrasTxt, extrasVal, setExtrasVal } = useServiciosExtras();

  // Carga inicial
  useEffect(() => {
    if (!glampingId) return;
    axios
      .get(`${API_BASE}/glampings/${glampingId}`)
      .then(({ data }) => {
        setNombreGlamping(data.nombreGlamping || "");
        setTipoGlamping(data.tipoGlamping || "");
        setCantidad_Huespedes(data.Cantidad_Huespedes ?? 0);
        setCantidad_Huespedes_Adicional(data.Cantidad_Huespedes_Adicional ?? 0);
        setAcepta_Mascotas(!!data.Acepta_Mascotas);
        setPrecioEstandar(data.precioEstandar ?? 0);
        setPrecioEstandarAdicional(data.precioEstandarAdicional ?? 0);
        setMinimoNoches(data.minimoNoches ?? 1);
        setDiasCancelacion(data.diasCancelacion ?? 0);
        setDescuento(data.descuento ?? 0);
        setDescripcionGlamping(data.descripcionGlamping || "");
        setVideo_youtube(data.video_youtube || "");
        setAmenidadesGlobal(
          Array.isArray(data.amenidadesGlobal)
            ? data.amenidadesGlobal
            : data.amenidadesGlobal?.split?.(",") ?? []
        );

        // Ten en cuenta
        setHorarios(data.horarios || "");
        setPoliticasCasa(data.politicas_casa || "");

        // Servicios adicionales (con helper centralizado)
        const { txt, val } = extractExtrasFromBackend(data);
        setExtrasTxt(txt);
        setExtrasVal(val);
      })
      .catch(console.error);
  }, [glampingId, setExtrasTxt, setExtrasVal]);

  // Reset precio adicional si no hay huéspedes adicionales
  useEffect(() => {
    if (Cantidad_Huespedes_Adicional <= 0) setPrecioEstandarAdicional(0);
  }, [Cantidad_Huespedes_Adicional]);

  const toggleAmenidad = useCallback((amenidad: string) => {
    setAmenidadesGlobal(prev =>
      prev.includes(amenidad) ? prev.filter(a => a !== amenidad) : [...prev, amenidad]
    );
  }, []);

  const actualizarGlamping = async () => {
    try {
      if (!glampingId) throw new Error("ID de Glamping no encontrado");
      const formData = new FormData();

      // Datos generales
      formData.append("nombreGlamping", nombreGlamping);
      formData.append("precioEstandar", String(precioEstandar));
      formData.append("descuento", String(descuento));
      formData.append("Cantidad_Huespedes", String(Cantidad_Huespedes));
      formData.append("precioEstandarAdicional", String(precioEstandarAdicional));
      formData.append("Cantidad_Huespedes_Adicional", String(Cantidad_Huespedes_Adicional));
      formData.append("minimoNoches", String(minimoNoches));
      formData.append("diasCancelacion", String(diasCancelacion));
      formData.append("tipoGlamping", tipoGlamping);
      formData.append("Acepta_Mascotas", Acepta_Mascotas ? "true" : "false");
      formData.append("video_youtube", video_youtube || "sin video");
      formData.append("descripcionGlamping", descripcionGlamping);
      formData.append("amenidadesGlobal", amenidadesGlobal.join(","));

      // Ten en cuenta (en claves separadas)
      if (horarios.trim()) formData.append("horarios", horarios);
      if (politicasCasa.trim()) formData.append("politicas_casa", politicasCasa);

      // Servicios adicionales (helper centralizado)
      appendExtrasToFormData(formData, extrasTxt, extrasVal);

      const res = await fetch(`${API_BASE}/glampings/Datos/${glampingId}`, {
        method: "PUT",
        body: formData,
      });
      if (!res.ok) throw new Error("Error al actualizar");
      await Swal.fire("Éxito", "Actualizado correctamente", "success");
      window.location.reload();
    } catch (err) {
      Swal.fire("Error", (err as Error).message, "error");
    }
  };

  return (
    <div className="ModificarGlamping-contenedor">
      <form
        className="ModificarGlamping-formulario"
        onSubmit={(e) => {
          e.preventDefault();
          actualizarGlamping();
        }}
      >
        {/* === Datos generales === */}
        <h2 className="ModificarGlamping-subtitulo">Datos generales</h2>
        <div className="ModificarGlamping-grid">
          <div className="ModificarGlamping-campo">
            <label>Nombre del Glamping</label>
            <input
              className="ModificarGlamping-input"
              value={nombreGlamping}
              onChange={e => setNombreGlamping(e.target.value)}
            />
          </div>
          <div className="ModificarGlamping-campo">
            <label>Precio noche estándar</label>
            <input
              type="number"
              className="ModificarGlamping-input"
              value={precioEstandar}
              onChange={e => setPrecioEstandar(+e.target.value || 0)}
            />
          </div>
          <div className="ModificarGlamping-campo">
            <label>Descuento (%)</label>
            <input
              type="number"
              className="ModificarGlamping-input"
              min={0}
              max={100}
              value={descuento}
              onChange={e => setDescuento(+e.target.value || 0)}
            />
          </div>
          <div className="ModificarGlamping-campo">
            <label>Huéspedes estándar</label>
            <input
              type="number"
              className="ModificarGlamping-input"
              min={1}
              value={Cantidad_Huespedes}
              onChange={e => setCantidad_Huespedes(+e.target.value || 0)}
            />
          </div>
          <div className="ModificarGlamping-campo">
            <label>Precio p/ huésped adicional</label>
            <input
              type="number"
              className="ModificarGlamping-input"
              min={0}
              value={precioEstandarAdicional}
              onChange={e => setPrecioEstandarAdicional(+e.target.value || 0)}
              disabled={Cantidad_Huespedes_Adicional <= 0}
            />
          </div>
          <div className="ModificarGlamping-campo">
            <label>Huéspedes adicionales</label>
            <input
              type="number"
              className="ModificarGlamping-input"
              min={0}
              value={Cantidad_Huespedes_Adicional}
              onChange={e => setCantidad_Huespedes_Adicional(+e.target.value || 0)}
            />
          </div>
          <div className="ModificarGlamping-campo">
            <label>Mínimo noches</label>
            <input
              type="number"
              className="ModificarGlamping-input"
              min={1}
              value={minimoNoches}
              onChange={e => setMinimoNoches(+e.target.value || 1)}
            />
          </div>
          <div className="ModificarGlamping-campo">
            <label>Días de cancelación</label>
            <input
              type="number"
              className="ModificarGlamping-input"
              min={0}
              value={diasCancelacion}
              onChange={e => setDiasCancelacion(+e.target.value || 0)}
            />
          </div>
          <div className="ModificarGlamping-campo">
            <label>Tipo de Glamping</label>
            <select
              className="ModificarGlamping-input"
              value={tipoGlamping}
              onChange={e => setTipoGlamping(e.target.value)}
            >
              <option>tienda</option>
              <option>cabaña</option>
              <option>domo</option>
              <option>Casa del árbol</option>
              <option>remolque</option>
              <option>tipi</option>
              <option>Lumipod</option>
              <option>Loto</option>
              <option>Chalet</option>
            </select>
          </div>
          <div className="ModificarGlamping-campo">
            <label>¿Acepta Mascotas?</label>
            <select
              className="ModificarGlamping-input"
              value={Acepta_Mascotas ? "true" : "false"}
              onChange={e => setAcepta_Mascotas(e.target.value === "true")}
            >
              <option value="true">Sí</option>
              <option value="false">No</option>
            </select>
          </div>
          <div className="ModificarGlamping-campo">
            <label>Video de YouTube</label>
            <input
              className="ModificarGlamping-input"
              value={video_youtube}
              onChange={e => setVideo_youtube(e.target.value)}
            />
          </div>
        </div>

        {/* === Descripción === */}
        <h2 className="ModificarGlamping-subtitulo">Descripción del Glamping</h2>
        <div className="ModificarGlamping-campo full-width">
          <textarea
            className="ModificarGlamping-input-desc"
            value={descripcionGlamping}
            onChange={e => setDescripcionGlamping(e.target.value)}
          />
        </div>

        {/* === Ten en cuenta (sección propia) === */}
        <h2 className="ModificarGlamping-subtitulo">Horarios y politicas</h2>
        <div className="ModificarGlamping-grid">
          <div className="ModificarGlamping-campo">
            <label htmlFor="horarios">Check-in y Check-out ⏰</label>
            <textarea
              id="horarios"
              className="ModificarGlamping-textarea ModificarGlamping-textarea-large"
              value={horarios}
              onChange={e => setHorarios(e.target.value)}
            />
          </div>
          <div className="ModificarGlamping-campo">
            <label htmlFor="politicas_casa">Políticas de la casa 📜</label>
            <textarea
              id="politicas_casa"
              className="ModificarGlamping-textarea ModificarGlamping-textarea-large"
              value={politicasCasa}
              onChange={e => setPoliticasCasa(e.target.value)}
            />
          </div>
        </div>

        {/* === Servicios adicionales (centralizado) === */}
        <h2 className="ModificarGlamping-subtitulo">Servicios adicionales</h2>
        <div className="ModificarGlamping-grid ModificarGlamping-servicios">
          {SERVICIOS_EXTRAS.map(s => (
            <div key={s.desc} className="ModificarGlamping-servicio-bloque">
              <div className="ModificarGlamping-campo">
                <label htmlFor={s.desc}>Describe {s.label.toLowerCase()}</label>
                <textarea
                  id={s.desc}
                  className="ModificarGlamping-textarea ModificarGlamping-textarea-large"
                  value={extrasTxt[s.desc] ?? ""}
                  onChange={e =>
                    setExtrasTxt(prev => ({ ...prev, [s.desc]: e.target.value }))
                  }
                />
              </div>
              {s.val && (
                <div className="ModificarGlamping-campo">
                  <label htmlFor={s.val}>Valor {s.label.toLowerCase()}</label>
                  <input
                    id={s.val}
                    type="number"
                    className="ModificarGlamping-input"
                    min={0}
                    value={extrasVal[s.val] ?? 0}
                    onChange={e =>
                      setExtrasVal(prev => ({
                        ...prev,
                        [s.val as string]: +e.target.value || 0,
                      }))
                    }
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* === Amenidades === */}
        <h2 className="ModificarGlamping-subtitulo">Amenidades</h2>
        <div className="ModificarGlamping-campo full-width">
          <div className="amenidades-container">
            {opcionesAmenidades.map(({ id, label }) => {
              const sel = amenidadesGlobal.includes(id);
              return (
                <button
                  key={id}
                  type="button"
                  className={`amenidad-button ${sel ? "selected" : ""}`}
                  onClick={() => toggleAmenidad(id)}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* === Barra fija de acción (siempre visible) === */}
        <div className="ModificarGlamping-cta">
          <div className="ModificarGlamping-cta-inner">
            <div className="ModificarGlamping-cta" aria-live="polite">
              <div className="ModificarGlamping-cta-inner">
                <button type="submit" className="ModificarGlamping-boton">
                  Actualizar
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ModificarGlamping;
