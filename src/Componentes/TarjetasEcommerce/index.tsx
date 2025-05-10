// TarjetasEcommerce.tsx
"use client"

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Tarjeta from '../Tarjeta';
import './estilos.css';
import { MdPool } from "react-icons/md";
import { FaHotTubPerson, FaCat } from 'react-icons/fa6';
import { GiFishingNet, GiCampfire, GiCampingTent, GiHabitatDome, GiTreehouse, GiHut } from "react-icons/gi";
import { MdOutlineCabin } from "react-icons/md";
import { FaCaravan } from "react-icons/fa";
import { PiCoffeeBeanFill } from "react-icons/pi";
import { GiEagleEmblem } from "react-icons/gi";
import { FaUmbrellaBeach, FaTemperatureArrowUp, FaTemperatureArrowDown } from "react-icons/fa6";
import { BsTreeFill } from "react-icons/bs";
import { PiMountainsBold } from "react-icons/pi";
import { GiDesert, GiHiking, GiRiver, GiWaterfall } from "react-icons/gi";

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
    case 'cerca-bogota': return <GiEagleEmblem />;
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
    if (scrollRef.current) {
      const amount = dir === 'left' ? -200 : 200;
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  const applied = filtros ?? [];
  const ciudadFilter = applied.find(f => CIUDADES.includes(f.toLowerCase())) || null;
  const tipoFilter = applied.find(f => TIPOS.includes(f)) || null;
  const amenidadesFilter = applied.filter(f => f !== ciudadFilter && f !== tipoFilter);

  const canonical = [ciudadFilter, tipoFilter, ...amenidadesFilter.sort()].filter(Boolean) as string[];
  const filtersKey = canonical.join(',');

  const getCoords = (c: string) => {
    const map: Record<string, { lat: number; lng: number }> = {
      'cerca-bogota': { lat: 4.710989, lng: -74.07209 },
      'cerca-medellin': { lat: 6.244203, lng: -75.5812119 },
      'cerca-cali': { lat: 3.451647, lng: -76.531985 },
    };
    return map[c.toLowerCase()] || map['cerca-bogota'];
  };

  const normalize = (json: any): any[] => {
    if (Array.isArray(json)) return json;
    if (json && Array.isArray(json.glampings)) return json.glampings;
    return [];
  };

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

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    setGlampings([]);
  }, [filtersKey]);

  useEffect(() => {
    const load = async () => {
      if (!hasMore) return;
      setLoading(true);
      const qp = new URLSearchParams();
      qp.set('page', page.toString());
      qp.set('limit', PAGE_SIZE.toString());
      if (tipoFilter) qp.set('tipoGlamping', tipoFilter);
      amenidadesFilter.forEach(a => qp.append('amenidades', a));
      if (ciudadFilter) {
        const { lat, lng } = getCoords(ciudadFilter);
        qp.set('lat', lat.toString());
        qp.set('lng', lng.toString());
        qp.set('distanciaMax', '150');
      }
      try {
        const res = await fetch(`${API_BASE}?${qp}`);
        const queryURL = `${API_BASE}?${qp}`;
        setQueryEnviada(queryURL);
        if (res.status === 404) {
          setHasMore(false);
          return;
        }
        const json = await res.json();
        const data = normalize(json);
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

  useEffect(() => {
    const onIntersect: IntersectionObserverCallback = entries => {
      if (entries[0].isIntersecting && !loading && hasMore) {
        observerInstance.current?.unobserve(observerRef.current!);
        setPage(p => p + 1);
      }
    };
    observerInstance.current = new IntersectionObserver(onIntersect, {
      rootMargin: '200px', threshold: 0.1
    });
    if (observerRef.current) observerInstance.current.observe(observerRef.current);
    return () => observerInstance.current?.disconnect();
  }, []);

  useEffect(() => {
    if (!loading && hasMore && observerRef.current) {
      observerInstance.current?.observe(observerRef.current);
    }
  }, [loading, hasMore]);

  const toggleFilter = (f: string) => {
    let list = [...canonical];
    const idx = list.indexOf(f);
    const esCiudad = CIUDADES.includes(f.toLowerCase());
    const esTipo = TIPOS.includes(f);
    if (esCiudad) list = list.filter(x => !CIUDADES.includes(x.toLowerCase()));
    if (esTipo) list = list.filter(x => !TIPOS.includes(x));
    if (idx >= 0) list.splice(idx, 1); else list.push(f);

    const ciudad = list.find(x => CIUDADES.includes(x.toLowerCase()));
    const tipo = list.find(x => TIPOS.includes(x));
    const amenidades = list.filter(x => x !== ciudad && x !== tipo);

    const newPath = [...(ciudad ? [ciudad] : []), ...(tipo ? [tipo] : []), ...amenidades];
    const path = newPath.length ? `/glampings/${newPath.join('/')}` : '/glampings';
    router.push(path);
  };

  return (
    <div className="TarjetasEcommerce-container">
      <div className="TarjetasEcommerce-results">{glampings.length} resultados</div>
      <pre style={{ background: "#f8f8f8", padding: "8px", fontSize: "12px", border: "1px solid #ccc" }}>{queryEnviada}</pre>
      {canonical.length > 0 && (
        <div className="TarjetasEcommerce-breadcrumbs">
          {canonical.map((f, i) => (
            <span key={i} className="TarjetasEcommerce-breadcrumb-item">
              {f}
              <button className="TarjetasEcommerce-breadcrumb-remove" onClick={() => toggleFilter(f)}>×</button>
            </span>
          ))}
        </div>
      )}

      <div className="TarjetasEcommerce-filtros-wrapper">
        <button className="TarjetasEcommerce-scroll-btn izquierda" onClick={() => scroll('left')}>&lt;</button>
        <div className="TarjetasEcommerce-filtros-scroll" ref={scrollRef}>
          {[...CIUDADES, ...TIPOS, ...AMENIDADES].map(label => {
            const isActive = canonical.includes(label);
            const icon = obtenerIcono(label);
            return (
              <div
                key={label}
                className={`TarjetasEcommerce-filtro-item ${isActive ? 'activo' : ''}`}
                onClick={() => toggleFilter(label)}
              >
                <div className="TarjetasEcommerce-filtro-icono">{icon}</div>
                <span className="TarjetasEcommerce-filtro-label">{label.replace(/-/g, ' ')}</span>
              </div>
            );
          })}
        </div>
        <button className="TarjetasEcommerce-scroll-btn derecha" onClick={() => scroll('right')}>&gt;</button>
      </div>

      <div className="TarjetasEcommerce-lista">
        {glampings.map(g => <Tarjeta key={g._id} {...mapProps(g)} />)}
      </div>
      {loading && <p className="TarjetasEcommerce-loading">Cargando...</p>}
      {glampings.length > 0 && <div ref={observerRef} />}
    </div>
  );
}