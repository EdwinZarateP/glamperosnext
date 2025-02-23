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

const bogota: React.FC = () => {
  const contexto = useContext(ContextoApp);

  if (!contexto) {
    throw new Error(
      "El contexto no está disponible. Asegúrate de envolver el componente con ProveedorContextoApp."
    );
  }

  // Coordenadas de Bogota
  const Bogota_LAT = 4.316107698;
  const Bogota_LNG = -74.181072702;

  const { mostrarFiltros } = contexto;

  return (
    <>
      {/* 🔹 HEAD SEO */}
      <Head>
        <title>Glamping cerca a Bogota | Vive la experiencia</title>
        <meta
          name="description"
          content="Encuentra los mejores glampings cerca de Bogota. Disfruta la naturaleza con todas las comodidades. Reserva ahora."
        />
        <meta
          name="keywords"
          content="glamping Bogota, camping de lujo, turismo ecológico, alojamiento en la naturaleza"
        />
        <meta
          property="og:title"
          content="Glamping cerca a Bogota | Vive la experiencia"
        />
        <meta
          property="og:description"
          content="Encuentra los mejores glampings cerca de Bogota. Disfruta la naturaleza con todas las comodidades. Reserva ahora."
        />
        <meta property="og:url" content="https://glamperos.com/bogota" />
        <meta
          property="og:image"
          content="https://storage.googleapis.com/glamperos-imagenes/Imagenes/animal5.jpeg"
        />
        <meta property="og:type" content="website" />
        <meta
          name="twitter:title"
          content="Glamping cerca a Bogota | Vive la experiencia"
        />
        <meta
          name="twitter:description"
          content="Encuentra los mejores glampings cerca de Bogota. Disfruta la naturaleza con todas las comodidades. Reserva ahora."
        />
        <meta
          name="twitter:image"
          content="https://storage.googleapis.com/glamperos-imagenes/Imagenes/animal5.jpeg"
        />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://glamperos.com/Bogota" />
      </Head>

      <div className="Bogota-principal">
        <HeaderDinamico title="Glamping cerca a Bogota" />
        <MenuIconos />

        {mostrarFiltros && <FiltrosContenedor />}

        <main>
          <section>
            <h1 className="Bogota-titulo-principal">
              Descubre los Mejores Glampings cerca de Bogota
            </h1>
            <p className="Bogota-descripcion">
              Explora la naturaleza con comodidad y estilo. Encuentra el
              glamping perfecto cerca de Bogota.
            </p>
          </section>

          <ContenedorTarjetasDinamico lat={Bogota_LAT} lng={Bogota_LNG} />
        </main>

        <MenuUsuariosInferior />
      </div>
    </>
  );
};

export default bogota;
