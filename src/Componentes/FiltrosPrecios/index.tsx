"use client";

import React, { useContext, useState, useEffect, useRef } from "react";
import { ContextoApp } from "@/context/AppContext";
import "./estilos.css";

const FiltroPrecios: React.FC = () => {
  const almacenVariables = useContext(ContextoApp);

  if (!almacenVariables) {
    throw new Error("El contexto no está disponible. Asegúrate de que el componente está dentro del proveedor.");
  }

  const { precioFiltrado, setPrecioFiltrado, setCantiadfiltrosAplicados } = almacenVariables;
  const min = 60000;
  const max = 2200000;

  // ✅ Garantiza que `precioFiltrado` sea una tupla válida
  const valoresIniciales: [number, number] = (
    precioFiltrado?.length === 2 ? precioFiltrado : [min, max]
  ) as [number, number];

  // ✅ Estado local inicializado correctamente
  const [valores, setValores] = useState<[number, number]>(valoresIniciales);

  // ✅ Ref para evitar la ejecución en el primer render
  const isFirstRender = useRef(true);

  // ✅ Actualizar `valores` cuando `precioFiltrado` cambia
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (JSON.stringify(precioFiltrado) !== JSON.stringify(valores)) {
      setValores(precioFiltrado as [number, number]);
    }
  }, [precioFiltrado]);

  // ✅ Actualizar `precioFiltrado` cuando `valores` cambia
  useEffect(() => {
    if (!isFirstRender.current && JSON.stringify(valores) !== JSON.stringify(precioFiltrado)) {
      setPrecioFiltrado([...valores] as [number, number]);
      setCantiadfiltrosAplicados(valores[0] !== min || valores[1] !== max ? 1 : 0);
    }
  }, [valores]); // ✅ Solo depende de `valores`

  // ✅ Manejo del cambio en los sliders
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

  // ✅ Calcular porcentaje para el track del slider
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
            value={valores[0]}
            onChange={(e) => handleChange(e, 0)}
            className="slider-thumb left"
          />
          <input
            type="range"
            min={min}
            max={max}
            value={valores[1]}
            onChange={(e) => handleChange(e, 1)}
            className="slider-thumb right"
          />
        </div>
      </div>
    </div>
  );
};

export default FiltroPrecios;