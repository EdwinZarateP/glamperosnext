"use client"

import Image from "next/image"
import { useState } from "react"
import "./estilos.css"

export default function HeaderFinal() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchData, setSearchData] = useState({
    location: "",
    date: "",
    persons: "",
  })

  const categories = [
    { name: "Bogotá", icon: "Bogota" },
    { name: "Medellín", icon: "Medellin" },
    { name: "Domos", icon: "Domo" },
    { name: "Tiendas", icon: "Tienda" },
    { name: "Cabañas", icon: "Cabañas" },
    { name: "Chalets", icon: "Chalet" },
    { name: "Tipis", icon: "Tipis" },
    { name: "Jacuzzi", icon: "Jacuzzi" },
    { name: "Piscina", icon: "Piscina" },
  ]

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Buscando:", searchData)
  }

  return (
    <header className="headerFinal-container">
      {/* Top Navigation Bar */}
      <nav className="headerFinal-topNav">
        <div className="headerFinal-topNavContent">
          <div className="headerFinal-logo">
            <Image
              src="https://storage.googleapis.com/glamperos-imagenes/Imagenes/animal5.jpeg"
              alt="Glamperos Logo"
              width={60}
              height={60}
              className="headerFinal-logoImage"
            />
            <span className="headerFinal-logoText">GLAMPEROS</span>
          </div>

          <ul className="headerFinal-navLinks">
            <li>
              <a href="/" className="headerFinal-navLink">
                Publica tu glamping
              </a>
            </li>
            <li>
              <a href="/blog" className="headerFinal-navLink">
                Blog
              </a>
            </li>
            <li>
              <button className="headerFinal-loginBtn">Iniciar sesión</button>
            </li>
          </ul>

          <button
            className="headerFinal-mobileMenuBtn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Abrir menú"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="headerFinal-mobileMenu">
          <a href="#" className="headerFinal-mobileMenuItem">
            Publica tu glamping
          </a>
          <a href="#" className="headerFinal-mobileMenuItem">
            Blog
          </a>
          <button className="headerFinal-mobileMenuItem headerFinal-mobileLoginBtn">
            Iniciar sesión
          </button>
        </div>
      )}

      {/* Hero Section */}
      <section className="headerFinal-hero">
        <div className="headerFinal-heroImageWrapper">
          <Image
            src="https://storage.googleapis.com/glamperos-imagenes/glampings/0f5326c3fa4a404bb1b4c37b9531d8d9.webp"
            alt="Glamping en Colombia"
            fill
            className="headerFinal-heroImage"
            priority
          />
          <div className="headerFinal-heroOverlay" />
        </div>

        <div className="headerFinal-heroContent">
          <h1 className="headerFinal-heroTitle">
            DESCUBRE GLAMPINGS Y ALOJAMIENTOS RURALES INCREÍBLES PARA RESERVAR
            EN COLOMBIA
          </h1>

          {/* Search Form */}
          <form className="headerFinal-searchForm" onSubmit={handleSearch}>
            <div className="headerFinal-searchGroup">
              <svg
                className="headerFinal-searchIcon"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <input
                type="text"
                placeholder="¿A dónde vas?"
                className="headerFinal-searchInput"
                value={searchData.location}
                onChange={(e) =>
                  setSearchData({ ...searchData, location: e.target.value })
                }
              />
            </div>

            <div className="headerFinal-searchGroup">
              <svg
                className="headerFinal-searchIcon"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <input
                type="text"
                placeholder="Fecha"
                className="headerFinal-searchInput"
                value={searchData.date}
                onChange={(e) =>
                  setSearchData({ ...searchData, date: e.target.value })
                }
              />
            </div>

            <div className="headerFinal-searchGroup">
              <svg
                className="headerFinal-searchIcon"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <input
                type="text"
                placeholder="Personas"
                className="headerFinal-searchInput"
                value={searchData.persons}
                onChange={(e) =>
                  setSearchData({ ...searchData, persons: e.target.value })
                }
              />
            </div>

            <button type="submit" className="headerFinal-searchBtn">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </button>
          </form>
        </div>
      </section>

      {/* Categories Menu - Desktop */}
      <nav className="headerFinal-categories">
        <ul className="headerFinal-categoriesList">
          {categories.map((category) => (
            <li key={category.name} className="headerFinal-categoryItem">
              <a href="#" className="headerFinal-categoryLink">
                <div className="headerFinal-categoryIcon">
                  <Image
                    src={`https://storage.cloud.google.com/glamperos-imagenes/Imagenes/${category.icon}.svg`}
                    alt={category.name}
                    width={32}
                    height={32}
                  />
                </div>
                <span className="headerFinal-categoryName">{category.name}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Categories Menu - Mobile Scroll */}
      <nav className="headerFinal-categoriesMobile">
        <ul className="headerFinal-categoriesMobileList">
          {categories.map((category) => (
            <li key={category.name} className="headerFinal-categoryMobileItem">
              <a href="#" className="headerFinal-categoryMobileLink">
                <div className="headerFinal-categoryMobileIcon">
                  <Image
                    src={`https://storage.cloud.google.com/glamperos-imagenes/Imagenes/${category.icon}.svg`}
                    alt={category.name}
                    width={28}
                    height={28}
                  />
                </div>
                <span className="headerFinal-categoryMobileName">
                  {category.name}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
