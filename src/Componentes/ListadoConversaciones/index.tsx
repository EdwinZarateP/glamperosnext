"use client";

import React, { useState, useEffect, useContext } from "react";
import Cookies from "js-cookie";
import { useSearchParams, useRouter } from "next/navigation";
import { ContextoApp } from "@/context/AppContext";
import dynamic from "next/dynamic";
import animationData from "@/Componentes/Animaciones/AnimationPuntos.json";
import { useMediaQuery } from "@/Funciones/useMediaQuery";
import "./estilos.css";

interface Conversacion {
  _id: string;
  contacto: string;
  ultima_fecha: string;
}

interface RespuestaConversaciones {
  conversaciones: Conversacion[];
}

interface Usuario {
  nombre: string;
  foto: string;
}

interface MyLottieProps {
  animationData: unknown;
  loop?: boolean;
  autoplay?: boolean;
  style?: React.CSSProperties;
}

// Transformamos la importación de `lottie-react` a un componente que acepte MyLottieProps
const Lottie = dynamic<MyLottieProps>(
  () =>
    import("lottie-react").then((mod) => {
      return mod.default as React.ComponentType<MyLottieProps>;
    }),
  { ssr: false }
);

const ListadoConversaciones: React.FC = () => {
  const [conversaciones, setConversaciones] = useState<(Conversacion & Usuario)[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  
  const almacenVariables = useContext(ContextoApp);
  if (!almacenVariables) {
    throw new Error("El contexto no está disponible.");
  }

  const { setActivarChat, setIdUrlConversacion, setIdUsuarioReceptor, setNombreUsuarioChat, setFotoUsuarioChat } = almacenVariables;
  const searchParams = useSearchParams();
  const idUsuarioReceptorQuery = searchParams.get("idUsuarioReceptor") || "";
  const router = useRouter();
  const idEmisor = Cookies.get("idUsuario");
  
  // Detectar si es móvil
  const isMobile = useMediaQuery("(max-width: 900px)");

  useEffect(() => {
    if (!idEmisor) {
      setActivarChat(true);
      setIdUrlConversacion(`/Mensajes?idUsuarioReceptor=${idUsuarioReceptorQuery}`);
      router.push("/RegistroPag");
      return;
    }
  
    const obtenerConversaciones = async () => {
      try {
        const respuesta = await fetch(
          `https://glamperosapi.onrender.com/mensajes/conversaciones/${idEmisor}`
        );
        if (!respuesta.ok) throw new Error("No tienes conversaciones.");
        const data: RespuestaConversaciones = await respuesta.json();
  
        const conversacionesConDetalles = await Promise.all(
          data.conversaciones.map(async (conversacion) => {
            try {
              const usuarioRespuesta = await fetch(
                `https://glamperosapi.onrender.com/usuarios/${conversacion.contacto}`
              );
              if (!usuarioRespuesta.ok) throw new Error("Error al obtener los detalles del usuario");
              const usuario: Usuario = await usuarioRespuesta.json();
              return { ...conversacion, ...usuario };
            } catch (e) {
              console.error(`Error al obtener detalles del usuario ${conversacion.contacto}`, e);
              return { ...conversacion, nombre: "Usuario desconocido", foto: "" };
            }
          })
        );
  
        const conversacionesOrdenadas = conversacionesConDetalles.sort((a, b) => {
          return new Date(b.ultima_fecha).getTime() - new Date(a.ultima_fecha).getTime();
        });
  
        setConversaciones(conversacionesOrdenadas);
  
        if (conversacionesOrdenadas.length > 0) {
          // Determinar de forma síncrona si es móvil
          const isMobileNow = typeof window !== "undefined" ? window.innerWidth < 900 : false;
          
          // Solo se hace auto-selección si NO estamos en móvil
          // o si ya existe un idUsuarioReceptorQuery (usuario ya seleccionó una conversación)
          if (!isMobileNow || idUsuarioReceptorQuery) {
            const ultimaConversacion =
              conversacionesOrdenadas.find((c) => c.contacto === idUsuarioReceptorQuery) ||
              conversacionesOrdenadas[0];
        
            setIdUsuarioReceptor(ultimaConversacion.contacto);
            setNombreUsuarioChat(ultimaConversacion.nombre);
            setFotoUsuarioChat(ultimaConversacion.foto);
        
            // Redirigir automáticamente solo en escritorio
            if (!isMobileNow && idUsuarioReceptorQuery !== ultimaConversacion.contacto) {
              router.push(`/Mensajes?idUsuarioReceptor=${ultimaConversacion.contacto}`);
            }
          }
        }        
              
      } catch (e: any) {
        setError(e.message);
      } finally {
        setCargando(false);
      }
    };
  
    obtenerConversaciones();
  }, [idEmisor, idUsuarioReceptorQuery, isMobile, setIdUsuarioReceptor, setNombreUsuarioChat, setFotoUsuarioChat, router]);
  
  const manejarClick = (conversacion: Conversacion & Usuario) => {
    setIdUsuarioReceptor(conversacion.contacto);
    setNombreUsuarioChat(conversacion.nombre);
    setFotoUsuarioChat(conversacion.foto);
    router.push(`/Mensajes?idUsuarioReceptor=${conversacion.contacto}`);
  };

  const obtenerIniciales = (nombre: string) => {
    return nombre ? nombre.charAt(0).toUpperCase() : "";
  };

  return (
    <div className="ListadoConversaciones-contenedor">
      <h2 className="ListadoConversaciones-titulo">Conversaciones</h2>
      {cargando ? (
        <Lottie
          animationData={animationData}
          loop={true}
          autoplay={true}
          style={{ height: 200, width: "100%", margin: "auto" }}
        />
      ) : error ? (
        <p className="ListadoConversaciones-error">{error}</p>
      ) : conversaciones.length === 0 ? (
        <p className="ListadoConversaciones-mensaje">No hay conversaciones disponibles.</p>
      ) : (
        <ul className="ListadoConversaciones-lista">
          {conversaciones.map((conversacion, index) => (
            <li key={index} className="ListadoConversaciones-item" onClick={() => manejarClick(conversacion)}>
              {conversacion.foto ? (
                <img
                  src={conversacion.foto || "/imagenes/placeholder.png"}
                  alt={conversacion.nombre}
                  className="ListadoConversaciones-imagen"
                />
              ) : (
                <div className="ListadoConversaciones-iniciales">{obtenerIniciales(conversacion.nombre)}</div>
              )}
              <span className="ListadoConversaciones-nombre">{conversacion.nombre}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ListadoConversaciones;
