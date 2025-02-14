"use client"; // Indica que es un Client Component para que pueda usar hooks del cliente

import React from "react";
import { useRouter } from "next/navigation";
import "./estilos.css";

interface HeaderIconoProps {
  descripcion: string;
}

export default function HeaderIcono({ descripcion }: HeaderIconoProps) {
  const router = useRouter();

  const irAInicio = () => {
    // Navega a la ruta raíz "/"
    router.push("/");
    // Evita el reload forzado a menos que realmente quieras recargar todo el sitio
    // window.location.reload();
  };

  return (
    <div className="HeaderIcono-contenedor">
      <header className="HeaderIcono-Header">
        <div className="HeaderIcono-izquierda" onClick={irAInicio}>
          <img src="/Imagenes/animal5.jpeg" alt="Logo" className="HeaderIcono-logo"/>
          <span className="HeaderIcono-nombreMarca">{descripcion}</span>
        </div>
      </header>
    </div>
  );
}
