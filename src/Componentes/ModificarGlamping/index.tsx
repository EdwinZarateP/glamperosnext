// src/app/ModificarGlamping.tsx

"use client";

import { useState, useEffect, useCallback } from "react";
import "./estilos.css";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import { opcionesAmenidades } from "../../Componentes/Amenidades/index";
import Swal from "sweetalert2";

const ModificarGlamping: React.FC = () => {
  const searchParams = useSearchParams();
  const glampingId = searchParams.get("glampingId");

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
  const [urlIcal, setUrlIcal] = useState("");
  const [urlIcalBooking, setUrlIcalBooking] = useState("");
  const [amenidadesGlobal, setAmenidadesGlobal] = useState<string[]>([]);

  // Carga inicial
  useEffect(() => {
    if (glampingId?.trim()) {
      axios
        .get(`https://glamperosapi.onrender.com/glampings/${glampingId}`)
        .then(({ data }) => {
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
          setUrlIcal(data.urlIcal || "");
          setUrlIcalBooking(data.urlIcalBooking || "");
          setAmenidadesGlobal(data.amenidadesGlobal || []);
        })
        .catch((err) => console.error("Error al cargar glamping:", err));
    }
  }, [glampingId]);

  // Si no hay huespedes adicionales, reset precio adicional
  useEffect(() => {
    if (Cantidad_Huespedes_Adicional <= 0) {
      setPrecioEstandarAdicional(0);
    }
  }, [Cantidad_Huespedes_Adicional]);

  const toggleAmenidad = useCallback((amenidad: string) => {
    setAmenidadesGlobal((prev) =>
      prev.includes(amenidad) ? prev.filter((a) => a !== amenidad) : [...prev, amenidad]
    );
  }, []);

  const actualizarGlamping = async () => {
    // ——— aquí van **todas** tus validaciones tal como las tenías ———
    // (limitar longitud, rangos, `Swal.fire` de error, etc.)

    const formData = new FormData();
    formData.append("nombreGlamping", nombreGlamping);
    formData.append("tipoGlamping", tipoGlamping);
    formData.append("Cantidad_Huespedes", Cantidad_Huespedes.toString());
    formData.append("Cantidad_Huespedes_Adicional", Cantidad_Huespedes_Adicional.toString());
    formData.append("Acepta_Mascotas", Acepta_Mascotas ? "true" : "false");
    formData.append("precioEstandar", precioEstandar.toString());
    formData.append("precioEstandarAdicional", precioEstandarAdicional.toString());
    formData.append("minimoNoches", minimoNoches.toString());
    formData.append("diasCancelacion", diasCancelacion.toString());
    formData.append("descuento", descuento.toString());
    formData.append("descripcionGlamping", descripcionGlamping);
    formData.append("urlIcal", urlIcal || "Sin url");
    formData.append("urlIcalBooking", urlIcalBooking || "Sin url");
    formData.append("video_youtube", video_youtube || "sin video");
    formData.append("amenidadesGlobal", amenidadesGlobal.join(","));

    try {
      if (!glampingId) throw new Error("ID de Glamping no encontrado");
      const res = await fetch(
        `https://glamperosapi.onrender.com/glampings/Datos/${glampingId}`,
        { method: "PUT", body: formData }
      );
      if (!res.ok) throw new Error("Error al actualizar glamping");
      await Swal.fire("Éxito", "Glamping actualizado correctamente", "success");
      window.location.reload();
    } catch (err) {
      console.error(err);
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
        <div className="ModificarGlamping-formulario-contenedor1">
          {/* Agrupo cada par label+campo en un div */}
          <div className="ModificarGlamping-campo">
            <label htmlFor="nombreGlamping">Nombre del Glamping:</label>
            <input
              id="nombreGlamping"
              className="ModificarGlamping-input"
              type="text"
              value={nombreGlamping}
              onChange={(e) => setNombreGlamping(e.target.value.slice(0, 40))}
            />
          </div>

          <div className="ModificarGlamping-campo">
            <label htmlFor="precioEstandar">Precio noche estandar:</label>
            <input
              id="precioEstandar"
              className="ModificarGlamping-input"
              type="number"
              value={precioEstandar}
              onChange={(e) => setPrecioEstandar(Number(e.target.value))}
            />
          </div>

          <div className="ModificarGlamping-campo">
            <label htmlFor="descuento">Descuento entre semana (%):</label>
            <input
              id="descuento"
              className="ModificarGlamping-input"
              type="number"
              value={descuento}
              min={0}
              max={100}
              onChange={(e) =>
                setDescuento(Math.min(100, Math.max(0, Number(e.target.value))))
              }
            />
          </div>

          <div className="ModificarGlamping-campo">
            <label htmlFor="Cantidad_Huespedes">Huéspedes estándar:</label>
            <input
              id="Cantidad_Huespedes"
              className="ModificarGlamping-input"
              type="number"
              value={Cantidad_Huespedes}
              min={1}
              max={15}
              onChange={(e) =>
                setCantidad_Huespedes(Math.min(15, Math.max(1, Number(e.target.value))))
              }
            />
          </div>

          <div className="ModificarGlamping-campo">
            <label htmlFor="Cantidad_Huespedes_Adicional">Huéspedes adicionales:</label>
            <input
              id="Cantidad_Huespedes_Adicional"
              className="ModificarGlamping-input"
              type="number"
              value={Cantidad_Huespedes_Adicional}
              min={0}
              max={15}
              onChange={(e) =>
                setCantidad_Huespedes_Adicional(
                  Math.min(15, Math.max(0, Number(e.target.value)))
                )
              }
            />
          </div>

          <div className="ModificarGlamping-campo">
            <label htmlFor="precioEstandarAdicional">Precio por huésped adicional:</label>
            <input
              id="precioEstandarAdicional"
              className={`ModificarGlamping-input ${
                Cantidad_Huespedes_Adicional <= 0 ? "disabled-input" : ""
              }`}
              type="number"
              value={precioEstandarAdicional}
              onChange={(e) => setPrecioEstandarAdicional(Number(e.target.value))}
              disabled={Cantidad_Huespedes_Adicional <= 0}
            />
          </div>

          <div className="ModificarGlamping-campo">
            <label htmlFor="minimoNoches">Mínimo noches:</label>
            <input
              id="minimoNoches"
              className="ModificarGlamping-input"
              type="number"
              value={minimoNoches}
              min={1}
              max={30}
              onChange={(e) =>
                setMinimoNoches(Math.min(30, Math.max(1, Number(e.target.value))))
              }
            />
          </div>

          <div className="ModificarGlamping-campo">
            <label htmlFor="diasCancelacion">Días de cancelación:</label>
            <input
              id="diasCancelacion"
              className="ModificarGlamping-input"
              type="number"
              value={diasCancelacion}
              min={0}
              max={30}
              onChange={(e) =>
                setDiasCancelacion(Math.min(30, Math.max(0, Number(e.target.value))))
              }
            />
          </div>

          <div className="ModificarGlamping-campo">
            <label htmlFor="tipoGlamping">Tipo de Glamping:</label>
            <select
              id="tipoGlamping"
              className="ModificarGlamping-input"
              value={tipoGlamping}
              onChange={(e) => setTipoGlamping(e.target.value)}
            >
              <option value="tienda">tienda</option>
              <option value="cabana">cabana</option>
              <option value="domo">domo</option>
              <option value="casa del arbol">Casa del árbol</option>
              <option value="remolque">remolque</option>
              <option value="tipi">tipi</option>
              <option value="Lumipod">Lumipod</option>
            </select>
          </div>

          <div className="ModificarGlamping-campo">
            <label htmlFor="Acepta_Mascotas">¿Acepta Mascotas?:</label>
            <select
              id="Acepta_Mascotas"
              className="ModificarGlamping-input"
              value={Acepta_Mascotas ? "true" : "false"}
              onChange={(e) => setAcepta_Mascotas(e.target.value === "true")}
            >
              <option value="true">Sí</option>
              <option value="false">No</option>
            </select>
          </div>

          <div className="ModificarGlamping-campo">
            <label htmlFor="video_youtube">Video de Youtube:</label>
            <input
              id="video_youtube"
              className="ModificarGlamping-input"
              type="text"
              value={video_youtube}
              onChange={(e) => setVideo_youtube(e.target.value)}
            />
          </div>

          <div className="ModificarGlamping-campo">
            <label htmlFor="urlIcal">URL iCal Airbnb:</label>
            <input
              id="urlIcal"
              className="ModificarGlamping-input"
              type="text"
              value={urlIcal}
              onChange={(e) => setUrlIcal(e.target.value)}
            />
          </div>

          <div className="ModificarGlamping-campo">
            <label htmlFor="urlIcalBooking">URL iCal Booking:</label>
            <input
              id="urlIcalBooking"
              className="ModificarGlamping-input"
              type="text"
              value={urlIcalBooking}
              onChange={(e) => setUrlIcalBooking(e.target.value)}
            />
          </div>
        </div>

        {/* Estos dos ocupan todo el ancho */}
        <div className="ModificarGlamping-campo full-width">
          <label htmlFor="descripcionGlamping">Descripción del Glamping:</label>
          <textarea
            id="descripcionGlamping"
            className="ModificarGlamping-input-desc"
            value={descripcionGlamping}
            onChange={(e) => setDescripcionGlamping(e.target.value)}
          />
        </div>

        <div className="ModificarGlamping-campo full-width">
          <label>Amenidades:</label>
          <div className="amenidades-container">
            {opcionesAmenidades.map(({ id, label }) => {
              const sel = amenidadesGlobal
                .map((s) => s.toLowerCase())
                .includes(id.toLowerCase());
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

        <button type="submit" className="ModificarGlamping-boton">
          Actualizar
        </button>
      </form>
    </div>
  );
};

export default ModificarGlamping;
