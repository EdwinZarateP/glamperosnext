// src/components/TarjetaGeneral/index.tsx
"use client";

import { useState, useContext, useEffect } from "react";
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
  onClick?: () => void; // 👈 AÑADE ESTA LÍNEA**
}


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
  onClick, // 👈 AGREGA ESTA LÍNEA**
}) => {

  const [imagenActual, setImagenActual] = useState(0);
  let touchStartX = 0;
  let touchEndX = 0;
// Estado interno para el corazón
  const [esFavorito, setEsFavorito] = useState<boolean>(favorito);
  const router = useRouter();
  const idUsuarioCookie = Cookies.get("idUsuario");
  
  useEffect(() => {
  if (!idUsuarioCookie) return;
  axios
    .get("https://glamperosapi.onrender.com/favoritos/buscar", {
      params: { usuario_id: idUsuarioCookie, glamping_id: glampingId },
    })
    .then(res => setEsFavorito(res.data.favorito_existe))
    .catch(() => {
      /* opcional: manejar error silencioso */
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
    e.stopPropagation();
    if (!idUsuarioCookie) {
      router.push("/registro");
      return;
    }
    const nuevoEstado = !esFavorito;
    setEsFavorito(nuevoEstado);
    audio.play();

    try {
      if (nuevoEstado) {
        await axios.post("https://glamperosapi.onrender.com/favoritos/", {
          usuario_id: idUsuarioCookie,
          glamping_id: glampingId,
        });
      } else {
        // eliminado
        await axios.delete("https://glamperosapi.onrender.com/favoritos/", {
          params: { usuario_id: idUsuarioCookie, glamping_id: glampingId },
        });
      }
    } catch (error) {
      console.error("Error actualizando favorito:", error);
      // revertir en caso de error
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
    <div className="TarjetaGeneral">
      {esPantallaPequena ? (
        <Link href={urlDestino} className="TarjetaGeneral-link" onClick={onClick}>
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
        </Link>
      ) : (
        <Link
          href={urlDestino}
          className="TarjetaGeneral-link"
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClick} 
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
        </Link>
      )}

      <div
        className="TarjetaGeneral-favorito"
        onClick={handleFavoritoChange}
      >
        {esFavorito? (
          <BsBalloonHeartFill className="TarjetaGeneral-corazon activo" />
        ) : (
          <AiTwotoneHeart className="TarjetaGeneral-corazon" />
        )}
      </div>

      <div
        className={`TarjetaGeneral-flecha izquierda ${
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
        className={`TarjetaGeneral-flecha derecha ${
          imagenActual === imagenes.length - 1 ? "oculta" : ""
        }`}
        onClick={(e) => {
          e.stopPropagation();
          siguienteImagen();
        }}
      >
        <MdOutlineKeyboardArrowRight />
      </div>

      <div className="TarjetaGeneral-info">
        <div className="TarjetaGeneral-contenido">
          <span className="TarjetaGeneral-nombre">
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
          <div className="TarjetaGeneral-calificacion">
            <FaStar className="TarjetaGeneral-estrella" />
            <span>{calificacion.toFixed(1)}</span>
          </div>
        </div>
        <p className="TarjetaGeneral-ciudad">{ciudad}</p>
        {renderPrecio()}
      </div>
    </div>
  );
};

export default TarjetaGeneral;
