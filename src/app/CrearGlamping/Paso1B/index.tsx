"use client";

import { useState, useContext, useEffect } from "react";
import { GiCampingTent, GiHabitatDome, GiTreehouse, GiHut } from "react-icons/gi";
import { MdOutlineCabin } from "react-icons/md";
import { FaCaravan } from "react-icons/fa";
import { ContextoApp } from "../../../context/AppContext";
import "./estilos.css";

const Paso1B: React.FC = () => {
  const [seleccionado, setSeleccionado] = useState<string | null>(null);
  const { tipoGlamping, setTipoGlamping } = useContext(ContextoApp)!;

  const opciones = [
    { id: "Tienda", label: "Tienda", icono: <GiCampingTent /> },
    { id: "Domo", label: "Domo", icono: <GiHabitatDome /> },
    { id: "Casa del árbol", label: "Casa del árbol", icono: <GiTreehouse /> },
    { id: "Remolque", label: "Remolque", icono: <FaCaravan /> },
    { id: "Cabaña", label: "Cabaña", icono: <MdOutlineCabin /> },
    { id: "Tipi", label: "Tipi", icono: <GiHut /> },
    { id: "Lumipod", label: "Lumipod", icono: (<img src="https://storage.googleapis.com/glamperos-imagenes/Imagenes/lumi.svg" alt="Lumipod" className="Paso1B-svg-icono" />),},
  ];

  const manejarSeleccion = (opcionId: string) => {
    setSeleccionado(opcionId);
    setTipoGlamping(opcionId);
  };

  useEffect(() => {
    setSeleccionado(tipoGlamping);
  }, [tipoGlamping]);

  return (
    <div className="Paso1B-contenedor">
      <h1 className="Paso1B-titulo">¿Cuál de estas opciones describe mejor tu Glamping?</h1>
      <div className="Paso1B-grid">
        {opciones.map((opcion) => (
          <div
            key={opcion.id}
            className={`Paso1B-opcion ${seleccionado === opcion.id ? "Paso1B-seleccionado" : ""}`}
            onClick={() => manejarSeleccion(opcion.id)}
          >
            <span className="Paso1B-icono">{opcion.icono}</span>
            <span className="Paso1B-label">{opcion.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Paso1B;
