"use client";

import React, { useState, useEffect } from "react";
import { opcionesAmenidades } from "../../Componentes/Amenidades/index"; // Ajusta la ruta según tu estructura
import "./estilos.css";
import { GiCircleClaws } from "react-icons/gi";

interface Props {
  amenidades: string[];
}

export default function LoQueOfrece({ amenidades }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Bloquear el scroll del fondo cuando el modal esté abierto
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
    <div className="LoQueOfrece-contenedor">
      <h2 className="LoQueOfrece-titulo">Lo que ofrece</h2>

      <div className="LoQueOfrece-lista-contenida">
        <div className="LoQueOfrece-lista">
          {amenidades.slice(0, 8).map((amenidad, index) => {
            const opcionEncontrada = opcionesAmenidades.find(
              (opcion) =>
                opcion.label.trim().toLowerCase() ===
                amenidad.trim().toLowerCase()
            );
            return (
              <div key={index} className="LoQueOfrece-item">
                <span className="LoQueOfrece-icono">
                  {opcionEncontrada?.icono || <GiCircleClaws />}
                </span>
                <span className="LoQueOfrece-etiqueta">{amenidad}</span>
              </div>
            );
          })}
        </div>
      </div>

      {amenidades.length > 6 && (
        <p className="mostrar-mas-texto" onClick={openModal}>
          Mostrar más &gt;
        </p>
      )}

      {isModalOpen && (
        <div className="LoQueOfrece-modal">
          <div className="LoQueOfrece-modal-contenido">
            <button className="LoQueOfrece-cerrar" onClick={closeModal}>
              ×
            </button>
            <h1>Lo que este lugar te ofrece</h1>
            <div className="LoQueOfrece-lista">
              {amenidades.map((amenidad, index) => {
                const opcionEncontrada = opcionesAmenidades.find(
                  (opcion) =>
                    opcion.label.trim().toLowerCase() ===
                    amenidad.trim().toLowerCase()
                );
                return (
                  <div key={index} className="LoQueOfrece-item">
                    <span className="LoQueOfrece-icono">
                      {opcionEncontrada?.icono || <GiCircleClaws />}
                    </span>
                    <span className="LoQueOfrece-etiqueta">{amenidad}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
