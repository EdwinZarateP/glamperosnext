"use client";
import { useEffect, useState } from 'react';
import dynamic from "next/dynamic";
import animationData from "../../Componentes/Animaciones/AnimationPuntos.json";
import Reservacion from '@/Componentes/Reservacion/index';
import HeaderIcono from '@/Componentes/HeaderIcono/index';
import './estilos.css';


interface MyLottieProps {
  animationData: unknown;
  loop?: boolean;
  autoplay?: boolean;
  style?: React.CSSProperties;
}

// Transformamos la importación de `lottie-react` a un componente que acepte MyLottieProps
const Lottie = dynamic<MyLottieProps>(
  () =>
    import("lottie-react").then((mod) => {
      // forzamos el default a un componente tipado
      return mod.default as React.ComponentType<MyLottieProps>;
    }),
  {
    ssr: false,
  }
);

function Reservar() {
  // Estado para mostrar/ocultar la animación de carga
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
    }
  }, []);

  // Función que se ejecuta cuando Reservacion avisa que terminó de cargar
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
            loop={true}
            autoplay={true}
            style={{ height: 200, width: "100%", margin: "auto" }}
          />
        </div>
      )}

      {/* Pasamos la función de notificación como prop al componente Reservacion */}
      <Reservacion onLoaded={handleReservacionLoaded} />
    </div>
  );
}

export default Reservar;
