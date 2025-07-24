// HeaderIcono.tsx
"use client";

import React, { useContext, useEffect, useState } from "react";
import Image from "next/image";
import { FiMenu } from "react-icons/fi";
import { BsIncognito } from "react-icons/bs";
import Cookies from "js-cookie";
import { ContextoApp } from "../../context/AppContext";
import MenuUsuario from "../MenuUsuario";
import "./estilos.css";

interface HeaderIconoProps {
  descripcion: string;
}

export default function HeaderIcono({ descripcion }: HeaderIconoProps) {
  const ctx = useContext(ContextoApp);
  if (!ctx) throw new Error("ContextoApp no disponible.");

  const { setMostrarMenuUsuarios, setIdUsuario } = ctx;

  const [nombreUsuario, setNombreUsuario] = useState<string | null>(null);
  const [idUsuarioCookie, setIdUsuarioCookie] = useState<string | null>(null);

  useEffect(() => {
    setNombreUsuario(Cookies.get("nombreUsuario") || null);
    setIdUsuarioCookie(Cookies.get("idUsuario")     || null);
  }, []);

  const irAInicio = () => {
    window.location.href = "/";
  };

  const toggleMenu = () => {
    if (idUsuarioCookie) {
      setIdUsuario(idUsuarioCookie);
    }
    setMostrarMenuUsuarios(prev => !prev);
  };

  return (
    <>
      <div className="HeaderIcono-contenedor">
        <header className="HeaderIcono-Header">
          {/* Logo + descripción */}
          <div className="HeaderIcono-izquierda" onClick={irAInicio}>
            <Image
              src="/Imagenes/animal5.jpeg"
              alt="Logo"
              width={100}
              height={50}
              priority
              className="HeaderIcono-logo"
            />
            <span className="HeaderIcono-nombreMarca">{descripcion}</span>
          </div>

          {/* Botón de menú */}
          <button
            className="HeaderIcono-menuBtn"
            onClick={toggleMenu}
            aria-label="Abrir menú de usuario"
          >
            <FiMenu size={24} />
            <span className="HeaderIcono-userInitial">
              {nombreUsuario
                ? nombreUsuario.charAt(0).toUpperCase()
                : <BsIncognito />}
            </span>
          </button>
        </header>
      </div>

      {/* Renderizado del menú de usuario */}
      <MenuUsuario />
    </>
  );
}
