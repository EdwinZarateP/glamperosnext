"use client";

import { useContext } from "react";
import Head from "next/head";
import HeaderDinamico from "@/Componentes/HeaderDinamico";
import ContenedorTarjetasDinamico from "@/Componentes/ContenedorTarjetasDinamico/index";
import MenuIconos from "@/Componentes/MenuIconos";
import FiltrosContenedor from "@/Componentes/FiltrosContenedor/index";
import { ContextoApp } from "@/context/AppContext";
import MenuUsuariosInferior from "@/Componentes/MenuUsuariosInferior";
import "./estilos.css";

const medellin: React.FC = () => {
  const contexto = useContext(ContextoApp);

  if (!contexto) {
    throw new Error(
      "El contexto no está disponible. Asegúrate de envolver el componente con ProveedorContextoApp."
    );
  }

  // Coordenadas de Medellin
  const Medellin_LAT = 6.257590259;
  const Medellin_LNG = -75.611031065;

  const { mostrarFiltros } = contexto;

  return (
    <>
      {/* 🔹 HEAD SEO */}
      <Head>
        <title>Glamping cerca a Medellin | Vive la experiencia</title>
        <meta
          name="description"
          content="Encuentra los mejores glampings cerca de Medellin. Disfruta la naturaleza con todas las comodidades. Reserva ahora."
        />
        <meta
          name="keywords"
          content="glamping Medellin, camping de lujo, turismo ecológico, alojamiento en la naturaleza"
        />
        <meta
          property="og:title"
          content="Glamping cerca a Medellin | Vive la experiencia"
        />
        <meta
          property="og:description"
          content="Encuentra los mejores glampings cerca de Medellin. Disfruta la naturaleza con todas las comodidades. Reserva ahora."
        />
        <meta property="og:url" content="https://glamperos.com/medellin" />
        <meta
          property="og:image"
          content="https://storage.googleapis.com/glamperos-imagenes/Imagenes/animal5.jpeg"
        />
        <meta property="og:type" content="website" />
        <meta
          name="twitter:title"
          content="Glamping cerca a Medellin | Vive la experiencia"
        />
        <meta
          name="twitter:description"
          content="Encuentra los mejores glampings cerca de Medellin. Disfruta la naturaleza con todas las comodidades. Reserva ahora."
        />
        <meta
          name="twitter:image"
          content="https://storage.googleapis.com/glamperos-imagenes/Imagenes/animal5.jpeg"
        />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://glamperos.com/medellin" />
      </Head>

      <div className="Medellin-principal">
        <HeaderDinamico title="Reserva los mejores glamping cerca a Medellin" />
        <MenuIconos />

        {mostrarFiltros && <FiltrosContenedor />}

        <main>
          <section>
            <h1 className="Medellin-titulo-principal">
              Mejores Glampings cerca a Medellin
            </h1>
            <p className="Medellin-descripcion">
            🌺Entre montañas de esmeralda y ríos que cantan, te espera un refugio donde el alma se encanta.
            Cabañas de ensueño, bajo cielos dorados, susurros del viento, abrazos callados.          El café y las nubes danzan al alba,
            mientras el sol besa la tierra y la calma. Despierta en un bosque, duerme con estrellas,
            cerca a Medellín hay noches eternas. 🌄
            </p>
          </section>

          <ContenedorTarjetasDinamico lat={Medellin_LAT} lng={Medellin_LNG} />
        </main>

        <MenuUsuariosInferior />
      </div>
    </>
  );
};

export default medellin;
