"use client";

import { useContext, useEffect } from "react";
import { ContextoApp } from "@/context/AppContext"; 
import FiltroPrecios from "@/Componentes/FiltrosPrecios/index"; 
import "./estilos.css"; 

const FiltrosContenedor: React.FC = () => {
  const almacenVariables = useContext(ContextoApp);

  if (!almacenVariables) {
    throw new Error("El contexto no está disponible. Asegúrate de envolver el componente en un proveedor de contexto.");
  }

  const {
    setMostrarFiltros,
    setActivarFiltros,
    tipoGlamping,
    setPrecioFiltrado,
    setTipoGlamping,
    setFiltros,
    setCantiadfiltrosAplicados,
    precioFiltrado, // ⬅️ Se asegura de usar el estado global actualizado
  } = almacenVariables;

  // ✅ Valores por defecto de precios
  const precioPorDefecto: [number, number] = [60000, 2200000];

  const aplicarFiltros = () => {
    let filtrosActivos = 0;

    if (tipoGlamping && tipoGlamping !== "") {
      filtrosActivos++;
    }
    if (JSON.stringify(precioFiltrado) !== JSON.stringify(precioPorDefecto)) {
      filtrosActivos++;
    }

    setCantiadfiltrosAplicados(filtrosActivos);

    setFiltros((prevFiltros) => ({
      ...prevFiltros,
      precioFilter: precioFiltrado, // ✅ Usa el estado global actualizado
      tipoFilter: tipoGlamping,
    }));

    setMostrarFiltros(false);
    setActivarFiltros(true);
    document.body.style.overflow = "auto";
  };

  const cerrarFiltros = () => {
    setMostrarFiltros(false);
    document.body.style.overflow = "auto";
  };

  const limpiarFiltros = () => {
    setTipoGlamping("");
    setPrecioFiltrado(precioPorDefecto); // ✅ Restaura el estado global correctamente
    setActivarFiltros(false);
    setCantiadfiltrosAplicados(0);
  };

  // ✅ Sincroniza `precioFiltrado` con el estado local de `FiltroPrecios`
  useEffect(() => {
    setPrecioFiltrado(precioPorDefecto);
  }, []);

  return (
    <div
      className="FiltrosContenedor-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          cerrarFiltros();
        }
      }}
    >
      <div className="FiltrosContenedor-contenedor">
        <h1>Filtros</h1>
        <div className="FiltrosContenedor-contenedor-opciones">
          <button className="FiltrosContenedor-boton-cerrar" onClick={cerrarFiltros}>
            ×
          </button>
          <div className="FiltrosContenedor-Rango-precios">
            <FiltroPrecios />
          </div>
          <div className="FiltrosContenedor-Amenidades">{/* Aquí puedes agregar más filtros */}</div>
        </div>

        <div className="FiltrosContenedor-botones-fijos">
          <button className="FiltrosContenedor-boton-limpiar" onClick={limpiarFiltros}>
            Limpiar filtros
          </button>
          <button className="FiltrosContenedor-boton-aplicar" onClick={aplicarFiltros}>
            Aplicar
          </button>
        </div>
      </div>
    </div>
  );
};

export default FiltrosContenedor;
