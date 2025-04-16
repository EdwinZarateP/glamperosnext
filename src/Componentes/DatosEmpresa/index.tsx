"use client";

import React from "react";
import "./estilos.css";

const DatosEmpresa: React.FC = () => {
  // URLs de las imágenes
  const imagenes = [
    "https://storage.googleapis.com/glamperos-imagenes/Imagenes/oso.webp",
    "https://storage.googleapis.com/glamperos-imagenes/Imagenes/sena%20fondo.png",
    "https://storage.googleapis.com/glamperos-imagenes/Imagenes/logo%20presidencia.jpeg",
  ];

  return (
    <div className="DatosEmpresa-contenedor">
      <h1 className="DatosEmpresa-titulo">Datos de la Empresa</h1>

      <section className="DatosEmpresa-informacion">
        <h2 className="DatosEmpresa-subtitulo">Proveedor de la Plataforma</h2>
        <p><strong>Empresa Colombiana</strong></p>
        <p>Financiada por el fondo emprender del Gobierno Colombiano</p>
        <p><strong>Sede:</strong> Cl. 71 # 58 - 102, Santa Maria, Itagüí</p>
        <p><strong>NIT:</strong>  901923029-2</p>
        <p>
          <strong>Registro Nacional de Turismo (RNT):</strong> 246204{" "}
          <a
            href="https://storage.googleapis.com/glamperos-imagenes/Imagenes/RNT%20GLAMPEROS%20SAS.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="boton-rnt"
          >
            Ver PDF
          </a>
        </p>
      </section>

      <section className="DatosEmpresa-pagos">
        <h2 className="DatosEmpresa-subtitulo">Parte contratante para los servicios de pago</h2>
        <p><strong>Empresa Colombiana</strong></p>
        <p>Autorizada y regulada por las entidades financieras de Colombia</p>
      </section>

      <section className="DatosEmpresa-contacto">
        <h2 className="DatosEmpresa-subtitulo">Contacto</h2>
        <p><strong>Teléfono:</strong> +57 321 8695196</p>
      </section>

      <section className="DatosEmpresa-imagenes">
        <h2 className="DatosEmpresa-subtitulo">Nuestros patrocinadores</h2>
        <div className="DatosEmpresa-galeria">
          <img
            src={imagenes[1]}
            alt="Imagen principal"
            className="imagen-principal"
          />
          <div className="imagen-secundaria-contenedor">
            <img
              src={imagenes[0]}
              alt="Imagen secundaria 1"
              className="imagen-secundaria"
            />
            <img
              src={imagenes[2]}
              alt="Imagen secundaria 2"
              className="imagen-secundaria"
            />
          </div>
        </div>
      </section>

      <section className="DatosEmpresa-politicas">
        <h2 className="DatosEmpresa-subtitulo">Código de conducta</h2>
        <p>
          Promovemos políticas de prevención y erradicación de la explotación infantil. Cumplimos con la 
          Resolución 3840 de 2009 del Ministerio de Comercio, Industria y Turismo.
        </p>
      </section>
    </div>
  );
};

export default DatosEmpresa;
