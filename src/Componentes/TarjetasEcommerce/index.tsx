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

  type MunicipioConSlug = Municipio & { SLUG: string };


  interface TarjetasEcommerceProps {
    filtros?: string[];
  }

  // Normaliza los municipios a slugs con guiones
  const municipiosConSlug: MunicipioConSlug[] = municipiosData.map(m => ({
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

  const getCiudadFromSlug = (slug: string): MunicipioConSlug | null => {
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
        SLUG: key,
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

    // Detectamos si el primer segmento es una ciudad válida
    const posibleCiudad = applied[0];
    const ciudadData = posibleCiudad ? getCiudadFromSlug(posibleCiudad) : null;
    const ciudadFilter = ciudadData ? ciudadData.CIUDAD_DEPARTAMENTO : null;

    // Si ciudad fue detectada, los siguientes filtros empiezan desde el índice 1
    const startIndex = ciudadData ? 1 : 0;

    const tipoFilter = applied.slice(startIndex).find(f => TIPOS.includes(f.toLowerCase())) || null;
    const amenidadesFilter = applied
      .slice(startIndex)
      .filter(f => AMENIDADES.includes(f));

    // 👇 el resto de segmentos después del primero se asumen como extras
      // Filtros extraídos de la URL para ciudad/tipo/amenidades
    const canonicalBase = [
      ...(ciudadData ? [ciudadData.SLUG] : []),
      ...(tipoFilter ? [tipoFilter.toLowerCase().replace(/\s+/g, '-')] : []),
      ...amenidadesFilter.map(a => a.toLowerCase().replace(/\s+/g, '-'))
    ];

    const extrasFromURL = applied.slice(canonicalBase.length);

    const initialFechaInicio = extrasFromURL[0] ?? '';
    const initialFechaFin = extrasFromURL[1] ?? '';
    const initialTotalHuespedes = extrasFromURL[2] ? Number(extrasFromURL[2]) : 1;
    const aceptaMascotas = extrasFromURL.includes("mascotas");

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
      if (document.referrer.includes('/explorarglamping')) {
        const scrollY = sessionStorage.getItem("glampings-scroll");
        if (scrollY) {
          window.scrollTo({ top: parseInt(scrollY), behavior: "smooth" });
          sessionStorage.removeItem("glampings-scroll");
        }
      }
    }, []);

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
    ciudadForzada?: Municipio,
    aceptaMascotas?: boolean
  ) => {
    const params = new URLSearchParams();
    params.set('page', String(pageArg));
    params.set('limit', String(PAGE_SIZE));
    
    const ciudadParaQuery = ciudadForzada ?? ciudadData;

    if (aceptaMascotas) {
    params.set("aceptaMascotas", "true");
    }

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
        const qs = construirQuery(pageArg, fi, ff, th, undefined, aceptaMascotas);
        setLastQuery(qs);
        const url = `${API_BASE}?${qs}`;
        try {
          const res = await fetch(url);
          if (res.status === 404) { setHasMore(false); return; }
          const json = await res.json();
          const arr = Array.isArray(json) ? json : json.glampings ?? [];
          setGlampings(prev => pageArg === 1 ? arr : [...prev, ...arr]);
          if (arr.length < PAGE_SIZE) setHasMore(false);
          if (pageArg === 1) {
            sessionStorage.setItem("glampings-cache", JSON.stringify(arr));
            sessionStorage.setItem("glampings-page", "1");
          } else {
            const anterior = JSON.parse(sessionStorage.getItem("glampings-cache") || "[]");
            sessionStorage.setItem("glampings-cache", JSON.stringify([...anterior, ...arr]));
            sessionStorage.setItem("glampings-page", String(pageArg));
          }
        } catch {
          setHasMore(false);
        } finally {
          setLoading(false);
          setPage(pageArg);
        }
      },
      [userLocation, ciudadFilter, tipoFilter, amenidadesFilter, aceptaMascotas]
    );

    // Carga inicial y cuando cambian filtros rápidos
    useEffect(() => {
    setGlampings([]);
    setHasMore(true);
    fetchGlampings(1, extrasFromURL);
    setHasFetched(true);
  }, [filtros?.join(','), ciudadFilter, tipoFilter, amenidadesFilter.join(','), userLocation, geoError, aceptaMascotas]);

  const handleCardClick = () => {
  sessionStorage.setItem("glampings-scroll", String(window.scrollY));
  };

  // Scroll infinito
    useEffect(() => {
      const obs = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && !loading && hasMore) {
          const extras = [
            ...(fechaInicio ? [fechaInicio] : []),
            ...(fechaFin    ? [fechaFin]    : []),
            ...(totalHuespedes > 1 ? [String(totalHuespedes)] : []),
            ...(aceptaMascotas ? ["mascotas"] : [])
          ];
          fetchGlampings(page + 1, extras);
        }
      }, { rootMargin: '200px', threshold: 0.1 });
      if (observerRef.current) obs.observe(observerRef.current);
      return () => obs.disconnect();
    }, [fetchGlampings, loading, hasMore, page, fechaInicio, fechaFin, totalHuespedes]);

    // Toggle filtros rápidos
    const toggleFilter = (value: string) => {
      sessionStorage.removeItem("glampings-cache");
      sessionStorage.removeItem("glampings-page");
      sessionStorage.removeItem("glampings-scroll");
      const val = value.toLowerCase();
      const valSlug = val.replace(/\s+/g, '-');
      const isCity = CIUDADES.includes(valSlug);
      const isType = TIPOS.includes(val);
      const isAmenity = AMENIDADES.includes(val);

      // Convertimos a minúsculas para comparar, pero mantenemos los originales para la URL
      let newCitySlug = ciudadFilter
      ? ciudadFilter.toLowerCase().replace(/\s+/g, '-')
      : null;

      let newType = tipoFilter?.toLowerCase() ?? null;
      let newAmenities = [...amenidadesFilter];

      if (isCity) {
        newCitySlug = newCitySlug === valSlug ? null : valSlug;
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

      const ciudadSlug = municipiosConSlug.find(
        m => m.SLUG === newCitySlug
      )?.SLUG;

      const rutaFiltros: string[] = [
        ...(ciudadSlug ? [ciudadSlug] : []),
        ...(newType ? [newType.toLowerCase().replace(/\s+/g, '-')] : []),
        ...newAmenities.map(a => a.toLowerCase().replace(/\s+/g, '-'))
      ];


      const extras = [
        ...(fechaInicio ? [fechaInicio] : []),
        ...(fechaFin ? [fechaFin] : []),
        ...(totalHuespedes > 1 ? [String(totalHuespedes)] : []),
        ...(aceptaMascotas ? ['mascotas'] : []) // 👈🏽 esto faltaba
      ];

      const path = (rutaFiltros.length > 0 || extras.length > 0)
        ? `/${[...rutaFiltros, ...extras].join('/')}`
        : '/';

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
            onBuscarAction={({ fechaInicio, fechaFin, totalHuespedes, aceptaMascotas  }) => {
              const extras = [
                fechaInicio,
                fechaFin,
                String(totalHuespedes),
                ...(aceptaMascotas ? ["mascotas"] : [])
              ];

              const ciudadForzada = municipiosData.find(
                m => m.CIUDAD_DEPARTAMENTO.toLowerCase() === ciudadFilter?.toLowerCase()
              );
              const qs = construirQuery(1, fechaInicio, fechaFin, totalHuespedes, ciudadForzada);

              setLastQuery(qs);
              setGlampings([]);
              setHasMore(true);
              fetchGlampings(1, extras);

              const fullPath = [...canonicalBase, ...extras];
              const route = fullPath.length ? `/${fullPath.join("/")}` : "/"; 
              router.push(route);
            }}
            ciudadSlug={ciudadData ? posibleCiudad : undefined}
            tipoFilter={tipoFilter ?? undefined}
            amenidadesFilter={amenidadesFilter}
          />



        </div>
        {/* Filtros rápidos */}
        <div className="TarjetasEcommerce-filtros-wrapper">
          <button className="TarjetasEcommerce-scroll-btn izquierda" onClick={() => scrollRef.current?.scrollBy({ left: -200, behavior: 'smooth' })}  aria-label="Desplazar filtros a la izquierda">
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
          <button className="TarjetasEcommerce-scroll-btn derecha" onClick={() => scrollRef.current?.scrollBy({ left: 200, behavior: 'smooth' })} aria-label="Desplazar filtros a la derecha">
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
                 <TarjetaGeneral key={g._id} {...mapProps(g)} onClick={handleCardClick} />
              ))}
            </div>
          ) : (!loading && hasFetched) ? (
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
          ) : null}

        {/* Si ya cargó al menos una página y sigues en loading… */}
        {loading && glampings.length > 0 && (
          <p className="TarjetasEcommerce-loading">Cargando más resultados…</p>
        )}

        {/* Sentinel para scroll infinito */}
        {glampings.length > 0 && <div ref={observerRef} />}
      </div>
    );
  }