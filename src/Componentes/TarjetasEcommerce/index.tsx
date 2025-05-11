// src/components/TarjetasEcommerce.tsx
"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  FaUmbrellaBeach,
  FaTemperatureArrowUp,
  FaTemperatureArrowDown
} from 'react-icons/fa6';
import {
  GiFishingNet,
  GiCampingTent,
  GiHabitatDome,
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

const API_BASE  = 'http://127.0.0.1:8000/glampings/glampingfiltrados';
const PAGE_SIZE = 30;

// ----------------------------------------------------------------------------
// 1) FILTROS DEFINIDOS
// ----------------------------------------------------------------------------
const FILTROS = [
  { value: 'bogota',   label: 'Cerca a Bogotá',    icon: <GiEagleEmblem /> },
  { value: 'medellin', label: 'Cerca a Medellín',  icon: <PiCoffeeBeanFill /> },
  { value: 'cali',     label: 'Cerca a Cali',      icon: <FaCat /> },
  { value: 'domo',     label: 'Domo',               icon: <GiHabitatDome /> },
  { value: 'tipi',     label: 'Tipi',               icon: <GiHut /> },
  { value: 'tienda',   label: 'Tienda',             icon: <GiCampingTent /> },
  { value: 'cabana',   label: 'Cabaña',             icon: <MdOutlineCabin /> },
  { value: 'lumipod',  label: 'Lumipod',            icon: <img src="https://storage.googleapis.com/glamperos-imagenes/Imagenes/lumi.svg" alt="Lumipod" className="TarjetasEcommerce-svg-icon" /> },
  { value: 'jacuzzi',          label: 'Jacuzzi',    icon: <FaHotTubPerson /> },
  { value: 'piscina',          label: 'Piscina',    icon: <MdPool /> },
  { value: 'malla-catamaran',  label: 'Malla Catamarán', icon: <GiFishingNet /> },
  { value: 'clima-calido',     label: 'Clima Cálido',    icon: <FaTemperatureArrowUp /> },
  { value: 'clima-frio',       label: 'Clima Frío',      icon: <FaTemperatureArrowDown /> },
  { value: 'playa',            label: 'Playa',           icon: <FaUmbrellaBeach /> },
  { value: 'naturaleza',       label: 'Naturaleza',      icon: <BsTreeFill /> },
  { value: 'en-la-montana',    label: 'En la Montaña',   icon: <PiMountainsBold /> },
  { value: 'desierto',         label: 'Desierto',        icon: <GiDesert /> },
  { value: 'caminata',         label: 'Caminata',        icon: <GiHiking /> },
  { value: 'cascada',          label: 'Cascada',         icon: <GiWaterfall /> },
  { value: 'rio',              label: 'Río',             icon: <GiRiver /> },
];

const CIUDADES = FILTROS.filter(f => ['bogota','medellin','cali'].includes(f.value)).map(f => f.value);
const TIPOS    = FILTROS.filter(f => ['domo','tipi','tienda','cabana','lumipod'].includes(f.value)).map(f => f.value);

// ----------------------------------------------------------------------------
// 2) COMPONENTE
// ----------------------------------------------------------------------------
export default function TarjetasEcommerce({ filtros }: TarjetasEcommerceProps) {
  const router = useRouter();

  // -- Estados para fechas y huéspedes (MANUAL) --
  const [fechaInicio, setFechaInicio]       = useState<string>('');
  const [fechaFin,    setFechaFin]          = useState<string>('');
  const [totalHuespedes, setTotalHuespedes]= useState<number>(1);

  // -- Resultados y paginación --
  const [glampings, setGlampings] = useState<any[]>([]);
  const [page,       setPage]     = useState(1);
  const [loading,    setLoading]  = useState(false);
  const [hasMore,    setHasMore]  = useState(true);

  // refs para scroll infinito y filtros
  const observerRef = useRef<HTMLDivElement>(null);
  const scrollRef   = useRef<HTMLDivElement>(null);

  // -- Filtros original de URL --
  const applied          = filtros ?? [];
  const ciudadFilter     = applied.find(f => CIUDADES.includes(f)) || null;
  const tipoFilter       = applied.find(f => TIPOS.includes(f))    || null;
  const amenidadesFilter = applied.filter(f => f !== ciudadFilter && f !== tipoFilter);
  const canonicalBase    = [ciudadFilter, tipoFilter, ...amenidadesFilter].filter(Boolean) as string[];

  // ----------------------------------------------------------------------------
  // mapProps (restaurado)
  // ----------------------------------------------------------------------------
  const mapProps = (g: any) => {
    const ubic = typeof g.ubicacion === 'string' ? JSON.parse(g.ubicacion) : g.ubicacion;
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

  // ----------------------------------------------------------------------------
  // fetchGlampings: pide la API con los extras al final
  // ----------------------------------------------------------------------------
  const fetchGlampings = useCallback(async (pageArg: number, extras: string[]) => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('page', String(pageArg));
    params.set('limit', String(PAGE_SIZE));
    if (tipoFilter)      params.set('tipoGlamping', tipoFilter);
    amenidadesFilter.forEach(a => params.append('amenidades', a));

    // extras = [fechaInicio?, fechaFin?, totalHuespedes?]
    if (extras[0]) params.set('fechaInicio', extras[0]);
    if (extras[1]) params.set('fechaFin',    extras[1]);
    if (extras[2]) params.set('totalHuespedes', extras[2]);

    const url = `${API_BASE}?${params.toString()}`;
    try {
      const res = await fetch(url);
      if (res.status === 404) { setHasMore(false); return; }
      const json = await res.json();
      const arr  = Array.isArray(json) ? json : json.glampings ?? [];
      setGlampings(prev => pageArg === 1 ? arr : [...prev, ...arr]);
      if (arr.length < PAGE_SIZE) setHasMore(false);
    } catch {
      setHasMore(false);
    } finally {
      setLoading(false);
      setPage(pageArg);
    }
  }, [amenidadesFilter, tipoFilter]);

  // ----------------------------------------------------------------------------
  // Botón Buscar: arma fullCanonical, push y fetch página 1
  // ----------------------------------------------------------------------------
  const onBuscar = () => {
    const extras = [
      ...(fechaInicio ? [fechaInicio] : []),
      ...(fechaFin    ? [fechaFin]    : []),
      ...(totalHuespedes > 1 ? [String(totalHuespedes)] : [])
    ];
    const fullCanonical = [...canonicalBase, ...extras];

    // limpia lista
    setGlampings([]);
    setHasMore(true);
    // dispara fetch
    fetchGlampings(1, extras);

    // nueva ruta limpia
    const path = fullCanonical.length
      ? `/glampings/${fullCanonical.join('/')}`
      : '/glampings';
    router.push(path);
  };

  // ----------------------------------------------------------------------------
  // Scroll infinito
  // ----------------------------------------------------------------------------
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
  }, [
    fetchGlampings,
    loading,
    hasMore,
    page,
    fechaInicio,
    fechaFin,
    totalHuespedes
  ]);

  // ----------------------------------------------------------------------------
  // Toggle filtro horizontal
  // ----------------------------------------------------------------------------
  const toggleFilter = (value: string) => {
    let list = [...canonicalBase];
    if (list.includes(value)) list = list.filter(x => x !== value);
    else {
      if (CIUDADES.includes(value)) list = list.filter(x => !CIUDADES.includes(x));
      if (TIPOS.includes(value))    list = list.filter(x => !TIPOS.includes(x));
      list.push(value);
    }
    const path = list.length ? `/glampings/${list.join('/')}` : '/glampings';
    router.push(path);
  };

  // ----------------------------------------------------------------------------
  // RENDER
  // ----------------------------------------------------------------------------
  return (
    <div className="TarjetasEcommerce-container">

      {/* sección de inputs + botón */}
      <div className="TarjetasEcommerce-filters-top">
        <div className="TarjetasEcommerce-search-controls">
          <label>
            Fecha inicio:
            <input
              type="date"
              value={fechaInicio}
              onChange={e => setFechaInicio(e.target.value)}
            />
          </label>
          <label>
            Fecha fin:
            <input
              type="date"
              value={fechaFin}
              onChange={e => setFechaFin(e.target.value)}
            />
          </label>
          <label>
            Huéspedes:
            <input
              type="number"
              min={1}
              value={totalHuespedes}
              onChange={e => setTotalHuespedes(Number(e.target.value))}
            />
          </label>
          <button
            className="TarjetasEcommerce-search-btn"
            onClick={onBuscar}
          >
            Buscar
          </button>
        </div>
      </div>

      {/* filtros horizontales */}
      <div className="TarjetasEcommerce-filtros-wrapper">
        <button
          className="TarjetasEcommerce-scroll-btn izquierda"
          onClick={() => scrollRef.current?.scrollBy({ left: -200, behavior: 'smooth' })}
        >
          <MdOutlineKeyboardArrowLeft size={24}/>
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
        <button
          className="TarjetasEcommerce-scroll-btn derecha"
          onClick={() => scrollRef.current?.scrollBy({ left: 200, behavior: 'smooth' })}
        >
          <MdOutlineKeyboardArrowRight size={24}/>
        </button>
      </div>

      {/* resultados */}
      <div className="TarjetasEcommerce-results">
        {glampings.length} resultados
      </div>

      {/* lista */}
      <div className="TarjetasEcommerce-lista">
        {glampings.map(g => <Tarjeta key={g._id} {...mapProps(g)} />)}
      </div>

      {loading && <p className="TarjetasEcommerce-loading">Cargando...</p>}
      {glampings.length > 0 && <div ref={observerRef} />}
    </div>
  );
}
