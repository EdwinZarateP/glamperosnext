// src/Componentes/TarjetasEcommerce/TarjetasEcommerceServer.tsx
import React from 'react';
import TarjetasEcommerce from './index';
import municipiosData from '../MunicipiosGeneral/municipiosGeneral.json';
import { headers, cookies } from 'next/headers';

interface Props {
  filtros?: string[];
  // Recíbelo desde el page.tsx
  searchParams?: {
    [key: string]: string | string[] | undefined;
  };
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';
const API_URL = `${API_BASE}/glampings/glampingfiltrados`;
const PAGE_SIZE = 24;

type Municipio = {
  CIUDAD_DEPARTAMENTO: string;
  CIUDAD: string;
  DEPARTAMENTO: string;
  LATITUD: number;
  LONGITUD: number;
};
type MunicipioConSlug = Municipio & { SLUG: string };

// 1) Municipios con slug
const municipiosConSlug: MunicipioConSlug[] = (municipiosData as Municipio[]).map(m => ({
  ...m,
  SLUG: m.CIUDAD_DEPARTAMENTO.toLowerCase().replace(/\s+/g, '-'),
}));

// 2) Tipos válidos
const TIPOS = ['domo', 'tipi', 'tienda', 'cabana', 'lumipod', 'loto', 'chalet'];

// 3) Limpieza de segmentos
const limpiarSegmentosPagina = (segmentos: string[]) =>
  segmentos.filter(seg => !/^pagina-\d+$/.test(seg) && !/^orden-(asc|desc)$/.test(seg));

// 3.1) Alias rápidos para ciudades
const CITY_ALIASES: Record<string, { lat: number; lng: number; nombre: string }> = {
  bogota:   { lat: 4.6589973718135, lng: -74.10152220780381, nombre: 'Bogotá' },
  medellin: { lat: 6.379745895,     lng: -75.447957442,      nombre: 'Medellín' },
  cali:     { lat: 3.4516,          lng: -76.5320,           nombre: 'Cali' },
};

// 4) Ciudad por slug con fallback alias
function getCiudadFromSlug(slug: string | undefined): MunicipioConSlug | null {
  if (!slug) return null;
  const directo = municipiosConSlug.find(m => m.SLUG === slug.toLowerCase());
  if (directo) return directo;
  const alias = CITY_ALIASES[slug.toLowerCase()];
  if (alias) {
    return {
      CIUDAD_DEPARTAMENTO: alias.nombre,
      CIUDAD: slug.toLowerCase(),
      DEPARTAMENTO: '',
      LATITUD: alias.lat,
      LONGITUD: alias.lng,
      SLUG: slug.toLowerCase(),
    } as MunicipioConSlug;
  }
  return null;
}

/**
 * Construye la query para la API combinando:
 * - segmentos (filtrosSinPagina)
 * - query params (searchParamsMap)
 */
function construirQuery(
  pageArg: number,
  filtrosSinPagina: string[],
  latCookie: string | undefined,
  lngCookie: string | undefined,
  isBot: boolean,
  orden: string | undefined,
  searchParamsMap: Record<string, string | undefined>
): string {
  const params = new URLSearchParams();
  params.set('page', String(pageArg));
  params.set('limit', String(PAGE_SIZE));
  if (orden) params.set('ordenPrecio', orden);

  // 1) Fechas y huéspedes desde segmentos...
  let fechaInicioFromSeg: string | undefined;
  let fechaFinFromSeg: string | undefined;
  let huespedesFromSeg: string | undefined;

  const restantes = filtrosSinPagina.filter(seg => {
    if (seg.startsWith('fechainicio=')) {
      fechaInicioFromSeg = seg.split('=')[1];
      return false;
    }
    if (seg.startsWith('fechafin=')) {
      fechaFinFromSeg = seg.split('=')[1];
      return false;
    }
    if (seg.startsWith('huespedes=')) {
      huespedesFromSeg = seg.split('=')[1];
      return false;
    }
    return true;
  });

  // ...y desde query params (prioridad para searchParams si existen)
  const fechaInicio = searchParamsMap.fechaInicio ?? fechaInicioFromSeg;
  const fechaFin    = searchParamsMap.fechaFin ?? fechaFinFromSeg;
  const huespedes   = searchParamsMap.totalHuespedes ?? huespedesFromSeg;
  const aceptaMascotasQS = searchParamsMap.aceptaMascotas;

  if (fechaInicio) params.set('fechaInicio', fechaInicio);
  if (fechaFin) params.set('fechaFin', fechaFin);
  if (huespedes && Number(huespedes) > 1) {
    params.set('totalHuespedes', huespedes);
  }
  if (aceptaMascotasQS === 'true') {
    params.set('aceptaMascotas', 'true');
  }

  // 2) Ciudad
  const ciudad = getCiudadFromSlug(restantes[0]);
  if (ciudad) {
    params.set('lat', String(ciudad.LATITUD));
    params.set('lng', String(ciudad.LONGITUD));
  } else if (latCookie && lngCookie && !isBot) {
    params.set('lat', latCookie);
    params.set('lng', lngCookie);
    params.set('distanciaMax', '1500');
  }

  // 3) Tipo
  const tipo = restantes.find(f => TIPOS.includes(f.toLowerCase()));
  if (tipo) params.set('tipoGlamping', tipo.toLowerCase());

  // 4) Amenidades (resto)
  const sinCiudad = ciudad ? restantes.slice(1) : restantes;
  const sinTipo = tipo ? sinCiudad.filter(f => f.toLowerCase() !== tipo.toLowerCase()) : sinCiudad;

  const amenidades = sinTipo.filter(
    a =>
      !/^orden-(asc|desc)$/.test(a) &&
      !a.startsWith('fechainicio=') &&
      !a.startsWith('fechafin=') &&
      !a.startsWith('huespedes=')
  );
  amenidades.forEach(a => params.append('amenidades', a.toLowerCase()));

  return params.toString();
}

export default async function TarjetasEcommerceServer({ filtros = [], searchParams = {} }: Props) {
  // 0) Headers/cookies
  const headersList = await headers();
  const cookieStore = await cookies();

  const userAgent = headersList.get('user-agent') || '';
  const isBot = /googlebot|bingbot|slurp|duckduckbot/i.test(userAgent);
  const latCookie = cookieStore.get('glampings_lat')?.value;
  const lngCookie = cookieStore.get('glampings_lng')?.value;

  // 1) Página
  const last = filtros[filtros.length - 1] || '';
  const match = last.match(/^pagina-(\d+)$/);
  const pageArg = match ? parseInt(match[1], 10) : 1;

  // 2) Orden
  const ordenSegment = filtros.find(seg => /^orden-(asc|desc)$/.test(seg));
  const orden = ordenSegment ? ordenSegment.replace('orden-', '') : undefined;

  // 3) Limpiar segmentos
  const filtrosSinPagina = limpiarSegmentosPagina(filtros);

  // 4) Normalizar searchParams para fácil acceso
  const sp = (key: string) => {
    const v = searchParams[key];
    return Array.isArray(v) ? v[0] : v;
  };
  const searchParamsMap: Record<string, string | undefined> = {
    fechaInicio: sp('fechaInicio'),
    fechaFin: sp('fechaFin'),
    totalHuespedes: sp('totalHuespedes'),
    aceptaMascotas: sp('aceptaMascotas'),
    utm_source: sp('utm_source'),
    utm_medium: sp('utm_medium'),
    utm_campaign: sp('utm_campaign'),
  };

  // 5) Construir y llamar API
  const qs = construirQuery(pageArg, filtrosSinPagina, latCookie, lngCookie, isBot, orden, searchParamsMap);

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

  return <TarjetasEcommerce initialData={glampings} initialTotal={total} />;
}
