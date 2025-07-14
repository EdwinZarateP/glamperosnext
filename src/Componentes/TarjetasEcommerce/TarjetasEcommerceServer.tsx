// src/Componentes/TarjetasEcommerce/TarjetasEcommerceServer.tsx
import React from 'react';
import TarjetasEcommerce from './index';
import municipiosData from '../MunicipiosGeneral/municipiosGeneral.json';
import { headers } from 'next/headers';

interface Props {
  filtros?: string[];
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';
const API_URL = `${API_BASE}/glampings/glampingfiltrados`;
const PAGE_SIZE = 24;

const DEFAULT_CITY_SLUG = 'bogota';

type Municipio = {
  CIUDAD_DEPARTAMENTO: string;
  CIUDAD: string;
  DEPARTAMENTO: string;
  LATITUD: number;
  LONGITUD: number;
};

type MunicipioConSlug = Municipio & { SLUG: string };

const municipiosConSlug: MunicipioConSlug[] = municipiosData.map(m => ({
  ...m,
  SLUG: m.CIUDAD_DEPARTAMENTO.toLowerCase().replace(/\s+/g, '-'),
}));

const TIPOS = ['domo', 'tipi', 'tienda', 'cabana', 'lumipod','chalet'];

/**
 * Elimina cualquier segmento "pagina-N" y "orden-asc|desc" en la ruta
 */
const limpiarSegmentosPagina = (segmentos: string[]) =>
  segmentos.filter(seg => 
    !/^pagina-\d+$/.test(seg) &&
    !/^orden-(asc|desc)$/.test(seg)
  );

function getCiudadFromSlug(slug: string | undefined): MunicipioConSlug | null {
  if (!slug) return null;
  return municipiosConSlug.find(m => m.SLUG === slug.toLowerCase()) || null;
}

/**
 * Construye query string con lat/lng, tipo, amenidades y ordenamiento
 */
function construirQuery(
  pageArg: number,
  filtrosSinPagina: string[],
  usarBogotaFallback: boolean,
  orden?: string
): string {
  const params = new URLSearchParams();
  params.set('page', String(pageArg));
  params.set('limit', String(PAGE_SIZE));
  if (orden) params.set('ordenPrecio', orden);

  // — 1) Extraer fechas y huéspedes de los segmentos
  let fechaInicio: string|undefined;
  let fechaFin:    string|undefined;
  let huespedes:   string|undefined;

  const restantes = filtrosSinPagina.filter(seg => {
    if (seg.startsWith('fechainicio=')) {
      fechaInicio = seg.split('=')[1];
      return false;
    }
    if (seg.startsWith('fechafin=')) {
      fechaFin = seg.split('=')[1];
      return false;
    }
    if (seg.startsWith('huespedes=')) {
      huespedes = seg.split('=')[1];
      return false;
    }
    return true;
  });

  if (fechaInicio) params.set('fechaInicio', fechaInicio);
  if (fechaFin)    params.set('fechaFin', fechaFin);
  if (huespedes && Number(huespedes) > 1) {
    params.set('totalHuespedes', huespedes);
  }

  // — 2) Ciudad / fallback Bogotá
  const ciudad = getCiudadFromSlug(restantes[0]);
  if (ciudad) {
    params.set('lat', String(ciudad.LATITUD));
    params.set('lng', String(ciudad.LONGITUD));
  } else if (usarBogotaFallback) {
    const bog = getCiudadFromSlug(DEFAULT_CITY_SLUG)!;
    params.set('lat', String(bog.LATITUD));
    params.set('lng', String(bog.LONGITUD));
  }

  // — 3) Tipo de glamping
  const tipo = restantes.find(f => TIPOS.includes(f.toLowerCase()));
  if (tipo) params.set('tipoGlamping', tipo.toLowerCase());

  // — 4) Amenidades “reales” (ahora en `restantes` sólo quedan ellas)
  const sinCiudad = ciudad ? restantes.slice(1) : restantes;
  const sinTipo   = tipo   ? sinCiudad.filter(f => f.toLowerCase() !== tipo.toLowerCase()) : sinCiudad;
  const amenidades = sinTipo.filter(a =>
    !/^orden-(asc|desc)$/.test(a) &&
    !a.startsWith('fechainicio=') &&
    !a.startsWith('fechafin=') &&
    !a.startsWith('huespedes=')
  );
  amenidades.forEach(a => params.append('amenidades', a.toLowerCase()));


  return params.toString();
}

export default async function TarjetasEcommerceServer({ filtros = [] }: Props) {
  const headersList = await headers();
  const userAgent = headersList.get('user-agent') || '';
  const isBot = /googlebot|bingbot|slurp|duckduckbot/i.test(userAgent);

  // 1) detecta página
  const last = filtros[filtros.length - 1] || '';
  const match = last.match(/^pagina-(\d+)$/);
  const pageArg = match ? parseInt(match[1], 10) : 1;

  // 2) Extraer el segmento de ordenamiento si existe
  const ordenSegment = filtros.find(seg => /^orden-(asc|desc)$/.test(seg));
  const orden = ordenSegment ? ordenSegment.replace('orden-', '') : '';

  // 3) limpia segmentos "pagina-N" y "orden-asc|desc" con función robusta
  const filtrosSinPagina = limpiarSegmentosPagina(filtros);

  // 4) decide usar Bogotá como fallback solo si es bot
  const usarBogotaFallback = isBot;

  // 5) construye y ejecuta la petición SSR, pasando el orden
  const qs = construirQuery(pageArg, filtrosSinPagina, usarBogotaFallback, orden);
  let glampings: any[] = [];
  let total = 0;

  try {
    const res = await fetch(`${API_URL}?${qs}`, { cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      glampings = json.glampings || [];
      total = typeof json.total === 'number' ? json.total : 0;
    } else {
      console.warn(`API responded ${res.status}`);
    }
  } catch (err) {
    console.error('Fetch error glampings:', err);
  }

  return (
    <TarjetasEcommerce
      initialData={glampings}
      initialTotal={total}
    />
  );
}