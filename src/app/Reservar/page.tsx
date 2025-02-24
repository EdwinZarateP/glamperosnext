"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from 'react';
import Lottie from 'lottie-react';
import animationData from "@/Componentes/Animaciones/AnimationPuntos.json";
import Reservacion from '@/Componentes/Reservacion/index';
import HeaderIcono from '@/Componentes/HeaderIcono/index';
import './estilos.css';

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
            style={{ width: 300, height: 300 }}
            loop
            autoplay
          />
        </div>
      )}

      {/* Pasamos la función de notificación como prop al componente Reservacion */}
      <Reservacion onLoaded={handleReservacionLoaded} />
    </div>
  );
}

export default Reservar;
