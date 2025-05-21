// HeaderGeneral.tsx
"use client";

import React, { useState, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FiMenu, FiSearch, FiX} from "react-icons/fi";
import { BsIncognito } from "react-icons/bs";
import CalendarioGeneral from "../CalendarioGeneral";
import Visitantes from "../Visitantes";
import MenuUsuario from "../MenuUsuario";
import { ContextoApp } from "../../context/AppContext";
import Cookies from "js-cookie";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
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
  }) => void;
  ciudadSlug?: string;
  tipoFilter?: string;
  amenidadesFilter?: string[];
}


export default function HeaderGeneral({
  ciudadSlug,
  tipoFilter,
  amenidadesFilter
}: HeaderGeneralProps) {

  const router = useRouter();
  const ctx = useContext(ContextoApp);
  if (!ctx) throw new Error("ContextoApp no disponible.");

  const {
    fechaInicioConfirmado,
    fechaFinConfirmado,
    // setFechaInicioConfirmado,
    // setFechaFinConfirmado,
    totalHuespedes,
    setCantidad_Huespedes,
    setCantidad_Huespedes_Adicional,
    setMostrarMenuUsuarios,
    setIdUsuario,
    setSiono,
    setLatitud,
    setLongitud,
    setCiudad_departamento,
    setTipoGlamping,
    setAmenidadesGlobal,
    setImagenesCargadas,
    setNombreGlamping,
    setDescripcionGlamping,
    setPrecioEstandar,
    setDiasCancelacion,
    setDescuento,
    setPrecioEstandarAdicional,
    setAcepta_Mascotas,
    setCopiasGlamping,
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

    // Inicializa fechas en mañana/pasado mañana al cargar
    // const hoy = new Date();
    // const manana = new Date(hoy);
    // manana.setDate(hoy.getDate() + 1);
    // const pasado = new Date(hoy);
    // pasado.setDate(hoy.getDate() + 2);
    // setFechaInicioConfirmado(manana);
    // setFechaFinConfirmado(pasado);
  }, []);

  // UI states
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showVisitantes, setShowVisitantes] = useState(false);
  const [error, setError] = useState("");

  // Autocompletado destino
  const [destination, setDestination] = useState("");
  const [suggestions, setSuggestions] = useState<Municipio[]>([]);
  useEffect(() => {
    if (destination.trim()) {
      const term = destination.toLowerCase();
      setSuggestions(
        municipiosData
          .filter(m => m.CIUDAD_DEPARTAMENTO.toLowerCase().includes(term))
          .slice(0, 10)
      );
    } else {
      setSuggestions([]);
    }
  }, [destination]);

  // Toggle menú usuario
  const toggleMenu = () => setMostrarMenuUsuarios(prev => !prev);

  // Calendario & Visitantes
  const abrirCalendario = () => setShowCalendar(true);
  const cerrarCalendario = () => setShowCalendar(false);
  const abrirVisitantes = () => setShowVisitantes(true);
  const cerrarVisitantes = () => setShowVisitantes(false);

  // Publicar glamping
  const publicarGlamping = () => {
    setSiono(true);
    setLatitud(4.123456);
    setLongitud(-74.123456);
    setCiudad_departamento("");
    setTipoGlamping("");
    setAmenidadesGlobal([]);
    setImagenesCargadas([]);
    setNombreGlamping("");
    setDescripcionGlamping("");
    setPrecioEstandar(0);
    setDiasCancelacion(1);
    setCantidad_Huespedes(1);
    setCantidad_Huespedes_Adicional(0);
    setDescuento(0);
    setPrecioEstandarAdicional(0);
    setAcepta_Mascotas(false);
    setCopiasGlamping(1);
    if (idUsuarioCookie) {
      setIdUsuario(idUsuarioCookie);
      router.push("/CrearGlamping");
    } else {
      router.push("/registro");
    }
  };

  // Búsqueda
 const handleSearch = () => {
  if (!fechaInicioConfirmado || !fechaFinConfirmado) {
    setError("Seleccione ambas fechas.");
    return;
  }

  const fmt = (d: Date) => d.toISOString().split("T")[0];
  const slugCiudadManual = destination.trim()
    ? destination.trim().toLowerCase().replace(/\s+/g, '-')
    : ciudadSlug;

  const fechaIni = fmt(fechaInicioConfirmado);
  const fechaFin = fmt(fechaFinConfirmado);

  // 👉 reconstruye la URL respetando filtros existentes
  const nuevaRuta = `/glampings/${[
    ...(slugCiudadManual ? [slugCiudadManual] : []),
    ...(tipoFilter ? [tipoFilter.toLowerCase()] : []),
    ...(amenidadesFilter?.map(a => a.toLowerCase()) ?? []),
    fechaIni,
    fechaFin,
    String(totalHuespedes)
  ].join("/")}`;

  cerrarCalendario();
  setShowSearchModal(false);
  router.push(nuevaRuta);
};


  // Limpiar modal
 const clearAll = () => {
  console.log("limpiando")
  setDestination("");
  setSuggestions([]);
  // Reinicia fechas y huéspedes (usa tus setters de contexto)
  setShowCalendar(false);
  setShowVisitantes(false);
  setError("");
};

const buscadorText =
  fechaInicioConfirmado && fechaFinConfirmado
    ? `${format(fechaInicioConfirmado, 'd MMM yyyy', { locale: es })} → ${format(fechaFinConfirmado, 'd MMM yyyy', { locale: es })}`
    : "¿Cuándo y donde?";


const fechaText =
  fechaInicioConfirmado && fechaFinConfirmado
    ? `${format(fechaInicioConfirmado, 'd MMM yyyy', { locale: es })} → ${format(fechaFinConfirmado, 'd MMM yyyy', { locale: es })}`
    : "¿Cuándo?";

  return (
    <div className="HeaderGeneral-container">
      <div className="HeaderGeneral-top">
        <div className="HeaderGeneral-logo" onClick={() => router.push("/")}>  
          <Image src="https://storage.googleapis.com/glamperos-imagenes/Imagenes/animal5.jpeg" alt="Glamperos logo" width={32} height={32} priority />
          <span className="HeaderGeneral-brand">Glamperos</span>
        </div>

        <div className="HeaderGeneral-search-pill" onClick={() => setShowSearchModal(true)}>
          <div className="HeaderGeneral-pill-segment">{buscadorText}</div>
          <div className="HeaderGeneral-pill-divider"/>
          <div className="HeaderGeneral-pill-segment">{totalHuespedes} huésped{totalHuespedes>1&&"es"}</div>
          <button className="HeaderGeneral-pill-search-btn"><FiSearch/></button>
        </div>

        <button className="HeaderGeneral-publish-btn" onClick={publicarGlamping}>Publica tu Glamping</button>
        <button className="HeaderGeneral-menu-btn" onClick={toggleMenu}>
          <FiMenu/>
          <span className="HeaderGeneral-user-initial">
            {isClient && nombreUsuario ? nombreUsuario[0].toUpperCase() : <BsIncognito/>}
          </span>
        </button>
      </div>
      <MenuUsuario/>

      {showSearchModal && (
        <div className="HeaderGeneral-SearchModal-overlay" onClick={() => setShowSearchModal(false)}>
          <div className="HeaderGeneral-SearchModal-container" onClick={e => e.stopPropagation()}>
            {/* Destino */}
            <div className="HeaderGeneral-field">
              <label>Destino</label>
              <div className="HeaderGeneral-input-wrapper">
                <input
                  type="text"
                  placeholder="Explora destinos"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
                  autoFocus
                />
                {destination && (
                  <FiX
                    className="HeaderGeneral-clear-dest-btn"
                    onClick={() => {
                      setDestination("");
                      setCiudad_departamento("");
                      setSuggestions([]);
                    }}
                  />
                )}
              </div>


              {showSuggestions && suggestions.length > 0 && (
                <ul className="HeaderGeneral-suggestions-list">
                  {suggestions.map((m,i) => (
                    <li
                      key={i}
                      onClick={() => {
                        setDestination(m.CIUDAD_DEPARTAMENTO);
                        setCiudad_departamento(m.CIUDAD_DEPARTAMENTO);
                        setSuggestions([]);
                        setShowSuggestions(false);
                      }}
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
              <div className="HeaderGeneral-fake-input">{totalHuespedes} huésped{totalHuespedes>1&&"es"}</div>
            </div>
            {showVisitantes && <Visitantes onCerrar={cerrarVisitantes} max_adultos={10} max_Ninos={10} max_bebes={5} max_mascotas={2} max_huespedes={10}/>} 
            {/* Botones */}
            <div className="HeaderGeneral-modal-actions">
              <button className="HeaderGeneral-clear-btn" onClick={clearAll}>Limpiar todo</button>
              <button className="HeaderGeneral-search-btn" onClick={handleSearch}>Buscar</button>
            </div>
            {error && <p className="HeaderGeneral-HeaderGeneral-error">{error}</p>}
          </div>
        </div>
      )}
    </div>
  );
}