"use client";

import { useContext } from "react";
import Head from "next/head";
import Header from "@/Componentes/Header";
import ContenedorTarjetas from "@/Componentes/ContenedorTarjetas/index";
import MenuIconos from "@/Componentes/MenuIconos";
import FiltrosContenedor from "@/Componentes/FiltrosContenedor/index";
import { ContextoApp } from "@/context/AppContext";
import MenuUsuariosInferior from "@/Componentes/MenuUsuariosInferior";
import "./page.css";

const Home: React.FC = () => {
  const contexto = useContext(ContextoApp);

  if (!contexto) {
    throw new Error(
      "El contexto no está disponible. Asegúrate de envolver el componente con ProveedorContextoApp."
    );
  }

  const { mostrarFiltros } = contexto;

  return (
    <>
      {/* 🔹 HEAD SEO */}
      <Head>
        <title>Glamping en Colombia | Encuentra tu experiencia única</title>
        <meta
          name="description"
          content="Descubre los mejores glampings en Colombia. Explora destinos únicos y vive una experiencia en la naturaleza con todas las comodidades."
        />
        <meta
          name="keywords"
          content="glamping Colombia, camping de lujo, turismo ecológico, alojamiento en la naturaleza"
        />
        <meta
          property="og:title"
          content="Glamping en Colombia | Encuentra tu experiencia única"
        />
        <meta
          property="og:description"
          content="Descubre los mejores glampings en Colombia. Explora destinos únicos y vive una experiencia en la naturaleza con todas las comodidades."
        />
        <meta property="og:url" content="https://glamperos.com/" />
        <meta
          property="og:image"
          content="https://storage.googleapis.com/glamperos-imagenes/Imagenes/animal5.jpeg"
        />
        <meta property="og:type" content="website" />
        <meta
          name="twitter:title"
          content="Glamping en Colombia | Encuentra tu experiencia única"
        />
        <meta
          name="twitter:description"
          content="Descubre los mejores glampings en Colombia. Explora destinos únicos y vive una experiencia en la naturaleza con todas las comodidades."
        />
        <meta
          name="twitter:image"
          content="https://storage.googleapis.com/glamperos-imagenes/Imagenes/animal5.jpeg"
        />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://glamperos.com/" />
      </Head>

      <div className="Home-principal">
        <Header />
        <MenuIconos />

        {mostrarFiltros && <FiltrosContenedor />}

        <main>
          <section>
            <h1 className="Home-titulo-principal">
              Descubre los Mejores Glampings en Colombia
            </h1>
            <p className="Home-descripcion">
              Explora la naturaleza con comodidad y estilo. Encuentra el
              glamping perfecto en cualquier rincón de Colombia.
            </p>
          </section>

          <ContenedorTarjetas />
        </main>

        <MenuUsuariosInferior />
      </div>
    </>
  );
};

export default Home;
