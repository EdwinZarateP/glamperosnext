"use client";

import React, { useContext } from "react";
import "./estilos.css";
import { ContextoApp } from "@/context/AppContext";

const Paso3B: React.FC = () => {
  const {
    precioEstandar,
    setPrecioEstandar,
    precioEstandarAdicional,
    setPrecioEstandarAdicional,
    descuento,
    setDescuento,
    diasCancelacion,
    setDiasCancelacion,
    copiasGlamping,
    setCopiasGlamping,
    minimoNoches,
    setMinimoNoches,
  } = useContext(ContextoApp)!;

  // ───── Handlers para campos de texto (precio, descuento, etc.) ─────
  const manejarPreciosEstandar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value.replace(/\D/g, '');
    const valorNumerico = Number(valor);
    if (valorNumerico <= 2000000) {
      setPrecioEstandar(valorNumerico);
    }
  };

  const manejarBlurPrecio = () => {
    setPrecioEstandar((prev) => prev ?? 0);
  };

  const manejarPreciosEstandarAdicional = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value.replace(/\D/g, '');
    const valorNumerico = Number(valor);
    if (valorNumerico <= 1000000) {
      setPrecioEstandarAdicional(valorNumerico);
    }
  };

  const manejarBlurPrecioAdicional = () => {
    setPrecioEstandarAdicional((prev) => prev ?? 0);
  };

  const manejarDescuento = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value.replace(/\D/g, '');
    const valorNumerico = Number(valor);
    if (valorNumerico <= 100) {
      setDescuento(valorNumerico);
    }
  };

  const manejarBlurDescuento = () => {
    setDescuento((prev) => prev ?? 0);
  };

  // ───── Handlers para los botones de incremento/decremento ─────
  // 1) Días de cancelación
  const handleDecreaseDiasCancelacion = () => {
    if (diasCancelacion > 1) {
      setDiasCancelacion(diasCancelacion - 1);
    }
  };
  const handleIncreaseDiasCancelacion = () => {
    if (diasCancelacion < 15) {
      setDiasCancelacion(diasCancelacion + 1);
    }
  };

  // 2) Mínimo de noches
  const handleDecreaseMinimoNoches = () => {
    if (minimoNoches > 1) {
      setMinimoNoches(minimoNoches - 1);
    }
  };
  const handleIncreaseMinimoNoches = () => {
    if (minimoNoches < 3) {
      setMinimoNoches(minimoNoches + 1);
    }
  };

  // 3) Cantidad de copias
  const handleDecreaseCopiasGlamping = () => {
    if (copiasGlamping > 1) {
      setCopiasGlamping(copiasGlamping - 1);
    }
  };
  const handleIncreaseCopiasGlamping = () => {
    if (copiasGlamping < 10) {
      setCopiasGlamping(copiasGlamping + 1);
    }
  };

  return (
    <div className="Paso3B-contenedor">
      <h1 className="Paso3B-titulo">Establece tu precio</h1>
      <p className="Paso3B-descripcion">
        Configura el precio que deseas cobrar por noche en tu glamping.
        La plataforma hará los descuentos automáticos para días entre semana si así lo deseas.
        De lo contrario debes dejar en 0 el descuento.
      </p>

      <div className="Paso3B-contenido">
        {/* Campo: Precio por noche */}
        <div className="Paso3B-opcion">
          <label htmlFor="precio-estandar" className="Paso3B-etiqueta">
            Precio por noche (Estandar)
          </label>
          <input
            id="precio-estandar"
            type="text"
            className="Paso3B-input"
            value={precioEstandar}
            onChange={manejarPreciosEstandar}
            onBlur={manejarBlurPrecio}
            placeholder="Ej: 350.000"
          />
        </div>

        {/* Campo: Precio por huésped adicional */}
        <div className="Paso3B-opcion">
          <label htmlFor="precio-estandar-adicional" className="Paso3B-etiqueta">
            Precio por noche (por cada huésped adicional)
          </label>
          <input
            id="precio-estandar-adicional"
            type="text"
            className="Paso3B-input"
            value={precioEstandarAdicional}
            onChange={manejarPreciosEstandarAdicional}
            onBlur={manejarBlurPrecioAdicional}
            placeholder="Ej: 150.000"
          />
        </div>

        {/* Campo: Descuento */}
        <div className="Paso3B-opcion">
          <label htmlFor="descuento" className="Paso3B-etiqueta">
            % de descuento para días entre semana no festivos
          </label>
          <input
            id="descuento"
            type="text"
            className="Paso3B-input"
            value={descuento}
            onChange={manejarDescuento}
            onBlur={manejarBlurDescuento}
            placeholder="Ej: 10%"
          />
        </div>

        {/* Campo: Días de cancelación (BOTONES) */}
        <div className="Paso3B-opcion">
          <label className="Paso3B-etiqueta">
            ¿Cuántos días de anticipación para cancelar?
          </label>
          <div className="Stepper-container">
            <button
              type="button"
              className="Stepper-boton"
              onClick={handleDecreaseDiasCancelacion}
            >
              –
            </button>
            <span className="Stepper-valor">{diasCancelacion}</span>
            <button
              type="button"
              className="Stepper-boton"
              onClick={handleIncreaseDiasCancelacion}
            >
              +
            </button>
          </div>
        </div>

        {/* Campo: Mínimo de noches (BOTONES) */}
        <div className="Paso3B-opcion">
          <label className="Paso3B-etiqueta">
            ¿Cuántas noches como mínimo se pueden reservar?
          </label>
          <div className="Stepper-container">
            <button
              type="button"
              className="Stepper-boton"
              onClick={handleDecreaseMinimoNoches}
            >
              –
            </button>
            <span className="Stepper-valor">{minimoNoches}</span>
            <button
              type="button"
              className="Stepper-boton"
              onClick={handleIncreaseMinimoNoches}
            >
              +
            </button>
          </div>
        </div>

        {/* Campo: Cantidad de copias (BOTONES) */}
        <div className="Paso3B-opcion">
          <label className="Paso3B-etiqueta">
            ¿Cuántas propiedades iguales quieres crear?
          </label>
          <div className="Stepper-container">
            <button
              type="button"
              className="Stepper-boton"
              onClick={handleDecreaseCopiasGlamping}
            >
              –
            </button>
            <span className="Stepper-valor">{copiasGlamping}</span>
            <button
              type="button"
              className="Stepper-boton"
              onClick={handleIncreaseCopiasGlamping}
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Paso3B;
