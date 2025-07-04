// src/app/ExplorarGlamping/ExplorarGlampingContenido.tsx
"use client";

import { useEffect, useContext, useState } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import animationData from "../../Componentes/Animaciones/AnimationPuntos.json";
import Header from "../../Componentes/Header";
import ImagenesExploradas from "../../Componentes/ImgExploradas/index";
import EncabezadoExplorado from "../../Componentes/EncabezadoExplorado";
import ImgExploradasIndividual from "../../Componentes/ImgExploradasIndividual/index";
import NombreGlamping from "../../Componentes/NombreGlamping";
import DescripcionGlamping from "../../Componentes/DescripcionGlamping/index";
import FormularioFechas from "../../Componentes/FormularioFechas";
import FormularioFechasMoviles from "../../Componentes/FormularioFechasMoviles";
import LoQueOfrece from "../../Componentes/LoQueOfrece/index";
import Calendario from "../../Componentes/Calendario";
import MapaGlampings from "../../Componentes/Mapa/index";
import Comentarios from "../../Componentes/Comentarios/index";
import PerfilUsuario from "../../Componentes/PerfilUsuario";
import { ContextoApp } from "../../context/AppContext";
import ManejoErrores from "../../Funciones/ManejoErrores";
import { ObtenerGlampingPorId } from "../../Funciones/ObtenerGlamping";
import VerVideo from "../../Componentes/VerVideo";
import { MdOndemandVideo } from "react-icons/md";
import "./estilos.css";

interface MyLottieProps {
  animationData: unknown;
  loop?: boolean;
  autoplay?: boolean;
  style?: React.CSSProperties;
}

const Lottie = dynamic<MyLottieProps>(
  () =>
    import("lottie-react").then((mod) =>
      mod.default as React.ComponentType<MyLottieProps>
    ),
  { ssr: false }
);
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;

interface Glamping {
  nombreGlamping: string;
  ciudad_departamento: string;
  tipoGlamping: string;
  Acepta_Mascotas: boolean;
  fechasReservadas?: string[];
  precioEstandar: number;
  precioEstandarAdicional: number;
  descuento: number;
  Cantidad_Huespedes: number;
  Cantidad_Huespedes_Adicional: number;
  descripcionGlamping: string;
  imagenes: string[];
  ubicacion: { lat: number; lng: number };
  amenidadesGlobal: string[];
  video_youtube: string;
  propietario_id: string;
  diasCancelacion: number;
  minimoNoches: number;
}

export default function ExplorarGlampingContenido() {
  const searchParams = useSearchParams();
  const glampingId = searchParams.get("glampingId") || "";
  const { setTarifaServicio, setFechasSeparadas, setVerVideo } =
    useContext(ContextoApp)!;

  // Inicializar tarifa y scroll
  useEffect(() => {
    setTarifaServicio(1.12);
    window.scrollTo({ top: 0 });
  }, [setTarifaServicio]);

  const [informacionGlamping, setInformacionGlamping] = useState<
    Glamping | null
  >(null);

  // Cargar datos del glamping
  useEffect(() => {
    if (!glampingId) return;
    (async () => {
      const datos = await ObtenerGlampingPorId(glampingId);
      if (!datos) return;

      setInformacionGlamping({
        nombreGlamping: datos.nombreGlamping || "",
        ciudad_departamento: datos.ciudad_departamento || "",
        tipoGlamping: datos.tipoGlamping || "",
        Acepta_Mascotas: datos.Acepta_Mascotas ?? false,
        fechasReservadas: datos.fechasReservadas || [],
        precioEstandar: datos.precioEstandar || 0,
        precioEstandarAdicional: datos.precioEstandarAdicional || 0,
        descuento: Number(datos.descuento) || 0,
        Cantidad_Huespedes: datos.Cantidad_Huespedes || 0,
        Cantidad_Huespedes_Adicional:
          datos.Cantidad_Huespedes_Adicional || 0,
        descripcionGlamping: datos.descripcionGlamping || "",
        imagenes: datos.imagenes || [],
        ubicacion: datos.ubicacion
          ? { lat: datos.ubicacion.lat, lng: datos.ubicacion.lng }
          : { lat: 0, lng: 0 },
        amenidadesGlobal: datos.amenidadesGlobal || [],
        video_youtube: datos.video_youtube || "",
        propietario_id: datos.propietario_id || "",
        diasCancelacion: datos.diasCancelacion || 1,
        minimoNoches: datos.minimoNoches || 1,
      });

      // Convertir strings a Date[]
      const fechas = (datos.fechasReservadas || []).map((f: string) => {
        const [y, m, d] = f.split("-").map(Number);
        return new Date(y, m - 1, d);
      });
      setFechasSeparadas(fechas);
    })();
  }, [glampingId, setFechasSeparadas]);

  // Calificaciones
  const [calProm, setCalProm] = useState(5);
  const [calCount, setCalCount] = useState(0);
  useEffect(() => {
    if (!glampingId) return;
    (async () => {
      try {
        const resp = await fetch(
          `${API_BASE}/evaluaciones/glamping/${glampingId}/promedio`
        );
        const js = await resp.json();
        setCalProm(js.calificacion_promedio || 5);
        setCalCount(js.calificacionEvaluaciones || 0);
      } catch {}
    })();
  }, [glampingId]);

  // Reset scroll on back navigation
  useEffect(() => {
    const irArriba = () =>
      window.scrollTo({ top: 0, behavior: "auto" });
    window.addEventListener("popstate", irArriba);
    return () =>
      window.removeEventListener("popstate", irArriba);
  }, []);

  const onVideo = () => setVerVideo(true);

  // Determinar si el vídeo es válido (no vacío ni placeholder)
  const tieneVideo =
    informacionGlamping?.video_youtube &&
    informacionGlamping.video_youtube.trim() !== "" &&
    informacionGlamping.video_youtube
      .trim()
      .toLowerCase() !== "sin video";
  
  const redirigirWhatsApp = () => {
    const numeroWhatsApp = "+573218695196";
    const urlActual = typeof window !== "undefined" ? window.location.href : "";
    const mensaje = encodeURIComponent(
      `Hola equipo Glamperos, ¡Quiero información sobre este glamping!\n \n${urlActual}`
    );
    const esPantallaPequena =
      typeof window !== "undefined" && window.innerWidth < 600;
    const urlWhatsApp = esPantallaPequena
      ? `https://wa.me/${numeroWhatsApp}?text=${mensaje}`
      : `https://web.whatsapp.com/send?phone=${numeroWhatsApp}&text=${mensaje}`;
    window.open(urlWhatsApp, "_blank");
  };
  
  
  return (
    <div className="contenedor-principal-exploracion">
      {informacionGlamping ? (
        <>
          {/* Header fijo */}
          <div className="header-container">
            <Header />
          </div>

          <main>
            {/* Encabezado sin borde */}
            <div className="encabezado-explorado-container">
              <EncabezadoExplorado
                nombreGlamping={`${
                  informacionGlamping.tipoGlamping === 'cabana' ? 'Cabaña' : informacionGlamping.tipoGlamping
                } en ${informacionGlamping.ciudad_departamento.split(" - ")[0]}`}
              />
            </div>

            {/* Galería principal */}
            <div className="imagenes-exploradas-container">

              {informacionGlamping.imagenes.length > 0 ? (
                <ImagenesExploradas
                  imagenes={informacionGlamping.imagenes}
                  video_youtube={informacionGlamping.video_youtube}
                  Acepta_Mascotas={informacionGlamping.Acepta_Mascotas}
                />
              ) : (
                <div className="lottie-container">
                  <Lottie
                    animationData={animationData}
                    loop
                    autoplay
                    style={{
                      height: 200,
                      width: "100%",
                      margin: "auto",
                    }}
                  />
                </div>
              )}
            </div>

            {/* Vista móvil de imágenes individuales */}
            <div className="img-exploradas-individual-container">
              <button className="boton-volver-exploracion" onClick={() => window.history.back()}>
                ←
              </button>
              <ImgExploradasIndividual
                imagenes={informacionGlamping.imagenes}
              />
              {tieneVideo && (
                <button
                  className="ImgExploradas-iconoVideo-peque"
                  onClick={onVideo}
                >
                  <MdOndemandVideo /> Video
                </button>
              )}
              <VerVideo urlVideo={informacionGlamping.video_youtube} />
            </div>

            {/* Título */}
            <div className="nombre-glamping-container">

              <NombreGlamping
                nombreGlamping={`${
                  informacionGlamping.tipoGlamping === 'cabana' ? 'Cabaña' : informacionGlamping.tipoGlamping
                } en ${informacionGlamping.ciudad_departamento.split(" - ")[0]}`}
              />
            </div>

            {/* Descripción y formulario lado a lado */}
            <div className="contenedor-descripcion-glamping">
              {/* Izquierda */}
              <div className="contenedor-descripcion-glamping-izq">
                <DescripcionGlamping
                  calificacionNumero={calProm}
                  calificacionEvaluaciones={calCount}
                  calificacionMasAlta="Su piscina fue lo mejor calificado"
                  descripcion_glamping={
                    informacionGlamping.descripcionGlamping
                  }
                />
                <div className="contenedor-lo-que-ofrece">
                  <LoQueOfrece
                    amenidades={informacionGlamping.amenidadesGlobal}
                  />
                </div>
                <div className="contenedor-calendario">

                  <Calendario
                    nombreGlamping={`${
                      informacionGlamping.tipoGlamping === 'cabana' ? 'Cabaña' : informacionGlamping.tipoGlamping
                    } en ${informacionGlamping.ciudad_departamento.split(" - ")[0]}`}
                  />

                </div>
              </div>
              {/* Derecha */}
              <div className="contenedor-descripcion-glamping-der">
                <FormularioFechas
                  precioPorNoche={informacionGlamping.precioEstandar}
                  precioPersonaAdicional={
                    informacionGlamping.precioEstandarAdicional
                  }
                  descuento={informacionGlamping.descuento}
                  admiteMascotas={informacionGlamping.Acepta_Mascotas}
                  Cantidad_Huespedes={
                    informacionGlamping.Cantidad_Huespedes
                  }
                  Cantidad_Huespedes_Adicional={
                    informacionGlamping.Cantidad_Huespedes_Adicional
                  }
                  minimoNoches={informacionGlamping.minimoNoches}
                />
              </div>
            </div>

            {/* Comentarios, mapa y perfil */}
            <Comentarios glampingId={glampingId} />
            <ManejoErrores>
              <MapaGlampings
                lat={informacionGlamping.ubicacion.lat}
                lng={informacionGlamping.ubicacion.lng}
              />
            </ManejoErrores>
            {informacionGlamping.propietario_id ? (
              <PerfilUsuario
                propietario_id={informacionGlamping.propietario_id}
              />
            ) : (
              <p>El propietario no está disponible</p>
            )}

            {/* Móvil */}
            <FormularioFechasMoviles
              precioPorNoche={informacionGlamping.precioEstandar}
              precioPersonaAdicional={
                informacionGlamping.precioEstandarAdicional
              }
              descuento={informacionGlamping.descuento}
              admiteMascotas={informacionGlamping.Acepta_Mascotas}
              Cantidad_Huespedes={
                informacionGlamping.Cantidad_Huespedes
              }
              Cantidad_Huespedes_Adicional={
                informacionGlamping.Cantidad_Huespedes_Adicional
              }
              minimoNoches={informacionGlamping.minimoNoches}
            />
          </main>
        </>
      ) : (
        // Fallback de carga
        <div className="lottie-cargando">
          <Lottie
            animationData={animationData}
            loop
            autoplay
            style={{
              height: 200,
              width: "100%",
              margin: "auto",
            }}
          />
        </div>
      )}
      <button
        type="button"
        className="contenedor-principal-whatsapp-button"
        onClick={redirigirWhatsApp}
        aria-label="Chatea por WhatsApp"
      >
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
          alt="WhatsApp"
          width={32}
          height={32}
        />
      </button>

    </div>
  );
}
