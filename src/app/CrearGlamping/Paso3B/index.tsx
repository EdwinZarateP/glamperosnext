"use client";

import React, { useContext } from "react";
import "./estilos.css";
import { ContextoApp } from "@/context/AppContext";

const Paso3B: React.FC = () => {
  const { precioEstandar, setPrecioEstandar, precioEstandarAdicional,
    setPrecioEstandarAdicional, descuento, setDescuento, diasCancelacion, 
    setDiasCancelacion, copiasGlamping, setCopiasGlamping, minimoNoches, setMinimoNoches } = useContext(ContextoApp)!;

  const manejarPreciosEstandar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value.replace(/\D/g, '');
    const valorNumerico = Number(valor);
    if (valorNumerico <= 2000000) {
      setPrecioEstandar(valorNumerico);
    }
  };

  const manejarPreciosEstandarAdicional = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value.replace(/\D/g, '');
    const valorNumerico = Number(valor);
    if (valorNumerico <= 1000000) {
      setPrecioEstandarAdicional(valorNumerico);
    }
  };

  const manejarBlurPrecio = () => {
    setPrecioEstandar((prev) => prev ?? 0);
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

  const manejarDiasCancelacion = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value.replace(/\D/g, '');
    const valorNumerico = Number(valor);
    if (valorNumerico <= 15) {
      setDiasCancelacion(valorNumerico);
    }
  };

  const manejarBlurDiasCancelacion = () => {
    setDiasCancelacion((prev) => prev ?? 0);
  };

  const manejarMinimoNoches = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value.replace(/\D/g, '');
    const valorNumerico = Number(valor);

    if (valorNumerico < 1) {
      
      setMinimoNoches(1);
    } else if (valorNumerico > 30) {
      setMinimoNoches(30);
    } else {
      setMinimoNoches(valorNumerico);
    }
    };

  const manejarBlurMinimoNoches = () => {
    setMinimoNoches((prev) => (prev && prev >= 1 ? prev : 1));
  };


  const manejarCopiasGlamping = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value.replace(/\D/g, '');
    const valorNumerico = Number(valor);
    if (valorNumerico <= 10) {
      setCopiasGlamping(valorNumerico);
    }
  };

  const manejarBlurCopiasGlamping= () => {
    setCopiasGlamping((prev) => prev ?? 0);
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
        <div className="Paso3B-opcion">
          <label htmlFor="precio-estandar" className="Paso3B-etiqueta">Precio por noche (Estandar)</label>
          <input id="precio-estandar" type="text" className="Paso3B-input" value={precioEstandar} onChange={manejarPreciosEstandar} onBlur={manejarBlurPrecio} placeholder="Ej: 350.000" />
        </div>

        <div className="Paso3B-opcion">
          <label htmlFor="precio-estandar-adicional" className="Paso3B-etiqueta">Precio por noche (por cada huésped adicional)</label>
          <input id="precio-estandar-adicional" type="text" className="Paso3B-input" value={precioEstandarAdicional} onChange={manejarPreciosEstandarAdicional} onBlur={manejarBlurPrecioAdicional} placeholder="Ej: 150.000" />
        </div>

        <div className="Paso3B-opcion">
          <label htmlFor="descuento" className="Paso3B-etiqueta">% de descuento para días entre semana no festivos</label>
          <input id="descuento" type="text" className="Paso3B-input" value={descuento} onChange={manejarDescuento} onBlur={manejarBlurDescuento} placeholder="Ej: 10%" />
        </div>

        <div className="Paso3B-opcion">
          <label htmlFor="diasCancelacion" className="Paso3B-etiqueta">¿Cuántos días de anticipación permites para que un huésped cancele su reserva?</label>
          <input id="diasCancelacion" type="text" className="Paso3B-input" value={diasCancelacion} onChange={manejarDiasCancelacion} onBlur={manejarBlurDiasCancelacion} placeholder="Ej: 5" />
        </div>

        <div className="Paso3B-opcion">
          <label htmlFor="minimoNoches" className="Paso3B-etiqueta">¿Cuántas noches como mínimo se pueden reservar?</label>
          <input id="minimoNoches" type="text" className="Paso3B-input" value={minimoNoches} onChange={manejarMinimoNoches} onBlur={manejarBlurMinimoNoches} placeholder="Ej: 1" />
        </div>

        <div className="Paso3B-opcion">
          <label htmlFor="cantidadCopias" className="Paso3B-etiqueta">¿Cuantas propiedades iguales quieres crear?</label>
          <input id="diasCancelacion" type="text" className="Paso3B-input" value={copiasGlamping} onChange={manejarCopiasGlamping} onBlur={manejarBlurCopiasGlamping} placeholder="Ej: 5" />
        </div>

      </div>
    </div>
  );
};

export default Paso3B;
