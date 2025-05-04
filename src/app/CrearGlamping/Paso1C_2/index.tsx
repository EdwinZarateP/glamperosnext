"use client";

import { useState, useCallback, useContext, useEffect } from "react";
import { ContextoApp } from "../../../context/AppContext";
import municipios from "../../Componentes/Municipios/municipios.json";
import "./estilos.css";

const Paso1C_2: React.FC = () => {
  const { ciudad_departamento, setCiudad_departamento } = useContext(ContextoApp)!; 
  const [destino, setDestino] = useState<string>("");
  const [sugerencias, setSugerencias] = useState<string[]>([]);

  // Actualizar el estado destino con el valor por defecto del contexto
  useEffect(() => {
    if (ciudad_departamento) {
      setDestino(ciudad_departamento);
    }
  }, [ciudad_departamento]);

  const buscarSugerencias = useCallback(
    (consulta: string) => {
      if (consulta.length > 1) {
        const resultados = municipios
          .filter((municipio: any) =>
            municipio.CIUDAD_DEPARTAMENTO.toLowerCase().includes(consulta.toLowerCase())
          )
          .map((municipio: any) => municipio.CIUDAD_DEPARTAMENTO)
          .slice(0, 10);
        setSugerencias(resultados);
      } else {
        setSugerencias([]);
      }
    },
    []
  );

  const manejarCambioDestino = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    setDestino(valor);
    buscarSugerencias(valor);
  };

  const manejarSeleccionSugerencia = (sugerencia: string) => {
    setDestino(sugerencia);
    setCiudad_departamento(sugerencia);
    setSugerencias([]);
  };

  const borrarContenido = () => {
    setDestino("");
    setCiudad_departamento("");
    setSugerencias([]);
  };

  return (
    <div className="paso1c2-contenedor">
      <div className="paso1c2-titulo">Escribe un municipio que esté cerca a tu glamping</div>
      <div className="paso1c2-barra-busqueda">
        <div className="paso1c2-contenedor-input">
          <span className="paso1c2-icono" onClick={destino ? borrarContenido : undefined}>
            {destino ? "x" : "🔍"}
          </span>
          <input
            type="text"
            className="paso1c2-input"
            placeholder="Escribe tu destino aquí"
            value={destino}
            onChange={manejarCambioDestino}
          />
        </div>
      </div>

      {sugerencias.length > 0 && (
        <ul className="paso1c2-sugerencias">
          {sugerencias.map((sugerencia, index) => (
            <li
              key={index}
              className="paso1c2-sugerencia"
              onClick={() => manejarSeleccionSugerencia(sugerencia)}
            >
              {sugerencia}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Paso1C_2;
