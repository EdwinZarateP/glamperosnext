"use client";

import { useEffect } from "react";
import Calificacion from "../../Componentes/Calificacion/index";
import DetalleGlampingTexto from "../../Componentes/DetalleGlampingTexto/index";
import "./estilos.css";

interface DescripcionGlampingProps {
  calificacionNumero: number;
  calificacionEvaluaciones: number;
  calificacionMasAlta?: string;
  descripcion_glamping: string;

  // — Ten en cuenta —
  politicas_casa?: string;
  horarios?: string;

  // — Servicios adicionales —
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
  kit_fogata?: string;
  valor_kit_fogata?: number;
  cena_romantica?: string;
  valor_cena_romantica?: number;
  cena_estandar?: string;
  valor_cena_estandar?: number;  
  mascota_adicional?: string;
  valor_mascota_adicional?: number;
}

export default function DescripcionGlamping({
  calificacionNumero,
  calificacionEvaluaciones,
  // calificacionMasAlta, // si decides usarla, pásala a <Calificacion /> o muéstrala en este componente
  descripcion_glamping,
  politicas_casa,
  horarios,
  decoracion_sencilla,
  valor_decoracion_sencilla,
  decoracion_especial,
  valor_decoracion_especial,
  paseo_cuatrimoto,
  valor_paseo_cuatrimoto,
  paseo_caballo,
  valor_paseo_caballo,
  masaje_pareja,
  valor_masaje_pareja,
  dia_sol,
  valor_dia_sol,
  caminata,
  valor_caminata,
  kit_fogata,
  valor_kit_fogata,
  cena_romantica,
  valor_cena_romantica,
  cena_estandar,
  valor_cena_estandar,
  mascota_adicional,
  valor_mascota_adicional,
}: DescripcionGlampingProps) {
  useEffect(() => {
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

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
          decoracion_sencilla={decoracion_sencilla}
          valor_decoracion_sencilla={valor_decoracion_sencilla}
          decoracion_especial={decoracion_especial}
          valor_decoracion_especial={valor_decoracion_especial}
          paseo_cuatrimoto={paseo_cuatrimoto}
          valor_paseo_cuatrimoto={valor_paseo_cuatrimoto}
          paseo_caballo={paseo_caballo}
          valor_paseo_caballo={valor_paseo_caballo}
          masaje_pareja={masaje_pareja}
          valor_masaje_pareja={valor_masaje_pareja}
          dia_sol={dia_sol}
          valor_dia_sol={valor_dia_sol}
          caminata={caminata}
          valor_caminata={valor_caminata}
          kit_fogata={kit_fogata}
          valor_kit_fogata={valor_kit_fogata}
          cena_romantica={cena_romantica}          
          valor_cena_romantica={valor_cena_romantica}
          cena_estandar={cena_estandar}
          valor_cena_estandar={valor_cena_estandar}
          mascota_adicional={mascota_adicional}
          valor_mascota_adicional={valor_mascota_adicional}
        />
      </div>
    </div>
  );
}
