// src/app/calendario/CalendarioContenido.tsx
"use client";

import { useContext, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ContextoApp } from "../../context/AppContext";
import CalendarioGeneral2 from "../../Componentes/CalendarioGeneral2";
import HeaderIcono from "../../Componentes/HeaderIcono";
import { ObtenerGlampingPorId } from "../../Funciones/ObtenerGlamping";
import MenuUsuariosInferior from "../../Componentes/MenuUsuariosInferior";
import "./estilos.css";

interface Glamping {
  fechasReservadas?: string[];
  fechasManual?: string[];
  fechasAirbnb?: string[];
  fechasBooking?: string[];
}

const CalendarioContenido: React.FC = () => {
  const searchParams = useSearchParams();
  const glampingId = searchParams.get("glampingId") || "";
  const { setFechasSeparadas } = useContext(ContextoApp)!;

  const [informacionGlamping, setInformacionGlamping] =
    useState<Glamping | null>(null);

  useEffect(() => {
    async function consultarGlamping() {
      if (!glampingId) {
        console.error("Falta glampingId");
        return;
      }
      const datos = await ObtenerGlampingPorId(glampingId);
      if (!datos) return;
      setInformacionGlamping({
        fechasReservadas: datos.fechasReservadas || [],
        fechasManual: datos.fechasReservadasManual || [],
        fechasAirbnb: datos.fechasReservadasAirbnb || [],
        fechasBooking: datos.fechasReservadasBooking || [],
      });
      // Actualizamos el contexto con todas las fechas parseadas
      const todas = datos.fechasReservadas || [];
      const comoDate = todas.map((str: string) => {
        const [y, m, d] = str.split("-").map(Number);
        return new Date(y, m - 1, d);
      });
      setFechasSeparadas(comoDate);
    }
    consultarGlamping();
  }, [glampingId, setFechasSeparadas]);

  return (
    <div className="calendarioPage-contenedor">
      <HeaderIcono descripcion="Glamperos" />

      <CalendarioGeneral2
        fechasManual={informacionGlamping?.fechasManual || []}
        fechasAirbnb={informacionGlamping?.fechasAirbnb || []}
        fechasBooking={informacionGlamping?.fechasBooking || []}
        fechasUnidas={informacionGlamping?.fechasReservadas || []}
      />

      <MenuUsuariosInferior />
    </div>
  );
};

export default CalendarioContenido;
