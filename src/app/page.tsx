// "use client";
import Head from "next/head";
import Header from "@/Componentes/Header";
import ContenedorTarjetas from "@/Componentes/ContenedorTarjetas/index";
import MenuIconos from "@/Componentes/MenuIconos";
import MenuUsuariosInferior from "@/Componentes/MenuUsuariosInferior";
import Image from "next/image";
import "./page.css";

const Home: React.FC = () => {
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
        <link rel="canonical" href="https://glamperos.com/" />
      </Head>

      <div className="Home-principal">
        <div className="Home-Titulo">

          <h1>
            Descubre y reserva los Mejores Glampings en Colombia{" "}
            <Image 
              src="https://upload.wikimedia.org/wikipedia/commons/2/21/Flag_of_Colombia.svg" 
              alt="Bandera de Colombia" 
              width={32} 
              height={24} 
            />
          </h1>

          <p className="Home-descripcion">
          ✨ Descubre la magia del glamping: lujo y naturaleza en un solo destino. 🌿🏕️
          </p>
        </div>
        <Header />
        <MenuIconos />
        <main>
          <ContenedorTarjetas />
        </main>

        <MenuUsuariosInferior />
      </div>
    </>
  );
};

export default Home;
