"use client"

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import TarjetaGeneral from '../TarjetaGeneral';
const HeaderGeneral = dynamic(() => import('../HeaderGeneral'), { ssr: false });
import { FILTROS } from './filtros';
import Image from 'next/image';
import SkeletonCard from '../SkeletonCard';
import { MdOutlineKeyboardArrowLeft, MdOutlineKeyboardArrowRight } from 'react-icons/md';
import municipiosData from '../MunicipiosGeneral/municipiosGeneral.json';
import './estilos.css';

// --- Types ---
type Municipio = {
  CIUDAD_DEPARTAMENTO: string;
  CIUDAD: string;
  DEPARTAMENTO: string;
  LATITUD: number;
  LONGITUD: number;
};

type MunicipioConSlug = Municipio & { SLUG: string };

interface TarjetasEcommerceProps {
  filtros?: string[];
}

// --- Constants ---
const API_BASE = 'https://glamperosapi.onrender.com/glampings/glampingfiltrados';
const PAGE_SIZE = 30;

// Coordenadas aproximadas para ciudades
const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  bogota:   { lat: 4.711,  lng: -74.0721 },
  medellin: { lat: 6.2442, lng: -75.5812 },
  cali:     { lat: 3.4516, lng: -76.5320 },
};

// Precompute municipios con slug
const municipiosConSlug: MunicipioConSlug[] = municipiosData.map(m => ({
  ...m,
  SLUG: m.CIUDAD_DEPARTAMENTO.toLowerCase().replace(/\s+/g, '-')
}));
const CIUDADES = municipiosConSlug.map(m => m.SLUG);

// Tipos de glamping válidos
const TIPOS = FILTROS
  .filter(f => ['domo','tipi','tienda','cabana','lumipod'].includes(f.value.toLowerCase()))
  .map(f => f.value.toLowerCase());

// Amenidades válidas
const AMENIDADES = FILTROS.map(f => f.value)
  .filter(v => !CIUDADES.includes(v.toLowerCase()) && !TIPOS.includes(v.toLowerCase()));

// Obtiene datos de ciudad desde slug
const getCiudadFromSlug = (slug: string): MunicipioConSlug | null => {
  const lower = slug.toLowerCase();
  const found = municipiosConSlug.find(m => m.SLUG === lower);
  if (found) return found;
  const coords = CITY_COORDS[lower];
  if (coords) {
    return {
      CIUDAD_DEPARTAMENTO: lower.charAt(0).toUpperCase() + lower.slice(1),
      CIUDAD: lower,
      DEPARTAMENTO: '',
      LATITUD: coords.lat,
      LONGITUD: coords.lng,
      SLUG: lower
    };
  }
  return null;
};

export default function TarjetasEcommerce({ filtros }: TarjetasEcommerceProps) {
  const router = useRouter();

  // Deriva filtros de la URL
  const appliedSegments = filtros ?? [];
  const ciudadSlugParam = appliedSegments[0];
  const ciudadData = ciudadSlugParam ? getCiudadFromSlug(ciudadSlugParam) : null;
  const ciudadFilter = ciudadData?.CIUDAD_DEPARTAMENTO || null;
  const startIndex = ciudadData ? 1 : 0;
  const tipoFilter = appliedSegments
    .slice(startIndex)
    .find(seg => TIPOS.includes(seg.toLowerCase())) || null;
  const amenidadesFilter = appliedSegments
    .slice(startIndex)
    .filter(seg => AMENIDADES.includes(seg));

  // Base canónica de filtros
  const canonicalBase = useMemo(() => [
    ...(ciudadData ? [ciudadData.SLUG] : []),
    ...(tipoFilter ? [tipoFilter.toLowerCase().replace(/\s+/g, '-')] : []),
    ...amenidadesFilter.map(a => a.toLowerCase().replace(/\s+/g, '-'))
  ], [ciudadData, tipoFilter, amenidadesFilter.join(',')]);

  // Extras: fechas, huespedes, mascotas
  const extrasFromURL = appliedSegments.slice(canonicalBase.length);
  const initialFechaInicio = extrasFromURL[0] || '';
  const initialFechaFin = extrasFromURL[1] || '';
  const initialTotalHuespedes = extrasFromURL[2] ? Number(extrasFromURL[2]) : 1;
  const aceptaMascotas = extrasFromURL.includes('mascotas');

  // States
  const [fechaInicio] = useState(initialFechaInicio);
  const [fechaFin] = useState(initialFechaFin);
  const [totalHuespedes] = useState(initialTotalHuespedes);
  const [, setLastQuery] = useState('');
  const [glampings, setGlampings] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [userLocation, setUserLocation] = useState<{lat:number,lng:number}|null>(null);
  const [geoError, setGeoError] = useState<string|null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  const observerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const observer = useRef<IntersectionObserver|null>(null);

  // Restaurar scroll
  useEffect(() => {
    if (document.referrer.includes('/explorarglamping')) {
      const scrollY = sessionStorage.getItem('glampings-scroll');
      if (scrollY) {
        window.scrollTo({ top: Number(scrollY), behavior: 'smooth' });
        sessionStorage.removeItem('glampings-scroll');
      }
    }
  }, []);

  // Geolocalización automática
  useEffect(() => {
    if (!ciudadFilter && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        pos => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        err => { console.warn(err); setGeoError('No pudimos obtener tu ubicación.'); },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, [ciudadFilter]);

  // Construir query string
  const construirQuery = useCallback((pageArg:number, fi?:string, ff?:string, th?:number, forcedCity?:Municipio, mascotas?:boolean) => {
    const params = new URLSearchParams();
    params.set('page', String(pageArg));
    params.set('limit', String(PAGE_SIZE));
    if (mascotas) params.set('aceptaMascotas','true');
    const loc = forcedCity ?? ciudadData;
    if (loc) {
      params.set('lat', String(loc.LATITUD));
      params.set('lng', String(loc.LONGITUD));
    } else if (userLocation) {
      params.set('lat', String(userLocation.lat));
      params.set('lng', String(userLocation.lng));
      params.set('distanciaMax','1500');
    }
    if (tipoFilter) params.set('tipoGlamping', tipoFilter);
    amenidadesFilter.forEach(a => params.append('amenidades', a));
    if (fi) params.set('fechaInicio', fi);
    if (ff) params.set('fechaFin', ff);
    if (th && th>1) params.set('totalHuespedes', String(th));
    return params.toString();
  }, [ciudadData, userLocation, tipoFilter, amenidadesFilter]);

  // Mapear datos para tarjeta
  const mapProps = useCallback((g:any) => {
    const ubic = typeof g.ubicacion==='string' ? JSON.parse(g.ubicacion) : g.ubicacion;
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
      favorito:false,
      onFavoritoChange:()=>{}
    };
  }, []);

  // Fetch glampings
  const fetchGlampings = useCallback(async(pageArg:number, extras:string[]) => {
    setLoading(true);
    const [fi,ff,thStr] = extras;
    const th = thStr?Number(thStr):undefined;
    const qs = construirQuery(pageArg,fi,ff,th,undefined,aceptaMascotas);
    setLastQuery(qs);
    try{
      const res = await fetch(`${API_BASE}?${qs}`);
      if(res.status===404){ setHasMore(false); return; }
      const json = await res.json();
      const arr = Array.isArray(json)?json:json.glampings||[];
      setGlampings(prev=> pageArg===1?arr:[...prev,...arr]);
      if(arr.length<PAGE_SIZE) setHasMore(false);
      sessionStorage.setItem('glampings-cache', JSON.stringify(pageArg===1?arr:[...glampings,...arr]));
      sessionStorage.setItem('glampings-page', String(pageArg));
    }catch{
      setHasMore(false);
    }finally{
      setLoading(false);
      setPage(pageArg);
    }
  }, [construirQuery, aceptaMascotas]);

  // Carga inicial y cambios de filtros
  useEffect(()=>{
    const cache = sessionStorage.getItem('glampings-cache');
    const pageCached = sessionStorage.getItem('glampings-page');
    if(!hasFetched && cache && pageCached && ciudadFilter){
      setGlampings(JSON.parse(cache)); setPage(Number(pageCached)); setHasFetched(true); return;
    }
    if(!hasFetched && (ciudadFilter||userLocation||geoError)){
      setGlampings([]); setHasMore(true); fetchGlampings(1,extrasFromURL); setHasFetched(true);
    }
  }, [ciudadFilter,userLocation,geoError,fetchGlampings,extrasFromURL,hasFetched]);

  // Scroll infinito con IntersectionObserver
  useEffect(()=>{
    if(observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries=>{
      if(entries[0].isIntersecting && !loading && hasMore){
        const extras = [
          ...(fechaInicio?[fechaInicio]:[]),
          ...(fechaFin?[fechaFin]:[]),
          ...(totalHuespedes>1?[String(totalHuespedes)]:[]),
          ...(aceptaMascotas?['mascotas']:[])
        ];
        fetchGlampings(page+1,extras);
      }
    },{ rootMargin:'200px', threshold:0.1 });
    if(observerRef.current) observer.current.observe(observerRef.current);
    return()=>observer.current?.disconnect();
  }, [fetchGlampings,loading,hasMore,page,fechaInicio,fechaFin,totalHuespedes,aceptaMascotas]);

  // Manejar clic en tarjeta para guardar scroll
  const handleCardClick = () => sessionStorage.setItem('glampings-scroll',String(window.scrollY));

  // Toggle rápido de filtros
  const toggleFilter = useCallback((value:string)=>{
    sessionStorage.removeItem('glampings-cache');
    sessionStorage.removeItem('glampings-page');
    sessionStorage.removeItem('glampings-scroll');
    const lower = value.toLowerCase();
    const isCity = CIUDADES.includes(lower);
    const isType = TIPOS.includes(lower);
    const isAmenity = AMENIDADES.includes(lower);

    let newCity = ciudadFilter?.toLowerCase().replace(/\s+/g,'-')||null;
    let newType = tipoFilter?.toLowerCase()||null;
    let newAmenities = [...amenidadesFilter];

    if(isCity) newCity = newCity===lower?null:lower;
    else if(isType) newType = newType===lower?null:lower;
    else if(isAmenity){
      const lowers = newAmenities.map(a=>a.toLowerCase());
      if(lowers.includes(lower)) newAmenities=newAmenities.filter(a=>a.toLowerCase()!==lower);
      else { const orig=FILTROS.find(f=>f.value.toLowerCase()===lower)?.value; if(orig) newAmenities.push(orig); }
    }

    const parts=[
      ...(newCity?[newCity]:[]),
      ...(newType?[newType.replace(/\s+/g,'-')]:[]),
      ...newAmenities.map(a=>a.toLowerCase().replace(/\s+/g,'-'))
    ];
    const extras=[
      ...(fechaInicio?[fechaInicio]:[]),
      ...(fechaFin?[fechaFin]:[]),
      ...(totalHuespedes>1?[String(totalHuespedes)]:[]),
      ...(aceptaMascotas?['mascotas']:[])
    ];
    const path=parts.length||extras.length?`/${[...parts,...extras].join('/')}`:'/';
    router.push(path);
  },[ciudadFilter,tipoFilter,amenidadesFilter,fechaInicio,fechaFin,totalHuespedes,aceptaMascotas,router]);

  // Botón WhatsApp
  const redirigirWhatsApp = () => {
    const num='+573218695196';
    const msg=encodeURIComponent('Hola equipo Glamperos, ¡Quiero información sobre glampings!');
    const small=typeof window!=='undefined'&&window.innerWidth<600;
    const url=small?`https://wa.me/${num}?text=${msg}`:`https://web.whatsapp.com/send?phone=${num}&text=${msg}`;
    window.open(url,'_blank');
  };

  // Renderizado memoizado de filtros rápidos
  const filtrosRenderizados = useMemo(() => FILTROS.map(f => {
    const active = canonicalBase.includes(f.value.toLowerCase().replace(/\s+/g,'-'));
    return (
      <div key={f.value} className={`TarjetasEcommerce-filtro-item ${active?'activo':''}`} onClick={()=>toggleFilter(f.value)}>
        <div className="TarjetasEcommerce-filtro-icono">{f.icon}</div>
        <span className="TarjetasEcommerce-filtro-label">{f.label}</span>
      </div>
    );
  }), [canonicalBase.join(',')]);

  return (
    <div className="TarjetasEcommerce-container">
      {/* Header y búsqueda */}
      <div className="TarjetasEcommerce-filters-top">
        <HeaderGeneral
          onBuscarAction={({fechaInicio,fechaFin,totalHuespedes,aceptaMascotas})=>{
            const extras=[fechaInicio,fechaFin,String(totalHuespedes),...(aceptaMascotas?['mascotas']:[])];
            sessionStorage.removeItem('glampingscache');
            setGlampings([]); setHasMore(true);
            fetchGlampings(1,extras);
            const ruta=[...canonicalBase,...extras].join('/');
            router.push(ruta?`/${ruta}`:'/');
          }}
          ciudadSlug={ciudadData?.SLUG}
          tipoFilter={tipoFilter||undefined}
          amenidadesFilter={amenidadesFilter}
        />
      </div>

      {/* Scroll de filtros rápidos */}
      <div className="TarjetasEcommerce-filtros-wrapper">
        <button className="TarjetasEcommerce-scroll-btn izquierda" onClick={()=>scrollRef.current?.scrollBy({left:-200,behavior:'smooth'})}>
          <MdOutlineKeyboardArrowLeft size={24} />
        </button>
        <div className="TarjetasEcommerce-filtros-scroll" ref={scrollRef}>
          {filtrosRenderizados}
        </div>
        <button className="TarjetasEcommerce-scroll-btn derecha" onClick={()=>scrollRef.current?.scrollBy({left:200,behavior:'smooth'})}>
          <MdOutlineKeyboardArrowRight size={24} />
        </button>
      </div>

      {/* Breadcrumbs */}
      <div className="TarjetasEcommerce-breadcrumbs">
        {canonicalBase.map((item,i)=>(
          <span key={i} className="TarjetasEcommerce-breadcrumb-item">
            {item} <button className="TarjetasEcommerce-breadcrumb-remove" onClick={()=>toggleFilter(item)}>×</button>
          </span>
        ))}
      </div>

      {/* Título y descripción */}
      <div className="TarjetasEcommerce-Titulo">
        <h1>
          Descubre y reserva los Mejores Glampings en Colombia{' '}
          <Image src="https://upload.wikimedia.org/wikipedia/commons/2/21/Flag_of_Colombia.svg" alt="Bandera de Colombia" width={32} height={24} priority />
        </h1>
        <p className="TarjetasEcommerce-descripcion">
          ✨ Descubre la magia del glamping: lujo y naturaleza en un solo destino. 🌿🏕️
        </p>
      </div>

      {/* Botón WhatsApp */}
      <button type="button" className="TarjetasEcommerce-whatsapp-button" onClick={redirigirWhatsApp} aria-label="Chatea por WhatsApp" />

      {/* Lista de resultados */}
      {loading && glampings.length===0 ? (
        <div className="TarjetasEcommerce-lista">
          {Array.from({length:6}).map((_,i)=><SkeletonCard key={i} />)}
        </div>
      ) : glampings.length>0 ? (
        <div className="TarjetasEcommerce-lista">
          {glampings.map(g=><TarjetaGeneral key={g._id} {...mapProps(g)} onClick={handleCardClick} />)}
        </div>
      ) : (!loading && hasFetched) ? (
        <div className="TarjetasEcommerce-no-results">
          <Image src="https://storage.googleapis.com/glamperos-imagenes/Imagenes/meme.jpg" alt="No hay glampings" width={400} height={300} />
          <p>Ups… no tenemos glampings con estas características, pero sigue explorando.</p>
        </div>
      ) : null}

      {/* Cargando más */}
      {loading && glampings.length>0 && <p className="TarjetasEcommerce-loading">Cargando más resultados…</p>}

      {/* Sentinel para infinito */}
      {glampings.length>0 && <div ref={observerRef} />}  
    </div>
  );
}
