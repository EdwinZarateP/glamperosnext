// src/Componentes/TarjetasEcommerce/index.tsx
'use client';

import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Tarjeta from '../Tarjeta';
import './estilos.css';

interface Glamping {
  glampingId: string;
  imagenes: string[];
  ciudad_departamento: string;
  precioEstandar: number;
  precioEstandarAdicional: number;
  calificacion: number;
  favorito: boolean;
  descuento?: number;
  tipoGlamping: string;
  nombreGlamping: string;
  Acepta_Mascotas: boolean;
  amenidadesGlobal: string[];
  ubicacion: { lat: number; lng: number };
  fechasReservadas: string[];
  Cantidad_Huespedes: number;
  Cantidad_Huespedes_Adicional: number;
}

interface CityFilter {
  slug: string;
  label: string;
  lat: number;
  lng: number;
}
const CITY_FILTERS: CityFilter[] = [
  { slug: 'cerca-bogota',   label: 'Cerca a Bogotá',  lat: 4.7110,   lng: -74.0721 },
  { slug: 'cerca-medellin', label: 'Cerca a Medellín', lat: 6.2442,   lng: -75.5812 },
  { slug: 'cerca-cali',     label: 'Cerca a Cali',     lat: 3.4516,   lng: -76.5320 },
];

interface TypeFilter {
  slug: string;
  label: string;
}
const TYPE_FILTERS: TypeFilter[] = [
  { slug: 'jacuzzi',        label: 'Jacuzzi' },
  { slug: 'pet-friendly',   label: 'Pet Friendly' },
  { slug: 'domo',           label: 'Domo' },
  { slug: 'lumipod',        label: 'Lumipod' },
  { slug: 'tienda',         label: 'Tienda' },
  { slug: 'cabana',         label: 'Cabaña' },
  { slug: 'casa-del-arbol', label: 'Casa del árbol' },
  { slug: 'tipi',           label: 'Tipi' },
];

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat/2)**2 +
    Math.cos((lat1 * Math.PI)/180) *
    Math.cos((lat2 * Math.PI)/180) *
    Math.sin(dLon/2)**2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

type Criterios = {
  cityCoords: { lat: number; lng: number } | null;
  types: string[];
};

interface TarjetasEcommerceProps {
  filtros: string[];
}

const API_URL = 'https://glamperosapi.onrender.com/glampings';
const PAGE_LIMIT = 30;

export default function TarjetasEcommerce({ filtros }: TarjetasEcommerceProps) {
  const [data, setData] = useState<Glamping[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loader = useRef<HTMLDivElement>(null);

  const criterios = useMemo<Criterios>(() => {
    let cityCoords: { lat: number; lng: number } | null = null;
    const types: string[] = [];

    filtros.forEach(slug => {
      const city = CITY_FILTERS.find(f => f.slug === slug);
      if (city) {
        cityCoords = { lat: city.lat, lng: city.lng };
        return;
      }
      if (TYPE_FILTERS.some(f => f.slug === slug)) {
        types.push(slug);
      }
    });

    return { cityCoords, types };
  }, [filtros]);

  const fetchGlampings = useCallback(async () => {
    const res = await fetch(`${API_URL}?page=${page}&limit=${PAGE_LIMIT}`);
    const items: Glamping[] = await res.json();
    if (items.length < PAGE_LIMIT) setHasMore(false);
    setData(prev => [...prev, ...items]);
  }, [page]);

  useEffect(() => { fetchGlampings(); }, [fetchGlampings]);

  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => { if (entries[0].isIntersecting && hasMore) setPage(p => p+1); },
      { rootMargin: '200px' }
    );
    if (loader.current) obs.observe(loader.current);
    return () => obs.disconnect();
  }, [hasMore]);

  const filtered = data.filter(item => {
    if (criterios.cityCoords) {
      const dist = haversine(
        item.ubicacion.lat,
        item.ubicacion.lng,
        criterios.cityCoords.lat,
        criterios.cityCoords.lng
      );
      if (dist > 100) return false;
    }
    for (const slug of criterios.types) {
      if (slug === 'pet-friendly' && !item.Acepta_Mascotas) return false;
      if (slug === 'jacuzzi' && !item.amenidadesGlobal.includes('Jacuzzi')) return false;
      if (slug !== 'pet-friendly' && slug !== 'jacuzzi') {
        const tf = TYPE_FILTERS.find(f => f.slug === slug)!;
        if (item.tipoGlamping !== tf.label) return false;
      }
    }
    return true;
  });

  const buildLink = (slug: string) => {
    const present = filtros.includes(slug);
    const newFiltros = present
      ? filtros.filter(f => f!==slug)
      : [...filtros, slug];
    return '/glampings/' + newFiltros.join('/');
  };

  return (
    <div className="contenedor-tarjetas">
      <div className="filtros-activos">
        {filtros.map(slug => {
          const city = CITY_FILTERS.find(f => f.slug===slug);
          const type = TYPE_FILTERS.find(f => f.slug===slug);
          const label = city?.label || type?.label || slug;
          return (
            <Link key={slug} href={buildLink(slug)} className="tag">
              {label} ×
            </Link>
          );
        })}
      </div>

      <aside className="panel-filtros">
        <div className="bloque-filtro">
          <h4>Ubicación</h4>
          <div className="opciones">
            {CITY_FILTERS.map(f => (
              <Link key={f.slug} href={buildLink(f.slug)}>
                {f.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="bloque-filtro">
          <h4>Tipo</h4>
          <div className="opciones">
            {TYPE_FILTERS.map(f => (
              <Link key={f.slug} href={buildLink(f.slug)}>
                {f.label}
              </Link>
            ))}
          </div>
        </div>
      </aside>

      <div className="tarjetas-grid">
        {filtered.map(g => (
          <Tarjeta
            key={g.glampingId}
            glampingId={g.glampingId}
            imagenes={g.imagenes}
            ciudad={g.ciudad_departamento}
            precio={g.precioEstandar}
            calificacion={g.calificacion}
            favorito={false}
            onFavoritoChange={() => {}}
            descuento={g.descuento}
            tipoGlamping={g.tipoGlamping}
            nombreGlamping={g.nombreGlamping}
            ubicacion={g.ubicacion}
            Acepta_Mascotas={g.Acepta_Mascotas}
            fechasReservadas={g.fechasReservadas}
            amenidadesGlobal={g.amenidadesGlobal}
            Cantidad_Huespedes={g.Cantidad_Huespedes}
            precioEstandarAdicional={g.precioEstandarAdicional}
            Cantidad_Huespedes_Adicional={g.Cantidad_Huespedes_Adicional}
          />
        ))}
      </div>

      <div ref={loader} className="scroll-loader" />
      {!hasMore && <p className="sin-mas-resultados">No hay más resultados.</p>}
    </div>
  );
}
