"use client";

import { useState, useEffect, useMemo } from "react";
import { opcionesAmenidades } from "../../Componentes/Amenidades/index";
import "./estilos.css";
import { GiCircleClaws } from "react-icons/gi";

interface Props {
  amenidades: string[];
}

export default function LoQueOfrece({ amenidades }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // 1) Deduplicar manteniendo orden de primera aparición
  const amenidadesUnicas = useMemo(() => {
    const seen = new Set<string>();
    return amenidades.filter(item => {
      const key = item.trim().toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [amenidades]);

  // helper para renderizar cada amenidad
  const renderAmenidad = (amenidad: string, index: number) => {
    const texto = amenidad.trim().toLowerCase();
    const opcion = opcionesAmenidades.find(o =>
      o.id.trim().toLowerCase() === texto ||
      o.label.trim().toLowerCase() === texto
    );

    const icono    = opcion?.icono || <GiCircleClaws />;
    const etiqueta = opcion?.label || amenidad;

    return (
      <div key={index} className="LoQueOfrece-item">
        <span className="LoQueOfrece-icono">{icono}</span>
        <span className="LoQueOfrece-etiqueta">{etiqueta}</span>
      </div>
    );
  };

  // controlar scroll cuando abre/cierra modal
  useEffect(() => {
    document.body.style.overflow = isModalOpen ? "hidden" : "auto";
    return () => { document.body.style.overflow = "auto"; };
  }, [isModalOpen]);

  return (
    <div className="LoQueOfrece-contenedor">
      <h2 className="LoQueOfrece-titulo">Lo que ofrece</h2>

      <div className="LoQueOfrece-lista-contenida">
        <div className="LoQueOfrece-lista">
          {amenidadesUnicas.slice(0, 12).map(renderAmenidad)}
        </div>
      </div>

      {amenidadesUnicas.length > 6 && (
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
              {amenidadesUnicas.map(renderAmenidad)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
