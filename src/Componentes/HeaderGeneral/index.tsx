// HeaderGeneral.tsx
"use client";

import React, { useState, useContext, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { FiMenu, FiSearch, FiX } from "react-icons/fi";
import { BsIncognito } from "react-icons/bs";
import CalendarioGeneral from "../CalendarioGeneral";
import Visitantes from "../Visitantes";
import MenuUsuario from "../MenuUsuario";
import { ContextoApp } from "../../context/AppContext";
import Cookies from "js-cookie";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import municipiosData from "../MunicipiosGeneral/municipiosGeneral.json";
import "./estilos.css";

type Municipio = {
  CIUDAD_DEPARTAMENTO: string;
  CIUDAD: string;
  DEPARTAMENTO: string;
  LATITUD: number;
  LONGITUD: number;
};

interface HeaderGeneralProps {
  onBuscarAction: (data: {
    fechaInicio: string;
    fechaFin: string;
    totalHuespedes: number;
    aceptaMascotas?: boolean;
    destino?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
  }) => void;
  ciudadSlug?: string;
  tipoFilter?: string;
  amenidadesFilter?: string[];
}

export default function HeaderGeneral({
  ciudadSlug,
  onBuscarAction,
}: HeaderGeneralProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const utmSource = searchParams.get("utm_source") || undefined;
  const utmMedium = searchParams.get("utm_medium") || undefined;
  const utmCampaign = searchParams.get("utm_campaign") || undefined;

  const ctx = useContext(ContextoApp);
  if (!ctx) throw new Error("ContextoApp no disponible.");

  const {
    fechaInicioConfirmado,
    fechaFinConfirmado,
    totalHuespedes,
    setMostrarMenuUsuarios,
    setIdUsuario,
    setCiudad_departamento,
    Cantidad_Mascotas,
    setFechaInicioConfirmado,
    setFechaFinConfirmado,
    setTotalHuespedes,
    setCantidad_Adultos,
    setCantidad_Ninos,
    setCantidad_Bebes,
    setCantidad_Mascotas,
  } = ctx;

  // Usuario
  const [nombreUsuario, setNombreUsuario] = useState<string | null>(null);
  const [idUsuarioCookie, setIdUsuarioCookie] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setNombreUsuario(Cookies.get("nombreUsuario") || null);
    setIdUsuarioCookie(Cookies.get("idUsuario") || null);

    if (ciudadSlug) {
      const ciudadEncontrada = municipiosData.find(
        (m) =>
          m.CIUDAD_DEPARTAMENTO.toLowerCase().replace(/\s+/g, "-") ===
          ciudadSlug.toLowerCase()
      );
      if (ciudadEncontrada) {
        setDestination(ciudadEncontrada.CIUDAD_DEPARTAMENTO);
        setCiudad_departamento(ciudadEncontrada.CIUDAD_DEPARTAMENTO);
      }
    }
  }, [ciudadSlug, setCiudad_departamento]);

  // UI states
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showVisitantes, setShowVisitantes] = useState(false);
  const [error, setError] = useState("");
  const [showToast, setShowToast] = useState(false);

  // Autocompletado destino
  const [destination, setDestination] = useState("");
  const [suggestions, setSuggestions] = useState<Municipio[]>([]);

  useEffect(() => {
    if (destination.trim()) {
      const term = destination.toLowerCase();
      setSuggestions(
        municipiosData
          .filter((m) => m.CIUDAD_DEPARTAMENTO.toLowerCase().includes(term))
          .slice(0, 10)
      );
    } else {
      setSuggestions([]);
    }
  }, [destination]);

  // refs
  const inputDestinoRef = useRef<HTMLInputElement>(null);
  const blurTimeout = useRef<number | null>(null);

  // helpers
  const toggleMenu = () => setMostrarMenuUsuarios((prev) => !prev);

  const abrirCalendario = () => setShowCalendar(true);
  const cerrarCalendario = () => setShowCalendar(false);
  const abrirVisitantes = () => setShowVisitantes(true);
  const cerrarVisitantes = () => setShowVisitantes(false);

  const selectSuggestion = (m: Municipio) => {
    // cancela el cierre diferido del onBlur
    if (blurTimeout.current) {
      clearTimeout(blurTimeout.current);
      blurTimeout.current = null;
    }
    setDestination(m.CIUDAD_DEPARTAMENTO);
    setCiudad_departamento(m.CIUDAD_DEPARTAMENTO);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  // Búsqueda
  const handleSearch = () => {
    if (!fechaInicioConfirmado || !fechaFinConfirmado) {
      setError("Seleccione fechas.");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }

    const fmt = (d: Date) => d.toISOString().split("T")[0];
    const fechaIni = fmt(fechaInicioConfirmado);
    const fechaFin = fmt(fechaFinConfirmado);

    onBuscarAction({
      fechaInicio: fechaIni,
      fechaFin: fechaFin,
      totalHuespedes: totalHuespedes,
      aceptaMascotas: Cantidad_Mascotas > 0,
      destino: destination,
      utmSource,
      utmMedium,
      utmCampaign,
    });

    cerrarCalendario();
    setShowSearchModal(false);
  };

  // Limpiar modal
  const clearAll = () => {
    setDestination("");
    setCiudad_departamento("");
    setSuggestions([]);

    setFechaInicioConfirmado(null);
    setFechaFinConfirmado(null);
    setTotalHuespedes(1);
    setCantidad_Adultos(1);
    setCantidad_Ninos(0);
    setCantidad_Bebes(0);
    setCantidad_Mascotas(0);

    setShowCalendar(false);
    setShowVisitantes(false);
    setError("");
    setTimeout(() => inputDestinoRef.current?.focus(), 0);
  };

  const buscadorText =
    fechaInicioConfirmado && fechaFinConfirmado
      ? `${format(fechaInicioConfirmado, "d MMM yyyy", { locale: es })} → ${format(fechaFinConfirmado, "d MMM yyyy", { locale: es })}`
      : "¿Cuándo y donde?";

  const fechaText =
    fechaInicioConfirmado && fechaFinConfirmado
      ? `${format(fechaInicioConfirmado, "d MMM yyyy", { locale: es })} → ${format(fechaFinConfirmado, "d MMM yyyy", { locale: es })}`
      : "¿Cuándo?";

  const existeId = () => !!idUsuarioCookie && idUsuarioCookie !== "undefined";

  return (
    <div className="HeaderGeneral-container">
      <div className="HeaderGeneral-top">
        <div className="HeaderGeneral-logo" onClick={() => router.push("/")}>
          <Image
            src="https://storage.googleapis.com/glamperos-imagenes/Imagenes/animal5.jpeg"
            alt="Glamperos logo"
            width={32}
            height={32}
            priority
          />
          <span className="HeaderGeneral-brand">Glamperos</span>
        </div>

        <div
          className="HeaderGeneral-search-pill"
          onClick={() => setShowSearchModal(true)}
        >
          <div className="HeaderGeneral-pill-segment">{buscadorText}</div>
          <div className="HeaderGeneral-pill-divider" />
          <div className="HeaderGeneral-pill-segment">
            {totalHuespedes} huésped{totalHuespedes > 1 && "es"}
          </div>
          <button className="HeaderGeneral-pill-search-btn" aria-label="Abrir busqueda">
            <FiSearch />
          </button>
        </div>

        <button
          className="HeaderGeneral-publish-btn"
          onClick={() => {
            if (existeId()) {
              setIdUsuario(idUsuarioCookie || "");
              router.push("/CrearGlamping");
            } else {
              router.push("/registro");
            }
          }}
        >
          Publica tu Glamping
        </button>

        <button
          className="HeaderGeneral-menu-btn"
          onClick={toggleMenu}
          aria-label="Abrir menú de usuario"
        >
          <FiMenu />
          <span className="HeaderGeneral-user-initial">
            {isClient && nombreUsuario ? nombreUsuario[0].toUpperCase() : <BsIncognito />}
          </span>
        </button>
      </div>

      <MenuUsuario />

      {showSearchModal && (
        <div
          className="HeaderGeneral-SearchModal-overlay"
          onClick={() => setShowSearchModal(false)}
        >
          <div
            className="HeaderGeneral-SearchModal-container"
            onClick={(e) => e.stopPropagation()}
          >
            {showToast && <div className="error-toast">{error}</div>}

            {/* Destino */}
            <div className="HeaderGeneral-field">
              <label>Destino</label>
              <div className="HeaderGeneral-input-wrapper">
                <input
                  ref={inputDestinoRef}
                  type="text"
                  placeholder="Explora destinos"
                  value={destination}
                  onChange={(e) => {
                    setDestination(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => {
                    // mostrar siempre (tenga o no texto)
                    setShowSuggestions(true);
                  }}
                  onBlur={() => {
                    // diferido: permite seleccionar con click antes de cerrar
                    blurTimeout.current = window.setTimeout(
                      () => setShowSuggestions(false),
                      150
                    );
                  }}
                />

                {destination && (
                  <FiX
                    className="HeaderGeneral-clear-dest-btn"
                    onClick={() => {
                      setDestination("");
                      setCiudad_departamento("");
                      setSuggestions([]);
                      setShowSuggestions(true);
                      setTimeout(() => inputDestinoRef.current?.focus(), 0);
                    }}
                  />
                )}
              </div>

              {showSuggestions && suggestions.length > 0 && (
                <ul className="HeaderGeneral-suggestions-list">
                  {suggestions.map((m, i) => (
                    <li
                      key={i}
                      // Selecciona antes del blur
                      onMouseDown={(e) => {
                        e.preventDefault();
                        selectSuggestion(m);
                      }}
                      // Si prefieres unificar eventos:
                      // onPointerDown={(e) => { e.preventDefault(); selectSuggestion(m); }}
                    >
                      {m.CIUDAD_DEPARTAMENTO}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Cuándo */}
            <div className="HeaderGeneral-field" onClick={abrirCalendario}>
              <label>Cuándo</label>
              <div className="HeaderGeneral-fake-input">{fechaText}</div>
            </div>
            {showCalendar && <CalendarioGeneral cerrarCalendario={cerrarCalendario} />}

            {/* Quién */}
            <div className="HeaderGeneral-field" onClick={abrirVisitantes}>
              <label>Quién</label>
              <div className="HeaderGeneral-fake-input">
                {totalHuespedes} huésped{totalHuespedes > 1 && "es"}
                {Cantidad_Mascotas > 0 &&
                  `, ${Cantidad_Mascotas} mascota${Cantidad_Mascotas > 1 ? "s" : ""}`}
              </div>
            </div>
            {showVisitantes && (
              <Visitantes
                onCerrar={cerrarVisitantes}
                max_adultos={10}
                max_Ninos={10}
                max_bebes={5}
                max_mascotas={2}
                max_huespedes={10}
              />
            )}

            {/* Botones */}
            <div className="HeaderGeneral-modal-actions">
              <button className="HeaderGeneral-clear-btn" onClick={clearAll}>
                Limpiar todo
              </button>
              <button className="HeaderGeneral-search-btn" onClick={handleSearch}>
                Buscar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
