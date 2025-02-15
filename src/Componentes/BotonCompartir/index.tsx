"use client";

import React, { useState } from "react";
import { FiShare } from "react-icons/fi";
import { FaWhatsapp, FaClipboard } from "react-icons/fa";
import "./estilos.css";

const BotonCompartir: React.FC = () => {
  // Si window no está definido (durante SSR) se devuelve cadena vacía.
  const currentUrl = typeof window !== "undefined" ? window.location.href : "";
  const [showModal, setShowModal] = useState(false);
  const [showNotification, setShowNotification] = useState<string | null>(null);

  // Función para copiar el enlace al portapapeles
  const copiarEnlace = () => {
    navigator.clipboard
      .writeText(currentUrl)
      .then(() => {
        setShowNotification("Enlace copiado al portapapeles");
        setTimeout(() => setShowNotification(null), 3000);
      })
      .catch((error) => {
        setShowNotification(`Error al copiar el enlace: ${error}`);
        setTimeout(() => setShowNotification(null), 3000);
      });
    setShowModal(false);
  };

  // Función para compartir el enlace por WhatsApp Web
  const compartirWhatsApp = () => {
    const mensaje = `¡Mira este glamping! ${currentUrl}`;
    const urlWhatsApp = `https://web.whatsapp.com/send?text=${encodeURIComponent(mensaje)}`;
    window.open(urlWhatsApp, "_blank");
    setShowModal(false);
  };

  return (
    <div>
      <button className="boton-compartir" onClick={() => setShowModal(true)}>
        <FiShare className="boton-compartir-icono-compartir" />
        <span className="texto-compartir">Compartir</span>
      </button>

      {/* Modal de opciones */}
      {showModal && (
        <div className="boton-compartir-modal">
          <div className="boton-compartir-modal-content">
            <h3>Elige una opción para compartir este lugar mágico 😍</h3>
            <button className="boton-compartir-modal-button" onClick={copiarEnlace}>
              <FaClipboard className="icono-copiar" /> Copiar enlace
            </button>
            <button className="boton-compartir-modal-button" onClick={compartirWhatsApp}>
              <FaWhatsapp className="icono-whatsapp" /> Enviar por WhatsApp
            </button>
            <button
              className="boton-compartir-modal-close"
              onClick={() => setShowModal(false)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Notificación */}
      {showNotification && (
        <div className="notificacion">
          {showNotification}
        </div>
      )}
    </div>
  );
};

export default BotonCompartir;
