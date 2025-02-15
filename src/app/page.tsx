"use client";

import { useContext } from "react";
import Header from "@/Componentes/Header";
// import ContenedorTarjetas from "@/Componentes/ContenedorTarjetas";
import MenuIconos from "@/Componentes/MenuIconos"; 
import FiltrosContenedor from "@/Componentes/FiltrosContenedor/index";
import { ContextoApp } from "@/context/AppContext";
// import MenuUsuariosInferior from "@/Componentes/MenuUsuariosInferior"; 
import "./globals.css"; 

const Home: React.FC = () => {
  const contexto = useContext(ContextoApp);

  if (!contexto) {
    throw new Error("El contexto no está disponible. Asegúrate de envolver el componente con ProveedorContextoApp.");
  }

  const { mostrarFiltros } = contexto;

  return (
    <div className="contenedor-principal">
      <Header />
      <MenuIconos />
      {mostrarFiltros && <FiltrosContenedor />}
      <main>
        {/* <ContenedorTarjetas /> */}
      </main>
      {/* <MenuUsuariosInferior /> */}
    </div>
  );
};

export default Home; // ✅ Ahora esta es la página principal (home)
