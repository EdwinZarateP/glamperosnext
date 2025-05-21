// components/TarjetasEcommerce.tsx

"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import TarjetaGeneral from '../TarjetaGeneral';
import HeaderGeneral from '../HeaderGeneral';
import { FILTROS } from './filtros';
import Image from "next/image";
import './estilos.css';
import SkeletonCard from '../SkeletonCard/index';
import {
  MdOutlineKeyboardArrowLeft,
  MdOutlineKeyboardArrowRight
} from "react-icons/md";
import municipiosData from "../MunicipiosGeneral/municipiosGeneral.json";

type Municipio = {
  CIUDAD_DEPARTAMENTO: string;
  CIUDAD: string;
  DEPARTAMENTO: string;
  LATITUD: number;
  LONGITUD: number;
};


interface TarjetasEcommerceProps {
  filtros?: string[];
}

// Normaliza los municipios a slugs con guiones
const municipiosConSlug = municipiosData.map(m => ({
  ...m,
  SLUG: m.CIUDAD_DEPARTAMENTO.toLowerCase().replace(/\s+/g, '-')
}));


// const API_BASE  = 'http://127.0.0.1:8000/glampings/glampingfiltrados';
const API_BASE  = 'https://glamperosapi.onrender.com/glampings/glampingfiltrados';
const PAGE_SIZE = 30;

// Coordenadas aproximadas para cada ciudad
const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  bogota:   { lat: 4.711,   lng: -74.0721 },
  medellin: { lat: 6.2442,  lng: -75.5812 },
  cali:     { lat: 3.4516,  lng: -76.5320 },
};

const getCiudadFromSlug = (slug: string): Municipio | null => {
  const match = municipiosConSlug.find(
    m => m.SLUG === slug.toLowerCase()
  );
  if (match) return match;

  const key = slug.toLowerCase();
  if (CITY_COORDS[key]) {
    return {
      CIUDAD_DEPARTAMENTO: key.charAt(0).toUpperCase() + key.slice(1),
      CIUDAD: key,
      DEPARTAMENTO: "",
      LATITUD: CITY_COORDS[key].lat,
      LONGITUD: CITY_COORDS[key].lng,
    };
  }

  return null;
};

const CIUDADES = municipiosConSlug.map(m => m.SLUG.toLowerCase());

const TIPOS = FILTROS
  .filter(f => ['domo','tipi','tienda','cabana','lumipod'].includes(f.value.toLowerCase()))
  .map(f => f.value.toLowerCase());
// Lista de amenidades válidas
const AMENIDADES = FILTROS.map(f => f.value)
  .filter(v => !CIUDADES.includes(v) && !TIPOS.includes(v));

export default function TarjetasEcommerce({ filtros }: TarjetasEcommerceProps) {
  const router = useRouter();

  // Derivo segmentos extra (fechas y huéspedes) de la URL
  const applied = filtros ?? [];

  const ciudadSegment = applied[0]; // Primer segmento en la URL
  const ciudadData = ciudadSegment ? getCiudadFromSlug(ciudadSegment) : null;
  const ciudadFilter = ciudadData ? ciudadData.CIUDAD_DEPARTAMENTO : null;

  const tipoFilter = applied.find(f => TIPOS.includes(f.toLowerCase())) || null;
  const amenidadesFilter = applied.filter(f => AMENIDADES.includes(f));

  // 👇 el resto de segmentos después del primero se asumen como extras
    // Filtros extraídos de la URL para ciudad/tipo/amenidades
  const canonicalBase    = [ciudadFilter, tipoFilter, ...amenidadesFilter]
    .filter(Boolean) as string[];
  const filtrosActivos = canonicalBase.length;
  const extrasFromURL = applied.slice(filtrosActivos);
  const initialFechaInicio = extrasFromURL[0] ?? '';
  const initialFechaFin = extrasFromURL[1] ?? '';
  const initialTotalHuespedes = extrasFromURL[2] ? Number(extrasFromURL[2]) : 1;


  // Estados para fechas y huéspedes (MANUAL)
  const [fechaInicio]    = useState<string>(initialFechaInicio);
  const [fechaFin]       = useState<string>(initialFechaFin);
  const [totalHuespedes]= useState<number>(initialTotalHuespedes);

  // Parámetro visual de última consulta
  const [ , setLastQuery] = useState<string>('');

  // Resultados y paginación
  const [glampings, setGlampings] = useState<any[]>([]);
  const [page,       setPage]      = useState<number>(1);
  const [loading,    setLoading]   = useState<boolean>(false);
  const [hasMore,    setHasMore]   = useState<boolean>(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);


  const observerRef = useRef<HTMLDivElement>(null);
  const scrollRef   = useRef<HTMLDivElement>(null);

useEffect(() => {
   if (!ciudadFilter && "geolocation" in navigator) {
     navigator.geolocation.getCurrentPosition(
       pos => {
         setUserLocation({
           lat: pos.coords.latitude,
           lng: pos.coords.longitude,
         });
       },
       err => {
          console.warn("Geolocalización denegada:", err.message);
          setGeoError("No pudimos obtener tu ubicación. Verás resultados generales.");
       },
       { enableHighAccuracy: true, timeout: 10000 }
     );
   }
 }, [ciudadFilter]);

  // Construye el query string para la API
  const construirQuery = (
  pageArg: number,
  fi?: string,
  ff?: string,
  th?: number,
  ciudadForzada?: Municipio
) => {
  const params = new URLSearchParams();
  params.set('page', String(pageArg));
  params.set('limit', String(PAGE_SIZE));

  const ciudadParaQuery = ciudadForzada ?? ciudadData;

  if (ciudadParaQuery) {
    params.set('lat', String(ciudadParaQuery.LATITUD));
    params.set('lng', String(ciudadParaQuery.LONGITUD));
  } else if (userLocation) {

    params.set('lat', String(userLocation.lat));
    params.set('lng', String(userLocation.lng));
    params.set('distanciaMax', '1500');
  }


  if (tipoFilter) params.set('tipoGlamping', tipoFilter);
  amenidadesFilter.forEach(a => params.append('amenidades', a));
  if (fi) params.set('fechaInicio', fi);
  if (ff) params.set('fechaFin', ff);
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
    [userLocation, ciudadFilter, tipoFilter, amenidadesFilter]
  );

  // Carga inicial y cuando cambian filtros rápidos
  useEffect(() => {
  if (!hasFetched && (ciudadFilter || userLocation)) {
    setGlampings([]);
    setHasMore(true);
    fetchGlampings(1, extrasFromURL);
    setHasFetched(true);
  } else if (!hasFetched && geoError) {
    // Cargar resultados generales (sin coords) si negó permisos
    setGlampings([]);
    setHasMore(true);
    fetchGlampings(1, extrasFromURL);
    setHasFetched(true);
  }
}, [ciudadFilter, tipoFilter, amenidadesFilter.join(','), userLocation, hasFetched, geoError]);

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
    const val = value.toLowerCase();

    const isCity = CIUDADES.includes(val);
    const isType = TIPOS.includes(val);
    const isAmenity = AMENIDADES.includes(val);

    // Convertimos a minúsculas para comparar, pero mantenemos los originales para la URL
    let newCity = ciudadFilter?.toLowerCase() ?? null;
    let newType = tipoFilter?.toLowerCase() ?? null;
    let newAmenities = [...amenidadesFilter];

    if (isCity) {
      newCity = newCity === val ? null : val;
    } else if (isType) {
      newType = newType === val ? null : val;
    } else if (isAmenity) {
      const lowerAmenities = newAmenities.map(a => a.toLowerCase());
      if (lowerAmenities.includes(val)) {
        // Quitamos la amenidad original si ya está (independientemente de su casing)
        newAmenities = newAmenities.filter(a => a.toLowerCase() !== val);
      } else {
        // Agregamos la amenidad original desde FILTROS
        const originalAmenity = FILTROS.find(f => f.value.toLowerCase() === val)?.value;
        if (originalAmenity) newAmenities.push(originalAmenity);
      }
    }

    const ciudadSlug = municipiosConSlug.find(m => m.CIUDAD_DEPARTAMENTO.toLowerCase() === newCity)?.SLUG;
    const rutaFiltros: string[] = [
      ...(ciudadSlug ? [ciudadSlug] : []),
      ...(newType ? [newType.toLowerCase().replace(/\s+/g, '-')] : []),
      ...newAmenities.map(a => a.toLowerCase().replace(/\s+/g, '-'))
    ];


    const extras = [
      ...(fechaInicio ? [fechaInicio] : []),
      ...(fechaFin ? [fechaFin] : []),
      ...(totalHuespedes > 1 ? [String(totalHuespedes)] : [])
    ];

    const path = (rutaFiltros.length > 0 || extras.length > 0)
      ? `/glampings/${[...rutaFiltros, ...extras].join('/')}`
      : '/glampings';

    router.push(path);
  };


   const redirigirWhatsApp = () => {
    const numeroWhatsApp = "+573218695196";
    const mensaje = encodeURIComponent("Hola equipo Glamperos, ¡Quiero información sobre glampings!");
    const esPantallaPequena =
      typeof window !== "undefined" && window.innerWidth < 600;
    const urlWhatsApp = esPantallaPequena
      ? `https://wa.me/${numeroWhatsApp}?text=${mensaje}`
      : `https://web.whatsapp.com/send?phone=${numeroWhatsApp}&text=${mensaje}`;
    window.open(urlWhatsApp, "_blank");
  };

  return (
    <div className="TarjetasEcommerce-container">    
      {/* Query */}
      {/* <span className="TarjetasEcommerce-query">Consultando: {lastQuery}</span> */}
      {/* Controles */}
      <div className="TarjetasEcommerce-filters-top">
        <HeaderGeneral
          onBuscarAction={({ fechaInicio, fechaFin, totalHuespedes }) => {
            const extras = [fechaInicio, fechaFin, String(totalHuespedes)];

            const ciudadForzada = municipiosData.find(
              m => m.CIUDAD_DEPARTAMENTO.toLowerCase() === ciudadFilter?.toLowerCase()
            );
            const qs = construirQuery(1, fechaInicio, fechaFin, totalHuespedes, ciudadForzada);

            setLastQuery(qs);
            setGlampings([]);
            setHasMore(true);
            fetchGlampings(1, extras);

            const fullPath = [...canonicalBase, ...extras];
            const route = fullPath.length ? `/glampings/${fullPath.join("/")}` : "/glampings"; 
            router.push(route);
          }}
          ciudadSlug={ciudadSegment}
          tipoFilter={tipoFilter ?? undefined}
          amenidadesFilter={amenidadesFilter}
        />



      </div>
      {/* Filtros rápidos */}
      <div className="TarjetasEcommerce-filtros-wrapper">
        <button className="TarjetasEcommerce-scroll-btn izquierda" onClick={() => scrollRef.current?.scrollBy({ left: -200, behavior: 'smooth' })}>
          <MdOutlineKeyboardArrowLeft size={24} />
        </button>
        <div className="TarjetasEcommerce-filtros-scroll" ref={scrollRef}>
          {FILTROS.map(f => {
            const active = canonicalBase.map(c => c.toLowerCase()).includes(f.value.toLowerCase());
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
      {/* Migas */}
      <div className="TarjetasEcommerce-breadcrumbs">
        {canonicalBase.map((filtro, i) => (
          <span key={i} className="TarjetasEcommerce-breadcrumb-item">
            {filtro}
            <button
              className="TarjetasEcommerce-breadcrumb-remove"
              onClick={() => toggleFilter(filtro)}
            >
              ×
            </button>
          </span>
        ))}
      </div>

      {/* Resultados */}
      {/* <div className="TarjetasEcommerce-results">{glampings.length} resultados</div> */}

      <div className='TarjetasEcommerce-Titulo'>
        <h1> Descubre y reserva los Mejores Glampings en Colombia{" "}
          <Image
            src="https://upload.wikimedia.org/wikipedia/commons/2/21/Flag_of_Colombia.svg"
            alt="Bandera de Colombia"
            width={32}
            height={24}
          />
        </h1>      
        <p className="TarjetasEcommerce-descripcion">
          ✨ Descubre la magia del glamping: lujo y naturaleza en un solo destino. 🌿🏕️
        </p>
        
      </div>
      
      {/* Botón fijo de WhatsApp */}
      <button
        type="button"
        className="TarjetasEcommerce-whatsapp-button"
        onClick={redirigirWhatsApp}
        aria-label="Chatea por WhatsApp"
      >
      </button>

     
       {/* Lista con Skeleton */}
        {loading && glampings.length === 0 ? (
          <div className="TarjetasEcommerce-lista">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : glampings.length > 0 ? (
          <div className="TarjetasEcommerce-lista">
            {glampings.map(g => (
              <TarjetaGeneral key={g._id} {...mapProps(g)} />
            ))}
          </div>
        ) : (
          // <-- NUEVO BLOQUE
          <div className="TarjetasEcommerce-no-results">
            <Image
              src="https://storage.googleapis.com/glamperos-imagenes/Imagenes/meme.jpg"         // coloca aquí tu meme en /public
              alt="No hay glampings"
              width={400}
              height={300}
            />
            <p>Ups… no tenemos glampings con estas características pero sigue explorando y encontraras el ideal</p>
          </div>
        )}


      {/* Si ya cargó al menos una página y sigues en loading… */}
      {loading && glampings.length > 0 && (
        <p className="TarjetasEcommerce-loading">Cargando más resultados…</p>
      )}

      {/* Sentinel para scroll infinito */}
      {glampings.length > 0 && <div ref={observerRef} />}
    </div>
  );
}
