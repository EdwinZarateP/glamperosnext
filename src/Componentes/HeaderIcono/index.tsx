"use client"; // Indica que es un Client Component para usar hooks del cliente

import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image"; // ✅ Optimización de imagen
import "./estilos.css";

interface HeaderIconoProps {
  descripcion: string;
}

export default function HeaderIcono({ descripcion }: HeaderIconoProps) {
  const router = useRouter();

  const irAInicio = () => {
    console.log("Ir al inicio");
    router.push("/");
  };
  

  return (
    <div className="HeaderIcono-contenedor">
      <header className="HeaderIcono-Header">
        <div className="HeaderIcono-izquierda" onClick={irAInicio}>
          <Image
            src="/Imagenes/animal5.jpeg"
            alt="Logo"
            width={100} // ✅ Ajusta el tamaño según necesites
            height={50}
            priority // ✅ Carga optimizada para mejor rendimiento
            className="HeaderIcono-logo"
          />
          <span className="HeaderIcono-nombreMarca">{descripcion}</span>
        </div>
      </header>
    </div>
  );
}
