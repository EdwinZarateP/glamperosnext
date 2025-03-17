"use client";

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import "./estilos.css";

const LandingPage = () => {
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  useEffect(() => {
    // Detectar si la pantalla es mayor a 900px
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth > 900);
    };

    checkScreenSize(); // Ejecutar al inicio
    window.addEventListener("resize", checkScreenSize);

    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, []);

  const handleNavigation = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    if (isLargeScreen) {
      window.open(path, "_blank"); // Abre en nueva pestaña si la pantalla es grande
    } else {
      window.location.href = path; // Recarga la página si la pantalla es pequeña
    }
  };

  return (
    <>
      <Head>
        <title>Glamping en Colombia | Glamperos</title>
        <meta name="description" content="Explora los mejores glampings en Medellín, Cali y Bogotá. Reserva tu experiencia con Glamperos." />
        <meta name="keywords" content="glamping en Colombia, glamping en Medellín, glamping en Cali, glamping en Bogotá" />
      </Head>

      <main className="LandingPage-container">
        <h1 className="LandingPage-title">🌿 Explora los Mejores Glampings en Colombia</h1>
        <p className="LandingPage-description">
          Encuentra experiencias únicas en la naturaleza. Elige tu destino y reserva ahora.
        </p>

        <div className="LandingPage-buttons">
          <Link href="/" onClick={(e) => handleNavigation(e, "/")} className="LandingPage-btn">
            🏕️ Todo Colombia
          </Link>
          <Link href="/medellin" onClick={(e) => handleNavigation(e, "/medellin")} className="LandingPage-btn">
            🌄 Medellín
          </Link>
          <Link href="/cali" onClick={(e) => handleNavigation(e, "/cali")} className="LandingPage-btn">
            🌿 Cali
          </Link>
          <Link href="/bogota" onClick={(e) => handleNavigation(e, "/bogota")} className="LandingPage-btn">
            🏔️ Bogotá
          </Link>
        </div>

        <section className="LandingPage-gallery">
          <h2 className="LandingPage-subtitle">📸 Mira cómo es la experiencia</h2>
          <div className="LandingPage-images">
            <img src="https://storage.googleapis.com/glamperos-imagenes/Imagenes/glamping%20jacuzzi.webp" alt="Glamping en la naturaleza" className="LandingPage-image" />
            <img src="https://storage.googleapis.com/glamperos-imagenes/Imagenes/glamping%20paisaje.webp" alt="Glamping de lujo" className="LandingPage-image" />            
          </div>
        </section>
      </main>
    </>
  );
};

export default LandingPage;
