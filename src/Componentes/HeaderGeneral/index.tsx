// components/HeaderGeneral.tsx

"use client";

import React, { useState, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FiMenu } from "react-icons/fi";
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
  const contexto = useContext(ContextoApp);
  if (!contexto) throw new Error("ContextoApp no disponible.");

  const {
    fechaInicioConfirmado,
    fechaFinConfirmado,
    totalHuespedes,
    setMostrarMenuUsuarios,
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
    setIdUsuario,
  } = contexto;

  // Carga de usuario
  const [nombreUsuario, setNombreUsuario] = useState<string | null>(null);
  const [idUsuarioCookie, setIdUsuarioCookie] = useState<string | null>(null);
  useEffect(() => {
    setNombreUsuario(Cookies.get("nombreUsuario") || null);
    setIdUsuarioCookie(Cookies.get("idUsuario") || null);
  }, []);

  const [showCalendar, setShowCalendar] = useState(false);
  const [showVisitantes, setShowVisitantes] = useState(false);
  const [error, setError] = useState<string>("");

  // Acciones
  const abrirCalendario = () => setShowCalendar(true);
  const cerrarCalendario = () => setShowCalendar(false);
  const abrirVisitantes = () => setShowVisitantes(true);
  const cerrarVisitantes = () => setShowVisitantes(false);

  // Toggle menú usuario
  const handleToggleMenu = () => setMostrarMenuUsuarios(prev => !prev);

  // Publica tu glamping
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

  // Manejo de búsqueda
  const handleSearch = () => {
    if (!fechaInicioConfirmado || !fechaFinConfirmado) {
      setError("Seleccione ambas fechas.");
      return;
    }
    const format = (d: Date) => d.toISOString().split("T")[0];
    onBuscarAction({
      fechaInicio: format(fechaInicioConfirmado),
      fechaFin: format(fechaFinConfirmado),
      totalHuespedes,
    });
    cerrarCalendario();
  };

  const fechaText = fechaInicioConfirmado && fechaFinConfirmado
    ? `${fechaInicioConfirmado.toISOString().split("T")[0]} → ${fechaFinConfirmado.toISOString().split("T")[0]}`
    : "¿Cuándo?";

  // Inicial usuario para botón
  const inicial = nombreUsuario?.[0].toUpperCase() || "?";

  return (
    <div className="HeaderGeneral-container">
      <div className="HeaderGeneral-top">
        <div className="HeaderGeneral-user" onClick={handleToggleMenu}>
          <FiMenu className="HeaderGeneral-user-icon" />
          <span className="HeaderGeneral-user-initial">{inicial}</span>
        </div>
        <MenuUsuario />
        <div className="HeaderGeneral-logo" onClick={() => router.push("/")}>          
          <Image
            src="https://storage.googleapis.com/glamperos-imagenes/Imagenes/animal5.jpeg"
            alt="Glamperos logo"
            width={40}
            height={40}
          />
          <span className="HeaderGeneral-brand">Glamperos</span>
        </div>
        <button className="HeaderGeneral-publish-btn" onClick={publicarGlamping}>
          Publica tu Glamping
        </button>
      </div>

      <div className="HeaderGeneral-search-controls">
        <button className="HeaderGeneral-date-btn" onClick={abrirCalendario}>
          {fechaText}
        </button>
        <button className="HeaderGeneral-visitantes-btn" onClick={abrirVisitantes}>
          {totalHuespedes} visitantes
        </button>
        <button className="HeaderGeneral-search-btn" onClick={handleSearch}>
          Buscar
        </button>
      </div>

      {error && <p className="HeaderGeneral-error">{error}</p>}
      {showCalendar && <CalendarioGeneral cerrarCalendario={cerrarCalendario} />}
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
    </div>
  );
}
