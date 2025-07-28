"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Cookies from "js-cookie";

import HeaderIcono from "../../Componentes/HeaderIcono";
import MenuUsuariosInferior from "../../Componentes/MenuUsuariosInferior";
import "./estilos.css";

// ✅ Agregamos la declaración para evitar el error de TS
declare global {
  interface Window {
    dataLayer: any[];
  }
}

const GraciasContenido: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [datos, setDatos] = useState({
    fechaInicio: "",
    fechaFin: "",
    telefonoUsuario: "",
    correoUsuario: "",
    cookieGlampingId: "",
    cargando: true,
  });

  useEffect(() => {
    const fechaInicio = searchParams.get("fechaInicio") ?? "Fecha no disponible";
    const fechaFin = searchParams.get("fechaFin") ?? "Fecha no disponible";

    let telefonoUsuario = Cookies.get("telefonoUsuario") || "No disponible";
    const correoUsuario = Cookies.get("correoUsuario") || "No disponible";
    const cookieGlampingId = Cookies.get("cookieGlampingId") || "No disponible";

    if (telefonoUsuario.startsWith("57")) {
      telefonoUsuario = telefonoUsuario.slice(2);
    }

    setDatos({
      fechaInicio,
      fechaFin,
      telefonoUsuario,
      correoUsuario,
      cookieGlampingId,
      cargando: false,
    });

    // 📦 Leer cookie transaccionFinal y enviarla a dataLayer
    const cookieData = Cookies.get("transaccionFinal");
    console.log("🔍 Cookie transaccion Final:", cookieData);
    console.log("🔍 Id del glamping final:", cookieGlampingId);
    if (cookieData) {
      try {
        const transaccion = JSON.parse(cookieData);
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push(transaccion);
        console.log("📦 Evento de compra enviado a dataLayer:", transaccion);
        Cookies.remove("transaccionFinal");
      } catch (error) {
        console.error("❌ Error al parsear transaccionFinal:", error);
      }
    }
  }, [searchParams]);

  if (datos.cargando) {
    return <p className="GraciasMensaje">Cargando información...</p>;
  }

  return (
    <div className="GraciasContenedor">
      <HeaderIcono descripcion="Glamperos" />
      <h1 className="GraciasTitulo">¡Gracias por tu reserva!</h1>

      {(datos.telefonoUsuario !== "No disponible" || datos.correoUsuario !== "No disponible") && (
        <p className="GraciasMensaje">
          A tu WhatsApp{" "}
          {datos.telefonoUsuario !== "No disponible" && (
            <strong>{datos.telefonoUsuario}</strong>
          )}
          {datos.telefonoUsuario !== "No disponible" && datos.correoUsuario !== "No disponible" && " y correo "}
          {datos.correoUsuario !== "No disponible" && (
            <strong>{datos.correoUsuario}</strong>
          )}{" "}
          enviamos el código de reserva, ubicación del glamping y el contacto del
          anfitrión. ¡Gracias por elegirnos!
        </p>
      )}

      <img
        src="https://storage.googleapis.com/glamperos-imagenes/Imagenes/oso.webp"
        alt="Glamperos logo"
        className="Gracias-logo"
        onClick={() => router.push("/")}
      />
      <MenuUsuariosInferior />
    </div>
  );
};

export default GraciasContenido;
