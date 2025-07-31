"use client";

import React, { useState, useContext, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AiTwotoneHeart } from "react-icons/ai";
import { BsBalloonHeartFill } from "react-icons/bs";
import { FaStar } from "react-icons/fa6";
import {
  MdOutlineKeyboardArrowLeft,
  MdOutlineKeyboardArrowRight,
  MdOutlinePets,
} from "react-icons/md";
import Cookies from "js-cookie";
import axios from "axios";
import { ContextoApp } from "../../context/AppContext";
import { calcularTarifaBasica } from "../../Funciones/calcularTarifaBasica";
import "./estilos.css";

interface TarjetaProps {
  glampingId: string;
  imagenes: string[];
  ciudad: string;
  precio: number;
  calificacion: number;
  favorito: boolean;
  descuento?: number;
  tipoGlamping: string;
  nombreGlamping: string;
  ubicacion: {
    lat: number;
    lng: number;
  };
  Acepta_Mascotas: boolean;
  fechasReservadas: string[];
  amenidadesGlobal: string[];
  Cantidad_Huespedes: number;
  precioEstandarAdicional: number;
  Cantidad_Huespedes_Adicional: number;
  onClick?: () => void;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;

const TarjetaGeneral: React.FC<TarjetaProps> = ({
  glampingId,
  imagenes,
  ciudad,
  precio,
  calificacion,
  favorito,
  descuento = 0,
  tipoGlamping,
  nombreGlamping,
  Acepta_Mascotas,
  Cantidad_Huespedes,
  amenidadesGlobal,
  onClick,
}) => {
  // Estado y refs
  const [imagenActual, setImagenActual] = useState(0);
  let touchStartX = 0;
  let touchEndX = 0;

  // Favoritos
  const [esFavorito, setEsFavorito] = useState<boolean>(favorito);
  const router = useRouter();
  const idUsuarioCookie = Cookies.get("idUsuario");

  // Registrar visita
  const registrarVisita = async () => {
    try {
      await axios.post(`${API_BASE}/visitas/`, {
        glamping_id: glampingId,
        user_id: idUsuarioCookie || "no_identificado",
        fecha: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error registrando visita:", error);
    }
  };

  useEffect(() => {
    if (!idUsuarioCookie) return;
    axios
      .get(`${API_BASE}/favoritos/buscar`, {
        params: { usuario_id: idUsuarioCookie, glamping_id: glampingId },
      })
      .then((res) => setEsFavorito(res.data.favorito_existe))
      .catch(() => {});
  }, [glampingId, idUsuarioCookie]);

  // Contexto de búsqueda y filtros
  const almacenVariables = useContext(ContextoApp);
  if (!almacenVariables) {
    throw new Error("El contexto no está disponible. Verifica el proveedor.");
  }
  const {
    totalDias,
    fechaInicio,
    fechaFin,
    Cantidad_Adultos,
    Cantidad_Ninos,
    Cantidad_Bebes,
    Cantidad_Mascotas,
  } = almacenVariables;

  // Sin imágenes
  if (!imagenes || imagenes.length === 0) {
    return <div>No hay imágenes para mostrar.</div>;
  }

  // Audio favorito
  const audioRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    if (typeof window !== "undefined") {
      audioRef.current = new Audio("/Sonidos/Favorito.mp3");
    }
  }, []);

  // Formateo de moneda COP
  const precioConFormato = (valor: number) =>
    valor.toLocaleString("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

  // Renderizado de precios con tarifa básica
  const renderPrecio = () => {
    const descuentoPct = descuento / 100;
    const { precioSinDescuento, precioConDescuento } = calcularTarifaBasica(
      precio,
      descuentoPct
    );
    return (
      <div className="TarjetaGeneral-precio">
        <span>
          {precioConFormato(precioSinDescuento)} para {Cantidad_Huespedes}
        </span>
        <br />
        <span>
          {precioConFormato(precioConDescuento)} de domingo a jueves
        </span>
      </div>
    );
  };

  // Manejo de favoritos
  const handleFavoritoChange = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!idUsuarioCookie) {
      router.push("/registro");
      return;
    }
    const nuevoEstado = !esFavorito;
    setEsFavorito(nuevoEstado);
    audioRef.current?.play();
    try {
      if (nuevoEstado) {
        await axios.post(`${API_BASE}/favoritos/`, {
          usuario_id: idUsuarioCookie,
          glamping_id: glampingId,
        });
      } else {
        await axios.delete(`${API_BASE}/favoritos/`, {
          params: { usuario_id: idUsuarioCookie, glamping_id: glampingId },
        });
      }
    } catch {
      setEsFavorito(!nuevoEstado);
      alert("No se pudo actualizar el favorito, inténtalo de nuevo.");
    }
  };

  // Navegación de imágenes
  const siguienteImagen = () => setImagenActual((prev) => Math.min(prev + 1, imagenes.length - 1));
  const anteriorImagen = () => setImagenActual((prev) => Math.max(prev - 1, 0));
  const handleTouchStart = (e: React.TouchEvent) => { touchStartX = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX = e.changedTouches[0].clientX;
    if (touchStartX - touchEndX > 50) siguienteImagen();
    if (touchEndX - touchStartX > 50) anteriorImagen();
  };

  // Puntos indicadores
  const maxPuntos = 5;
  const start = Math.max(0, imagenActual - Math.floor(maxPuntos / 2));
  const puntosVisibles = imagenes.slice(start, start + maxPuntos);

  // Detección de pantalla pequeña
  const isClient = typeof window !== "undefined";
  const esPantallaPequena = isClient ? window.innerWidth <= 600 : false;

  // Fechas por defecto para URL: siguiente fin de semana (viernes a domingo)
  const hoy = new Date();
  const diaActual = hoy.getDay(); // 0=domingo, ..., 5=viernes, 6=sábado
  const diasHastaViernes = (5 - diaActual + 7) % 7 || 7;

  const fechaInicioPorDefecto = new Date(hoy);
  fechaInicioPorDefecto.setDate(hoy.getDate() + diasHastaViernes); // viernes

  const fechaFinPorDefecto = new Date(fechaInicioPorDefecto);
  fechaFinPorDefecto.setDate(fechaInicioPorDefecto.getDate() + 1); // domingo


  const fechaInicioUrl = fechaInicio
    ? fechaInicio.toISOString().split("T")[0]
    : fechaInicioPorDefecto.toISOString().split("T")[0];
  const fechaFinUrl = fechaFin
    ? fechaFin.toISOString().split("T")[0]
    : fechaFinPorDefecto.toISOString().split("T")[0];

  // Parámetros de query
  const queryParams = new URLSearchParams({
    fechaInicioUrl,
    fechaFinUrl,
    totalDiasUrl: String(Math.max(1, totalDias ?? 1)),
    totalAdultosUrl: String(Cantidad_Adultos ?? 1),
    totalNinosUrl: String(Cantidad_Ninos ?? 0),
    totalBebesUrl: String(Cantidad_Bebes ?? 0),
    totalMascotasUrl: String(Cantidad_Mascotas ?? 0),
  });
  const urlDestino = `/propiedad/${glampingId}/?${queryParams.toString()}`;

  return (
    <div className="TarjetaGeneral">
      <Link
        href={urlDestino}
        prefetch={false}
        className="TarjetaGeneral-link"
        target={esPantallaPequena ? undefined : "_blank"}
        rel={esPantallaPequena ? undefined : "noopener noreferrer"}
        onClick={() => {
          registrarVisita();
          onClick?.();
        }}
      >
        <div
          className="TarjetaGeneral-imagen-container"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="TarjetaGeneral-carrusel"
            style={{ transform: `translateX(-${imagenActual * 100}%)` }}
          >
            {imagenes.map((url, idx) => (
              <img
                key={idx}
                src={url}
                alt={`Glamping ${nombreGlamping}`}
                className="TarjetaGeneral-imagen visible"
              />
            ))}
          </div>
          {Acepta_Mascotas && <MdOutlinePets className="TarjetaGeneral-icono-mascota" />}
          {amenidadesGlobal.includes("incluye-desayuno") && (
            <div className="TarjetaGeneral-desayuno-badge">Desayuno incluido</div>
          )}
          <div className="TarjetaGeneral-puntos">
            {puntosVisibles.map((_, i) => (
              <span
                key={i}
                className={`TarjetaGeneral-punto ${start + i === imagenActual ? "activo" : ""}`}
                onClick={(e) => { e.stopPropagation(); setImagenActual(start + i); }}
              />
            ))}
          </div>
        </div>
        <div className="TarjetaGeneral-info">
          <div className="TarjetaGeneral-contenido">
            <span className="TarjetaGeneral-nombre">
              {/* Lógica para formatear tipo y amenidades */}
              {(() => {
                const mapaTipo: Record<string, string> = {
                  cabana: "Cabaña",
                  tienda: "Tienda",
                  domo: "Domo",
                  tipi: "Tipi",
                  lulipod: "Lulipod",
                  loto: "Loto",
                  chalet: "Chalet",
                };
                const tipoFormateado = mapaTipo[tipoGlamping.toLowerCase()] || tipoGlamping;
                const sufijos = [
                  { valor: "playa", prefijo: "cerca a la" },
                  { valor: "desierto", prefijo: "en el" },
                  { valor: "jacuzzi", prefijo: "con" },
                  { valor: "malla-catamaran", prefijo: "con" },
                  { valor: "baño-privado", prefijo: "con" },
                  { valor: "tina", prefijo: "con" },
                  { valor: "vista-al-lago", prefijo: "con" },
                  { valor: "rio", prefijo: "cerca al" },
                  { valor: "cascada", prefijo: "cerca a la" },
                  { valor: "piscina", prefijo: "con" },
                  { valor: "en-la-montaña", prefijo: "" },
                  { valor: "zona-fogata", prefijo: "con" },
                ];
                const encontrado = sufijos.find((s) => amenidadesGlobal.includes(s.valor));
                return encontrado
                  ? `${tipoFormateado}${encontrado.prefijo ? ` ${encontrado.prefijo}` : ""} ${encontrado.valor.replace(/-/g, " ")}`
                  : tipoFormateado;
              })()}
            </span>
            <div className="TarjetaGeneral-calificacion">
              <FaStar className="TarjetaGeneral-estrella" />
              <span>{calificacion.toFixed(1)}</span>
            </div>
          </div>
          <p className="TarjetaGeneral-ciudad">{ciudad}</p>
          {renderPrecio()}
        </div>
      </Link>
      {/* Flechas fuera del Link */}
      <div
        className={`TarjetaGeneral-flecha izquierda ${imagenActual === 0 ? "oculta" : ""}`}
        onClick={anteriorImagen}
      >
        <MdOutlineKeyboardArrowLeft />
      </div>
      <div
        className={`TarjetaGeneral-flecha derecha ${imagenActual === imagenes.length - 1 ? "oculta" : ""}`}
        onClick={siguienteImagen}
      >
        <MdOutlineKeyboardArrowRight />
      </div>
      {/* Botón favorito */}
      <div className="TarjetaGeneral-favorito" onClick={handleFavoritoChange}>
        {esFavorito ? (
          <BsBalloonHeartFill className="TarjetaGeneral-corazon activo" />
        ) : (
          <AiTwotoneHeart className="TarjetaGeneral-corazon" />
        )}
      </div>
    </div>
  );
};

export default TarjetaGeneral;
