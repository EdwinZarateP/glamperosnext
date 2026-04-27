"use client";

import { useState } from "react";
import styles from "./ListadoGlampingsV2.module.css";
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
  imagenes: string[];   // <-- ahora es un array
  favorito: boolean;
}

// --- Helper de formato ---
function formatCOP(valor: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(valor);
}

// --- Sub-componente: Carrusel de imágenes ---
function CarruselImagenes({ imagenes, nombre }: { imagenes: string[]; nombre: string }) {
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
      {/* Imagen activa */}
      <img
        src={imagenes[indice]}
        alt={`${nombre} — foto ${indice + 1}`}
        className={styles.imagen}
        key={indice} // fuerza re-render para fade
      />

      {/* Flechas — solo visibles al hacer hover y si hay más de 1 imagen */}
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

          {/* Indicadores de punto */}
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
    </div>
  );
}

// --- Sub-componente: Tarjeta individual ---
function TarjetaGlamping({ glamping }: { glamping: Glamping }) {
  const [esFavorito, setEsFavorito] = useState(glamping.favorito);

  return (
    <article className={styles.tarjeta}>

      {/* ── 1. Carrusel de imágenes ── */}
      <div className={styles.imagenContenedor}>
        <CarruselImagenes imagenes={glamping.imagenes} nombre={glamping.nombre} />

        {/* ── 2. Botón Favorito ── */}
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

        {/* ── 10. Puntuación badge ── */}
        <div className={styles.badgePuntuacion}>
          <span className={styles.starIcon}>★</span>
          <span className={styles.puntuacionValor}>{glamping.calificacion.toFixed(1)}</span>
          <span className={styles.puntuacionResenas}>({glamping.totalResenas})</span>
        </div>
      </div>

      {/* ── Cuerpo de la tarjeta ── */}
      <div className={styles.contenido}>

        {/* ── 3. Nombre ── */}
        <h3 className={styles.nombre}>{glamping.nombre}</h3>

        {/* ── 4. Ubicación ── */}
        <p className={styles.ubicacion}>
          <svg viewBox="0 0 24 24" className={styles.iconoPin} aria-hidden="true">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75
                     7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38
                     0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5
                     2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
          {glamping.ubicacion}
        </p>

        {/* ── 5 · 6 · 9 — Chips ── */}
        <div className={styles.caracteristicas}>

          <div className={styles.chip}>
            <svg viewBox="0 0 24 24" className={styles.chipIcono} aria-hidden="true">
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16
                       5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8
                       0c1.66 0 2.99-1.34 2.99-3S9.66 5 8
                       5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0
                       2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8
                       0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97
                       1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
            </svg>
            <span>Máx. {glamping.capacidadMaxima} {glamping.capacidadMaxima === 1 ? "persona" : "personas"}</span>
          </div>

          <div className={`${styles.chip} ${glamping.petFriendly ? styles.chipActivo : styles.chipInactivo}`}>
            <svg viewBox="0 0 24 24" className={styles.chipIcono} aria-hidden="true">
              <path d="M4.5 11c.83 0 1.5-.67 1.5-1.5v-3C6 5.67 5.33 5
                       4.5 5S3 5.67 3 6.5v3C3 10.33 3.67 11 4.5
                       11zm6-1c.83 0 1.5-.67 1.5-1.5v-5C12 2.67 11.33
                       2 10.5 2S9 2.67 9 3.5v5C9 9.33 9.67 10 10.5
                       10zm5 0c.83 0 1.5-.67 1.5-1.5v-5C17 2.67 16.33
                       2 15.5 2S14 2.67 14 3.5v5c0 .83.67 1.5 1.5
                       1.5zm4.5 1c.83 0 1.5-.67 1.5-1.5v-3C21 5.67
                       20.33 5 19.5 5S18 5.67 18 6.5v3c0 .83.67 1.5
                       1.5 1.5zM12 12c-2.5 0-7.5 1.67-7.5 5v2h15v-2c0-3.33-5-5-7.5-5z"/>
            </svg>
            <span>{glamping.petFriendly ? "Pet-friendly" : "Sin mascotas"}</span>
          </div>

          <div className={`${styles.chip} ${glamping.desayunoIncluido ? styles.chipActivo : styles.chipInactivo}`}>
            <svg viewBox="0 0 24 24" className={styles.chipIcono} aria-hidden="true">
              <path d="M18.5 3H6c-1.1 0-2 .9-2 2v5.71c0 3.83 2.95
                       7.18 6.78 7.29 3.96.12 7.22-3.06 7.22-7V5c0-.55-.45-1-1-1zm-5
                       7v3h-3v-3H8l3.5-4 3.5 4h-1.5zM4 19h16v2H4z"/>
            </svg>
            <span>{glamping.desayunoIncluido ? "Desayuno incluido" : "Sin desayuno"}</span>
          </div>
        </div>

        {/* ── 7 & 8. Precios ── */}
        <div className={styles.precios}>
          <div className={styles.precioItem}>
            <span className={styles.precioLabel}>Fin de semana</span>
            <div className={styles.precioFila}>
              <span className={styles.precioValor}>{formatCOP(glamping.precioFinSemana)}</span>
              <span className={styles.precioNoche}>/ noche</span>
            </div>
          </div>
          <div className={styles.separadorPrecio} />
          <div className={styles.precioItem}>
            <span className={styles.precioLabel}>Días de semana</span>
            <div className={styles.precioFila}>
              <span className={`${styles.precioValor} ${styles.precioSemana}`}>{formatCOP(glamping.precioDiaSemana)}</span>
              <span className={styles.precioNoche}>/ noche</span>
            </div>
          </div>
        </div>

        {/* ── CTA ── */}
        <button className={styles.btnReservar}>Reservar ahora</button>
      </div>
    </article>
  );
}

// --- Componente principal ---
export default function ListadoGlampings() {
  return (
    <section className={`${styles.seccion} ${styles.wrapper}`}>
      <div className={styles.contenedor}>
        <div className={styles.encabezado}>
          <h2 className={styles.titulo}>Reserva fácil y seguro. Nuestros alojamientos son 100% verificados por nuestro equipo</h2>
          <p className={styles.subtitulo}>Vive el comfort de un glamping con jacuzzi privado, piscina y desayuno incluido. ¡Desde 300 mil pesos por pareja!</p>
          <span className={`chip chip-secundario`}>Nuevo</span>
          <span className={`chip chip-secundario ${styles.chipPrueba}`}>Nuevo 2</span>
        </div>



        <div className={styles.cuadricula}>
          {glampingsDePrueba.map((g) => (
            <TarjetaGlamping key={g.id} glamping={g} />
          ))}
        </div>
      </div>
    </section>
  );
}
