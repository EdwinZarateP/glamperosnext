"use client";

import { useEffect } from "react";
import Calificacion from "../../Componentes/Calificacion";
import DetalleGlampingTexto from "../../Componentes/DetalleGlampingTexto";
import { SERVICIOS_EXTRAS } from "@/Funciones/serviciosExtras";
import "./estilos.css";

interface DescripcionGlampingProps {
  calificacionNumero: number;
  calificacionEvaluaciones: number;
  calificacionMasAlta?: string;
  descripcion_glamping: string;

  politicas_casa?: string;
  horarios?: string;

  // — Servicios adicionales (se mantienen para compatibilidad) —
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
  tour_1?: string;
  valor_tour_1?: number;
  cena_estandar?: string;
  valor_cena_estandar?: number;
  mascota_adicional?: string;
  valor_mascota_adicional?: number;
}

export default function DescripcionGlamping(props: DescripcionGlampingProps) {
  const {
    calificacionNumero,
    calificacionEvaluaciones,
    descripcion_glamping,
    politicas_casa,
    horarios,
  } = props;

  useEffect(() => {
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  // Construye dinámicamente los props de servicios extra a partir del catálogo centralizado
  const extrasProps: Record<string, unknown> = {};
  for (const s of SERVICIOS_EXTRAS) {
    if (s.desc && s.desc in props) {
      extrasProps[s.desc] = (props as any)[s.desc];
    }
    if (s.val && s.val in props) {
      extrasProps[s.val] = (props as any)[s.val];
    }
  }

  return (
    <div className="descripcion-glamping-contenedor">
      <Calificacion
        calificacionNumero={calificacionNumero}
        calificacionEvaluaciones={calificacionEvaluaciones}
      />

      <div className="descripcion-glamping-detalle">
        <DetalleGlampingTexto
          descripcionGlamping={descripcion_glamping}
          politicas_casa={politicas_casa}
          horarios={horarios}
          {...extrasProps}
        />
      </div>
    </div>
  );
}
