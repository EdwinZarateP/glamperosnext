"use client";

import { useEffect, useContext, useState } from "react";
import Header from "@/Componentes/Header";
import ImagenesExploradas from "@/Componentes/ImgExploradas/index";
import EncabezadoExplorado from "@/Componentes/EncabezadoExplorado";
import ImgExploradasIndividual from "@/Componentes/ImgExploradasIndividual/index";
import NombreGlamping from "@/Componentes/NombreGlamping";
import DescripcionGlamping from "@/Componentes/DescripcionGlamping/index";
// import FormularioFechas from "@/Componentes/FormularioFechas";
import LoQueOfrece from "@/Componentes/LoQueOfrece/index";
import Calendario from "@/Componentes/Calendario";
import MapaGlampings from "@/Componentes/Mapa/index";
import Comentarios from "@/Componentes/Comentarios/index";
// import ReservarBoton from "@/Componentes/BotonReservar";
import { ContextoApp } from "@/context/AppContext";
import ManejoErrores from "@/Funciones/ManejoErrores";
import { ObtenerGlampingPorId } from "@/Funciones/ObtenerGlamping";
import Lottie from "lottie-react";
import animationData from "@/Componentes/Animaciones/AnimationPuntos.json";
import { useParams, useRouter } from "next/navigation";
import VerVideo from "@/Componentes/VerVideo";
import PerfilUsuario from "@/Componentes/PerfilUsuario";
import { MdOndemandVideo } from "react-icons/md";
import "./estilos.css";

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
  ubicacion: {
    lat: number;
    lng: number;
  };
  amenidadesGlobal: string[];
  video_youtube: string;
  propietario_id: string;
  diasCancelacion: number;
}

// interface Ubicacion {
//   lat: number;
//   lng: number;
// }

export default function ExplorarGlamping() {
  const router = useRouter();
  const { glampingId } = useParams() as { glampingId: string };

  const irAInicio = () => {
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const almacenVariables = useContext(ContextoApp);
  if (!almacenVariables) {
    throw new Error(
      "El contexto no está disponible. Asegúrate de envolver el componente en un proveedor de contexto."
    );
  }
  const { setTarifaServicio, setFechasSeparadas, setVerVideo } = almacenVariables;

  // Tarifa predeterminada
  useEffect(() => {
    setTarifaServicio(1.12);
  }, [setTarifaServicio]);

  // Scroll al inicio
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  // Estado para la información del glamping
  const [informacionGlamping, setInformacionGlamping] = useState<Glamping | null>(null);

  useEffect(() => {
    const consultarGlamping = async () => {
      if (!glampingId) {
        console.error("No se proporcionó un ID de glamping.");
        return;
      }
      const datos = await ObtenerGlampingPorId(glampingId);
      if (datos) {
        setInformacionGlamping({
          nombreGlamping: datos.nombreGlamping || "No disponible",
          ciudad_departamento: datos.ciudad_departamento || "No disponible",
          tipoGlamping: datos.tipoGlamping || "No disponible",
          Acepta_Mascotas: datos.Acepta_Mascotas ?? false,
          fechasReservadas: datos.fechasReservadas || [],
          precioEstandar: datos.precioEstandar || 0,
          precioEstandarAdicional: datos.precioEstandarAdicional || 0,
          descuento: Number(datos.descuento) || 0,
          Cantidad_Huespedes: datos.Cantidad_Huespedes || 0,
          Cantidad_Huespedes_Adicional: datos.Cantidad_Huespedes_Adicional || 0,
          descripcionGlamping: datos.descripcionGlamping || "No disponible",
          imagenes: datos.imagenes || [],
          ubicacion: datos.ubicacion
            ? { lat: datos.ubicacion.lat, lng: datos.ubicacion.lng }
            : { lat: 0, lng: 0 },
          amenidadesGlobal: datos.amenidadesGlobal || [],
          video_youtube: datos.video_youtube || "sin video",
          propietario_id: datos.propietario_id || "No disponible",
          diasCancelacion: datos.diasCancelacion || 3,
        });

        // Convertir fechas reservadas de string a Date
        if (datos.fechasReservadas) {
          const fechasComoDate = datos.fechasReservadas.map((fechaString: string) => {
            const [year, month, day] = fechaString.split("-").map(Number);
            return new Date(year, month - 1, day);
          });
          setFechasSeparadas(fechasComoDate);
        }
      }
    };

    consultarGlamping();
  }, [glampingId, setFechasSeparadas]);

  // Estados para calificaciones
  const [calificacionEvaluaciones, setCalificacionEvaluaciones] = useState<number | null>(null);
  const [calificacionPromedio, setCalificacionPromedio] = useState<number>(4.5);

  useEffect(() => {
    if (glampingId) {
      const obtenerCalificaciones = async () => {
        try {
          const response = await fetch(`https://glamperosapi.onrender.com/evaluaciones/glamping/${glampingId}/promedio`);
          const data = await response.json();
          if (data) {
            setCalificacionPromedio(data.calificacion_promedio || 4.5);
            setCalificacionEvaluaciones(data.calificacionEvaluaciones || 1);
          }
        } catch (error) {
          console.error("Error al obtener las calificaciones:", error);
        }
      };
      obtenerCalificaciones();
    }
  }, [glampingId]);

  // Manejo de navegación para volver al inicio en cambios de ruta
  useEffect(() => {
    const manejarNavegacion = (_: PopStateEvent) => {
      irAInicio();
    };
    window.addEventListener("popstate", manejarNavegacion);
    return () => {
      window.removeEventListener("popstate", manejarNavegacion);
    };
  }, [router]);

  const handleVideoClick = () => {
    setVerVideo(true);
  };

  return (
    <div className="contenedor-principal-exploracion">
      {informacionGlamping ? (
        <>
          <div className="header-container">
            <Header />
          </div>
          <main>
            <div className="encabezado-explorado-container">
              <EncabezadoExplorado 
                nombreGlamping={`${informacionGlamping.nombreGlamping} - ${informacionGlamping.ciudad_departamento.split(" - ")[0] || ""}`} 
              />
            </div>
            <div className="imagenes-exploradas-container">
              {informacionGlamping.imagenes && informacionGlamping.imagenes.length > 0 ? (
                <ImagenesExploradas 
                  imagenes={informacionGlamping.imagenes}
                  video_youtube={informacionGlamping.video_youtube}
                  Acepta_Mascotas={informacionGlamping.Acepta_Mascotas}
                />
              ) : (
                <div className="lottie-container">
                  <Lottie 
                    animationData={animationData} 
                    style={{ height: 200, width: "100%", margin: "auto" }} 
                  />
                </div>
              )}
            </div>
            <div className="img-exploradas-individual-container">
              {informacionGlamping.imagenes && informacionGlamping.imagenes.length > 0 ? (
                <ImgExploradasIndividual imagenes={informacionGlamping.imagenes} />                
              ) : null}
              {informacionGlamping.video_youtube &&
                informacionGlamping.video_youtube.trim() !== "sin video" && (
                <button
                  className="ImgExploradas-iconoVideo-peque"
                  onClick={handleVideoClick}
                >
                  <MdOndemandVideo title="Mostrar Video" />
                  Video
                </button>
              )}
              <VerVideo urlVideo={informacionGlamping.video_youtube} />
              
            </div>
            <div className="nombre-glamping-container">
              <NombreGlamping 
                nombreGlamping={`${informacionGlamping.nombreGlamping} - ${informacionGlamping.ciudad_departamento.split(" - ")[0] || ""}`} 
              />
            </div>
            <div className="contenedor-descripcion-glamping">
              <div className="contenedor-descripcion-glamping-izq">
                <DescripcionGlamping
                  calificacionNumero={calificacionPromedio || 4.5}
                  calificacionEvaluaciones={calificacionEvaluaciones || 1}
                  calificacionMasAlta="Su piscina fue lo mejor calificado"
                  descripcion_glamping={informacionGlamping.descripcionGlamping}  
                />
                <div className="contenedor-lo-que-ofrece">
                  <LoQueOfrece amenidades={informacionGlamping.amenidadesGlobal} />
                </div>
                <div className="contenedor-calendario">
                  <Calendario 
                    nombreGlamping={`${informacionGlamping.nombreGlamping} - ${informacionGlamping.ciudad_departamento.split(" - ")[0] || ""}`}
                  />
                </div>
              </div>
              <div className="contenedor-descripcion-glamping-der">
                {/* <FormularioFechas
                  precioPorNoche={informacionGlamping.precioEstandar || 0}
                  precioPersonaAdicional={informacionGlamping.precioEstandarAdicional || 0}
                  descuento={informacionGlamping.descuento || 0}
                  admiteMascotas={informacionGlamping.Acepta_Mascotas || false}
                  Cantidad_Huespedes={informacionGlamping.Cantidad_Huespedes || 10}
                  Cantidad_Huespedes_Adicional={informacionGlamping.Cantidad_Huespedes_Adicional || 0}
                /> */}
              </div>
            </div>
            <Comentarios glampingId={glampingId || ""} />
            <ManejoErrores>              
              <MapaGlampings 
                lat={informacionGlamping.ubicacion?.lat ?? 0} 
                lng={informacionGlamping.ubicacion?.lng ?? 0} 
              />
            </ManejoErrores>
            {informacionGlamping.propietario_id ? (
            <PerfilUsuario propietario_id={informacionGlamping.propietario_id} />
            ) : (
              <p>El propietario no está disponible</p>
            )}
            {/* <ReservarBoton 
              precioPorNoche={informacionGlamping.precioEstandar || 0}
              descuento={informacionGlamping.descuento || 0}
              precioPersonaAdicional={informacionGlamping.precioEstandarAdicional || 0}
              Cantidad_Huespedes={informacionGlamping.Cantidad_Huespedes || 10}
              admiteMascotas={informacionGlamping.Acepta_Mascotas || false}
              Cantidad_Huespedes_Adicional={informacionGlamping.Cantidad_Huespedes_Adicional || 0}
            /> */}
          </main>
        </>
      ) : (
        <div className="lottie-cargando">
          <Lottie 
            animationData={animationData} 
            style={{ height: 200, width: 200, margin: "auto" }} 
          />
        </div>
      )}
    </div>
  );
}
