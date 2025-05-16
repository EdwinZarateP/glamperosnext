"use client";

import React, { useState, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FiMenu, FiSearch } from "react-icons/fi";
import { BsIncognito } from "react-icons/bs";
import CalendarioGeneral from "../CalendarioGeneral";
import Visitantes from "../Visitantes";
import MenuUsuario from "../MenuUsuario";
import { ContextoApp } from "../../context/AppContext";
import Cookies from "js-cookie";
import "./estilos.css";

interface HeaderGeneralProps {
  onBuscarAction: (data: {
    fechaInicio: string;
    fechaFin: string;
    totalHuespedes: number;
  }) => void;
}

export default function HeaderGeneral({ onBuscarAction }: HeaderGeneralProps) {
  const router = useRouter();
  const ctx = useContext(ContextoApp);
  if (!ctx) throw new Error("ContextoApp no disponible.");

  const {
    fechaInicioConfirmado,
    fechaFinConfirmado,
    totalHuespedes,
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
    setCantidad_Huespedes,
    setCantidad_Huespedes_Adicional,
    setDescuento,
    setPrecioEstandarAdicional,
    setAcepta_Mascotas,
    setCopiasGlamping,
  } = ctx;

  // Estado usuario
  const [nombreUsuario, setNombreUsuario] = useState<string | null>(null);
  const [idUsuarioCookie, setIdUsuarioCookie] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
    setNombreUsuario(Cookies.get("nombreUsuario") || null);
    setIdUsuarioCookie(Cookies.get("idUsuario") || null);
  }, []);

  // UI states
  const [showCalendar, setShowCalendar] = useState(false);
  const [showVisitantes, setShowVisitantes] = useState(false);
  const [error, setError] = useState("");

  // Toggle menú usuario
  const toggleMenu = () => setMostrarMenuUsuarios((p) => !p);

  // Abrir cierres
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

  // Ejecutar búsqueda
  const handleSearch = () => {
    if (!fechaInicioConfirmado || !fechaFinConfirmado) {
      setError("Seleccione ambas fechas.");
      return;
    }
    const fmt = (d: Date) => d.toISOString().split("T")[0];
    onBuscarAction({
      fechaInicio: fmt(fechaInicioConfirmado),
      fechaFin: fmt(fechaFinConfirmado),
      totalHuespedes,
    });
    cerrarCalendario();
  };

  // Texto de fechas
  const fechaText =
    fechaInicioConfirmado && fechaFinConfirmado
      ? `${fechaInicioConfirmado.toISOString().slice(0,10)} → ${fechaFinConfirmado
          .toISOString()
          .slice(0,10)}`
      : "¿Cuándo?";

  // Inicial usuario
  // const inicial = isClient && nombreUsuario
  //   ? nombreUsuario[0].toUpperCase()
  //   : "?";

  return (
    <div className="HeaderGeneral-container">
      {/* Top bar */}
      <div className="HeaderGeneral-top">

        {/* Logo */}
        <div
          className="HeaderGeneral-logo"
          onClick={() => router.push("/")}
        >
          <Image
            src="https://storage.googleapis.com/glamperos-imagenes/Imagenes/animal5.jpeg"
            alt="Glamperos logo"
            width={32}
            height={32}
            priority
          />
          <span className="HeaderGeneral-brand">Glamperos</span>
        </div>

              {/* Pill de búsqueda central */}
      <div className="HeaderGeneral-search-pill">
        <div className="HeaderGeneral-pill-segment pill-dates" onClick={abrirCalendario}>
          {fechaText}
        </div>
        <div className="HeaderGeneral-pill-divider" />
        <div className="HeaderGeneral-pill-segment pill-guests" onClick={abrirVisitantes}>
          {totalHuespedes} huésped{totalHuespedes > 1 ? "es" : ""}
        </div>
        <div className="HeaderGeneral-pill-divider" />
        <button
          className="HeaderGeneral-pill-search-btn"
          onClick={handleSearch}
          aria-label="Buscar"
        >
          <FiSearch />
        </button>
      </div>

      {error && (
        <p className="HeaderGeneral-error">{error}</p>
      )}

      {showCalendar && (
        <CalendarioGeneral cerrarCalendario={cerrarCalendario} />
      )}
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


        {/* Publica tu Glamping */}
        <button
          className="HeaderGeneral-publish-btn"
          onClick={publicarGlamping}
        >
          Publica tu Glamping
        </button>

                {/* Menú usuario */}
        <button
          className="HeaderGeneral-menu-btn"
          onClick={toggleMenu}
          aria-label="Abrir menú"
        >
          <FiMenu />
          <span className="HeaderGeneral-user-initial">
            {isClient && nombreUsuario
              ? nombreUsuario[0].toUpperCase()
              : <BsIncognito />}
          </span>
        </button>

      </div>

      {/* Dropdown de usuario */}
      <MenuUsuario />

    </div>
  );
}
