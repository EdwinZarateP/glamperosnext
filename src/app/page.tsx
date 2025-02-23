// "use client";
import Head from "next/head";
import Header from "@/Componentes/Header";
import ContenedorTarjetas from "@/Componentes/ContenedorTarjetas/index";
import MenuIconos from "@/Componentes/MenuIconos";
import MenuUsuariosInferior from "@/Componentes/MenuUsuariosInferior";
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
        <Header />
        <MenuIconos />

        <main>
          <section className="Home-oculto-seo">
            <h1>Descubre los Mejores Glampings en Colombia</h1>
            <p>
              Explora la naturaleza con comodidad y estilo. Encuentra el glamping perfecto en cualquier rincón de Colombia.
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
