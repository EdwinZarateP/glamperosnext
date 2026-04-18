"use client";

import { useState } from "react";
import styles from "./ListadoGlampingsV1.module.css";
import { glampingsDePrueba } from '../glampings';
import PersonasIcono from "@/Componentes/ui/iconos/PersonasIcono";
import MascotaIcono from "@/Componentes/ui/iconos/MascotaIcono";


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
function TarjetaGlamping({ glamping }: { glamping: Glamping }) {
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
            <PersonasIcono size={13} className={styles.chipIcono} />
            {glamping.capacidadMaxima} personas
          </span>

          <span className={styles.separadorLinea}>|</span>

          {/* Pet-friendly */}
          <span className={`${styles.chipInline} ${glamping.petFriendly ? styles.chipActivo : styles.chipInactivo}`}>
            <MascotaIcono size={13} className={styles.chipIcono} />
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
export default function ListadoGlampings() {
  return (
    <section className={styles.seccion}>
      <div className={styles.contenedor}>
        <div className={styles.encabezado}>
          <h2 className={styles.titulo}>Reserva fácil y seguro. Nuestros alojamientos son 100% verificados por nuestro equipo</h2>
          <p className={styles.subtitulo}>Vive el comfort de un glamping con jacuzzi privado, piscina y desayuno incluido. ¡Desde 300 mil pesos por pareja!</p>
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
