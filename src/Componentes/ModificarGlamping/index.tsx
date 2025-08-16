// src/app/ModificarGlamping.tsx

"use client";

import { useState, useEffect, useCallback } from "react";
import "./estilos.css";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { opcionesAmenidades } from "../../Componentes/Amenidades/index";
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

  // ——— Nuevos estados para decoración ———
  const [decoracionSencilla, setDecoracionSencilla] = useState<string>("");
  const [valorDecoracionSencilla, setValorDecoracionSencilla] = useState<number>(0);
  const [decoracionEspecial, setDecoracionEspecial] = useState<string>("");
  const [valorDecoracionEspecial, setValorDecoracionEspecial] = useState<number>(0);

  // Carga inicial
  useEffect(() => {
    if (glampingId) {
      axios
        .get(`${API_BASE}/glampings/${glampingId}`)
        .then(({ data }) => {
          // existentes
          setNombreGlamping(data.nombreGlamping || "");
          setTipoGlamping(data.tipoGlamping || "");
          setCantidad_Huespedes(data.Cantidad_Huespedes ?? 0);
          setCantidad_Huespedes_Adicional(data.Cantidad_Huespedes_Adicional ?? 0);
          setAcepta_Mascotas(data.Acepta_Mascotas || false);
          setPrecioEstandar(data.precioEstandar ?? 0);
          setPrecioEstandarAdicional(data.precioEstandarAdicional ?? 0);
          setMinimoNoches(data.minimoNoches ?? 1);
          setDiasCancelacion(data.diasCancelacion ?? 0);
          setDescuento(data.descuento ?? 0);
          setDescripcionGlamping(data.descripcionGlamping || "");
          setVideo_youtube(data.video_youtube || "");
          setAmenidadesGlobal(data.amenidadesGlobal || []);
          // nuevos
          setDecoracionSencilla(data.decoracion_sencilla || "");
          setValorDecoracionSencilla(data.valor_decoracion_sencilla ?? 0);
          setDecoracionEspecial(data.decoracion_especial || "");
          setValorDecoracionEspecial(data.valor_decoracion_especial ?? 0);
        })
        .catch(console.error);
    }
  }, [glampingId]);

  // Reset precio adicional si no hay huéspedes adicionales
  useEffect(() => {
    if (Cantidad_Huespedes_Adicional <= 0) {
      setPrecioEstandarAdicional(0);
    }
  }, [Cantidad_Huespedes_Adicional]);

  const toggleAmenidad = useCallback((amenidad: string) => {
    setAmenidadesGlobal(prev =>
      prev.includes(amenidad) ? prev.filter(a => a !== amenidad) : [...prev, amenidad]
    );
  }, []);

  const actualizarGlamping = async () => {
    // Aquí puedes agregar validaciones...
    const formData = new FormData();
    // Datos generales
    formData.append("nombreGlamping", nombreGlamping);
    formData.append("precioEstandar", precioEstandar.toString());
    formData.append("descuento", descuento.toString());
    formData.append("Cantidad_Huespedes", Cantidad_Huespedes.toString());
    formData.append("precioEstandarAdicional", precioEstandarAdicional.toString());
    formData.append("Cantidad_Huespedes_Adicional", Cantidad_Huespedes_Adicional.toString());
    formData.append("minimoNoches", minimoNoches.toString());
    formData.append("diasCancelacion", diasCancelacion.toString());
    formData.append("tipoGlamping", tipoGlamping);
    formData.append("Acepta_Mascotas", Acepta_Mascotas ? "true" : "false");
    formData.append("video_youtube", video_youtube || "sin video");
    // Servicios adicionales
    formData.append("decoracion_sencilla", decoracionSencilla);
    formData.append("valor_decoracion_sencilla", valorDecoracionSencilla.toString());
    formData.append("decoracion_especial", decoracionEspecial);
    formData.append("valor_decoracion_especial", valorDecoracionEspecial.toString());
    // Descripción
    formData.append("descripcionGlamping", descripcionGlamping);
    // Amenidades
    formData.append("amenidadesGlobal", amenidadesGlobal.join(","));

    try {
      if (!glampingId) throw new Error("ID de Glamping no encontrado");
      const res = await fetch(`${API_BASE}/glampings/Datos/${glampingId}`, {
        method: "PUT",
        body: formData
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
        onSubmit={e => {
          e.preventDefault();
          actualizarGlamping();
        }}
      >
        {/* === Sección: Datos generales === */}
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
              onChange={e => setPrecioEstandar(+e.target.value)}
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
              onChange={e => setDescuento(+e.target.value)}
            />
          </div>
          <div className="ModificarGlamping-campo">
            <label>Huéspedes estándar</label>
            <input
              type="number"
              className="ModificarGlamping-input"
              min={1}
              value={Cantidad_Huespedes}
              onChange={e => setCantidad_Huespedes(+e.target.value)}
            />
          </div>
          <div className="ModificarGlamping-campo">
            <label>Precio p/ huésped adicional</label>
            <input
              type="number"
              className="ModificarGlamping-input"
              min={0}
              value={precioEstandarAdicional}
              onChange={e => setPrecioEstandarAdicional(+e.target.value)}
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
              onChange={e => setCantidad_Huespedes_Adicional(+e.target.value)}
            />
          </div>
          <div className="ModificarGlamping-campo">
            <label>Mínimo noches</label>
            <input
              type="number"
              className="ModificarGlamping-input"
              min={1}
              value={minimoNoches}
              onChange={e => setMinimoNoches(+e.target.value)}
            />
          </div>
          <div className="ModificarGlamping-campo">
            <label>Días de cancelación</label>
            <input
              type="number"
              className="ModificarGlamping-input"
              min={0}
              value={diasCancelacion}
              onChange={e => setDiasCancelacion(+e.target.value)}
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

        {/* === Sección: Descripción === */}
        <h2 className="ModificarGlamping-subtitulo">Descripción del Glamping</h2>
        <div className="ModificarGlamping-campo full-width">
          <textarea
            className="ModificarGlamping-input-desc"
            value={descripcionGlamping}
            onChange={e => setDescripcionGlamping(e.target.value)}
          />
        </div>

        {/* === Sección: Servicios adicionales === */}
        <h2 className="ModificarGlamping-subtitulo">Servicios adicionales</h2>
        <div className="ModificarGlamping-grid ModificarGlamping-servicios">
          <div className="ModificarGlamping-campo">
            <label htmlFor="decoracion_sencilla">Describe tu decoración sencilla</label>
            <textarea
              id="decoracion_sencilla"
              className="ModificarGlamping-textarea ModificarGlamping-textarea-large"
              value={decoracionSencilla}
              onChange={e => setDecoracionSencilla(e.target.value)}
            />
          </div>
          <div className="ModificarGlamping-campo">
            <label htmlFor="valor_decoracion_sencilla">Valor decoración sencilla</label>
            <input
              id="valor_decoracion_sencilla"
              type="number"
              className="ModificarGlamping-input"
              min={0}
              value={valorDecoracionSencilla}
              onChange={e => setValorDecoracionSencilla(+e.target.value)}
            />
          </div>
          <div className="ModificarGlamping-campo">
            <label htmlFor="decoracion_especial">Describe tu Decoración especial</label>
            <textarea
              id="decoracion_especial"
              className="ModificarGlamping-textarea ModificarGlamping-textarea-large"
              value={decoracionEspecial}
              onChange={e => setDecoracionEspecial(e.target.value)}
            />
          </div>
          <div className="ModificarGlamping-campo">
            <label htmlFor="valor_decoracion_especial">Valor decoración especial</label>
            <input
              id="valor_decoracion_especial"
              type="number"
              className="ModificarGlamping-input"
              min={0}
              value={valorDecoracionEspecial}
              onChange={e => setValorDecoracionEspecial(+e.target.value)}
            />
          </div>
        </div>


        {/* === Sección: Amenidades === */}
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

        {/* === Botón === */}
        <button type="submit" className="ModificarGlamping-boton">
          Actualizar
        </button>
      </form>
    </div>
  );
};

export default ModificarGlamping;
