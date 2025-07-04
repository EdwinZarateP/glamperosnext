// components/TarjetasEcommerce.tsx

"use client"

  import React, { useState, useEffect, useRef } from 'react';
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
  import Regiones from "../Regiones/index";
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
    initialData?: any[]; 
    initialTotal?: number; 
  }

  // Normaliza los municipios a slugs con guiones
  const municipiosConSlug: MunicipioConSlug[] = municipiosData.map(m => ({
    ...m,
    SLUG: m.CIUDAD_DEPARTAMENTO.toLowerCase().replace(/\s+/g, '-')
  }));


  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;
  const API_URL = `${API_BASE}/glampings/glampingfiltrados2`;

  const PAGE_SIZE = 24;

  // Coordenadas aproximadas para cada ciudad
  const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
    bogota:   { lat: 4.711,   lng: -74.0721 },
    medellin: { lat: 6.2442,  lng: -75.5812 },
    cali:     { lat: 3.4516,  lng: -76.5320 },
  };
  const defaultLocation = CITY_COORDS.bogota;

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
  const limpiarSegmentosPagina = (segmentos: string[]) =>
    segmentos.filter(seg => !/^pagina-\d+$/.test(seg));


  // CONSTRUCCION DEL COMPONENTE

  export default function TarjetasEcommerce({ filtros, initialData = [], initialTotal = 0 }: TarjetasEcommerceProps) {
    const router = useRouter();

    // Derivo segmentos extra (fechas y huéspedes) de la URL
    const applied = filtros ?? [];
  
    // para detectar la pagina
    const lastSegment = applied[applied.length - 1];
    const pageMatch = lastSegment?.match(/^pagina-(\d+)$/);
    const pageFromUrl = pageMatch ? Number(pageMatch[1]) : 1;
    const currentPageFromUrl = !isNaN(pageFromUrl) && pageFromUrl > 0 ? pageFromUrl : 1;


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
    const [glampings, setGlampings] = useState<any[]>(initialData || []);
    // Usa la constante que ya tienes: currentPageFromUrl
    const [page, setPage] = useState<number>(currentPageFromUrl);
    // Ya no necesitas hasFetched, elimínalo:

    // Nuevo estado para saber cuántas páginas hay (asumiendo que la API devuelve 'total')
    const [totalPages, setTotalPages] = useState<number>(
      Math.max(1, Math.ceil((initialTotal ?? 0) / PAGE_SIZE))
    );
    const [loading,    setLoading]   = useState<boolean>(false);
   
    // const observerRef = useRef<HTMLDivElement>(null);
    const scrollRef   = useRef<HTMLDivElement>(null);
    const didFetchOnClient = useRef(false);
    const [hasFetched, setHasFetched] = useState(false);
    // const [hydrated, setHydrated] = useState(false);   
  
    // estados para geolocalización
    const [userLocation, setUserLocation] = useState<{lat: number; lng: number} | null>(null);
    const [, setGeoError]                  = useState<string | null>(null);
  
        
    // useEffect(() => {
    //   // nada de SSR: en cuanto hidrata y no hay filtro de ciudad, pasa a skeleton
    //   if (hydrated && !ciudadFilter) {
    //     setLoading(true);
    //   }
    // }, [hydrated, ciudadFilter]);

    // useEffect(() => {
    //   setHydrated(true);
    // }, []);

    // Obtiene permiso y dispara getCurrentPosition de inmediato
    // 🔄 Hook de geolocalización con fallback a Bogotá
    useEffect(() => {
      if (ciudadFilter) return; // si ya filtró por ciudad en la URL, no pedimos geo
      if (!navigator.geolocation) {
        // sin API de geoloc → fallback inmediato
        setUserLocation(defaultLocation);
        setLoading(false);
        return;
      }

      // función para aplicar el fallback
      const aplicarFallback = () => {
        setGeoError("Usando ubicación por defecto (Bogotá)");
        setUserLocation(defaultLocation);
        setLoading(false);
      };

      if (typeof navigator.permissions !== 'undefined') {
        navigator.permissions
          .query({ name: 'geolocation' as PermissionName })
          .then(perm => {
            if (perm.state === 'denied') {
              aplicarFallback();
            } else {
              navigator.geolocation.getCurrentPosition(
                pos => {
                  setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                },
                () => {
                  aplicarFallback();
                },
                { enableHighAccuracy: true, timeout: 10000 }
              );
            }
          })
          .catch(() => {
            // si falla Permissions API → intentamos geoloc directo
            navigator.geolocation.getCurrentPosition(
              pos => {
                setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
              },
              () => {
                aplicarFallback();
              },
              { enableHighAccuracy: true, timeout: 10000 }
            );
          });
      } else {
        // navegadores sin Permissions API
        navigator.geolocation.getCurrentPosition(
          pos => {
            setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          },
          () => {
            aplicarFallback();
          },
          { enableHighAccuracy: true, timeout: 10000 }
        );
      }
    }, [ciudadFilter]);



    
    const [redirigiendoInternamente, setRedirigiendoInternamente] = useState(false);

    useEffect(() => {
      if (document.referrer.includes('/explorarglamping')) {
        const scrollY = sessionStorage.getItem("glampings-scroll");
        if (scrollY) {
          window.scrollTo({ top: parseInt(scrollY), behavior: "auto" });
          sessionStorage.removeItem("glampings-scroll");
        }
      }
    }, []);


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
   const fetchGlampings = async (pageArg: number, extras: string[] = []) => {
    if (pageArg !== 1) {
      setGlampings([]);
    }
    setLoading(true);
    const [fi, ff, thStr] = extras;
    const th = thStr ? Number(thStr) : undefined;
    const qs = construirQuery(pageArg, fi, ff, th, undefined, aceptaMascotas);
    setLastQuery(qs);
    const url = `${API_URL}?${qs}`;
    try {
      const res = await fetch(url);
      const json = await res.json();
      const arr = Array.isArray(json) ? [] : json.glampings ?? [];
      const total = typeof json.total === 'number' ? json.total : 0;
      if (arr.length === 0 && pageArg > 1) {
        const retryQs = construirQuery(1, fi, ff, th, undefined, aceptaMascotas);
        const retryRes = await fetch(`${API_URL}?${retryQs}`);
        const retryJson = await retryRes.json();
        const retryArr = Array.isArray(retryJson) ? [] : retryJson.glampings ?? [];

        if (retryArr.length > 0) {
          const newExtras = limpiarSegmentosPagina(extras);
          const newPath = [...canonicalBase, ...newExtras].join('/');
          setRedirigiendoInternamente(true);
          window.scrollTo({ top: 0, behavior: 'auto' });
          router.push(`/${newPath}`);
          return;
        }
      }

      setGlampings(arr);
      if (typeof json.total === "number") {
        setTotalPages(Math.max(1, Math.ceil(total / PAGE_SIZE)));
      }
      if (pageArg === 1) {
        sessionStorage.setItem("glampings-cache", JSON.stringify(arr));
        sessionStorage.setItem("glampings-page", "1");
      } else {
        const anterior = JSON.parse(sessionStorage.getItem("glampings-cache") || "[]");
        sessionStorage.setItem("glampings-cache", JSON.stringify([...anterior, ...arr]));
        sessionStorage.setItem("glampings-page", String(pageArg));
      }
    } catch {
      // ...
    } finally {
      setLoading(false);
      setPage(pageArg);
    }
  };


  useEffect(() => {
    // Si ya tengo un filtro de ciudad por slug, no fetch
    if (ciudadFilter) return;
    if (!userLocation) return;
    if (didFetchOnClient.current) return;
    didFetchOnClient.current = true;
    
    const extras0 = limpiarSegmentosPagina(extrasFromURL);
    +   fetchGlampings(pageFromUrl, extras0)
     .finally(() => {
       setHasFetched(true);
     })
  }, [userLocation, ciudadFilter, pageFromUrl, extrasFromURL.join(',')]);



    const handleCardClick = () => {
    sessionStorage.setItem("glampings-scroll", String(window.scrollY));
    };

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

      let newCitySlug = ciudadFilter
        ? ciudadFilter.toLowerCase().replace(/\s+/g, '-')
        : null;

      let newType = tipoFilter?.toLowerCase() ?? null;
      let newAmenities = [...amenidadesFilter];

      const extras = [
        ...(fechaInicio ? [fechaInicio] : []),
        ...(fechaFin ? [fechaFin] : []),
        ...(totalHuespedes > 1 ? [String(totalHuespedes)] : []),
        ...(aceptaMascotas ? ['mascotas'] : [])
      ];

      const extrasSinPagina = limpiarSegmentosPagina(extras);

      if (isCity) {
        if (newCitySlug === valSlug) {
          // ✅ Si la ciudad clickeada es la misma, la quitamos
          newCitySlug = null;
        } else {
          // ✅ Si es diferente, la seleccionamos como nueva
          newCitySlug = valSlug;
        }
      } else if (isType) {
        newType = newType === val ? null : val;
      } else if (isAmenity) {
        const lowerAmenities = newAmenities.map(a => a.toLowerCase());
        if (lowerAmenities.includes(val)) {
          newAmenities = newAmenities.filter(a => a.toLowerCase() !== val);
        } else {
          const originalAmenity = FILTROS.find(f => f.value.toLowerCase() === val)?.value;
          if (originalAmenity) newAmenities.push(originalAmenity);
        }
      }

      const rutaFiltros: string[] = [
        ...(newCitySlug ? [newCitySlug] : []),
        ...(newType ? [newType.toLowerCase().replace(/\s+/g, '-')] : []),
        ...newAmenities.map(a => a.toLowerCase().replace(/\s+/g, '-'))
      ];

      const path = (rutaFiltros.length > 0 || extrasSinPagina.length > 0)
        ? `/${[...rutaFiltros, ...extrasSinPagina].join('/')}`
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

    // justo después de tus useState y useEffect, antes del return:
    const noResults = hasFetched && !loading && !redirigiendoInternamente && glampings.length === 0;

    const handlePageClick = (n: number) => {
      // limpia viejos segmentos "pagina-N"
      const extras = limpiarSegmentosPagina(extrasFromURL);
      const ruta = [
        ...canonicalBase,
        ...(n > 1 ? [`pagina-${n}`] : []),
        ...extras
      ].join('/');
      router.push(`/${ruta}`);
    }

    return (
      <div className="TarjetasEcommerce-container">
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
              // setHasMore(true);
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
        
        {!noResults && (
          <div className='TarjetasEcommerce-Titulo'>
            <h1>
              {ciudadFilter
                ? `Descubre y reserva los Mejores Glampings cerca a ${
                    ciudadFilter
                      .replace(/-/g, ' ')                       // quitar guiones
                      .split(' ')                               // dividir en palabras
                      .slice(0, 2)                               // tomar las dos primeras
                      .join(' ')                                // unir de nuevo
                  }`
                : "Descubre y reserva los Mejores Glampings en Colombia"}{" "}
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
        )}
        {/* Botón fijo de WhatsApp */}
        <button
          type="button"
          className="TarjetasEcommerce-whatsapp-button"
          onClick={redirigirWhatsApp}
          aria-label="Chatea por WhatsApp"
        >
        </button>
        {/* Lista con Skeleton */}
          {(loading) ? (
            <div className="TarjetasEcommerce-lista">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : (
            glampings.length > 0
              ? <div className="TarjetasEcommerce-lista">
                  {glampings.map(g => (
                    <TarjetaGeneral
                      key={g._id}
                      {...mapProps(g)}
                      onClick={handleCardClick}
                    />
                  ))}
                </div>
              : <div className="TarjetasEcommerce-no-results">
                  <Regiones />
                </div>
          )}
        {/* ----------------------------------------
            BLOQUE NUEVO: Botones de paginación
            ---------------------------------------- */}
        {totalPages > 1 && (
          <div className="TarjetasEcommerce-paginacion">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
              <button
                key={num}
                className={`TarjetasEcommerce-pagina-boton ${page === num ? 'activo' : ''}`}
                onClick={() => handlePageClick(num)}
              >
                {num}
              </button>
            ))}
          </div>
        )}


      </div>
    );
  }