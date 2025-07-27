'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { FiMenu, FiX } from 'react-icons/fi';
import './estilos.css';

export default function HeaderBlog() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Cerrar menú al clicar fuera
  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const handlePublica = (e: React.MouseEvent) => {
    e.preventDefault();
    const idUsuario = Cookies.get('idUsuario');
    router.push(idUsuario ? '/CrearGlamping' : '/registro');
    setMenuOpen(false);
  };

  return (
    <header className="header-container" ref={menuRef}>
      <div className="header-inner">
        <Link href="/blog" className="logo-link">
          <Image
            src="/Imagenes/animal5.jpeg"
            alt="Logo Glamperos"
            width={32}
            height={32}
          />
          <span className="logo-text">Blog Glamperos</span>
        </Link>

        {/* Nav de escritorio */}
        <nav className="nav-links">
          <Link href="/">Inicio</Link>
          <Link href="/blog">Blog</Link>
          <button className="btn-publish" onClick={handlePublica}>
            Publica tu glamping
          </button>
        </nav>

        {/* Botón hamburguesa móvil */}
        <button
          className="hamburger"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Menu"
        >
          {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* Menú móvil desplegable */}
      {menuOpen && (
        <div className="mobile-menu">
          <Link href="/">Inicio</Link>
          <Link href="/blog">Blog</Link>
          <button className="btn-publish" onClick={handlePublica}>
            Publica tu glamping
          </button>
        </div>
      )}
    </header>
  );
}
