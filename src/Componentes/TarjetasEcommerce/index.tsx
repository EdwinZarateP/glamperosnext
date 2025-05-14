// components/TarjetasEcommerce.tsx

"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Tarjeta from '../Tarjeta';
import HeaderGeneral from '../HeaderGeneral';
import { FILTROS } from './filtros';
import './estilos.css';

import {
  MdOutlineKeyboardArrowLeft,
  MdOutlineKeyboardArrowRight
} from "react-icons/md";

interface TarjetasEcommerceProps {
  filtros?: string[];
}

const API_BASE  = 'http://127.0.0.1:8000/glampings/glampingfiltrados';
const PAGE_SIZE = 30;

// Coordenadas aproximadas para cada ciudad
const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  bogota:   { lat: 4.711,   lng: -74.0721 },
  medellin: { lat: 6.2442,  lng: -75.5812 },
  cali:     { lat: 3.4516,  lng: -76.5320 },
};

const CIUDADES = Object.keys(CITY_COORDS);
const TIPOS    = FILTROS
  .filter(f => ['domo','tipi','tienda','cabana','lumipod'].includes(f.value))
  .map(f => f.value);
// Lista de amenidades válidas
const AMENIDADES = FILTROS.map(f => f.value)
  .filter(v => !CIUDADES.includes(v) && !TIPOS.includes(v));

export default function TarjetasEcommerce({ filtros }: TarjetasEcommerceProps) {
  const router = useRouter();

  // Derivo segmentos extra (fechas y huéspedes) de la URL
  const applied = filtros ?? [];
  const extrasFromURL = applied.filter(
    seg => !CIUDADES.includes(seg) && !TIPOS.includes(seg) && !AMENIDADES.includes(seg)
  );
  const initialFechaInicio    = extrasFromURL[0] ?? '';
  const initialFechaFin       = extrasFromURL[1] ?? '';
  const initialTotalHuespedes = extrasFromURL[2] ? Number(extrasFromURL[2]) : 1;

  // Estados para fechas y huéspedes (MANUAL)
  const [fechaInicio,    setFechaInicio]    = useState<string>(initialFechaInicio);
  const [fechaFin,       setFechaFin]       = useState<string>(initialFechaFin);
  const [totalHuespedes, setTotalHuespedes]= useState<number>(initialTotalHuespedes);

  // Parámetro visual de última consulta
  const [lastQuery, setLastQuery] = useState<string>('');

  // Resultados y paginación
  const [glampings, setGlampings] = useState<any[]>([]);
  const [page,       setPage]      = useState<number>(1);
  const [loading,    setLoading]   = useState<boolean>(false);
  const [hasMore,    setHasMore]   = useState<boolean>(true);

  const observerRef = useRef<HTMLDivElement>(null);
  const scrollRef   = useRef<HTMLDivElement>(null);

  // Filtros extraídos de la URL para ciudad/tipo/amenidades
  const ciudadFilter     = applied.find(f => CIUDADES.includes(f)) || null;
  const tipoFilter       = applied.find(f => TIPOS.includes(f))    || null;
  const amenidadesFilter = applied.filter(f => AMENIDADES.includes(f));
  const canonicalBase    = [ciudadFilter, tipoFilter, ...amenidadesFilter]
    .filter(Boolean) as string[];

  // Construye el query string para la API
  const construirQuery = (
    pageArg: number,
    fi?: string,
    ff?: string,
    th?: number
  ) => {
    const params = new URLSearchParams();
    params.set('page', String(pageArg));
    params.set('limit', String(PAGE_SIZE));
    if (ciudadFilter && CITY_COORDS[ciudadFilter]) {
      const { lat, lng } = CITY_COORDS[ciudadFilter];
      params.set('lat', String(lat));
      params.set('lng', String(lng));
    }
    if (tipoFilter) params.set('tipoGlamping', tipoFilter);
    amenidadesFilter.forEach(a => params.append('amenidades', a));
    if (fi) params.set('fechaInicio', fi);
    if (ff) params.set('fechaFin',    ff);
    if (th && th > 1) params.set('totalHuespedes', String(th));
    return params.toString();
  };

  // Mapea datos para la tarjeta
  const mapProps = (g: any) => {
    const ubic = typeof g.ubicacion === 'string'
      ? JSON.parse(g.ubicacion)
      : g.ubicacion;
    return {
      glampingId: g._id,
      imagenes: g.imagenes,
      ciudad: g.ciudad_departamento,
      precio: g.precioEstandar,
      calificacion: g.calificacion,
      descuento: g.descuento,
      tipoGlamping: g.tipoGlamping,
      nombreGlamping: g.nombreGlamping,
      ubicacion: { lat: ubic.lat, lng: ubic.lng },
      Acepta_Mascotas: g.Acepta_Mascotas,
      fechasReservadas: g.fechasReservadas,
      amenidadesGlobal: g.amenidadesGlobal,
      Cantidad_Huespedes: g.Cantidad_Huespedes,
      precioEstandarAdicional: g.precioEstandarAdicional,
      Cantidad_Huespedes_Adicional: g.Cantidad_Huespedes_Adicional,
      favorito: false,
      onFavoritoChange: () => {},
    };
  };

  // Llamada a la API
  const fetchGlampings = useCallback(
    async (pageArg: number, extras: string[]) => {
      setLoading(true);
      const [fi, ff, thStr] = extras;
      const th = thStr ? Number(thStr) : undefined;
      const qs = construirQuery(pageArg, fi, ff, th);
      setLastQuery(qs);
      const url = `${API_BASE}?${qs}`;
      try {
        const res = await fetch(url);
        if (res.status === 404) { setHasMore(false); return; }
        const json = await res.json();
        const arr = Array.isArray(json) ? json : json.glampings ?? [];
        setGlampings(prev => pageArg === 1 ? arr : [...prev, ...arr]);
        if (arr.length < PAGE_SIZE) setHasMore(false);
      } catch {
        setHasMore(false);
      } finally {
        setLoading(false);
        setPage(pageArg);
      }
    },
    [ciudadFilter, tipoFilter, amenidadesFilter]
  );

  // Carga inicial y cuando cambian filtros rápidos
  useEffect(() => {
    setGlampings([]);
    setHasMore(true);
    fetchGlampings(1, extrasFromURL);
  }, [ciudadFilter, tipoFilter, amenidadesFilter.join(',')]);

  // Botón Buscar: activa fechas/huespedes
  const onBuscar = () => {
    const extras = [
      ...(fechaInicio ? [fechaInicio] : []),
      ...(fechaFin    ? [fechaFin]    : []),
      ...(totalHuespedes > 1 ? [String(totalHuespedes)] : [])
    ];
    setLastQuery(construirQuery(1, extras[0], extras[1], extras[2] ? Number(extras[2]) : undefined));
    setGlampings([]);
    setHasMore(true);
    fetchGlampings(1, extras);
    const fullPath = [...canonicalBase, ...extras];
    const route = fullPath.length ? `/glampings/${fullPath.join('/')}` : '/glampings';
    router.push(route);
  };

  // Scroll infinito
  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !loading && hasMore) {
        const extras = [
          ...(fechaInicio ? [fechaInicio] : []),
          ...(fechaFin    ? [fechaFin]    : []),
          ...(totalHuespedes > 1 ? [String(totalHuespedes)] : [])
        ];
        fetchGlampings(page + 1, extras);
      }
    }, { rootMargin: '200px', threshold: 0.1 });
    if (observerRef.current) obs.observe(observerRef.current);
    return () => obs.disconnect();
  }, [fetchGlampings, loading, hasMore, page, fechaInicio, fechaFin, totalHuespedes]);

  // Toggle filtros rápidos
  const toggleFilter = (value: string) => {
    let listRaw = [...canonicalBase];
    if (listRaw.includes(value)) listRaw = listRaw.filter(x => x !== value);
    else {
      if (CIUDADES.includes(value)) listRaw = listRaw.filter(x => !CIUDADES.includes(x));
      if (TIPOS.includes(value))    listRaw = listRaw.filter(x => !TIPOS.includes(x));
      listRaw.push(value);
    }
    const city = listRaw.find(v => CIUDADES.includes(v));
    const type = listRaw.find(v => TIPOS.includes(v));
    const amenities = listRaw.filter(v => !CIUDADES.includes(v) && !TIPOS.includes(v));
    const ordered = [
      ...(city ? [city] : []),
      ...(type ? [type] : []),
      ...amenities
    ];
    const extras = [
      ...(fechaInicio ? [fechaInicio] : []),
      ...(fechaFin    ? [fechaFin]    : []),
      ...(totalHuespedes > 1 ? [String(totalHuespedes)] : [])
    ];
    const fullPath = ordered.concat(extras);
    const route = fullPath.length ? `/glampings/${fullPath.join('/')}` : '/glampings';
    router.push(route);
  };

  return (
    <div className="TarjetasEcommerce-container">
      {/* Migas */}
      <div className="TarjetasEcommerce-breadcrumbs">
        {canonicalBase.map((c,i)=><span key={i} className="TarjetasEcommerce-breadcrumb-item">{c}</span>)}
      </div>
      {/* Query */}
      <span className="TarjetasEcommerce-query">Consultando: {lastQuery}</span>
      {/* Controles */}
      <div className="TarjetasEcommerce-filters-top">
        <HeaderGeneral
          fechaInicio={fechaInicio}
          fechaFin={fechaFin}
          totalHuespedes={totalHuespedes}
          onFechaInicioChange={setFechaInicio}
          onFechaFinChange={setFechaFin}
          onTotalHuespedesChange={setTotalHuespedes}
          onBuscar={onBuscar}
        />
      </div>
      {/* Filtros rápidos */}
      <div className="TarjetasEcommerce-filtros-wrapper">
        <button className="TarjetasEcommerce-scroll-btn izquierda" onClick={() => scrollRef.current?.scrollBy({ left: -200, behavior: 'smooth' })}>
          <MdOutlineKeyboardArrowLeft size={24} />
        </button>
        <div className="TarjetasEcommerce-filtros-scroll" ref={scrollRef}>
          {FILTROS.map(f => {
            const active = canonicalBase.includes(f.value);
            return (
              <div
                key={f.value}
                className={`TarjetasEcommerce-filtro-item ${active ? 'activo' : ''}`}
                onClick={() => toggleFilter(f.value)}
              >
                <div className="TarjetasEcommerce-filtro-icono">{f.icon}</div>
                <span className="TarjetasEcommerce-filtro-label">{f.label}</span>
              </div>
            );
          })}
        </div>
        <button className="TarjetasEcommerce-scroll-btn derecha" onClick={() => scrollRef.current?.scrollBy({ left: 200, behavior: 'smooth' })}>
          <MdOutlineKeyboardArrowRight size={24} />
        </button>
      </div>
      {/* Resultados */}
      <div className="TarjetasEcommerce-results">{glampings.length} resultados</div>
      {/* Lista */}
      <div className="TarjetasEcommerce-lista">{glampings.map(g => <Tarjeta key={g._id} {...mapProps(g)} />)}</div>
      {loading && <p className="TarjetasEcommerce-loading">Cargando...</p>}
      {glampings.length > 0 && <div ref={observerRef} />}  
    </div>
  );
}
