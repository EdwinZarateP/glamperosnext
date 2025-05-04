"use client";

import { useContext, useState, useEffect } from "react";
import { ContextoApp } from "../../context/AppContext";
import "./estilos.css";

const FiltroPrecios: React.FC = () => {
  const almacenVariables = useContext(ContextoApp);

  if (!almacenVariables) {
    throw new Error("El contexto no está disponible. Asegúrate de que el componente está dentro del proveedor.");
  }

  const { precioFiltrado, setPrecioFiltrado, setCantiadfiltrosAplicados } = almacenVariables;
  const min = 60000;
  const max = 2200000;

  // Garantiza que precioFiltrado sea una tupla válida
  const valoresIniciales: [number, number] =
    precioFiltrado && precioFiltrado.length === 2
      ? [precioFiltrado[0], precioFiltrado[1]]
      : [min, max];

  // Estado local que representa los valores del slider
  const [valores, setValores] = useState<[number, number]>(valoresIniciales);

  // Sincroniza el estado local cuando el contexto cambia (por ejemplo, al limpiar filtros)
  useEffect(() => {
    setValores(precioFiltrado as [number, number]);
  }, [precioFiltrado]);

  // Manejo del cambio en los sliders (sin actualizar el contexto en cada pulsación)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = Number(e.target.value);
    setValores((prevValores) => {
      const nuevosValores: [number, number] = [...prevValores];
      if (index === 0) {
        nuevosValores[0] = Math.min(value, nuevosValores[1]);
      } else {
        nuevosValores[1] = Math.max(value, nuevosValores[0]);
      }
      return nuevosValores;
    });
  };

  // Al soltar el slider, se "comprometen" los cambios en el contexto
  const commitChange = () => {
    setPrecioFiltrado([...valores] as [number, number]);
    setCantiadfiltrosAplicados(valores[0] !== min || valores[1] !== max ? 1 : 0);
  };

  // Calcula el porcentaje para el fondo del track del slider
  const porcentajeMin = ((valores[0] - min) / (max - min)) * 100;
  const porcentajeMax = ((valores[1] - min) / (max - min)) * 100;

  return (
    <div className="precio-filtro">
      <div className="precio-header">
        <h3>Rango de precios</h3>
        <div className="precio-valores">
          ${valores[0].toLocaleString()} — ${valores[1].toLocaleString()}
        </div>
      </div>

      <div className="slider-container">
        <div
          className="slider-track"
          style={{
            background: `linear-gradient(to right, #ddd ${porcentajeMin}%, #4a90e2 ${porcentajeMin}%, #4a90e2 ${porcentajeMax}%, #ddd ${porcentajeMax}%)`,
          }}
        >
          <input
            type="range"
            min={min}
            max={max}
            step={10000}
            value={valores[0]}
            onChange={(e) => handleChange(e, 0)}
            onMouseUp={commitChange}
            onTouchEnd={commitChange}
            className="slider-thumb left"
          />
          <input
            type="range"
            min={min}
            max={max}
            step={10000}
            value={valores[1]}
            onChange={(e) => handleChange(e, 1)}
            onMouseUp={commitChange}
            onTouchEnd={commitChange}
            className="slider-thumb right"
          />
        </div>
      </div>
    </div>
  );
};

export default FiltroPrecios;
