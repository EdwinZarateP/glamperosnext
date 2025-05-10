// TarjetasEcommerce.tsx
"use client"

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Tarjeta from '../Tarjeta';
import './estilos.css';

import {
  MdPool,
  MdOutlineCabin,
  MdOutlineKeyboardArrowLeft,
  MdOutlineKeyboardArrowRight
} from "react-icons/md";
import {
  FaHotTubPerson,
  FaCat,
  // FaCaravan,
  FaUmbrellaBeach,
  FaTemperatureArrowUp,
  FaTemperatureArrowDown
} from 'react-icons/fa6';
import {
  GiFishingNet,
  GiCampingTent,
  GiHabitatDome,
  // GiTreehouse,
  GiHut,
  GiDesert,
  GiHiking,
  GiRiver,
  GiWaterfall,
  GiEagleEmblem
} from "react-icons/gi";
import { PiCoffeeBeanFill, PiMountainsBold } from 'react-icons/pi';
import { BsTreeFill } from "react-icons/bs";

interface TarjetasEcommerceProps {
  filtros?: string[];
}

const API_BASE = 'http://127.0.0.1:8000/glampings/glampingfiltrados';
const PAGE_SIZE = 30;

// 1) Definimos un array unificado de filtros con valor, label e ícono:
const FILTROS = [
  // Ciudades
  { value: 'cerca-bogota',     label: 'Cerca a Bogotá',    icon: <GiEagleEmblem /> },
  { value: 'cerca-medellin',   label: 'Cerca a Medellín',  icon: <PiCoffeeBeanFill /> },
  { value: 'cerca-cali',       label: 'Cerca a Cali',      icon: <FaCat /> },

  // Tipo
  { value: 'domo',             label: 'Domo',              icon: <GiHabitatDome /> },
  { value: 'tipi',             label: 'Tipi',              icon: <GiHut /> },
  { value: 'tienda',           label: 'Tienda',            icon: <GiCampingTent /> },
  { value: 'cabana',           label: 'Cabaña',            icon: <MdOutlineCabin /> },
  { value: "lumipod", label: "Lumipod", icon: (<img src="https://storage.googleapis.com/glamperos-imagenes/Imagenes/lumi.svg" alt="Lumipod" className="Paso1B-svg-icono" />),},

  // Amenidades
  { value: 'jacuzzi',          label: 'Jacuzzi',           icon: <FaHotTubPerson /> },
  { value: 'piscina',          label: 'Piscina',           icon: <MdPool /> },
  { value: 'malla-catamaran',  label: 'Malla Catamarán',   icon: <GiFishingNet /> },
  { value: 'clima-calido',     label: 'Clima Cálido',      icon: <FaTemperatureArrowUp /> },
  { value: 'clima-frio',       label: 'Clima Frío',        icon: <FaTemperatureArrowDown /> },
  { value: 'playa',            label: 'Playa',             icon: <FaUmbrellaBeach /> },
  { value: 'naturaleza',       label: 'Naturaleza',        icon: <BsTreeFill /> },
  { value: 'en-la-montana',    label: 'En la Montaña',     icon: <PiMountainsBold /> },
  { value: 'desierto',         label: 'Desierto',          icon: <GiDesert /> },
  { value: 'caminata',         label: 'Caminata',          icon: <GiHiking /> },
  { value: 'cascada',         label: 'Cascada',          icon: <GiWaterfall /> },
  { value: 'rio',         label: 'Río',          icon: <GiRiver /> },

];

// 2) Creamos los arrays de valores para lógica interna
const CIUDADES   = FILTROS.filter(f => ['cerca-bogota','cerca-medellin','cerca-cali'].includes(f.value)).map(f => f.value);
const TIPOS      = FILTROS.filter(f => ['domo','tipi','tienda','cabana','lulipod'].includes(f.value)).map(f => f.value);
// const AMENIDADES = FILTROS
//   .map(f => f.value)
//   .filter(v => !CIUDADES.includes(v) && !TIPOS.includes(v));

export default function TarjetasEcommerce({ filtros }: TarjetasEcommerceProps) {
  const router = useRouter();
  const [glampings, setGlampings] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [queryEnviada, setQueryEnviada] = useState('');
  const observerRef      = useRef<HTMLDivElement>(null);
  const observerInstance = useRef<IntersectionObserver | null>(null);
  const scrollRef        = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const offset = dir === 'left' ? -200 : 200;
    scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
  };

  // 3) Filtrado aplicado
  const applied         = filtros ?? [];
  const ciudadFilter    = applied.find(f => CIUDADES.includes(f)) || null;
  const tipoFilter      = applied.find(f => TIPOS.includes(f)) || null;
  const amenidadesFilter= applied.filter(f => f !== ciudadFilter && f !== tipoFilter);

  // clave para reiniciar carga
  const canonical  = [ciudadFilter, tipoFilter, ...amenidadesFilter].filter(Boolean) as string[];
  const filtersKey = canonical.join(',');

  // coordenadas por ciudad
  const getCoords = (c: string) => ({
    'cerca-bogota':   { lat: 4.710989, lng: -74.07209 },
    'cerca-medellin': { lat: 6.244203, lng: -75.5812119 },
    'cerca-cali':     { lat: 3.451647, lng: -76.531985 },
  }[c] || { lat: 4.710989, lng: -74.07209 });

  // normaliza respuesta
  const normalize = (json: any): any[] =>
    Array.isArray(json) ? json : Array.isArray(json.glampings) ? json.glampings : [];

  // mapea a props de Tarjeta
  const mapProps = (g: any) => {
    const ubic = typeof g.ubicacion === 'string' ? JSON.parse(g.ubicacion) : g.ubicacion;
    return {
      glampingId: g._id,
      imagenes: g.imagenes,
      ciudad: g.ciudad_departamento,
      precio: g.precioEstandar,
      calificacion: g.calificacion,
      favorito: false,
      onFavoritoChange: () => {},
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
    };
  };

  // reset al cambiar filtros
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    setGlampings([]);
  }, [filtersKey]);

  // carga inicial y paginada
  useEffect(() => {
    const load = async () => {
      if (!hasMore) return;
      setLoading(true);
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(PAGE_SIZE));
      if (tipoFilter) params.set('tipoGlamping', tipoFilter);
      amenidadesFilter.forEach(a => params.append('amenidades', a));
      if (ciudadFilter) {
        const { lat, lng } = getCoords(ciudadFilter);
        params.set('lat', String(lat));
        params.set('lng', String(lng));
        params.set('distanciaMax', '150');
      }
      const url = `${API_BASE}?${params}`;
      setQueryEnviada(url);
      try {
        const res = await fetch(url);
        if (res.status === 404) { setHasMore(false); return; }
        const data = normalize(await res.json());
        setGlampings(prev => page === 1 ? data : [...prev, ...data]);
        if (data.length < PAGE_SIZE) setHasMore(false);
      } catch {
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page, filtersKey, ciudadFilter, tipoFilter, JSON.stringify(amenidadesFilter)]);

  // infinite scroll
  useEffect(() => {
    const onIntersect: IntersectionObserverCallback = entries => {
      if (entries[0].isIntersecting && !loading && hasMore) {
        observerInstance.current?.unobserve(observerRef.current!);
        setPage(p => p + 1);
      }
    };
    observerInstance.current = new IntersectionObserver(onIntersect, { rootMargin: '200px', threshold: 0.1 });
    if (observerRef.current) observerInstance.current.observe(observerRef.current);
    return () => observerInstance.current?.disconnect();
  }, []);

  useEffect(() => {
    if (!loading && hasMore && observerRef.current) {
      observerInstance.current?.observe(observerRef.current);
    }
  }, [loading, hasMore]);

  // alternar filtro
  const toggleFilter = (value: string) => {
    let list = [...canonical];
    if (list.includes(value)) {
      list = list.filter(x => x !== value);
    } else {
      if (CIUDADES.includes(value)) list = list.filter(x => !CIUDADES.includes(x));
      if (TIPOS.includes(value))    list = list.filter(x => !TIPOS.includes(x));
      list.push(value);
    }
    const ciudad = list.find(x => CIUDADES.includes(x)) || null;
    const tipo   = list.find(x => TIPOS.includes(x))    || null;
    const amens  = list.filter(x => x !== ciudad && x !== tipo);
    const pathSegments = [...(ciudad ? [ciudad] : []), ...(tipo ? [tipo] : []), ...amens];
    const path = pathSegments.length ? `/glampings/${pathSegments.join('/')}` : '/glampings';
    router.push(path);
  };

  return (
    <div className="TarjetasEcommerce-container">
      <div className="TarjetasEcommerce-results">
        {glampings.length} resultados
      </div>
      <pre className="TarjetasEcommerce-debug">{queryEnviada}</pre>

      {/* Scroll de filtros con flechas */}
      <div className="TarjetasEcommerce-filtros-wrapper">
        <button
          className="TarjetasEcommerce-scroll-btn izquierda"
          onClick={() => scroll('left')}
        >
          <MdOutlineKeyboardArrowLeft size={24}/>
        </button>

        <div className="TarjetasEcommerce-filtros-scroll" ref={scrollRef}>
          {FILTROS.map(({ value, label, icon }) => {
            const isActive = canonical.includes(value);
            return (
              <div
                key={value}
                className={`TarjetasEcommerce-filtro-item ${isActive ? 'activo' : ''}`}
                onClick={() => toggleFilter(value)}
              >
                <div className="TarjetasEcommerce-filtro-icono">{icon}</div>
                <span className="TarjetasEcommerce-filtro-label">{label}</span>
              </div>
            );
          })}
        </div>

        <button
          className="TarjetasEcommerce-scroll-btn derecha"
          onClick={() => scroll('right')}
        >
          <MdOutlineKeyboardArrowRight size={24}/>
        </button>
      </div>

      {/* Migas de navegación */}
      {canonical.length > 0 && (
        <div className="TarjetasEcommerce-breadcrumbs">
          {canonical.map((val, i) => {
            const meta = FILTROS.find(f => f.value === val);
            return (
              <span key={i} className="TarjetasEcommerce-breadcrumb-item">
                {meta?.label || val}
                <button
                  className="TarjetasEcommerce-breadcrumb-remove"
                  onClick={() => toggleFilter(val)}
                >
                  ×
                </button>
              </span>
            );
          })}
        </div>
      )}

      {/* Lista de tarjetas */}
      <div className="TarjetasEcommerce-lista">
        {glampings.map(g => <Tarjeta key={g._id} {...mapProps(g)} />)}
      </div>

      {loading && <p className="TarjetasEcommerce-loading">Cargando...</p>}
      {glampings.length > 0 && <div ref={observerRef} />}
    </div>
  );
}
