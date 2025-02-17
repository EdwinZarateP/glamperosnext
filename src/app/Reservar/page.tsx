"use client"; 
import { useEffect } from 'react';
import Reservacion from '@/Componentes/Reservacion/index'; 
import HeaderIcono from '@/Componentes/HeaderIcono/index'; 
import './estilos.css';

function Reservar() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
    }
  }, []);

  return (
    <div className='Reservar-contenedor'>
        <HeaderIcono descripcion="Glamperos" />
        <Reservacion />
    </div>
  );
}

export default Reservar;