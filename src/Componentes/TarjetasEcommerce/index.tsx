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
import { FaHotTubPerson, FaCat, FaCaravan, FaUmbrellaBeach, FaTemperatureArrowUp, FaTemperatureArrowDown } from 'react-icons/fa6';
import { GiFishingNet, GiCampfire, GiCampingTent, GiHabitatDome, GiTreehouse, GiHut, GiDesert, GiHiking, GiRiver, GiWaterfall } from "react-icons/gi";
import { PiCoffeeBeanFill, PiMountainsBold } from 'react-icons/pi';
import { BsTreeFill } from "react-icons/bs";

interface TarjetasEcommerceProps {
  filtros?: string[];
}

const API_BASE = 'http://127.0.0.1:8000/glampings/glampingfiltrados';
const PAGE_SIZE = 30;

const CIUDADES = ['cerca-bogota', 'cerca-medellin', 'cerca-cali'];
const TIPOS = ['domo', 'tipi', 'tienda', 'cabana', 'lulipod', 'remolque'];
const AMENIDADES = ['jacuzzi', 'piscina', 'malla-catamaran', 'clima-calido', 'clima-frio', 'playa', 'naturaleza', 'en-la-montana', 'desierto', 'caminata'];

const obtenerIcono = (label: string) => {
  switch (label.toLowerCase()) {
    case 'cerca-bogota': return <GiHut />;
    case 'cerca-medellin': return <PiCoffeeBeanFill />;
    case 'cerca-cali': return <FaCat />;
    case 'jacuzzi': return <FaHotTubPerson />;
    case 'piscina': return <MdPool />;
    case 'malla-catamaran': return <GiFishingNet />;
    case 'zona-fogata': return <GiCampfire />;
    case 'domo': return <GiHabitatDome />;
    case 'tipi': return <GiHut />;
    case 'tienda': return <GiCampingTent />;
    case 'cabana': return <MdOutlineCabin />;
    case 'remolque': return <FaCaravan />;
    case 'lulipod': return <GiTreehouse />;
    case 'clima-calido': return <FaTemperatureArrowUp />;
    case 'clima-frio': return <FaTemperatureArrowDown />;
    case 'playa': return <FaUmbrellaBeach />;
    case 'naturaleza': return <BsTreeFill />;
    case 'rio': return <GiRiver />;
    case 'cascada': return <GiWaterfall />;
    case 'en-la-montana': return <PiMountainsBold />;
    case 'desierto': return <GiDesert />;
    case 'caminata': return <GiHiking />;
    default: return <span>🌿</span>;
  }
};

export default function TarjetasEcommerce({ filtros }: TarjetasEcommerceProps) {
  const router = useRouter();
  const [glampings, setGlampings] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [queryEnviada, setQueryEnviada] = useState('');
  const observerRef = useRef<HTMLDivElement>(null);
  const observerInstance = useRef<IntersectionObserver | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = dir === 'left' ? -200 : 200;
    scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
  };

  // filtros aplicados
  const applied = filtros ?? [];
  const ciudadFilter = applied.find(f => CIUDADES.includes(f.toLowerCase())) || null;
  const tipoFilter = applied.find(f => TIPOS.includes(f)) || null;
  const amenidadesFilter = applied.filter(f => f !== ciudadFilter && f !== tipoFilter);

  // clave única para reconstruir URL y disparar efectos
  const canonical = [ciudadFilter, tipoFilter, ...amenidadesFilter].filter(Boolean) as string[];
  const filtersKey = canonical.join(',');

  // coordenadas por ciudad
  const getCoords = (c: string) => ({
    'cerca-bogota': { lat: 4.710989, lng: -74.07209 },
    'cerca-medellin': { lat: 6.244203, lng: -75.5812119 },
    'cerca-cali': { lat: 3.451647, lng: -76.531985 },
  }[c.toLowerCase()] || { lat: 4.710989, lng: -74.07209 });

  // normalización de respuesta
  const normalize = (json: any): any[] =>
    Array.isArray(json) ? json : Array.isArray(json.glampings) ? json.glampings : [];

  // mapeo a props de Tarjeta
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

  // carga de datos
  useEffect(() => {
    const load = async () => {
      if (!hasMore) return;
      setLoading(true);
      const qp = new URLSearchParams();
      qp.set('page', String(page));
      qp.set('limit', String(PAGE_SIZE));
      if (tipoFilter)        qp.set('tipoGlamping', tipoFilter);
      amenidadesFilter.forEach(a => qp.append('amenidades', a));
      if (ciudadFilter) {
        const { lat, lng } = getCoords(ciudadFilter);
        qp.set('lat', String(lat));
        qp.set('lng', String(lng));
        qp.set('distanciaMax', '150');
      }
      try {
        const url = `${API_BASE}?${qp}`;
        setQueryEnviada(url);
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

  // infinite scroll observer
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
  const toggleFilter = (f: string) => {
    let newList = [...canonical];
    if (canonical.includes(f)) {
      // si existe, solo lo quito
      newList = newList.filter(x => x !== f);
    } else {
      // si no existe, agrego (y quito ciudad/tipo previas si aplica)
      if (CIUDADES.includes(f.toLowerCase())) {
        newList = newList.filter(x => !CIUDADES.includes(x.toLowerCase()));
      }
      if (TIPOS.includes(f)) {
        newList = newList.filter(x => !TIPOS.includes(x));
      }
      newList.push(f);
    }
    const ciudad = newList.find(x => CIUDADES.includes(x.toLowerCase()));
    const tipo = newList.find(x => TIPOS.includes(x));
    const amenidades = newList.filter(x => x !== ciudad && x !== tipo);
    const pathSegments = [...(ciudad ? [ciudad] : []), ...(tipo ? [tipo] : []), ...amenidades];
    const path = pathSegments.length ? `/glampings/${pathSegments.join('/')}` : '/glampings';
    router.push(path);
  };

  return (
    <div className="TarjetasEcommerce-container">
      <div className="TarjetasEcommerce-results">
        {glampings.length} resultados
      </div>
      <pre className="TarjetasEcommerce-debug">{queryEnviada}</pre>

      <div className="TarjetasEcommerce-filtros-wrapper">
        <button
          className="TarjetasEcommerce-scroll-btn izquierda"
          onClick={() => scroll('left')}
        >
          <MdOutlineKeyboardArrowLeft size={24}/>
        </button>
        <div className="TarjetasEcommerce-filtros-scroll" ref={scrollRef}>
          {[...CIUDADES, ...TIPOS, ...AMENIDADES].map(label => {
            const isActive = canonical.includes(label);
            return (
              <div
                key={label}
                className={`TarjetasEcommerce-filtro-item ${isActive ? 'activo' : ''}`}
                onClick={() => toggleFilter(label)}
              >
                <div className="TarjetasEcommerce-filtro-icono">
                  {obtenerIcono(label)}
                </div>
                <span className="TarjetasEcommerce-filtro-label">
                  {label.replace(/-/g, ' ')}
                </span>
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

      {canonical.length > 0 && (
        <div className="TarjetasEcommerce-breadcrumbs">
          {canonical.map((f, i) => (
            <span key={i} className="TarjetasEcommerce-breadcrumb-item">
              {f.replace(/-/g, ' ')}
              <button
                className="TarjetasEcommerce-breadcrumb-remove"
                onClick={() => toggleFilter(f)}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="TarjetasEcommerce-lista">
        {glampings.map(g => (
          <Tarjeta key={g._id} {...mapProps(g)} />
        ))}
      </div>

      {loading && <p className="TarjetasEcommerce-loading">Cargando...</p>}
      {glampings.length > 0 && <div ref={observerRef} />}
    </div>
  );
}
