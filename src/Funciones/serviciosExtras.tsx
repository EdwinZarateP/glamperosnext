//src/Funciones/serviciosExtras.tsx
import { useState } from "react";

export type ServicioDef = {
  /** clave de texto/descripcion en el backend */
  desc: string;
  /** clave de precio en el backend (opcional) */
  val?: string;
  /** etiqueta amigable */
  label: string;
};

export const SERVICIOS_EXTRAS: ServicioDef[] = [
  // 🌞 Experiencias básicas
  { desc: "dia_sol", val: "valor_dia_sol", label: "Día de sol" },
  { desc: "kit_fogata", val: "valor_kit_fogata", label: "Kit de fogata" },
  { desc: "mascota_adicional", val: "valor_mascota_adicional", label: "Mascota adicional" },

  // 🎀 Decoración y cenas
  { desc: "decoracion_sencilla", val: "valor_decoracion_sencilla", label: "Decoración sencilla" },
  { desc: "decoracion_especial", val: "valor_decoracion_especial", label: "Decoración especial" },
  { desc: "cena_estandar", val: "valor_cena_estandar", label: "Cena estándar" },
  { desc: "cena_romantica", val: "valor_cena_romantica", label: "Cena romántica" },
  { desc: "picnic_romantico", val: "valor_picnic_romantico", label: "Picnic romántico" },
  { desc: "proyeccion_pelicula", val: "valor_proyeccion_pelicula", label: "Proyección película" },

  // 🚶‍♂️ Actividades al aire libre
  { desc: "caminata", val: "valor_caminata", label: "Caminata" },
  { desc: "paseo_bicicleta", val: "valor_paseo_bicicleta", label: "Paseo bicicleta" },
  { desc: "paseo_caballo", val: "valor_paseo_caballo", label: "Paseo a caballo" },
  { desc: "paseo_cuatrimoto", val: "valor_paseo_cuatrimoto", label: "Paseo en cuatrimoto" },

  // 🧗 Deportes de aventura
  { desc: "torrentismo", val: "valor_torrentismo", label: "Torrentismo" },
  { desc: "parapente", val: "valor_parapente", label: "Parapente" },

  // 🌊 Actividades acuáticas
  { desc: "paseo_lancha", val: "valor_paseo_lancha", label: "Paseo en lancha" },
  { desc: "kayak", val: "valor_kayak", label: "Paseo en kayak" },
  { desc: "jet_ski", val: "valor_jet_ski", label: "Paseo en jet ski" },
  { desc: "paseo_vela", val: "valor_paseo_vela", label: "Paseo en vela" },

  // 💆 Relax
  { desc: "masaje_pareja", val: "valor_masaje_pareja", label: "Masaje en pareja" },
  { desc: "terapia_facial", val: "valor_terapia_facial", label: "Terapia facial" },
  
];


export type ExtrasTxt = Record<string, string>;   // { [desc]: texto }
export type ExtrasVal = Record<string, number>;   // { [val]: precio }

// ---------------------------------------------
// Hook centralizado para manejar extras
// ---------------------------------------------
export function useServiciosExtras(initial?: { txt?: ExtrasTxt; val?: ExtrasVal }) {
  const defaultTxt: ExtrasTxt = SERVICIOS_EXTRAS.reduce<ExtrasTxt>((acc, s) => {
    acc[s.desc] = "";
    return acc;
  }, {});

  const defaultVal: ExtrasVal = SERVICIOS_EXTRAS.reduce<ExtrasVal>((acc, s) => {
    if (s.val) acc[s.val] = 0;
    return acc;
  }, {});

  const [extrasTxt, setExtrasTxt] = useState<ExtrasTxt>(initial?.txt ?? defaultTxt);
  const [extrasVal, setExtrasVal] = useState<ExtrasVal>(initial?.val ?? defaultVal);

  return { extrasTxt, setExtrasTxt, extrasVal, setExtrasVal };
}

// ---------------------------------------------
// Helpers
// ---------------------------------------------

/** Carga inicial desde el objeto del backend (data) */
export function extractExtrasFromBackend(
  data: Record<string, any>
): { txt: ExtrasTxt; val: ExtrasVal } {
  const txt = SERVICIOS_EXTRAS.reduce<ExtrasTxt>((acc, s) => {
    acc[s.desc] = (data?.[s.desc] ?? "") as string;
    return acc;
  }, {});
  const val = SERVICIOS_EXTRAS.reduce<ExtrasVal>((acc, s) => {
    if (!s.val) return acc;
    const raw = data?.[s.val];
    const n = typeof raw === "number" ? raw : Number(raw ?? 0);
    acc[s.val] = Number.isNaN(n) ? 0 : n;
    return acc;
  }, {});
  return { txt, val };
}

/** Agrega al FormData solo lo que tiene contenido */
export function appendExtrasToFormData(
  formData: FormData,
  extrasTxt: ExtrasTxt,
  extrasVal: ExtrasVal
) {
  for (const s of SERVICIOS_EXTRAS) {
    const descVal = extrasTxt[s.desc];
    if (typeof descVal === "string" && descVal.trim()) {
      formData.append(s.desc, descVal.trim());
    }
    if (s.val && Number.isFinite(extrasVal[s.val])) {
      formData.append(s.val, String(extrasVal[s.val]));
    }
  }
}

/** Arma una lista visible (para render) a partir de txt/val */
export function buildServiciosVisibles(
  extrasTxt: ExtrasTxt,
  extrasVal: ExtrasVal
): { titulo: string; texto?: string; valor?: number }[] {
  return SERVICIOS_EXTRAS
    .map(s => ({
      titulo: s.label,
      texto: extrasTxt[s.desc],
      valor: s.val ? extrasVal[s.val] : undefined,
    }))
    .filter(item => {
      const tieneTexto = !!item.texto && item.texto.trim().length > 0;
      const valorPositivo = typeof item.valor === "number" && item.valor > 0;
      return tieneTexto || valorPositivo;
    });
}

/** Aumenta 10% y redondea al múltiplo de 1000 hacia arriba */
export function ajustarValor(valor: number): number {
  const aumentado = valor * 1.1;
  return Math.ceil(aumentado / 1000) * 1000;
}

export function mapExtrasToDescripcionProps(
  data: Record<string, any>,
  textOrUndef: (v: unknown) => string | undefined,
  numOrUndef: (v: unknown) => number | undefined
): Record<string, string | number | undefined> {
  const extras: Record<string, string | number | undefined> = {};

  for (const s of SERVICIOS_EXTRAS) {
    extras[s.desc] = textOrUndef(data[s.desc]);
    if (s.val) {
      extras[s.val] = numOrUndef(data[s.val]);
    }
  }

  return extras;
}