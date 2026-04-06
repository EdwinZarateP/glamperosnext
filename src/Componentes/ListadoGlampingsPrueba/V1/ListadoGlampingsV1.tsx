"use client";

import { useState } from "react";
import styles from "./ListadoGlampingsV1.module.css";
import { glampingsDePrueba } from '../glampings';


// --- Tipos ---
interface Glamping {
  id: number;
  nombre: string;
  ubicacion: string;
  precioFinSemana: number;
  precioDiaSemana: number;
  calificacion: number;
  totalResenas: number;
  capacidadMaxima: number;
  petFriendly: boolean;
  desayunoIncluido: boolean;
  imagenes: string[];
  favorito: boolean;
}

// --- Helper ---
function formatCOP(valor: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(valor);
}

// --- Carrusel ---
function CarruselImagenes({
  imagenes,
  nombre,
  desayunoIncluido,
}: {
  imagenes: string[];
  nombre: string;
  desayunoIncluido: boolean;
}) {
  const [indice, setIndice] = useState(0);
  const [hovering, setHovering] = useState(false);
  const total = imagenes.length;

  function irAnterior(e: React.MouseEvent) {
    e.stopPropagation();
    setIndice((prev) => (prev - 1 + total) % total);
  }
  function irSiguiente(e: React.MouseEvent) {
    e.stopPropagation();
    setIndice((prev) => (prev + 1) % total);
  }

  return (
    <div
      className={styles.imagenWrapper}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <img
        src={imagenes[indice]}
        alt={`${nombre} — foto ${indice + 1}`}
        className={styles.imagen}
        key={indice}
      />

      {/* Flechas */}
      {total > 1 && (
        <>
          <button
            className={`${styles.flecha} ${styles.flechaIzq} ${hovering ? styles.flechaVisible : ""}`}
            onClick={irAnterior}
            aria-label="Imagen anterior"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6z" />
            </svg>
          </button>
          <button
            className={`${styles.flecha} ${styles.flechaDer} ${hovering ? styles.flechaVisible : ""}`}
            onClick={irSiguiente}
            aria-label="Imagen siguiente"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" />
            </svg>
          </button>

          {/* Puntos */}
          <div className={styles.indicadores}>
            {imagenes.map((_, i) => (
              <button
                key={i}
                className={`${styles.punto} ${i === indice ? styles.puntoActivo : ""}`}
                onClick={(e) => { e.stopPropagation(); setIndice(i); }}
                aria-label={`Ir a imagen ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}

      {/* Badge desayuno — esquina inferior derecha de la imagen */}
      {desayunoIncluido && (
        <div className={styles.badgeDesayuno}>
          Desayuno incluido
        </div>
      )}
    </div>
  );
}

// --- Tarjeta ---
function TarjetaGlampingV2({ glamping }: { glamping: Glamping }) {
  const [esFavorito, setEsFavorito] = useState(glamping.favorito);

  return (
    <article className={styles.tarjeta}>

      {/* Zona imagen */}
      <div className={styles.imagenContenedor}>
        <CarruselImagenes
          imagenes={glamping.imagenes}
          nombre={glamping.nombre}
          desayunoIncluido={glamping.desayunoIncluido}
        />

        {/* Favorito */}
        <button
          className={`${styles.btnFavorito} ${esFavorito ? styles.activado : ""}`}
          onClick={() => setEsFavorito(!esFavorito)}
          aria-label={esFavorito ? "Quitar de favoritos" : "Agregar a favoritos"}
        >
          <svg viewBox="0 0 24 24" className={styles.iconoCorazon} aria-hidden="true">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5
                     2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09
                     C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5
                     c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </button>
      </div>

      {/* Cuerpo */}
      <div className={styles.contenido}>

        {/* Fila: nombre + puntuación */}
        <div className={styles.filaNombre}>
          <h3 className={styles.nombre}>{glamping.nombre}</h3>
          <div className={styles.puntuacion}>
            <span className={styles.starIcon}>★</span>
            <span className={styles.puntuacionValor}>{glamping.calificacion.toFixed(1)}</span>
          </div>
        </div>

        {/* Ubicación */}
        <p className={styles.ubicacion}>{glamping.ubicacion}</p>

        {/* Características en línea */}
        <div className={styles.caracteristicas}>
          {/* Capacidad */}
          <span className={styles.chipInline}>
            {/* <svg viewBox="0 0 24 24" className={styles.chipIcono} aria-hidden="true"> */}
            <svg
              viewBox="0 0 470 470"
              className={styles.chipIcono}
              aria-hidden="true"
            >
              <path
                d="m 148,79.935 c -0.825,0.45 -4.2,1.641 -7.5,2.647 -12.273,3.743 -20.68,9.857 -30.95,22.506 -4.162,5.126 -9.655,18.087 -11.712,27.635 -3.67,17.036 -2.394,39.077 3.403,58.777 1.133,3.85 2.442,7.428 2.909,7.95 0.468,0.523 0.85,1.523 0.85,2.223 0,2.498 5.488,13.003 12.449,23.827 3.891,6.05 7.632,12.259 8.313,13.797 1.779,4.019 1.487,11.56 -0.628,16.203 -3.245,7.126 -8.541,10.851 -28.134,19.791 -38.557,17.592 -47.709,22.949 -58.536,34.269 -7.756,8.108 -12.649,16.319 -15.704,26.353 -3.666,12.039 -6.161,35.225 -5.421,50.385 0.448,9.172 0.908,11.447 3.056,15.113 4.667,7.963 13.672,13.997 24.846,16.647 2.892,0.686 8.634,2.142 12.759,3.236 4.125,1.093 10.425,2.363 14,2.821 3.575,0.458 9.65,1.295 13.5,1.861 12.936,1.9 39.834,3.923 61.5,4.624 24.991,0.81 65.011,-1.24 91.5,-4.687 3.85,-0.501 10.825,-1.327 15.5,-1.836 8.119,-0.884 10.422,-1.288 23,-4.039 13.855,-3.029 23.26,-7.33 30.174,-13.798 7.916,-7.404 8.326,-8.892 8.326,-30.24 0,-18.123 -0.438,-21.938 -4.187,-36.5 -2.148,-8.344 -8.515,-21.108 -13.297,-26.657 -8.727,-10.128 -26.896,-21.827 -49.516,-31.883 -31.444,-13.98 -37.179,-17.55 -40.946,-25.488 -2.341,-4.933 -2.184,-12.252 0.378,-17.569 1.166,-2.422 4.609,-8.003 7.65,-12.403 9.709,-14.046 16.831,-30.366 18.548,-42.5 0.428,-3.025 1.242,-7.975 1.807,-11 3.254,-17.397 2.287,-30.31 -3.727,-49.75 -0.893,-2.888 -1.981,-5.25 -2.417,-5.25 -0.436,0 -0.793,-0.486 -0.793,-1.081 0,-1.59 -6.4,-10.955 -11.258,-16.475 -5.344,-6.07 -18.425,-14.476 -26.242,-16.862 -3.3,-1.007 -6.781,-2.225 -7.736,-2.706 -2.182,-1.1 -33.733,-1.048 -35.764,0.059 m 182.684,-0.286 c -0.357,0.358 -3.245,1.498 -6.417,2.536 -7.805,2.552 -9.786,3.544 -16.781,8.402 -28.016,19.458 -36.517,57.775 -22.832,102.913 3.365,11.099 9.177,22.55 18.238,35.932 7.381,10.899 7.402,10.951 7.402,17.639 0,7.447 -1.25149,11.81274 -3.25492,17.34295 -0.42107,1.16231 -1.34529,2.09157 -1.80922,3.23745 -0.40993,1.01252 -1.03039,2.09116 -0.84178,3.16711 0.65097,3.71363 3.31801,6.77167 6.45025,9.29125 17.43764,14.02684 32.58784,25.20366 41.97215,42.09749 5.17669,9.31917 4.74144,8.40717 10.46909,36.19 1.41122,15.23374 1.29991,15.146 0.30491,25 -2.19,21.69 -8.45537,30.30594 -22.28473,39.30631 -2.21647,1.5043 -2.92597,1.93667 -4.94827,3.26169 -1.14994,0.87582 -1.12515,1.4866 0.23795,1.68688 17.666,0.955 76.66302,1.10187 80.41102,-0.26513 0.825,-0.3 5.1,-0.991 9.5,-1.534 14.031,-1.731 20.894,-2.744 25,-3.689 2.2,-0.506 8.275,-1.874 13.5,-3.04 11.268,-2.515 19.197,-5.485 24,-8.989 4.18,-3.049 5.2,-4.297 8.135,-9.943 2.127,-4.092 2.233,-5.37 2.107,-25.397 -0.16,-25.469 -1.87,-34.183 -9.909,-50.485 -3.761,-7.625 -17.075,-22.348 -22.889,-25.31 -1.619,-0.825 -4.496,-2.531 -6.393,-3.79 -4.42,-2.936 -31.894,-16.21 -33.549,-16.21 -0.243,0 -3.044,-1.174 -6.222,-2.608 -3.179,-1.434 -7.355,-3.317 -9.28,-4.184 -23.125,-10.417 -28.401,-24.625 -15.755,-42.434 6.491,-9.141 16.755,-28.121 16.755,-30.982 0,-0.726 0.929,-3.789 2.064,-6.806 2.915,-7.748 5.896,-26.807 5.918,-37.829 0.017,-8.752 -2.858,-26.936 -4.898,-30.972 -0.468,-0.927 -1.408,-3.035 -2.089,-4.685 -7.056,-17.09 -20.733,-29.55 -40.022,-36.456 -8.14,-2.915 -9.124,-3.034 -25.056,-3.039 -9.121,-0.003 -16.876,0.287 -17.233,0.644"
                stroke="none"
                fill-rule="evenodd"
                id="path1"
              />
            </svg>
            {glamping.capacidadMaxima} personas
          </span>

          <span className={styles.separadorLinea}>|</span>

          {/* Pet-friendly */}
          <span className={`${styles.chipInline} ${glamping.petFriendly ? styles.chipActivo : styles.chipInactivo}`}>
            <svg viewBox="0 0 512 512" className={styles.chipIcono} aria-hidden="true">
              <path
                d="M490.39,182.75c-5.55-13.19-14.77-22.7-26.67-27.49l-.16-.06a46.46,46.46,0,0,0-17-3.2h-.64c-27.24.41-55.05,23.56-69.19,57.61-10.37,24.9-11.56,51.68-3.18,71.64,5.54,13.2,14.78,22.71,26.73,27.5l.13.05a46.53,46.53,0,0,0,17,3.2c27.5,0,55.6-23.15,70-57.65C497.65,229.48,498.78,202.72,490.39,182.75Z"
              />
              <path
                d="M381.55,329.61c-15.71-9.44-30.56-18.37-40.26-34.41C314.53,250.8,298.37,224,256,224s-58.57,26.8-85.39,71.2c-9.72,16.06-24.6,25-40.36,34.48-18.07,10.86-36.74,22.08-44.8,44.16a66.93,66.93,0,0,0-4.65,25c0,35.95,28,65.2,62.4,65.2,17.75,0,36.64-6.15,56.63-12.66,19.22-6.26,39.09-12.73,56.27-12.73s37,6.47,56.15,12.73C332.2,457.85,351,464,368.8,464c34.35,0,62.3-29.25,62.3-65.2a67,67,0,0,0-4.75-25C418.29,351.7,399.61,340.47,381.55,329.61Z"
              />
              <path
                d="M150,188.85c11.9,14.93,27,23.15,42.52,23.15a42.88,42.88,0,0,0,6.33-.47c32.37-4.76,52.54-44.26,45.92-90C242,102.3,234.6,84.39,224,71.11,212.12,56.21,197,48,181.49,48a42.88,42.88,0,0,0-6.33.47c-32.37,4.76-52.54,44.26-45.92,90C132,157.67,139.4,175.56,150,188.85Z"
              />
              <path
                d="M313.16,211.53a42.88,42.88,0,0,0,6.33.47c15.53,0,30.62-8.22,42.52-23.15,10.59-13.29,17.95-31.18,20.75-50.4h0c6.62-45.72-13.55-85.22-45.92-90a42.88,42.88,0,0,0-6.33-.47C315,48,299.88,56.21,288,71.11c-10.6,13.28-18,31.19-20.76,50.44C260.62,167.27,280.79,206.77,313.16,211.53Z"
              />
              <path
                d="M111.59,308.8l.14-.05c11.93-4.79,21.16-14.29,26.69-27.48,8.38-20,7.2-46.75-3.15-71.65C120.94,175.16,92.85,152,65.38,152a46.4,46.4,0,0,0-17,3.2l-.14.05C36.34,160,27.11,169.54,21.58,182.73c-8.38,20-7.2,46.75,3.15,71.65C39.06,288.84,67.15,312,94.62,312A46.4,46.4,0,0,0,111.59,308.8Z"
              />
            </svg>
            {/* tilde de check si acepta, X si no */}
            {glamping.petFriendly ? "✔" : "✖"}
          </span>
        </div>

        {/* Precio fin de semana */}
        <p className={styles.precioLinea}>
          <span className={styles.precioValor}>{formatCOP(glamping.precioFinSemana)}</span>
          <span className={styles.precioLabel}>/ noche</span>
        </p>

        {/* Precio días de semana */}
        <p className={styles.precioLineaSecundaria}>
          <span className={styles.precioValorSecundario}>{formatCOP(glamping.precioDiaSemana)}</span>
          <span className={styles.precioLabel}>/ noche de domingo a jueves</span>
        </p>

      </div>
    </article>
  );
}

// --- Componente principal ---
export default function ListadoGlampingsV2() {
  return (
    <section className={styles.seccion}>
      <div className={styles.contenedor}>
        <div className={styles.encabezado}>
          <h2 className={styles.titulo}>Reserva fácil y seguro. Nuestros alojamientos son 100% verificados por nuestro equipo</h2>
          <p className={styles.subtitulo}>Vive el comfort de un glamping con jacuzzi privado, piscina y desayuno incluido. ¡Desde 300 mil pesos por pareja!</p>
        </div>
        <div className={styles.grilla}>
          {glampingsDePrueba.map((g) => (
            <TarjetaGlampingV2 key={g.id} glamping={g} />
          ))}
        </div>
      </div>
    </section>
  );
}
