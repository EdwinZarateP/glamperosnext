// ─────────────────────────────────────────────────────────────────
// src/components/TarjetaGeneral/index.tsx  (versión “flechas afuera”)
// ─────────────────────────────────────────────────────────────────
"use client";

import { useState, useContext, useEffect, useRef } from "react";
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
import { calcularPrecioConDescuento } from "../../Funciones/calcularPrecioConDescuento";
import { precioConRecargo } from "../../Funciones/precioConRecargo";
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
  descuento,
  tipoGlamping,
  nombreGlamping,
  Acepta_Mascotas,
  Cantidad_Huespedes,
  precioEstandarAdicional,
  Cantidad_Huespedes_Adicional,
  amenidadesGlobal,
  onClick,
}) => {
  const [imagenActual, setImagenActual] = useState(0);
  let touchStartX = 0;
  let touchEndX = 0;

  const [esFavorito, setEsFavorito] = useState<boolean>(favorito);
  const router = useRouter();
  const idUsuarioCookie = Cookies.get("idUsuario");

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
      .catch(() => {
        /* silencio */
      });
  }, [glampingId, idUsuarioCookie]);

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

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      audioRef.current = new Audio("/Sonidos/Favorito.mp3");
    }
  }, []);

  const precioSinDescuento = precioConRecargo(precio);
  const precioConDescuentoAplicado = calcularPrecioConDescuento(precio, descuento);
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

  const totalDiasUrl = Math.max(1, totalDias ?? 1);
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
  const precioFinalNoche = Number.isFinite(precioConTarifa / totalDiasUrl)
    ? precioConTarifa / totalDiasUrl
    : precio;

  const handleFavoritoChange = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Evita que el clic en el corazón navegue
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
    } catch (error) {
      console.error("Error actualizando favorito:", error);
      setEsFavorito(!nuevoEstado);
      alert("No se pudo actualizar el favorito, inténtalo de nuevo.");
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
        <div className="TarjetaGeneral-precio">
          <span>
            {precioConFormato(precioSinDescuento)} noche para {Cantidad_Huespedes}
          </span>
        
            <>
              <br />
              <span>
                {precioConFormato(precioConDescuentoAplicado)} de lunes a jueves no festivos
              </span>
            </>

        </div>
      );
    }
    return (
      <>
        <span className="TarjetaGeneral-precio-base">
          {precioConFormato(precioFinalNoche)} por noche
        </span>
        <div className="TarjetaGeneral-precio-variosDias">
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
    <div className="TarjetaGeneral">
      {/* ─── Aquí sólo envuelvo la “parte clicable” en el Link ─── */}
      <Link
        href={urlDestino}
        prefetch={false}
        className="TarjetaGeneral-link"
        target={esPantallaPequena ? undefined : "_blank"}
        rel={esPantallaPequena ? undefined : "noopener noreferrer"}
        onClick={() => {
          registrarVisita();  // 👈 registra la visita
          if (onClick) onClick(); // mantiene tu lógica existente
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
          {Acepta_Mascotas && (
            <MdOutlinePets className="TarjetaGeneral-icono-mascota" />
          )}
          {amenidadesGlobal.includes("incluye-desayuno") && (
            <div className="TarjetaGeneral-desayuno-badge">
              Desayuno incluido
            </div>
          )}
          <div className="TarjetaGeneral-puntos">
            {puntosVisibles.map((_, i) => (
              <span
                key={start + i}
                className={`TarjetaGeneral-punto ${
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

        <div className="TarjetaGeneral-info">
          <div className="TarjetaGeneral-contenido">
            <span className="TarjetaGeneral-nombre">
              {(() => {
                const tipoFormateado = (() => {
                  const mapa = {
                    cabana: "Cabaña",
                    tienda: "Tienda",
                    domo: "Domo",
                    tipi: "Tipi",
                    lulipod: "Lulipod",
                  };
                  return (
                    mapa[tipoGlamping.toLowerCase() as keyof typeof mapa] ||
                    tipoGlamping
                  );
                })();

                const amenidadesSufijo = [
                  { valor: "playa", prefijo: "cerca a la" },
                  { valor: "malla-catamaran", prefijo: "con" },
                  { valor: "vista-al-lago", prefijo: "con" },
                  { valor: "desierto", prefijo: "en el" },
                  { valor: "jacuzzi", prefijo: "con" },
                  { valor: "baño-privado", prefijo: "con" },
                  { valor: "piscina", prefijo: "con" },
                  { valor: "tina", prefijo: "con" },
                  { valor: "rio", prefijo: "cerca al" },
                  { valor: "cascada", prefijo: "cerca a la" },
                  { valor: "en-la-montaña", prefijo: "" },
                  { valor: "zona-fogata", prefijo: "con" },
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
                    ? `${tipoFormateado} ${amenidadEncontrada.valor.replace(/-/g, " ").toLowerCase()}`
                    : `${tipoFormateado} ${amenidadEncontrada.prefijo} ${amenidadEncontrada.valor.replace(/-/g, " ").toLowerCase()}`;
                }
                return tipoFormateado;
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

      {/* ─── Aquí, fuera del Link, van las flechas para no disparar el <Link> ─── */}
      <div
        className={`TarjetaGeneral-flecha izquierda ${
          imagenActual === 0 ? "oculta" : ""
        }`}
        onClick={() => {
          anteriorImagen();
        }}
      >
        <MdOutlineKeyboardArrowLeft />
      </div>
      <div
        className={`TarjetaGeneral-flecha derecha ${
          imagenActual === imagenes.length - 1 ? "oculta" : ""
        }`}
        onClick={() => {
          siguienteImagen();
        }}
      >
        <MdOutlineKeyboardArrowRight />
      </div>

      {/* ─── El botón de favorito también puede quedarse fuera del <Link> ─── */}
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
