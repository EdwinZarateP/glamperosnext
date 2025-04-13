"use client";

import React, { useContext, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ContextoApp } from "@/context/AppContext";
import CalendarioGeneral2 from "@/Componentes/CalendarioGeneral2";
import HeaderIcono from "@/Componentes/HeaderIcono";
import { ObtenerGlampingPorId } from "@/Funciones/ObtenerGlamping";
import "./estilos.css";

interface Glamping {
  fechasReservadas?: string[]; // Unión de todas las fechas bloqueadas
  fechasManual?: string[];     // Fechas bloqueadas manualmente
  fechasAirbnb?: string[];     // Fechas importadas desde Airbnb
  fechasBooking?: string[];    // Fechas importadas desde Booking
}

const CalendarioPage: React.FC = () => {
  const searchParams = useSearchParams();
  const glampingId = searchParams.get("glampingId") || "";
  const { setFechasSeparadas } = useContext(ContextoApp)!;

  // Estado para guardar la información del glamping (arrays de fechas)
  const [informacionGlamping, setInformacionGlamping] = useState<Glamping | null>(null);

  // Consultamos la información del glamping, similar a SepararFechas
  useEffect(() => {
    const consultarGlamping = async () => {
      if (!glampingId) {
        console.error("No se proporcionó un ID de glamping.");
        return;
      }
      const datos = await ObtenerGlampingPorId(glampingId);
      if (datos) {
        setInformacionGlamping({
          fechasReservadas: datos.fechasReservadas || [],
          fechasManual: datos.fechasReservadasManual || [],
          fechasAirbnb: datos.fechasReservadasAirbnb || [],
          fechasBooking: datos.fechasReservadasBooking || [],
        });
        // Convertimos la unión de fechas a objetos Date para actualizar el contexto
        if (datos.fechasReservadas) {
          const fechasComoDate = datos.fechasReservadas.map((fechaString: string) => {
            const [year, month, day] = fechaString.split("-").map(Number);
            return new Date(year, month - 1, day);
          });
          setFechasSeparadas(fechasComoDate);
        }
      }
    };
    consultarGlamping();
  }, [glampingId, setFechasSeparadas]);

  // En esta versión el componente CalendarioGeneral2 se muestra siempre
  return (
    <div className="calendarioPage-contenedor">
      <HeaderIcono descripcion="Glamperos" />
      
      <CalendarioGeneral2 
        cerrarCalendario={() => { /* Puedes dejar vacía la función o implementar algo si lo requieres */ }}
        fechasManual={informacionGlamping?.fechasManual || []}
        fechasAirbnb={informacionGlamping?.fechasAirbnb || []}
        fechasBooking={informacionGlamping?.fechasBooking || []}
        fechasUnidas={informacionGlamping?.fechasReservadas || []}
      />
    </div>
  );
};

export default CalendarioPage;
