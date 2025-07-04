// src/Componentes/TarjetasEcommerce/TarjetasEcommerceServer.tsx

import TarjetasEcommerce from './index';
import { Suspense } from "react";
import municipiosData from "../MunicipiosGeneral/municipiosGeneral.json";

interface Municipio {
  CIUDAD_DEPARTAMENTO: string;
  CIUDAD: string;
  DEPARTAMENTO: string;
  LATITUD: number;
  LONGITUD: number;
}

interface MunicipioConSlug extends Municipio {
  SLUG: string;
}

interface Props {
  filtros?: string[];
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;
const API_URL = `${API_BASE}/glampings/glampingfiltrados2`;
const PAGE_SIZE = 24;

// Normaliza municipios a slug
const municipiosConSlug: MunicipioConSlug[] = municipiosData.map(m => ({
  ...m,
  SLUG: m.CIUDAD_DEPARTAMENTO.toLowerCase().replace(/\s+/g, '-')
}));

const getCiudadFromSlug = (slug: string): MunicipioConSlug | null => {
  return municipiosConSlug.find(m => m.SLUG === slug.toLowerCase()) ?? null;
};

const construirQuery = (pageArg: number, filtros?: string[]) => {
  const params = new URLSearchParams();
  params.set('page', String(pageArg));
  params.set('limit', String(PAGE_SIZE));

  if (filtros && filtros.length > 0) {
    const posibleCiudad = getCiudadFromSlug(filtros[0]);
    if (posibleCiudad) {
      params.set('lat', String(posibleCiudad.LATITUD));
      params.set('lng', String(posibleCiudad.LONGITUD));
    }

    // Ejemplo futuro para tipos o amenidades:
    // const tipo = filtros.find(f => TIPOS.includes(f));
    // if (tipo) params.set('tipoGlamping', tipo);
  }

  return params.toString();
};

export default async function TarjetasEcommerceServer({ filtros }: Props) {
  const qs = construirQuery(1, filtros);
  const res = await fetch(`${API_URL}?${qs}`, { cache: 'no-store' });
  const json = await res.json();
  const glampings = Array.isArray(json) ? [] : json.glampings ?? [];

  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <TarjetasEcommerce filtros={filtros} initialData={glampings} />
    </Suspense>
  );
}
