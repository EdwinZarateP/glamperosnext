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
              viewBox="0 0 512 512"
              className={styles.chipIcono}
              aria-hidden="true"
            >
              <path
                d="M140.87 70.159c-.864.472-4.403 1.72-7.862 2.775-12.867 3.924-21.681 10.334-32.448 23.595-4.363 5.374-10.122 18.963-12.279 28.973-3.847 17.86-2.51 40.968 3.568 61.62 1.188 4.037 2.56 7.788 3.05 8.336s.89 1.596.89 2.33c0 2.62 5.754 13.632 13.052 24.98 4.08 6.343 8.001 12.852 8.715 14.465 1.866 4.213 1.56 12.12-.658 16.987-3.402 7.47-8.954 11.376-29.495 20.749-40.423 18.443-50.018 24.06-61.37 35.927-8.13 8.5-13.26 17.109-16.463 27.628-3.843 12.622-6.46 36.93-5.683 52.824.47 9.615.952 12 3.204 15.844 4.892 8.348 14.333 14.674 26.048 17.453 3.032.719 9.052 2.245 13.376 3.392 4.325 1.146 10.93 2.478 14.678 2.958s10.117 1.357 14.153 1.95c13.562 1.993 41.762 4.114 64.476 4.849 26.2.849 68.157-1.3 95.928-4.914a954 954 0 0 1 16.25-1.925c8.512-.927 10.927-1.35 24.113-4.235 14.526-3.175 24.386-7.684 31.634-14.465 8.3-7.763 8.73-9.323 8.73-31.704 0-19-.46-23-4.39-38.266-2.252-8.748-8.927-22.13-13.94-27.947-9.15-10.618-28.198-22.883-51.913-33.426-32.966-14.656-38.978-18.4-42.927-26.721-2.455-5.172-2.29-12.845.396-18.42 1.222-2.539 4.832-8.39 8.02-13.003 10.179-14.725 17.646-31.835 19.446-44.556a321 321 0 0 1 1.894-11.533c3.412-18.239 2.398-31.776-3.907-52.157-.937-3.028-2.077-5.504-2.534-5.504s-.832-.51-.832-1.134c0-1.667-6.71-11.485-11.802-17.272-5.603-6.364-19.317-15.176-27.512-17.678-3.46-1.056-7.11-2.333-8.11-2.837-2.288-1.153-35.366-1.099-37.495.062m191.524-.3c-.374.376-3.402 1.57-6.727 2.659-8.183 2.675-10.26 3.715-17.594 8.809-29.371 20.4-38.284 60.57-23.936 107.893 3.527 11.636 9.62 23.641 19.12 37.67 7.738 11.427 7.76 11.481 7.76 18.493 0 7.808-1.312 12.385-3.412 18.182-.442 1.219-1.41 2.193-1.897 3.394-.43 1.062-1.08 2.193-.882 3.32.682 3.894 3.478 7.1 6.762 9.742 18.282 14.705 34.165 26.423 44.003 44.134 5.428 9.77 4.971 8.814 10.976 37.942 1.48 15.97 1.363 15.879.32 26.21-2.296 22.74-8.865 31.772-23.363 41.208-2.324 1.577-3.068 2.03-5.188 3.42-1.206.918-1.18 1.558.25 1.768 18.52 1.001 80.372 1.155 84.302-.278.864-.314 5.346-1.039 9.96-1.608 14.71-1.815 21.904-2.877 26.21-3.868 2.306-.53 8.675-1.964 14.152-3.187 11.814-2.637 20.126-5.75 25.162-9.424 4.382-3.196 5.451-4.505 8.528-10.424 2.23-4.29 2.342-5.63 2.21-26.626-.168-26.702-1.961-35.837-10.39-52.928-3.942-7.994-17.9-23.43-23.996-26.535-1.697-.865-4.713-2.653-6.702-3.973-4.634-3.078-33.438-16.995-35.173-16.995-.254 0-3.19-1.23-6.523-2.734-3.333-1.503-7.71-3.477-9.729-4.386-24.244-10.922-29.775-25.817-16.517-44.488 6.805-9.583 17.566-29.482 17.566-32.481 0-.761.974-3.973 2.163-7.136 3.057-8.123 6.182-28.104 6.205-39.66.018-9.175-2.996-28.239-5.135-32.47-.49-.972-1.476-3.182-2.19-4.912-7.398-17.917-21.737-30.98-41.959-38.22-8.534-3.056-9.566-3.18-26.269-3.186-9.562-.003-17.692.3-18.066.675"
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
