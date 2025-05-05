"use client";
import Header from "../Componentes/Header";
import ContenedorTarjetas from "../Componentes/ContenedorTarjetas/index";
import MenuIconos from "../Componentes/MenuIconos";
import MenuUsuariosInferior from "../Componentes/MenuUsuariosInferior";
import Image from "next/image";
import "./page.css";

export default function Home() {

  const redirigirWhatsApp = () => {
    const numeroWhatsApp = "+573218695196";
    const mensaje = encodeURIComponent("Hola equipo Glamperos, ¡Quiero información!");
    const esPantallaPequena =
      typeof window !== "undefined" && window.innerWidth < 600;
    const urlWhatsApp = esPantallaPequena
      ? `https://wa.me/${numeroWhatsApp}?text=${mensaje}`
      : `https://web.whatsapp.com/send?phone=${numeroWhatsApp}&text=${mensaje}`;
    window.open(urlWhatsApp, "_blank");
  };

  return (
    <>
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

      {/* Botón fijo de WhatsApp que llama a redirigirWhatsApp */}
      <button
        type="button"
        className="whatsapp-button"
        onClick={redirigirWhatsApp}
        aria-label="Chatea por WhatsApp"
      >
        <Image
          src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
          alt="Icono WhatsApp"
          width={32}
          height={32}
        />
      </button>
    </>
  );
}
