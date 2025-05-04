"use client";

import { useContext } from "react";
import Head from "next/head";
import HeaderDinamico from "../../Componentes/HeaderDinamico";
import ContenedorTarjetasDinamico from "../../Componentes/ContenedorTarjetasDinamico/index";
import MenuIconos from "../../Componentes/MenuIconos";
import FiltrosContenedor from "../../Componentes/FiltrosContenedor/index";
import { ContextoApp } from "../../context/AppContext";
import MenuUsuariosInferior from "../../Componentes/MenuUsuariosInferior";
import "./estilos.css";

const cali: React.FC = () => {
  const contexto = useContext(ContextoApp);

  if (!contexto) {
    throw new Error(
      "El contexto no está disponible. Asegúrate de envolver el componente con ProveedorContextoApp."
    );
  }

  // Coordenadas de Cali
  const CALI_LAT = 3.399043723;
  const CALI_LNG = -76.576492589;

  const { mostrarFiltros } = contexto;

  return (
    <>
      {/* 🔹 HEAD SEO */}
      <Head>
        <title>Glamping cerca a Cali | Vive la experiencia</title>
        <meta
          name="description"
          content="Encuentra los mejores glampings cerca de Cali. Disfruta la naturaleza con todas las comodidades. Reserva ahora."
        />
        <meta
          name="keywords"
          content="glamping Cali, camping de lujo, turismo ecológico, alojamiento en la naturaleza"
        />
        <meta
          property="og:title"
          content="Glamping cerca a Cali | Vive la experiencia"
        />
        <meta
          property="og:description"
          content="Encuentra los mejores glampings cerca de Cali. Disfruta la naturaleza con todas las comodidades. Reserva ahora."
        />
        <meta property="og:url" content="https://glamperos.com/cali" />
        <meta
          property="og:image"
          content="https://storage.googleapis.com/glamperos-imagenes/Imagenes/animal5.jpeg"
        />
        <meta property="og:type" content="website" />
        <meta
          name="twitter:title"
          content="Glamping cerca a Cali | Vive la experiencia"
        />
        <meta
          name="twitter:description"
          content="Encuentra los mejores glampings cerca de Cali. Disfruta la naturaleza con todas las comodidades. Reserva ahora."
        />
        <meta
          name="twitter:image"
          content="https://storage.googleapis.com/glamperos-imagenes/Imagenes/animal5.jpeg"
        />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://glamperos.com/cali" />
      </Head>

      <div className="Cali-principal">
        <HeaderDinamico title="Reserva los mejores glamping cerca a Cali" />
        <MenuIconos />

        {mostrarFiltros && <FiltrosContenedor />}

        <main>
          <section>
            <h1 className="Cali-titulo-principal">
              Mejores Glampings cerca a Cali
            </h1>
            <p className="Cali-descripcion">
            🌺Brisa de azúcar, fuego del sol, Cali te envuelve en su mágico rol.
            Ríos de vida, selvas en flor, una hamaca y el canto de un ruiseñor.
            Aroma de tierra, noches de luna,  el Pacífico cerca, su voz oportuna.
            Despierta en la brisa, duerme en la calma, el Valle del Cauca te abraza el alma. 🌙
            </p>
          </section>

          <ContenedorTarjetasDinamico lat={CALI_LAT} lng={CALI_LNG} />
        </main>

        <MenuUsuariosInferior />
      </div>
    </>
  );
};

export default cali;
