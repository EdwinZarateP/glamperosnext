// components/TarjetasEcommerce.tsx
"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import TarjetaGeneral from "../TarjetaGeneral";
import HeaderGeneral from "../HeaderGeneral";
import { FILTROS } from "./filtros";
import Image from "next/image";
import "./estilos.css";
import SkeletonCard from "../SkeletonCard/index";
import { MdOutlineKeyboardArrowLeft, MdOutlineKeyboardArrowRight } from "react-icons/md";
import Regiones from "../Regiones/index";
import municipiosData from "../MunicipiosGeneral/municipiosGeneral.json";
import Footer from "@/Componentes/Footer";

type Municipio = {
  CIUDAD_DEPARTAMENTO: string;
  CIUDAD: string;
  DEPARTAMENTO: string;
  LATITUD: number;
  LONGITUD: number;
};

type MunicipioConSlug = Municipio & { SLUG: string };

interface TarjetasEcommerceProps {
  initialData?: any[];
  initialTotal?: number;
}

// Normaliza los municipios a slugs con guiones
const municipiosConSlug: MunicipioConSlug[] = (municipiosData as Municipio[]).map((m) => ({
  ...m,
  SLUG: m.CIUDAD_DEPARTAMENTO.toLowerCase().replace(/\s+/g, "-"),
}));

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;
const API_URL = `${API_BASE}/glampings/glampingfiltrados`;

const PAGE_SIZE = 24;

// Coordenadas aproximadas para cada ciudad
const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  bogota: { lat: 4.6589973718135, lng: -74.10152220780381 },
  medellin: { lat: 6.379745895, lng: -75.447957442 },
  cali: { lat: 3.4516, lng: -76.532 },
};
const defaultLocation = CITY_COORDS.bogota;

const getCiudadFromSlug = (slug: string): MunicipioConSlug | null => {
  const match = municipiosConSlug.find((m) => m.SLUG === slug.toLowerCase());
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

const CIUDADES = municipiosConSlug.map((m) => m.SLUG.toLowerCase());

const TIPOS = FILTROS
  .filter((f) => ["domo", "tipi", "tienda", "cabana", "lumipod", "chalet"].includes(f.value.toLowerCase()))
  .map((f) => f.value.toLowerCase());

// Lista de amenidades válidas
const AMENIDADES = FILTROS.map((f) => f.value).filter((v) => !CIUDADES.includes(v) && !TIPOS.includes(v));

const limpiarSegmentosPagina = (segmentos: string[]) =>
  segmentos.filter((seg) => !/^pagina-\d+$/.test(seg) && !/^orden-(asc|desc)$/.test(seg));

// ————————————————————————————————————————————————————————————————————————————
// COMPONENTE
// ————————————————————————————————————————————————————————————————————————————
export default function TarjetasEcommerce({ initialData = [], initialTotal = 0 }: TarjetasEcommerceProps) {
  const router = useRouter();

  // Path y segmentos
  const pathname = usePathname() || "";
  const applied = pathname.split("/").filter(Boolean);
  const appliedSinPagina = limpiarSegmentosPagina(applied);
  const ordenSegment = applied.find((seg) => /^orden-(asc|desc)$/.test(seg));
  const ordenPrecio = ordenSegment ? ordenSegment.replace("orden-", "") : "";

  // Página desde URL
  const lastSegment = applied[applied.length - 1];
  const pageMatch = lastSegment?.match(/^pagina-(\d+)$/);
  const pageFromUrl = pageMatch ? Number(pageMatch[1]) : 1;
  const currentPageFromUrl = !isNaN(pageFromUrl) && pageFromUrl > 0 ? pageFromUrl : 1;

  // Ciudad detectada
  const posibleCiudad = appliedSinPagina[0];
  const ciudadData = posibleCiudad ? getCiudadFromSlug(posibleCiudad) : null;
  const ciudadFilter = ciudadData ? ciudadData.CIUDAD_DEPARTAMENTO : null;

  // Tipo y amenidades
  const startIndex = ciudadData ? 1 : 0;
  const tipoFilter = appliedSinPagina.slice(startIndex).find((f) => TIPOS.includes(f.toLowerCase()));
  const amenidadesFilter = appliedSinPagina
    .slice(startIndex)
    .filter((f) => AMENIDADES.includes(f.toLowerCase()) && !f.includes("=") && !/%3d/i.test(f));

  // Base canónica para construir rutas
  const canonicalBase = [
    ...(ciudadData ? [ciudadData.SLUG] : []),
    ...(tipoFilter ? [tipoFilter.toLowerCase().replace(/\s+/g, "-")] : []),
    ...amenidadesFilter.map((a) => a.toLowerCase().replace(/\s+/g, "-")),
  ];

  // Parámetros tomados de segmentos extra
  const searchParamsFromSegments = appliedSinPagina.slice(canonicalBase.length).reduce(
    (acc, seg) => {
      if (seg.startsWith("fechainicio=")) acc.fechaInicio = seg.replace("fechainicio=", "");
      else if (seg.startsWith("fechafin=")) acc.fechaFin = seg.replace("fechafin=", "");
      else if (seg.startsWith("huespedes=")) acc.totalHuespedes = Number(seg.replace("huespedes=", ""));
      else if (seg === "mascotas") acc.aceptaMascotas = true;
      return acc;
    },
    {
      fechaInicio: "",
      fechaFin: "",
      totalHuespedes: 1,
      aceptaMascotas: false,
    }
  );

  // Query params (utm y búsqueda)
  const searchParams = useSearchParams();
  const utmSource = searchParams.get("utm_source");
  const utmMedium = searchParams.get("utm_medium");
  const utmCampaign = searchParams.get("utm_campaign");

  const initialFechaInicio = searchParams.get("fechaInicio") || searchParamsFromSegments.fechaInicio || "";
  const initialFechaFin = searchParams.get("fechaFin") || searchParamsFromSegments.fechaFin || "";
  const initialTotalHuespedes =
    Number(searchParams.get("totalHuespedes")) || searchParamsFromSegments.totalHuespedes || 1;

  const aceptaMascotas = searchParams.get("aceptaMascotas") === "true" || searchParamsFromSegments.aceptaMascotas;

  const extrasFromURL = [
    ...(initialFechaInicio ? [`fechainicio=${initialFechaInicio}`] : []),
    ...(initialFechaFin ? [`fechafin=${initialFechaFin}`] : []),
    ...(initialTotalHuespedes > 1 ? [`huespedes=${initialTotalHuespedes}`] : []),
    ...(aceptaMascotas ? ["mascotas"] : []),
  ];

  // Estados búsqueda “manual”
  const [fechaInicio] = useState<string>(initialFechaInicio);
  const [fechaFin] = useState<string>(initialFechaFin);
  const [totalHuespedes] = useState<number>(initialTotalHuespedes);

  // Resultados, página y total
  const [glampings, setGlampings] = useState<any[]>(initialData || []);
  const [page, setPage] = useState<number>(currentPageFromUrl);
  const [totalPages, setTotalPages] = useState<number>(Math.max(1, Math.ceil((initialTotal ?? 0) / PAGE_SIZE)));
  const [loading, setLoading] = useState<boolean>(false);
  const [hasFetched, setHasFetched] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const lastQueryUrlRef = useRef<string>("");

  // ——— Geolocalización (cacheada) ———
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(() => {
    try {
      return JSON.parse(localStorage.getItem("glampings-geo") || "null");
    } catch {
      return null;
    }
  });
  const [, setGeoError] = useState<string | null>(null);

  // Pide geoloc si NO hay ciudad en URL (se cachea y se envía a API)
  useEffect(() => {
    if (ciudadFilter) return;

    const persistLocation = (lat: number, lng: number) => {
      localStorage.setItem("glampings-geo", JSON.stringify({ lat, lng }));
      document.cookie = `glampings_lat=${lat}; path=/`;
      document.cookie = `glampings_lng=${lng}; path=/`;
    };

    const guardarLocalizacionAPI = (lat: number, lng: number) => {
      const cookies = document.cookie.split("; ").reduce<Record<string, string>>((acc, cur) => {
        const [k, v] = cur.split("=");
        acc[k] = v;
        return acc;
      }, {});
      const user_id = cookies["idUsuario"] || "no_identificado";

      fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/localizaciones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat, lng, user_id }),
      })
        .then((res) => res.json())
        .then((json) => console.log("✅ Localización guardada:", json))
        .catch((err) => console.error("❌ Error guardando localización:", err));
    };

    const successCallback = (pos: GeolocationPosition) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      setUserLocation({ lat, lng });
      persistLocation(lat, lng);
      guardarLocalizacionAPI(lat, lng);
    };

    const errorCallback = () => {
      setGeoError("Usando ubicación por defecto (Bogotá)");
      const { lat, lng } = defaultLocation;
      setUserLocation({ lat, lng });
      persistLocation(lat, lng);
      guardarLocalizacionAPI(lat, lng);
    };

    if (!navigator.geolocation) {
      errorCallback();
      return;
    }

    if (navigator.permissions) {
      navigator.permissions
        .query({ name: "geolocation" as PermissionName })
        .then((perm) => {
          if (perm.state === "denied") {
            errorCallback();
          } else {
            navigator.geolocation.getCurrentPosition(successCallback, errorCallback, {
              enableHighAccuracy: true,
              timeout: 10000,
            });
          }
        })
        .catch(() =>
          navigator.geolocation.getCurrentPosition(successCallback, errorCallback, {
            enableHighAccuracy: true,
            timeout: 10000,
          })
        );
    } else {
      navigator.geolocation.getCurrentPosition(successCallback, errorCallback, {
        enableHighAccuracy: true,
        timeout: 10000,
      });
    }
  }, [ciudadFilter]);

  // Volver al scroll guardado si venimos de /glamping
  useEffect(() => {
    if (document.referrer.includes("/glamping")) {
      const scrollY = sessionStorage.getItem("glampings-scroll");
      if (scrollY) {
        window.scrollTo({ top: parseInt(scrollY), behavior: "auto" });
        sessionStorage.removeItem("glampings-scroll");
      }
    }
  }, []);

  // ——— Lock de fuente de ubicación para evitar parpadeos ———
  // city → usar siempre la ciudad; user → usar lat/lng del usuario; null → sin ubicación
  const [locationMode, setLocationMode] = useState<"city" | "user" | null>(null);

  // Clave “base” que cambia cuando cambian filtros canónicos u orden (no por paginación)
  const basePathKey = useMemo(() => {
    const base = canonicalBase.join("/");
    return ordenPrecio ? `${base}|orden-${ordenPrecio}` : base;
  }, [canonicalBase, ordenPrecio]);

  // Decide la fuente de ubicación SOLO cuando cambian filtros base (o aparece geoloc por 1ª vez)
  useEffect(() => {
    if (ciudadFilter) {
      setLocationMode("city");
    } else if (userLocation) {
      setLocationMode("user");
    } else {
      setLocationMode(null);
    }
    // Nota: dependemos de "userLocation ? true : false" para no disparar por cada cambio de lat/lng
  }, [basePathKey, ciudadFilter, userLocation ? true : false]);

  // Construye query para API
  const construirQuery = (
    pageArg: number,
    fi?: string,
    ff?: string,
    th?: number,
    ciudadForzada?: Municipio | { LATITUD: number; LONGITUD: number; CIUDAD_DEPARTAMENTO?: string } | null,
    aceptaMascotasParam?: boolean,
    ordenPrecioParam?: string
  ) => {
    const params = new URLSearchParams();
    params.set("page", String(pageArg));
    params.set("limit", String(PAGE_SIZE));

    if (aceptaMascotasParam) params.set("aceptaMascotas", "true");
    if (ordenPrecioParam) {
      params.set("ordenPrecio", ordenPrecioParam);
    } else if (ordenPrecio) {
      params.set("ordenPrecio", ordenPrecio);
    }

    if (ciudadForzada) {
      params.set("lat", String(ciudadForzada.LATITUD));
      params.set("lng", String(ciudadForzada.LONGITUD));
      // Solo distanciaMax si es ubicación del usuario
      if (
        !("CIUDAD_DEPARTAMENTO" in ciudadForzada) ||
        !ciudadForzada.CIUDAD_DEPARTAMENTO ||
        ciudadForzada.CIUDAD_DEPARTAMENTO === "Tu ubicación"
      ) {
        params.set("distanciaMax", "1500");
      }
    }

    if (tipoFilter) params.set("tipoGlamping", tipoFilter);

    if (fi) params.set("fechaInicio", fi);
    if (ff) params.set("fechaFin", ff);
    if (th && th > 1) params.set("totalHuespedes", String(th));

    amenidadesFilter.forEach((a) => params.append("amenidades", a.toLowerCase()));

    return params.toString();
  };

  // Map props a TarjetaGeneral
  const mapProps = (g: any) => {
    const ubic = typeof g.ubicacion === "string" ? JSON.parse(g.ubicacion) : g.ubicacion;
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

  // Fetch a la API (con lock de ubicación)
  const fetchGlampings = async (pageArg: number, extras: string[] = [], orden?: string) => {
    if (loading) return;
    setLoading(true);

    const rawFi = extras.find((s) => s.startsWith("fechainicio="));
    const rawFf = extras.find((s) => s.startsWith("fechafin="));
    const rawTh = extras.find((s) => s.startsWith("huespedes="));
    const fi = rawFi ? rawFi.split("=")[1] : undefined;
    const ff = rawFf ? rawFf.split("=")[1] : undefined;
    const th = rawTh ? Number(rawTh.split("=")[1]) : undefined;

    // Determina loc según el lock
    const loc = ciudadData
      ? ciudadData
      : (locationMode === "user" && userLocation
          ? {
              CIUDAD_DEPARTAMENTO: "Tu ubicación",
              CIUDAD: "Cercanos a ti",
              DEPARTAMENTO: "",
              LATITUD: userLocation.lat,
              LONGITUD: userLocation.lng,
              SLUG: "ubicacion-actual",
            }
          : null);

    const qs = construirQuery(pageArg, fi, ff, th, loc, aceptaMascotas, orden);
    const url = `${API_URL}?${qs}`;

    // Evita refetch idéntico
    if (lastQueryUrlRef.current === url) {
      setLoading(false);
      return;
    }
    lastQueryUrlRef.current = url;

    try {
      const res = await fetch(url);
      const json = await res.json();
      const arr = Array.isArray(json) ? [] : json.glampings ?? [];
      const total = typeof json.total === "number" ? json.total : 0;

      // Si no hay resultados en páginas >1, intenta 1 sin redirigir (para evitar flash)
      if (arr.length === 0 && pageArg > 1) {
        const retryQs = construirQuery(1, fi, ff, th, loc, aceptaMascotas, orden);
        const retryRes = await fetch(`${API_URL}?${retryQs}`);
        const retryJson = await retryRes.json();
        const retryArr = Array.isArray(retryJson) ? [] : retryJson.glampings ?? [];

        if (retryArr.length > 0) {
          setGlampings(retryArr);
          setTotalPages(Math.max(1, Math.ceil((retryJson.total ?? 0) / PAGE_SIZE)));
          setPage(1);
          // No empujamos nueva URL para que no haya "parpadeo"
          return;
        }
      }

      setGlampings(arr);
      if (typeof total === "number") {
        setTotalPages(Math.max(1, Math.ceil(total / PAGE_SIZE)));
      }

      // Cache simple por sesión (opcional)
      if (pageArg === 1) {
        sessionStorage.setItem("glampings-cache", JSON.stringify(arr));
        sessionStorage.setItem("glampings-page", "1");
      } else {
        const anterior = JSON.parse(sessionStorage.getItem("glampings-cache") || "[]");
        sessionStorage.setItem("glampings-cache", JSON.stringify([...anterior, ...arr]));
        sessionStorage.setItem("glampings-page", String(pageArg));
      }
    } catch (e) {
      console.error("Error fetching glampings:", e);
    } finally {
      setLoading(false);
      setHasFetched(true);
      setPage(pageArg);
    }
  };

  // Sync con SSR en cada navegación (incluye pagina-N)
  useEffect(() => {
    setGlampings(initialData || []);
    setTotalPages(Math.max(1, Math.ceil((initialTotal ?? 0) / PAGE_SIZE)));
    setPage(currentPageFromUrl);
  }, [initialData, initialTotal, currentPageFromUrl]);

  // ÚNICO efecto para pedir datos (evita doble fetch y parpadeo por geoloc)
  useEffect(() => {
    // 1) Si hay datos SSR:
    if (initialData.length > 0) {
      // Solo refetch si NO hay ciudad y ya tenemos geoloc del usuario bloqueada:
      if (!ciudadFilter && locationMode === "user") {
        fetchGlampings(pageFromUrl, extrasFromURL, ordenPrecio);
      }
      return; // ✅ evita la llamada extra en /bogota
    }

    // 2) CSR puro: esperar a tener ciudad o geoloc lista
    if (!ciudadFilter && locationMode === null) return;

    fetchGlampings(pageFromUrl, extrasFromURL, ordenPrecio);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    pageFromUrl,
    extrasFromURL.join(","),
    ordenPrecio,
    ciudadFilter,
    locationMode,
    initialData.length,
  ]);

  const handleCardClick = () => {
    sessionStorage.setItem("glampings-scroll", String(window.scrollY));
  };

  // Toggle filtros rápidos
  const toggleFilter = (value: string) => {
    sessionStorage.removeItem("glampings-cache");
    sessionStorage.removeItem("glampings-page");
    sessionStorage.removeItem("glampings-scroll");

    const val = value.toLowerCase();
    const valSlug = val.replace(/\s+/g, "-");
    const isCity = CIUDADES.includes(valSlug);
    const isType = TIPOS.includes(val);
    const isAmenity = AMENIDADES.includes(val);

    let newCitySlug = ciudadFilter ? ciudadFilter.toLowerCase().replace(/\s+/g, "-") : null;
    let newType = tipoFilter?.toLowerCase() ?? null;
    let newAmenities = [...amenidadesFilter];

    if (isCity) {
      newCitySlug = newCitySlug === valSlug ? null : valSlug;
    } else if (isType) {
      newType = newType === val ? null : val;
    } else if (isAmenity) {
      const lowerAmenities = newAmenities.map((a) => a.toLowerCase());
      if (lowerAmenities.includes(val)) {
        newAmenities = newAmenities.filter((a) => a.toLowerCase() !== val);
      } else {
        const originalAmenity = FILTROS.find((f) => f.value.toLowerCase() === val)?.value;
        if (originalAmenity) newAmenities.push(originalAmenity);
      }
    }

    const rutaFiltros: string[] = [
      ...(newCitySlug ? [newCitySlug] : []),
      ...(newType ? [newType.toLowerCase().replace(/\s+/g, "-")] : []),
      ...newAmenities.map((a) => a.toLowerCase().replace(/\s+/g, "-")),
    ];

    const currentParams = new URLSearchParams(window.location.search);
    const qs = currentParams.toString();

    const path =
      rutaFiltros.length > 0 ? `/${rutaFiltros.join("/")}${qs ? `?${qs}` : ""}` : `/${qs ? `?${qs}` : ""}`;

    router.push(path);
  };

  const redirigirWhatsApp = () => {
    const numeroWhatsApp = "+573218695196";
    const mensaje = encodeURIComponent("Hola equipo Glamperos, ¡Quiero información sobre glampings!");
    const esPantallaPequena = typeof window !== "undefined" && window.innerWidth < 600;
    const urlWhatsApp = esPantallaPequena
      ? `https://wa.me/${numeroWhatsApp}?text=${mensaje}`
      : `https://web.whatsapp.com/send?phone=${numeroWhatsApp}&text=${mensaje}`;
    window.open(urlWhatsApp, "_blank");
  };

  const noResults = hasFetched && !loading && glampings.length === 0;

  const handlePageClick = (n: number) => {
    const query = new URLSearchParams();

    if (fechaInicio) query.set("fechaInicio", fechaInicio);
    if (fechaFin) query.set("fechaFin", fechaFin);
    if (totalHuespedes > 1) query.set("totalHuespedes", String(totalHuespedes));
    if (aceptaMascotas) query.set("aceptaMascotas", "true");
    if (utmSource) query.set("utm_source", utmSource);
    if (utmMedium) query.set("utm_medium", utmMedium);
    if (utmCampaign) query.set("utm_campaign", utmCampaign);

    const pathSegments = [
      ...canonicalBase,
      ...(ordenPrecio ? [`orden-${ordenPrecio}`] : []),
      ...(n > 1 ? [`pagina-${n}`] : []),
    ].join("/");

    const qs = query.toString();
    router.push(`/${pathSegments}${qs ? `?${qs}` : ""}`);
  };

  return (
    <div className="TarjetasEcommerce-container">
      {/* Controles */}
      <div className="TarjetasEcommerce-filters-top">
        <HeaderGeneral
          onBuscarAction={({ fechaInicio, fechaFin, totalHuespedes, aceptaMascotas, destino }) => {
            const ciudadSlug = destino ? destino.toLowerCase().trim().replace(/\s+/g, "-") : null;
            const tipoSlug = tipoFilter ? tipoFilter.toLowerCase().replace(/\s+/g, "-") : null;
            const amenitySlugs = amenidadesFilter.map((a) => a.toLowerCase().trim().replace(/\s+/g, "-"));

            const segments = [...(ciudadSlug ? [ciudadSlug] : []), ...(tipoSlug ? [tipoSlug] : []), ...amenitySlugs];

            const params = new URLSearchParams();
            if (fechaInicio) params.append("fechaInicio", fechaInicio);
            if (fechaFin) params.append("fechaFin", fechaFin);
            if (totalHuespedes) params.append("totalHuespedes", String(totalHuespedes));
            if (aceptaMascotas) params.append("aceptaMascotas", "true");
            if (utmSource) params.append("utm_source", utmSource);
            if (utmMedium) params.append("utm_medium", utmMedium);
            if (utmCampaign) params.append("utm_campaign", utmCampaign);

            // Cambiar URL
            const qs = params.toString();
            router.push(`/${segments.join("/")}${qs ? `?${qs}` : ""}`);

            // Forzar fetch inmediato a page 1
            fetchGlampings(1, [
              ...(fechaInicio ? [`fechainicio=${fechaInicio}`] : []),
              ...(fechaFin ? [`fechafin=${fechaFin}`] : []),
              ...(totalHuespedes ? [`huespedes=${totalHuespedes}`] : []),
              ...(aceptaMascotas ? ["mascotas"] : []),
            ]);
          }}
          ciudadSlug={ciudadData ? posibleCiudad : undefined}
          tipoFilter={tipoFilter}
          amenidadesFilter={amenidadesFilter}
        />
      </div>

      {/* Filtros rápidos */}
      <div className="TarjetasEcommerce-filtros-wrapper">
        <button
          className="TarjetasEcommerce-scroll-btn izquierda"
          onClick={() => scrollRef.current?.scrollBy({ left: -200, behavior: "smooth" })}
          aria-label="Desplazar filtros a la izquierda"
        >
          <MdOutlineKeyboardArrowLeft size={24} />
        </button>
        <div className="TarjetasEcommerce-filtros-scroll" ref={scrollRef}>
          {FILTROS.map((f) => {
            const active = canonicalBase.map((c) => c.toLowerCase()).includes(f.value.toLowerCase());
            return (
              <div
                key={f.value}
                className={`TarjetasEcommerce-filtro-item ${active ? "activo" : ""}`}
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
          onClick={() => scrollRef.current?.scrollBy({ left: 200, behavior: "smooth" })}
          aria-label="Desplazar filtros a la derecha"
        >
          <MdOutlineKeyboardArrowRight size={24} />
        </button>
      </div>

      {/* Migas */}
      <div className="TarjetasEcommerce-breadcrumbs">
        {canonicalBase.map((filtro, i) => (
          <span key={i} className="TarjetasEcommerce-breadcrumb-item">
            {filtro}
            <button className="TarjetasEcommerce-breadcrumb-remove" onClick={() => toggleFilter(filtro)}>
              ×
            </button>
          </span>
        ))}
      </div>

      {!noResults && (
        <>
          <div className="TarjetasEcommerce-Titulo">
            <h1>
              {ciudadFilter
                ? `Descubre y reserva los Mejores Glampings cerca a ${ciudadFilter
                    .replace(/-/g, " ")
                    .split(" ")
                    .slice(0, 2)
                    .join(" ")}`
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

            <div className="TarjetasEcommerce-ordenamiento">
              <label htmlFor="ordenPrecio">Ordenar por:</label>
              <select
                id="ordenPrecio"
                value={ordenPrecio}
                onChange={(e) => {
                  const nuevoOrden = e.target.value;
                  const query = new URLSearchParams();

                  if (fechaInicio) query.set("fechaInicio", fechaInicio);
                  if (fechaFin) query.set("fechaFin", fechaFin);
                  if (totalHuespedes > 1) query.set("totalHuespedes", String(totalHuespedes));
                  if (aceptaMascotas) query.set("aceptaMascotas", "true");
                  if (utmSource) query.set("utm_source", utmSource!);
                  if (utmMedium) query.set("utm_medium", utmMedium!);
                  if (utmCampaign) query.set("utm_campaign", utmCampaign!);

                  const pathSegments = [...canonicalBase, ...(nuevoOrden ? [`orden-${nuevoOrden}`] : [])].join("/");
                  const qs = query.toString();
                  router.push(`/${pathSegments}${qs ? `?${qs}` : ""}`);
                }}
              >
                <option value="">Recomendados</option>
                <option value="asc">Precio: menor a mayor</option>
                <option value="desc">Precio: mayor a menor</option>
              </select>
            </div>
          </div>
        </>
      )}

      {/* Botón fijo de WhatsApp */}
      <button
        type="button"
        className="TarjetasEcommerce-whatsapp-button"
        onClick={redirigirWhatsApp}
        aria-label="Chatea por WhatsApp"
      ></button>

      {/* Lista con Skeleton */}
      {loading ? (
        <div className="TarjetasEcommerce-lista">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : glampings.length > 0 ? (
        <div className="TarjetasEcommerce-lista">
          {glampings.map((g) => (
            <TarjetaGeneral key={g._id} {...mapProps(g)} onClick={handleCardClick} />
          ))}
        </div>
      ) : (
        <div className="TarjetasEcommerce-no-results">
          <Regiones />
        </div>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="TarjetasEcommerce-paginacion">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              className={`TarjetasEcommerce-pagina-boton ${page === num ? "activo" : ""}`}
              onClick={() => handlePageClick(num)}
            >
              {num}
            </button>
          ))}
        </div>
      )}

      {!loading && <Footer />}
    </div>
  );
}
