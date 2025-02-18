"use client";

import React, { useState, useEffect, useRef, KeyboardEvent, useContext } from "react";
import Cookies from "js-cookie";
import { useSearchParams, useRouter } from "next/navigation";
import { ContextoApp } from "@/context/AppContext";
import { useMediaQuery } from "@/Funciones/useMediaQuery";
import "./estilos.css";

interface Message {
  emisor: string;
  receptor: string;
  mensaje: string;
  timestamp: string;
}

const Conversaciones: React.FC = () => {
  const isMobile = useMediaQuery('(max-width: 900px)');
  const searchParams = useSearchParams();
  const idReceptor = searchParams.get('idReceptor') || "";
  const router = useRouter();

  const almacenVariables = useContext(ContextoApp);
  if (!almacenVariables) {
    throw new Error("El contexto no está disponible.");
  }

  const {
    idUsuarioReceptor,
    setIdUsuarioReceptor,
    nombreUsuarioChat,
    fotoUsuarioChat,
    setActivarChat,
    setIdUrlConversacion,
  } = almacenVariables;

  const [mensaje, setMensaje] = useState("");
  const [mensajes, setMensajes] = useState<Message[]>([]);
  const [autoScroll, setAutoScroll] = useState(true);
  const idEmisor = Cookies.get("idUsuario");
  const idReceptorURL = idUsuarioReceptor || idReceptor;
  const historialRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!idEmisor) {
      setActivarChat(true);
      setIdUrlConversacion(idReceptor);
      router.push("/Registrarse");
    }
  }, [idEmisor, router, setActivarChat, setIdUrlConversacion, idReceptor]);

  useEffect(() => {
    if (!idUsuarioReceptor && idReceptor) {
      setIdUsuarioReceptor(idReceptor);
    }
  }, [idUsuarioReceptor, idReceptor, setIdUsuarioReceptor]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (idEmisor && idReceptorURL) {
      const obtenerMensajes = async () => {
        try {
          const response = await fetch(
            `https://glamperosapi.onrender.com/mensajes/obtener_mensajes/${idEmisor}/${idReceptorURL}`
          );
          const data = await response.json();

          if (data.mensajes) {
            const mensajesOrdenados = data.mensajes.sort(
              (a: Message, b: Message) =>
                new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            );
            setMensajes(mensajesOrdenados);

            if (autoScroll && historialRef.current) {
              historialRef.current.scrollTop = historialRef.current.scrollHeight;
            }
          }
        } catch (error) {
          console.error("Error al obtener los mensajes:", error);
        }
      };

      obtenerMensajes();
      intervalId = setInterval(obtenerMensajes, 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [idEmisor, idReceptorURL, autoScroll]);

  const enviarMensaje = async () => {
    if (mensaje.trim() && idEmisor && idReceptorURL) {
      const nuevoMensaje = {
        emisor: idEmisor,
        receptor: idReceptorURL,
        mensaje,
        timestamp: new Date().toISOString(),
      };

      try {
        await fetch("https://glamperosapi.onrender.com/mensajes/enviar_mensaje", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(nuevoMensaje),
        });

        setMensajes((prevMensajes) => [...prevMensajes, nuevoMensaje]);
        setMensaje("");
        setAutoScroll(true);
      } catch (error) {
        console.error("Error al enviar el mensaje:", error);
      }
    }
  };

  const manejarTeclaEnter = (event: KeyboardEvent) => {
    if (event.key === "Enter") {
      enviarMensaje();
    }
  };

  const manejarScroll = () => {
    if (historialRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = historialRef.current;
      setAutoScroll(scrollTop + clientHeight >= scrollHeight - 10);
    }
  };

  const obtenerIniciales = (nombre: string) => {
    return nombre ? nombre.charAt(0).toUpperCase() : "";
  };

  return (
    <div className="ConversacionesContenedor">
      <div className="ConversacionesHeader">
        {isMobile && (
          <button 
          className="CerrarModalBoton"
          onClick={() => router.push('/Mensajes')}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          Volver
        </button>
        
        )}
        {fotoUsuarioChat ? (
          <img
            src={fotoUsuarioChat || "/imagenes/placeholder.png"}
            alt={nombreUsuarioChat}
            className="ConversacionesFoto"
          />
        ) : (
          <div className="ConversacionesIniciales">{obtenerIniciales(nombreUsuarioChat)}</div>
        )}
        <div className="ConversacionesNombre">{nombreUsuarioChat || "Nombre desconocido"}</div>
      </div>

      <div className="ConversacionesHistorial" ref={historialRef} onScroll={manejarScroll}>
        {mensajes.map((msg, index) => (
          <div
            key={index}
            className={`ConversacionesMensaje ${
              msg.emisor === idEmisor ? "ConversacionesEmisor" : "ConversacionesReceptor"
            }`}
          >
            <span className="ConversacionesTexto">{msg.mensaje}</span>
            <span className="ConversacionesTimestamp">{new Date(msg.timestamp).toLocaleString()}</span>
          </div>
        ))}
      </div>

      <div className="ConversacionesInputContenedor">
        <input
          type="text"
          className="ConversacionesInput"
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          onKeyDown={manejarTeclaEnter}
          placeholder="Escribe tu mensaje..."
        />
        <button className="ConversacionesBotonEnviar" onClick={enviarMensaje}>
          Enviar
        </button>
      </div>
    </div>
  );
};

export default Conversaciones;