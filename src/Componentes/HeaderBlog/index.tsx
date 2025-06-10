'use client';

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import "./estilos.css";

export default function HeaderBlog({ descripcion }: { descripcion: string }) {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Cierra el menú si se hace clic fuera
  useEffect(() => {
    function manejarClickFuera(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuAbierto(false);
      }
    }

    if (menuAbierto) {
      document.addEventListener("mousedown", manejarClickFuera);
    } else {
      document.removeEventListener("mousedown", manejarClickFuera);
    }

    return () => {
      document.removeEventListener("mousedown", manejarClickFuera);
    };
  }, [menuAbierto]);

  return (
    <header className="HeaderBlog-contenedor" ref={menuRef}>
      <div className="HeaderBlog-Header">
        <div className="HeaderBlog-izquierda">
          <Link href="/" className="HeaderBlog-logoLink">
            <Image
              src="/Imagenes/animal5.jpeg"
              alt="Logo"
              width={40}
              height={40}
              className="HeaderBlog-logo"
            />
          </Link>
          {descripcion && (
            <span className="HeaderBlog-descripcion">{descripcion}</span>
          )}
        </div>

        <div className="HeaderBlog-derecha">
          <Link href="/" className="HeaderBlog-btn HeaderBlog-btn-primario">
            Descubre tu glamping
          </Link>
          <Link
            href="/CrearGlamping"
            className="HeaderBlog-btn HeaderBlog-btn-secundario"
          >
            Publica tu glamping
          </Link>
        </div>

        {/* Botón hamburguesa */}
        <button
          className="HeaderBlog-hamburguesa"
          onClick={() => setMenuAbierto(!menuAbierto)}
        >
          ☰
        </button>
      </div>

      {/* Menú móvil desplegable */}
      {menuAbierto && (
        <div className="HeaderBlog-menuMovil">
          <Link href="/" className="HeaderBlog-menuLink">
            Descubre tu glamping
          </Link>
          <Link href="/CrearGlamping" className="HeaderBlog-menuLink">
            Publica tu glamping
          </Link>
        </div>
      )}
    </header>
  );
}
