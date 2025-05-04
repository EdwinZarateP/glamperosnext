// app/ExplorarGlamping/ExplorarGlampingContenido.tsx
"use client";

import { useEffect, useContext, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
  () => import("lottie-react").then((mod) => mod.default as React.ComponentType<MyLottieProps>),
  { ssr: false }
);

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
  const router = useRouter();
  const searchParams = useSearchParams();
  const glampingId = searchParams.get("glampingId") || "";

  const { setTarifaServicio, setFechasSeparadas, setVerVideo } = useContext(ContextoApp)!;

  useEffect(() => { setTarifaServicio(1.12); }, [setTarifaServicio]);
  useEffect(() => { window.scrollTo({ top: 0 }); }, []);

  const [informacionGlamping, setInformacionGlamping] = useState<Glamping | null>(null);

  useEffect(() => {
    if (!glampingId) return;
    (async () => {
      const datos = await ObtenerGlampingPorId(glampingId);
      if (datos) {
        const ig = {
          nombreGlamping: datos.nombreGlamping || "",
          ciudad_departamento: datos.ciudad_departamento || "",
          tipoGlamping: datos.tipoGlamping || "",
          Acepta_Mascotas: datos.Acepta_Mascotas ?? false,
          fechasReservadas: datos.fechasReservadas || [],
          precioEstandar: datos.precioEstandar || 0,
          precioEstandarAdicional: datos.precioEstandarAdicional || 0,
          descuento: Number(datos.descuento) || 0,
          Cantidad_Huespedes: datos.Cantidad_Huespedes || 0,
          Cantidad_Huespedes_Adicional: datos.Cantidad_Huespedes_Adicional || 0,
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
        };
        setInformacionGlamping(ig);

        // Convertir fechas a Date[]
        const fechas = (datos.fechasReservadas || []).map((f: string) => {
          const [y, m, d] = f.split("-").map(Number);
          return new Date(y, m - 1, d);
        });
        setFechasSeparadas(fechas);
      }
    })();
  }, [glampingId, setFechasSeparadas]);

  const [calProm, setCalProm] = useState(5);
  const [calCount, setCalCount] = useState(0);

  useEffect(() => {
    if (!glampingId) return;
    (async () => {
      try {
        const resp = await fetch(
          `https://glamperosapi.onrender.com/evaluaciones/glamping/${glampingId}/promedio`
        );
        const js = await resp.json();
        setCalProm(js.calificacion_promedio || 5);
        setCalCount(js.calificacionEvaluaciones || 0);
      } catch {}
    })();
  }, [glampingId]);

  const irArriba = () => window.scrollTo({ top: 0, behavior: "auto" });
  useEffect(() => {
    window.addEventListener("popstate", irArriba);
    return () => window.removeEventListener("popstate", irArriba);
  }, []);

  const onVideo = () => setVerVideo(true);

  return (
    <div className="contenedor-principal-exploracion">
      {informacionGlamping ? (
        <>
          <Header />
          <main>
            <EncabezadoExplorado
              nombreGlamping={`${informacionGlamping.tipoGlamping} en ${
                informacionGlamping.ciudad_departamento.split(" - ")[0]
              }`}
            />

            <div className="imagenes-exploradas-container">
              {informacionGlamping.imagenes.length > 0 ? (
                <ImagenesExploradas
                  imagenes={informacionGlamping.imagenes}
                  video_youtube={informacionGlamping.video_youtube}
                  Acepta_Mascotas={informacionGlamping.Acepta_Mascotas}
                />
              ) : (
                <Lottie
                  animationData={animationData}
                  loop
                  autoplay
                  style={{ height: 200, width: "100%", margin: "auto" }}
                />
              )}
            </div>

            <div className="img-exploradas-individual-container">
              <ImgExploradasIndividual imagenes={informacionGlamping.imagenes} />
              {informacionGlamping.video_youtube &&
                informacionGlamping.video_youtube !== "" && (
                  <button
                    className="ImgExploradas-iconoVideo-peque"
                    onClick={onVideo}
                  >
                    <MdOndemandVideo /> Video
                  </button>
                )}
              <VerVideo urlVideo={informacionGlamping.video_youtube} />
            </div>

            <NombreGlamping
              nombreGlamping={`${informacionGlamping.tipoGlamping} en ${
                informacionGlamping.ciudad_departamento.split(" - ")[0]
              }`}
            />

            <div className="contenedor-descripcion-glamping">
              <div className="izq">
                <DescripcionGlamping
                  calificacionNumero={calProm}
                  calificacionEvaluaciones={calCount}
                  calificacionMasAlta="Su piscina fue lo mejor"
                  descripcion_glamping={informacionGlamping.descripcionGlamping}
                />
                <LoQueOfrece amenidades={informacionGlamping.amenidadesGlobal} />
                <Calendario
                  nombreGlamping={`${informacionGlamping.tipoGlamping} en ${
                    informacionGlamping.ciudad_departamento.split(" - ")[0]
                  }`}
                />
              </div>
              <div className="der">
                <FormularioFechas
                  precioPorNoche={informacionGlamping.precioEstandar}
                  precioPersonaAdicional={
                    informacionGlamping.precioEstandarAdicional
                  }
                  descuento={informacionGlamping.descuento}
                  admiteMascotas={informacionGlamping.Acepta_Mascotas}
                  Cantidad_Huespedes={informacionGlamping.Cantidad_Huespedes}
                  Cantidad_Huespedes_Adicional={
                    informacionGlamping.Cantidad_Huespedes_Adicional
                  }
                  minimoNoches={informacionGlamping.minimoNoches}
                />
              </div>
            </div>

            <Comentarios glampingId={glampingId} />

            <ManejoErrores>
              <MapaGlampings
                lat={informacionGlamping.ubicacion.lat}
                lng={informacionGlamping.ubicacion.lng}
              />
            </ManejoErrores>

            {informacionGlamping.propietario_id ? (
              <PerfilUsuario propietario_id={informacionGlamping.propietario_id} />
            ) : (
              <p>Propietario no disponible</p>
            )}

            <FormularioFechasMoviles
              precioPorNoche={informacionGlamping.precioEstandar}
              precioPersonaAdicional={
                informacionGlamping.precioEstandarAdicional
              }
              descuento={informacionGlamping.descuento}
              admiteMascotas={informacionGlamping.Acepta_Mascotas}
              Cantidad_Huespedes={informacionGlamping.Cantidad_Huespedes}
              Cantidad_Huespedes_Adicional={
                informacionGlamping.Cantidad_Huespedes_Adicional
              }
              minimoNoches={informacionGlamping.minimoNoches}
            />
          </main>
        </>
      ) : (
        <div className="lottie-cargando">
          <Lottie
            animationData={animationData}
            loop
            autoplay
            style={{ height: 200, width: "100%", margin: "auto" }}
          />
        </div>
      )}
    </div>
  );
}
