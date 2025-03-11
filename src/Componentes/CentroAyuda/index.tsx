"use client";

import React from "react";
import { useRouter } from "next/navigation"; 
import "./estilos.css";

const CentroAyuda: React.FC = () => {
  const router = useRouter(); // Hook para navegación en Next.js

  const redirigirWhatsApp = () => {
    const numeroWhatsApp = "+573218695196";
    const mensaje = encodeURIComponent("Hola equipo Glamperos, ¡Necesito ayuda!");
    const esPantallaPequena = typeof window !== "undefined" && window.innerWidth < 600;
    const urlWhatsApp = esPantallaPequena
      ? `https://wa.me/${numeroWhatsApp}?text=${mensaje}`
      : `https://web.whatsapp.com/send?phone=${numeroWhatsApp}&text=${mensaje}`;
    window.open(urlWhatsApp, "_blank");
  };

  return (
    <div className="CentroAyuda-contenedor">
      <h1 className="CentroAyuda-titulo">Centro de Ayuda</h1>

      <div className="CentroAyuda-opciones">
        <p className="CentroAyuda-texto">
          Si tienes preguntas o quieres que te ayudemos a solucionar algún problema con la plataforma:
        </p>
        <ul className="CentroAyuda-lista">
          <li className="CentroAyuda-item">
            <button className="CentroAyuda-boton" onClick={redirigirWhatsApp}>
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" // Acceder a imágenes desde la carpeta "public"
                alt="WhatsApp"
                className="CentroAyuda-icono-whatsapp"
              />
              WhatsApp Glamperos
            </button>
          </li>
          <li className="CentroAyuda-item">
            <p className="CentroAyuda-texto">
              Puedes contactarnos por correo:
              <span className="CentroAyuda-correo"> soporte@glamperos.com</span>
            </p>
          </li>
        </ul>

        {/* Preguntas Frecuentes siempre visibles */}
        <div className="CentroAyuda-faq">
          <h3 className="CentroAyuda-faq-titulo">Preguntas Frecuentes</h3>
          <ul>
            <li>
              <strong>¿Cómo cancelo o modifico mi reserva?</strong> Puedes hacerlo en la sección "Perfil"-"Mis Viajes",
              siempre que no infrinja las políticas establecidas antes de realizar la reserva.
            </li>
            <li>
              <strong>¿Qué métodos de pago aceptan?</strong>
              <ul>
                <li>Tarjetas de crédito y débito (Visa, Mastercard, American Express)</li>
                <li>PSE</li>
                <li>Nequi</li>
                <li>E-prepago Bancolombia</li>
                <li>Corresponsales bancarios</li>
                <li>Botón de pago Bancolombia</li>
                <li>Compra y Paga Después (BNPL) Bancolombia</li>
                <li>DaviPlata</li>
              </ul>
            </li>
            <li>
              <strong>¿Cómo contacto al anfitrión?</strong> En la página de cada Glamping tienes un botón para enviarle
              un mensaje.
            </li>
            <li>
              <strong>¿Qué es Glamperos?</strong>
              <span className="CentroAyuda-span-navegar" onClick={() => router.push("/DatosEmpresariales")}>
                Conoce más de nosotros
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CentroAyuda;
