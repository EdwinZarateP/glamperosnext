"use client";

import React, { useContext, useState, useEffect } from "react";
import "./estilos.css";
import { ContextoApp } from "../../context/AppContext";

const Paso2E: React.FC = () => {
  const { nombreGlamping, setNombreGlamping } = useContext(ContextoApp)!;

  // Local state para el campo de texto
  const [inputNombre, setInputNombre] = useState('');

  // Sincronizar el estado local con el valor guardado en el contexto al cargar el componente
  useEffect(() => {
    setInputNombre(nombreGlamping);
  }, [nombreGlamping]);

  const manejarCambio = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value.slice(0, 40); // Limitar a 40 caracteres
    setInputNombre(valor);
    setNombreGlamping(valor);
  };

  return (
    <div className="Paso2E-contenedor">
      <div className="Paso2E-contenido">
        <div className="Paso2E-texto">
          <h1 className="Paso2E-titulo-principal">Dinos el alias de tu glamping</h1>
          <p className="Paso2E-descripcion">
            Los nombres cortos funcionan mejor, por ejemplo "El refugio",
            "El nido de la montaña", etc.
          </p>
        </div>
        <div className="Paso2E-input-contenedor">
          <input
            type="text"
            className="Paso2E-input"
            placeholder={nombreGlamping || "Escribe el nombre de tu glamping"}
            value={inputNombre}
            onChange={manejarCambio}
          />

          {/* Mostrar la cantidad de caracteres ingresados */}
          <p className="Paso2E-caracteres">
            {inputNombre.length}/40
          </p>
        </div>
      </div>
    </div>
  );
};

export default Paso2E;
