// HeaderFinal.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import "./estilos.css";

import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { DateRangePicker } from "react-date-range";
import { addDays, addMonths, format, isSameDay } from "date-fns";
import { es } from "date-fns/locale";

import municipiosData from "../Municipios/municipios.json";

interface Municipio {
  CIUDAD_DEPARTAMENTO: string;
  CIUDAD: string;
  DEPARTAMENTO: string;
}

type Operacion = "sumar" | "restar";

interface CounterRowProps {
  label: string;
  sublabel: string;
  value: number;
  onChange: (op: Operacion) => void;
  max: number;
}

export default function HeaderFinal() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<"donde" | "fechas" | "quien" | null>(null);

  const [destino, setDestino] = useState("");
  const [municipiosFiltrados, setMunicipiosFiltrados] = useState<Municipio[]>(
    municipiosData as Municipio[]
  );

  const [monthsToShow, setMonthsToShow] = useState(2);
  const [hasSelection, setHasSelection] = useState(false);

  const [stateDates, setStateDates] = useState([
    {
      startDate: new Date(),
      endDate: addDays(new Date(), 1),
      key: "selection",
    },
  ]);

  const [viajeros, setViajeros] = useState({ adultos: 0, ninos: 0, bebes: 0, mascotas: 0 });

  // refs para click-outside
  const rootRef = useRef<HTMLElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // carrusel mobile
  const carouselRef = useRef<HTMLUListElement | null>(null);

  const nextMonths = useMemo(() => Array.from({ length: 6 }, (_, i) => addMonths(new Date(), i)), []);

  const totalHuespedes = viajeros.adultos + viajeros.ninos + viajeros.bebes;

  const textoQuien = useMemo(() => {
    if (totalHuespedes <= 0) return "Huéspedes";
    return `${totalHuespedes} huésped${totalHuespedes === 1 ? "" : "es"}`;
  }, [totalHuespedes]);

  const toggleMenu = (menu: "donde" | "fechas" | "quien") => {
    setActiveMenu((prev) => (prev === menu ? null : menu));
    setMobileMenuOpen(false);
  };

  // Responsividad del calendario (cantidad de meses)
  useEffect(() => {
    const handleResize = () => setMonthsToShow(window.innerWidth < 768 ? 1 : 2);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Cerrar paneles al hacer clic por fuera (incluye calendario y dropdowns)
  useEffect(() => {
    const handler = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (!target) return;

      // si el click está dentro del header, dejamos que la lógica interna actúe
      if (rootRef.current && rootRef.current.contains(target)) {
        // si el click está dentro del dropdown, no cerramos
        if (dropdownRef.current && dropdownRef.current.contains(target)) return;

        // si el click fue dentro de los items que abren dropdown, tampoco cerramos aquí
        return;
      }

      // click fuera del componente completo
      setActiveMenu(null);
      setMobileMenuOpen(false);
    };

    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, []);

  // Input destino
  const handleDestinoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const busqueda = e.target.value;
    setDestino(busqueda);

    const filtrados = (municipiosData as Municipio[]).filter((m) =>
      m.CIUDAD_DEPARTAMENTO.toLowerCase().includes(busqueda.toLowerCase())
    );
    setMunicipiosFiltrados(filtrados);
  };

  const seleccionarDestino = (nombre: string) => {
    setDestino(nombre);
    setActiveMenu("fechas");
  };

  const handleSelectDate = (ranges: any) => {
    const newSelection = ranges.selection;
    const currentSelection = stateDates[0];

    const clickedSameStart = isSameDay(newSelection.startDate, currentSelection.startDate);
    const clickedSameEnd = isSameDay(newSelection.endDate, currentSelection.endDate);

    if (hasSelection && clickedSameStart && clickedSameEnd) {
      setHasSelection(false);
      setStateDates([{ startDate: new Date(), endDate: addDays(new Date(), 1), key: "selection" }]);
    } else {
      setHasSelection(true);
      setStateDates([newSelection]);
    }
  };

  const actualizarViajeros = (
    tipo: "adultos" | "ninos" | "bebes" | "mascotas",
    operacion: Operacion
  ) => {
    setViajeros((prev) => {
      const actual = prev[tipo];
      let nuevo = operacion === "sumar" ? actual + 1 : actual - 1;
      if (nuevo < 0) nuevo = 0;
      if (tipo === "mascotas" && nuevo > 5) return prev;
      if (tipo !== "mascotas" && nuevo > 10) return prev;
      return { ...prev, [tipo]: nuevo };
    });
  };

  const handleSearch = () => {
    // aquí disparas navegación / query / lo que necesites
    console.log("Buscar...", { destino, stateDates, viajeros });
    setActiveMenu(null);
  };

  const scrollCarousel = (direction: "left" | "right") => {
    if (!carouselRef.current) return;
    const scrollAmount = 240;
    carouselRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

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
  ];

  return (
    <header className="headerFinal-container" ref={rootRef as any}>
      <nav className="headerFinal-topNav">
        <div className="headerFinal-topNavContent">
          <button
            className="headerFinal-mobileMenuBtn"
            onClick={() => setMobileMenuOpen((v) => !v)}
            type="button"
            aria-label="Abrir menú"
          >
            {mobileMenuOpen ? (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            ) : (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            )}
          </button>

          <div className="headerFinal-logo">
            <Image
              src="https://storage.googleapis.com/glamperos-imagenes/Imagenes/animal5.jpeg"
              alt="Logo"
              width={50}
              height={50}
              className="headerFinal-logoImage"
            />
            <span className="headerFinal-logoText">GLAMPEROS</span>
          </div>

          <ul className="headerFinal-navLinks">
            <li>
              <Link href="/registro" className="headerFinal-navLink">
                Publica tu glamping
              </Link>
            </li>
            <li>
              <Link href="/blog" className="headerFinal-navLink">
                Blog
              </Link>
            </li>
            <li>
              <Link href="/registro">
                <button className="headerFinal-loginBtn" type="button">
                  Iniciar sesión
                </button>
              </Link>
            </li>
          </ul>

          <Link href="/registro" className="headerFinal-mobileUser">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
            </svg>
            <span className="headerFinal-mobileUserText">Iniciar sesión</span>
          </Link>
        </div>

        {mobileMenuOpen && (
          <div className="headerFinal-mobileMenu">
            <Link href="/registro" className="headerFinal-mobileMenuItem" onClick={() => setMobileMenuOpen(false)}>
              Publica tu glamping
            </Link>
            <Link href="/blog" className="headerFinal-mobileMenuItem" onClick={() => setMobileMenuOpen(false)}>
              Blog
            </Link>
          </div>
        )}
      </nav>

      <section className="headerFinal-hero">
        <div className="headerFinal-heroImageWrapper">
          <Image
            src="https://storage.googleapis.com/glamperos-imagenes/glampings/0f5326c3fa4a404bb1b4c37b9531d8d9.webp"
            alt="Hero"
            fill
            className="headerFinal-heroImage"
            priority
          />
          <div className="headerFinal-heroOverlay" />
        </div>

        <div className="headerFinal-heroContent">
          <h1 className="headerFinal-heroTitle">DESCUBRE GLAMPINGS Y ALOJAMIENTOS RURALES PARA RESERVAR EN COLOMBIA</h1>

          <div className="headerFinal-searchBarContainer">
            <div className="headerFinal-searchBar">
              {/* 1. DÓNDE */}
              <div
                className={`headerFinal-searchItem ${activeMenu === "donde" ? "headerFinal-searchItemActive" : ""}`}
                onClick={() => toggleMenu("donde")}
              >
                <div className="headerFinal-searchItemContent">
                  <div className="headerFinal-inputIcon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                  </div>
                  <div className="headerFinal-searchTextGroup">
                    <label className="headerFinal-searchLabel">Dónde</label>
                    <input
                      type="text"
                      placeholder="¿A dónde vas?"
                      className="headerFinal-searchInputText"
                      value={destino}
                      onChange={handleDestinoChange}
                      onFocus={() => setActiveMenu("donde")}
                    />
                  </div>
                </div>

                {activeMenu === "donde" && (
                  <div className="headerFinal-dropdownPanel headerFinal-locationDropdown" ref={dropdownRef}>
                    <ul className="headerFinal-locationList">
                      {municipiosFiltrados.slice(0, 6).map((item, index) => (
                        <li
                          key={index}
                          className="headerFinal-locationItem"
                          onClick={(e) => {
                            e.stopPropagation();
                            seleccionarDestino(item.CIUDAD_DEPARTAMENTO);
                          }}
                        >
                          <div className="headerFinal-iconBox">📍</div>
                          <div>
                            <div className="headerFinal-locationTitle">{item.CIUDAD}</div>
                            <div className="headerFinal-locationSub">{item.DEPARTAMENTO}</div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="headerFinal-divider"></div>

              {/* 2. FECHAS */}
              <div
                className={`headerFinal-searchItem ${activeMenu === "fechas" ? "headerFinal-searchItemActive" : ""}`}
                onClick={() => toggleMenu("fechas")}
              >
                <div className="headerFinal-searchItemContent">
                  <div className="headerFinal-inputIcon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                  </div>
                  <div className="headerFinal-searchTextGroup">
                    <label className="headerFinal-searchLabel">Fechas</label>
                    <div className="headerFinal-searchInputText">
                      {hasSelection
                        ? `${format(stateDates[0].startDate, "dd MMM", { locale: es })} - ${format(stateDates[0].endDate, "dd MMM", { locale: es })}`
                        : "Selecciona fechas"}
                    </div>
                  </div>
                </div>

                {activeMenu === "fechas" && (
                  <div
                    className="headerFinal-dropdownPanel headerFinal-calendarDropdown"
                    ref={dropdownRef}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DateRangePicker
                      onChange={handleSelectDate}
                      showSelectionPreview
                      moveRangeOnFirstSelection={false}
                      months={monthsToShow}
                      ranges={stateDates}
                      direction="horizontal"
                      locale={es}
                      minDate={new Date()}
                      staticRanges={[]}
                      inputRanges={[]}
                      showDateDisplay={false}
                      rangeColors={["#335429"]}
                    />
                  </div>
                )}
              </div>

              <div className="headerFinal-divider"></div>

              {/* 3. QUIÉN */}
              <div
                className={`headerFinal-searchItem ${activeMenu === "quien" ? "headerFinal-searchItemActive" : ""}`}
                onClick={() => toggleMenu("quien")}
              >
                <div className="headerFinal-searchItemRow">
                  <div className="headerFinal-searchItemContent headerFinal-searchItemFull">
                    <div className="headerFinal-inputIcon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                      </svg>
                    </div>
                    <div className="headerFinal-searchTextGroup">
                      <label className="headerFinal-searchLabel">Quién</label>
                      <div className="headerFinal-searchInputText">{textoQuien}</div>
                    </div>
                  </div>

                  <div className="headerFinal-searchBtnContainer headerFinal-desktopOnlyBtn">
                    <button
                      className="headerFinal-searchBtn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSearch();
                      }}
                      type="button"
                      aria-label="Buscar"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="headerFinal-searchBtnIcon">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.35-4.35" />
                      </svg>
                    </button>
                  </div>
                </div>

                {activeMenu === "quien" && (
                  <div className="headerFinal-dropdownPanel headerFinal-countersDropdown headerFinal-rightAligned" ref={dropdownRef}>
                    <CounterRow
                      label="Adultos"
                      sublabel="13 años o más"
                      value={viajeros.adultos}
                      onChange={(op) => actualizarViajeros("adultos", op)}
                      max={10}
                    />
                    <CounterRow
                      label="Niños"
                      sublabel="2 – 12 años"
                      value={viajeros.ninos}
                      onChange={(op) => actualizarViajeros("ninos", op)}
                      max={10}
                    />
                    <CounterRow
                      label="Bebés"
                      sublabel="Menos de 2 años"
                      value={viajeros.bebes}
                      onChange={(op) => actualizarViajeros("bebes", op)}
                      max={10}
                    />
                    <CounterRow
                      label="Mascotas"
                      sublabel="¿Traes mascota?"
                      value={viajeros.mascotas}
                      onChange={(op) => actualizarViajeros("mascotas", op)}
                      max={5}
                    />
                  </div>
                )}
              </div>

              <button className="headerFinal-searchBtnMobileBig" onClick={handleSearch} type="button" aria-label="Buscar">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="headerFinal-searchBtnMobileIcon">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.35-4.35" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Categorías móvil (carrusel) */}
        <nav className="headerFinal-categoriesMobile">
          <div className="headerFinal-mobileCarouselContainer">
            <button className="headerFinal-carouselArrowBtn" onClick={() => scrollCarousel("left")} type="button" aria-label="Anterior">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>

            <ul className="headerFinal-categoriesMobileList" ref={carouselRef}>
              {categories.map((category) => (
                <li key={category.name} className="headerFinal-categoryMobileItem">
                  <a href="#" className="headerFinal-categoryMobileLink">
                    <div className="headerFinal-categoryMobileIcon">
                      <Image
                        src={`https://storage.googleapis.com/glamperos-imagenes/Imagenes/${category.icon}.svg`}
                        alt={category.name}
                        width={28}
                        height={28}
                      />
                    </div>
                    <span className="headerFinal-categoryMobileName">{category.name}</span>
                  </a>
                </li>
              ))}
            </ul>

            <button className="headerFinal-carouselArrowBtn" onClick={() => scrollCarousel("right")} type="button" aria-label="Siguiente">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        </nav>
      </section>

      {/* Categorías desktop */}
      <nav className="headerFinal-categories">
        <ul className="headerFinal-categoriesList">
          {categories.map((category) => (
            <li key={category.name} className="headerFinal-categoryItem">
              <a href="#" className="headerFinal-categoryLink">
                <div className="headerFinal-categoryIcon">
                  <Image
                    src={`https://storage.googleapis.com/glamperos-imagenes/Imagenes/${category.icon}.svg`}
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
    </header>
  );
}

function CounterRow({ label, sublabel, value, onChange, max }: CounterRowProps) {
  return (
    <div className="headerFinal-counterRow">
      <div className="headerFinal-counterInfo">
        <h4 className="headerFinal-counterTitle">{label}</h4>
        <p className="headerFinal-counterSub">{sublabel}</p>
      </div>

      <div className="headerFinal-counterControls">
        <button
          className="headerFinal-ctrlBtn"
          onClick={(e) => {
            e.stopPropagation();
            onChange("restar");
          }}
          disabled={value === 0}
          type="button"
          aria-label={`Disminuir ${label}`}
        >
          -
        </button>

        <span className="headerFinal-counterValue">{value}</span>

        <button
          className="headerFinal-ctrlBtn"
          onClick={(e) => {
            e.stopPropagation();
            onChange("sumar");
          }}
          disabled={value >= max}
          type="button"
          aria-label={`Aumentar ${label}`}
        >
          +
        </button>
      </div>
    </div>
  );
}
