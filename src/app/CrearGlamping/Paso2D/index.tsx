"use client";

import { useState, useEffect, useContext } from "react";
import { ContextoApp } from "@/context/AppContext";
import "./estilos.css";

const Paso2D: React.FC = () => {
  const [linkVideo, setLinkVideo] = useState<string>("");
  const [showModal, setShowModal] = useState<boolean>(false);
  const [videoBlocked, setVideoBlocked] = useState<boolean>(false);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [isValidVideo, setIsValidVideo] = useState<boolean>(false);

  const { setVideoSeleccionado } = useContext(ContextoApp)!;

  // Capturar el enlace
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLinkVideo(e.target.value);
  };

  // Función para limpiar el enlace del video
  const clearVideoInput = () => {
    setLinkVideo("");
    setVideoId(null);
    setVideoBlocked(false);
    setIsValidVideo(false);
    setVideoSeleccionado(""); // Asegurar que no quede un video seleccionado
  };

  // Validación del enlace para evitar bucles
  useEffect(() => {
    if (!linkVideo) {
      setVideoBlocked(false);
      setVideoId(null);
      setIsValidVideo(false);
      return;
    }

    const validarVideo = (url: string) => {
      const regex = /(?:youtube\.com\/.*[?&]v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
      const match = url.match(regex);

      if (match) {
        const idVideo = match[1];
        if (url.includes("redesociales") || url.includes("marca")) {
          setVideoBlocked(true);
          setShowModal(true);
          setVideoId(null);
          setIsValidVideo(false);
          setVideoSeleccionado(""); // No selecciona video bloqueado
        } else {
          setVideoBlocked(false);
          setVideoId(idVideo);
          setIsValidVideo(true);
          // Solo almacenar si el video es válido
          setVideoSeleccionado(url);
        }
      } else {
        setVideoBlocked(true);
        setVideoId(null);
        setIsValidVideo(false);
        setVideoSeleccionado(""); // No selecciona video bloqueado
      }
    };

    validarVideo(linkVideo);
  }, [linkVideo, setVideoSeleccionado]);

  return (
    <div className="Paso2D-contenedor">
      {/* Input para capturar el enlace */}
      <div className="Paso2D-formulario">
        <h1 className="Paso2D-titulo">Comparte un video de tu Glamping (Opcional)</h1>
        <p className="Paso2D-instrucciones">
          Puedes colocar aquí tu video del glamping para que los usuarios puedan ver un recorrido por el lugar. Si no tienes un video, omite este paso.
        </p>
        <div className="input-wrapper">
          {/* Input y botón de cerrar dentro del mismo contenedor */}
          <div className="Paso2D-input-container">
            <input
              type="text"
              placeholder="Pega tu enlace de YouTube aquí"
              value={linkVideo}
              onChange={handleChange}
              className="Paso2D-input"
            />
            {linkVideo && (
              <button className="Paso2D-clear-button" onClick={clearVideoInput}>
                x
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mostrar el video solo si no está bloqueado */}
      {!videoBlocked && videoId && (
        <div className="Paso2D-video-container">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?controls=0&disablekb=1&rel=0&modestbranding=1&showinfo=0`}
            className="Paso2D-video"
            title="Video promocional"
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        </div>
      )}

      {/* Mostrar advertencia bajo el video si el enlace es válido */}
      {isValidVideo && !videoBlocked && (
        <div className="Paso2D-advertencia">
          <p>¡Nos reservamos el derecho a publicar el video si no cumple con nuestras políticas!</p>
          <button className="Paso2D-btn-ver-politicas" onClick={() => setShowModal(true)}>
            Ver Políticas
          </button>
        </div>
      )}

      {/* Ventana modal para las políticas */}
      {showModal && (
        <div className="Paso2D-modal-overlay">
          <div className="Paso2D-modal-content">
            <h3 className="Paso2D-modal-titulo">Políticas de Contenido de Glamperos</h3>
            <p className="Paso2D-modal-descripcion">
              ¡Nos reservamos el derecho de no mostrar un video si no cumple nuestras políticas!
            </p>
            <ul className="Paso2D-modal-lista">
              <li>El video no debe contener referencias a redes sociales.</li>
              <li>No se deben mencionar marcas directamente.</li>
              <li>Cualquier contenido que afecte la experiencia de usuarios en Glamperos será restringido.</li>
              <li>El contenido debe ser respetuoso y libre de lenguaje ofensivo o discriminatorio.</li>
              <li>No se debe incluir contenido violento, explícito o peligroso.</li>
              <li>El video no puede contener material de naturaleza política o ideológica que pueda resultar controvertido.</li>
              <li>Todos los videos deben cumplir con las normativas legales vigentes en el país de operación de la plataforma.</li>
              <li>No se deben mostrar actividades peligrosas o riesgosas que puedan incurrir en problemas legales.</li>
              <li>Los videos deben estar relacionados con la experiencia de glamping, turismo, naturaleza y experiencias al aire libre.</li>
              <li>Se debe evitar el contenido engañoso o con información errónea.</li>
              <li>Glamperos se reserva el derecho de rechazar cualquier video que no cumpla con estos lineamientos.</li>
            </ul>
            <button className="Paso2D-cerrar-modal" onClick={() => setShowModal(false)}>
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Paso2D;
