"use client";

import React, { useState, useEffect, useRef } from "react";
import "./estilos.css";

interface DescripcionGlampingTextoProps {
  descripcionGlamping: string;
}

export default function DescripcionGlampingTexto({
  descripcionGlamping,
}: DescripcionGlampingTextoProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const textoRef = useRef<HTMLDivElement>(null);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  useEffect(() => {
    const paragraph = textoRef.current;
    if (paragraph) {
      setShowButton(paragraph.scrollHeight > paragraph.clientHeight);
    }
  }, [descripcionGlamping]);

  // Bloquea el scroll del fondo cuando el modal está abierto
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isModalOpen]);

  return (
    <div className="DescripcionGlampingTexto-contenedor">
      <div className="DescripcionGlampingTexto-parrafo" ref={textoRef}>
        {descripcionGlamping}
      </div>
      {showButton && (
        <span
          className="DescripcionGlampingTexto-mostrar-mas-texto"
          onClick={openModal}
        >
          Mostrar más &gt;
        </span>
      )}
      {isModalOpen && (
        <div className="DescripcionGlampingTexto-modal">
          <div className="DescripcionGlampingTexto-modal-contenido">
            <h2 className="DescripcionGlampingTexto-titulo">Tenemos para ti</h2>
            <button
              className="DescripcionGlampingTexto-cerrar-boton"
              onClick={closeModal}
            >
              ×
            </button>
            <p>{descripcionGlamping}</p>
          </div>
        </div>
      )}
    </div>
  );
}
