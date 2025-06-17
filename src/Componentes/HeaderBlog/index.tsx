'use client';

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import "./estilos.css";

export default function HeaderBlog({ descripcion }: { descripcion: string }) {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

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

  // Función para validar login antes de publicar
  const handlePublicaClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const idUsuario = Cookies.get("idUsuario");
    if (idUsuario) {
      router.push("/CrearGlamping");
    } else {
      router.push("/registro");
    }
  };

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
          
          {descripcion && (
            <span className="HeaderBlog-descripcion">{descripcion}</span>
          )}
          </Link>
        </div>

        <div className="HeaderBlog-derecha">
          <Link href="/" className="HeaderBlog-btn HeaderBlog-btn-primario">
            Descubre tu glamping
          </Link>
          <button
            className="HeaderBlog-btn HeaderBlog-btn-secundario"
            onClick={handlePublicaClick}
          >
            Publica tu glamping
          </button>
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
            Inicio
          </Link>
          <button
            className="HeaderBlog-menuLink"
            onClick={handlePublicaClick}
          >
            Publica tu glamping
          </button>
        </div>
      )}
    </header>
  );
}
