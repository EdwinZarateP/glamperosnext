// src/components/Tarjeta/index.tsx
"use client";

import { useState, useContext } from "react";
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
import { calcularTarifaServicio } from "../../Funciones/calcularTarifaServicio";
import fds from "../BaseFinesSemana/fds.json";
import "./estilos.css";

interface TarjetaProps {
  glampingId: string;
  imagenes: string[];
  ciudad: string;
  precio: number;
  calificacion: number;
  favorito: boolean;
  onFavoritoChange: (nuevoEstado: boolean) => void;
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
  onImagenCargada?: () => void;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;


const Tarjeta: React.FC<TarjetaProps> = ({
  glampingId,
  imagenes,
  ciudad,
  precio,
  calificacion,
  favorito,
  onFavoritoChange,
  descuento,
  tipoGlamping,
  nombreGlamping,
  Acepta_Mascotas,
  Cantidad_Huespedes,
  precioEstandarAdicional,
  Cantidad_Huespedes_Adicional,
  amenidadesGlobal,
}) => {
  // ➡️ siempre usamos la prop para saber si es favorito
  const esFavoritoState = favorito;

  const [imagenActual, setImagenActual] = useState(0);
  let touchStartX = 0;
  let touchEndX = 0;

  const router = useRouter();
  const idUsuarioCookie = Cookies.get("idUsuario");

  const almacenVariables = useContext(ContextoApp);
  if (!almacenVariables) {
    throw new Error("El contexto no está disponible. Verifica el proveedor.");
  }
  const {
    totalDias,
    fechaInicio,
    fechaFin,
    fechaInicioConfirmado,
    fechaFinConfirmado,
    Cantidad_Adultos,
    Cantidad_Ninos,
    Cantidad_Bebes,
    Cantidad_Mascotas,
  } = almacenVariables;

  if (!imagenes || imagenes.length === 0) {
    return <div>No hay imágenes para mostrar.</div>;
  }

  const audio = new Audio("/Sonidos/Favorito.mp3");
  const hoy = new Date();
  const fechaInicioPorDefecto = new Date();
  fechaInicioPorDefecto.setDate(hoy.getDate() + 1);
  const fechaFinPorDefecto = new Date();
  fechaFinPorDefecto.setDate(hoy.getDate() + 2);

  const fechaInicioUrl = fechaInicio
    ? fechaInicio.toISOString().split("T")[0]
    : fechaInicioPorDefecto.toISOString().split("T")[0];
  const fechaFinUrl = fechaFin
    ? fechaFin.toISOString().split("T")[0]
    : fechaFinPorDefecto.toISOString().split("T")[0];

  const totalDiasUrl = totalDias ?? 1;
  const totalAdultosUrl = Cantidad_Adultos ?? 1;
  const totalNinosUrl = Cantidad_Ninos ?? 0;
  const totalBebesUrl = Cantidad_Bebes ?? 0;
  const totalMascotasUrl = Cantidad_Mascotas ?? 0;

  const precioConTarifa = calcularTarifaServicio(
    precio,
    fds.viernesysabadosyfestivos,
    descuento,
    fechaInicioConfirmado ?? fechaInicioPorDefecto,
    fechaFinConfirmado ?? fechaFinPorDefecto
  );
  const precioFinalNoche = precioConTarifa / totalDiasUrl;

  const verificarFavorito = async (): Promise<boolean> => {
    try {
      const respuesta = await axios.get(
        `${API_BASE}/favoritos/buscar`,
        {
          params: { usuario_id: idUsuarioCookie, glamping_id: glampingId },
        }
      );
      return respuesta.data.favorito_existe;
    } catch (error) {
      console.error("Error al verificar favorito:", error);
      return false;
    }
  };

  const handleFavoritoChange = async () => {
    if (!idUsuarioCookie) {
      router.push("/registro");
      return;
    }

    // ➡️ invertimos el estado basándonos en la prop
    const nuevoEstado = !esFavoritoState;
    audio.play();
    onFavoritoChange(nuevoEstado);

    try {
      if (nuevoEstado) {
        await axios.post(`${API_BASE}/favoritos/`, {
          usuario_id: idUsuarioCookie,
          glamping_id: glampingId,
        });
      } else {
        const existe = await verificarFavorito();
        if (!existe) return;
        await axios.delete(`${API_BASE}/favoritos/`, {
          params: { usuario_id: idUsuarioCookie, glamping_id: glampingId },
        });
      }
    } catch (error) {
      console.error("Error al actualizar el favorito:", error);
      alert("Hubo un problema al actualizar el favorito. Intenta nuevamente.");
      // opcional: podrías querer revertir el cambio en el padre
      onFavoritoChange(!nuevoEstado);
    }
  };

  const siguienteImagen = () => {
    setImagenActual((prev) =>
      prev < imagenes.length - 1 ? prev + 1 : prev
    );
  };
  const anteriorImagen = () => {
    setImagenActual((prev) => (prev > 0 ? prev - 1 : prev));
  };
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX = e.changedTouches[0].clientX;
    if (touchStartX - touchEndX > 50) siguienteImagen();
    else if (touchEndX - touchStartX > 50) anteriorImagen();
  };

  const maxPuntos = 5;
  const start = Math.max(0, imagenActual - Math.floor(maxPuntos / 2));
  const end = Math.min(imagenes.length, start + maxPuntos);
  const puntosVisibles = imagenes.slice(start, end);

  const precioConFormato = (valor: number) =>
    valor.toLocaleString("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

  const renderPrecio = () => {
    if (totalDiasUrl <= 1) {
      return (
        <div className="tarjeta-precio">
          <span>
            {precioConFormato(precioFinalNoche)} noche para {Cantidad_Huespedes}
          </span>
          {Cantidad_Huespedes_Adicional > 0 && (
            <>
              <br />
              <span>
                {precioConFormato(precioEstandarAdicional)} por persona adicional
              </span>
            </>
          )}
        </div>
      );
    }
    return (
      <>
        <span className="tarjeta-precio-base">
          {precioConFormato(precioFinalNoche)} por noche
        </span>
        <div className="tarjeta-precio-variosDias">
          {precioConFormato(precioConTarifa)} por {totalDiasUrl} noches
          {Cantidad_Huespedes_Adicional > 0 && (
            <>
              <br />
              <span>
                {precioConFormato(precioEstandarAdicional)} por persona adicional
              </span>
            </>
          )}
        </div>
      </>
    );
  };

  const isClient = typeof window !== "undefined";
  
  const formatearTipoGlamping = (valor: string): string => {
  const mapa = {
    cabana: "Cabaña",
    tienda: "Tienda",
    domo: "Domo",
    tipi: "Tipi",
    lulipod: "Lulipod",
  };
  return mapa[valor.toLowerCase() as keyof typeof mapa] || valor;
};

  const esPantallaPequena = isClient ? window.innerWidth <= 600 : false;

  const queryParams = new URLSearchParams({
    glampingId,
    fechaInicioUrl,
    fechaFinUrl,
    totalDiasUrl: totalDiasUrl.toString(),
    totalAdultosUrl: totalAdultosUrl.toString(),
    totalNinosUrl: totalNinosUrl.toString(),
    totalBebesUrl: totalBebesUrl.toString(),
    totalMascotasUrl: totalMascotasUrl.toString(),
  });
  const urlDestino = `/ExplorarGlamping?${queryParams.toString()}`;

  return (
    <div className="tarjeta">
      {esPantallaPequena ? (
        <Link href={urlDestino} className="tarjeta-link">
          <div
            className="tarjeta-imagen-container"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div
              className="carrusel"
              style={{ transform: `translateX(-${imagenActual * 100}%)` }}
            >
              {imagenes.map((url, idx) => (
                <img
                  key={idx}
                  src={url}
                  alt={`Glamping ${nombreGlamping}`}
                  className="tarjeta-imagen visible"
                />
              ))}
            </div>
            {Acepta_Mascotas && (
              <MdOutlinePets className="tarjeta-icono-mascota" />
            )}
            <div className="puntos">
              {puntosVisibles.map((_, i) => (
                <span
                  key={start + i}
                  className={`punto ${
                    start + i === imagenActual ? "activo" : ""
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setImagenActual(start + i);
                  }}
                />
              ))}
            </div>
          </div>
        </Link>
      ) : (
        <Link
          href={urlDestino}
          className="tarjeta-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          <div
            className="tarjeta-imagen-container"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div
              className="carrusel"
              style={{ transform: `translateX(-${imagenActual * 100}%)` }}
            >
              {imagenes.map((url, idx) => (
                <img
                  key={idx}
                  src={url}
                  alt={`Glamping ${nombreGlamping}`}
                  className="tarjeta-imagen visible"
                />
              ))}
            </div>
            {Acepta_Mascotas && (
              <MdOutlinePets className="tarjeta-icono-mascota" />
            )}
            <div className="puntos">
              {puntosVisibles.map((_, i) => (
                <span
                  key={start + i}
                  className={`punto ${
                    start + i === imagenActual ? "activo" : ""
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setImagenActual(start + i);
                  }}
                />
              ))}
            </div>
          </div>
        </Link>
      )}

      <div
        className="tarjeta-favorito"
        onClick={(e) => {
          e.stopPropagation();
          handleFavoritoChange();
        }}
      >
        {esFavoritoState ? (
          <BsBalloonHeartFill className="corazon activo" />
        ) : (
          <AiTwotoneHeart className="corazon" />
        )}
      </div>

      <div
        className={`flecha izquierda ${
          imagenActual === 0 ? "oculta" : ""
        }`}
        onClick={(e) => {
          e.stopPropagation();
          anteriorImagen();
        }}
      >
        <MdOutlineKeyboardArrowLeft />
      </div>
      <div
        className={`flecha derecha ${
          imagenActual === imagenes.length - 1 ? "oculta" : ""
        }`}
        onClick={(e) => {
          e.stopPropagation();
          siguienteImagen();
        }}
      >
        <MdOutlineKeyboardArrowRight />
      </div>

      <div className="tarjeta-info">
        <div className="tarjeta-contenido">
          <span className="tarjeta-nombre">
            {(() => {
              const tipoFormateado = formatearTipoGlamping(tipoGlamping);
              const amenidadesSufijo = [              
                { valor: "playa", prefijo: "cerca a la" },
                { valor: "malla catamaran", prefijo: "con" },
                { valor: "vista al lago", prefijo: "con" },
                { valor: "desierto", prefijo: "en el" },
                { valor: "jacuzzi", prefijo: "con" },
                { valor: "baño privado", prefijo: "con" },
                { valor: "piscina", prefijo: "con" },
                { valor: "tina", prefijo: "con" },
                { valor: "rio", prefijo: "cerca al" },
                { valor: "cascada", prefijo: "cerca a la" },
                { valor: "en la montaña", prefijo: "" },
                { valor: "zona fogata", prefijo: "con" },
              ];
              let amenidadEncontrada = null;
              for (let item of amenidadesSufijo) {
                if (amenidadesGlobal.includes(item.valor)) {
                  amenidadEncontrada = item;
                  break;
                }
              }
              if (amenidadEncontrada) {
                return amenidadEncontrada.prefijo === ""
                  ? `${tipoFormateado} ${amenidadEncontrada.valor}`
                  : `${tipoFormateado} ${
                      amenidadEncontrada.prefijo
                    } ${amenidadEncontrada.valor}`;
              }
              return tipoFormateado;
            })()}
          </span>
          <div className="tarjeta-calificacion">
            <FaStar className="tarjeta-estrella" />
            <span>{calificacion.toFixed(1)}</span>
          </div>
        </div>
        <p className="tarjeta-ciudad">{ciudad}</p>
        {renderPrecio()}
      </div>
    </div>
  );
};

export default Tarjeta;
