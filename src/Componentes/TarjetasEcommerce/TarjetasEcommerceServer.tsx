// src/Componentes/TarjetasEcommerce/TarjetasEcommerceServer.tsx
import React from 'react';
import TarjetasEcommerce from './index';
import municipiosData from '../MunicipiosGeneral/municipiosGeneral.json';
import { headers, cookies } from 'next/headers';

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

// 1) Array de municipios con slug
const municipiosConSlug: MunicipioConSlug[] = municipiosData.map(m => ({
  ...m,
  SLUG: m.CIUDAD_DEPARTAMENTO.toLowerCase().replace(/\s+/g, '-'),
}));

// 2) Tipos válidos de glamping
const TIPOS = ['domo', 'tipi', 'tienda', 'cabana', 'lumipod', 'chalet'];

// 3) Limpia segmentos "pagina-N" y "orden-asc|desc"
const limpiarSegmentosPagina = (segmentos: string[]) =>
  segmentos.filter(seg =>
    !/^pagina-\d+$/.test(seg) &&
    !/^orden-(asc|desc)$/.test(seg)
  );

// 4) Obtiene MunicipioConSlug por slug
function getCiudadFromSlug(slug: string | undefined): MunicipioConSlug | null {
  if (!slug) return null;
  return municipiosConSlug.find(m => m.SLUG === slug.toLowerCase()) || null;
}

/**
 * 5) Construye la query string para la API,
 *    ahora recibiendo también latCookie/lngCookie.
 */
function construirQuery(
  pageArg: number,
  filtrosSinPagina: string[],
  latCookie: string | undefined,
  lngCookie: string | undefined,
  usarBotFallback: boolean,
  orden?: string
): string {
  const params = new URLSearchParams();
  params.set('page', String(pageArg));
  params.set('limit', String(PAGE_SIZE));
  if (orden) params.set('ordenPrecio', orden);

  // — extraer fechas y huéspedes
  let fechaInicio: string | undefined;
  let fechaFin:    string | undefined;
  let huespedes:   string | undefined;

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

  // — ciudad ruta
  const ciudad = getCiudadFromSlug(restantes[0]);
  if (ciudad) {
    params.set('lat', String(ciudad.LATITUD));
    params.set('lng', String(ciudad.LONGITUD));
  } else if (latCookie && lngCookie && !usarBotFallback) {
    // — fallback a cookie
    params.set('lat', latCookie);
    params.set('lng', lngCookie);
  } else {
    // — último recurso, Bogotá (bot o sin cookies)
    const bog = getCiudadFromSlug(DEFAULT_CITY_SLUG)!;
    params.set('lat', String(bog.LATITUD));
    params.set('lng', String(bog.LONGITUD));
  }

  // — tipo de glamping
  const tipo = restantes.find(f => TIPOS.includes(f.toLowerCase()));
  if (tipo) params.set('tipoGlamping', tipo.toLowerCase());

  // — amenidades “reales”
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
  // 0) Leer cookies y headers en SSR
  const headersList   = await headers();
  const cookieStore   = await cookies();   
  const userAgent     = headersList.get('user-agent') || '';
  const isBot         = /googlebot|bingbot|slurp|duckduckbot/i.test(userAgent);
  const latCookie     = cookieStore.get('glampings_lat')?.value;
  const lngCookie     = cookieStore.get('glampings_lng')?.value;

  // 1) Detecta página
  const last         = filtros[filtros.length - 1] || '';
  const match        = last.match(/^pagina-(\d+)$/);
  const pageArg      = match ? parseInt(match[1], 10) : 1;

  // 2) Extrae orden si existe
  const ordenSegment = filtros.find(seg => /^orden-(asc|desc)$/.test(seg));
  const orden        = ordenSegment ? ordenSegment.replace('orden-', '') : '';

  // 3) Limpia segmentos de página y orden
  const filtrosSinPagina = limpiarSegmentosPagina(filtros);

  // 4) Construye y llama a la API
  const qs = construirQuery(
    pageArg,
    filtrosSinPagina,
    latCookie,
    lngCookie,
    isBot,
    orden
  );

  let glampings: any[] = [];
  let total = 0;
  try {
    const res = await fetch(`${API_URL}?${qs}`, { cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      glampings = json.glampings || [];
      total     = typeof json.total === 'number' ? json.total : 0;
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
