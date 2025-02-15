"use client";

import { useContext } from "react";
import { ContextoApp } from "@/context/AppContext"; 
import FiltroPrecios from "@/Componentes/FiltrosPrecios/index"; 
import "./estilos.css"; 

const FiltrosContenedor: React.FC = () => {
  const almacenVariables = useContext(ContextoApp);

  if (!almacenVariables) {
    return null; // ✅ Evita errores de renderizado si el contexto no está disponible
  }

  const {
    setMostrarFiltros,
    setActivarFiltros,
    tipoGlamping,
    setPrecioFiltrado,
    setTipoGlamping,
    setFiltros,
    setCantiadfiltrosAplicados,
    precioFiltrado, // ⬅️ Asegura que el estado global se actualice correctamente
  } = almacenVariables;

  // ✅ Valores por defecto de precios
  const precioPorDefecto: [number, number] = [60000, 2200000];

  const aplicarFiltros = () => {
    let filtrosActivos = 0;

    // ✅ Verifica si el precio fue modificado
    if (JSON.stringify(precioFiltrado) !== JSON.stringify(precioPorDefecto)) {
      filtrosActivos++;
    }

    // ✅ Verifica si el tipo de glamping fue seleccionado
    if (tipoGlamping && tipoGlamping !== "") {
      filtrosActivos++;
    }

    setCantiadfiltrosAplicados(filtrosActivos); // ✅ Actualiza el contador de filtros aplicados

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
    setCantiadfiltrosAplicados(0); // ✅ Borra el contador de filtros aplicados
  };

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
