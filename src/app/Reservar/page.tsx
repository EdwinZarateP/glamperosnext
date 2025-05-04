"use client";

import { Suspense, useEffect, useState } from 'react';
import dynamic from "next/dynamic";
import animationData from "../../Componentes/Animaciones/AnimationPuntos.json";
import Reservacion from '../../Componentes/Reservacion/index';
import HeaderIcono from '../../Componentes/HeaderIcono/index';
import './estilos.css';

interface MyLottieProps {
  animationData: unknown;
  loop?: boolean;
  autoplay?: boolean;
  style?: React.CSSProperties;
}

// Import dinámico de lottie-react
const Lottie = dynamic<MyLottieProps>(
  () => import("lottie-react").then(mod => mod.default as React.ComponentType<MyLottieProps>),
  { ssr: false }
);

function Reservar() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
    }
  }, []);

  const handleReservacionLoaded = () => {
    setIsLoading(false);
  };

  return (
    <div className="Reservar-contenedor">
      <HeaderIcono descripcion="Glamperos" />

      {isLoading && (
        <div className="lottie-container">
          <Lottie
            animationData={animationData}
            loop
            autoplay
            style={{ height: 200, width: "100%", margin: "auto" }}
          />
        </div>
      )}

      <Suspense fallback={<div>Cargando reservación…</div>}>
        <Reservacion onLoaded={handleReservacionLoaded} />
      </Suspense>
    </div>
  );
}

export default Reservar;
