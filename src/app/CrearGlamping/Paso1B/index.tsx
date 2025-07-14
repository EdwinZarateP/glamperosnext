"use client";

import { useState, useContext, useEffect } from "react";
import { GiCampingTent, GiHabitatDome, GiTreehouse, GiHut, GiWoodCabin} from "react-icons/gi";
import { MdOutlineCabin } from "react-icons/md";
import { FaCaravan } from "react-icons/fa";
import { ContextoApp } from "../../../context/AppContext";
import "./estilos.css";

const Paso1B: React.FC = () => {
  const [seleccionado, setSeleccionado] = useState<string | null>(null);
  const { tipoGlamping, setTipoGlamping } = useContext(ContextoApp)!;

  const opciones = [
    { id: "tienda", label: "tienda", icono: <GiCampingTent /> },
    { id: "domo", label: "Domo", icono: <GiHabitatDome /> },
    { id: "casa del arbol", label: "Casa del árbol", icono: <GiTreehouse /> },
    { id: "remolque", label: "Remolque", icono: <FaCaravan /> },
    { id: "cabana", label: "Cabaña", icono: <MdOutlineCabin /> },
    { id: "tipi", label: "Tipi", icono: <GiHut /> },
    { id: "lumipod", label: "Lumipod", icono: (<img src="https://storage.googleapis.com/glamperos-imagenes/Imagenes/lumi.svg" alt="Lumipod" className="Paso1B-svg-icono" />),},
    { id: "chalet", label: "Chalet", icono: <GiWoodCabin /> },
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
