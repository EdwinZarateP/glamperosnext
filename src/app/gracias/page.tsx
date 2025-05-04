"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import HeaderIcono from "../../Componentes/HeaderIcono/index";
import MenuUsuariosInferior from "../../Componentes/MenuUsuariosInferior/index";
import "./estilos.css";

const Gracias: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Estado para almacenar los datos
  const [datos, setDatos] = useState<{
    fechaInicio: string;
    fechaFin: string;
    telefonoUsuario: string;
    correoUsuario: string;
    cargando: boolean;
  }>({
    fechaInicio: "",
    fechaFin: "",
    telefonoUsuario: "",
    correoUsuario: "",
    cargando: true,
  });

  useEffect(() => {
    // Extraer parámetros de la URL
    const fechaInicio = searchParams.get("fechaInicio") ?? "Fecha no disponible";
    const fechaFin = searchParams.get("fechaFin") ?? "Fecha no disponible";

    // Obtener datos de cookies
    let telefonoUsuario = Cookies.get("telefonoUsuario") || "No disponible";
    const correoUsuario = Cookies.get("correoUsuario") || "No disponible";

    // Si el teléfono empieza con "57", eliminarlo y dejar el resto del número
    if (telefonoUsuario.startsWith("57")) {
      telefonoUsuario = telefonoUsuario.slice(2);
    }

    // Guardar datos en el estado
    setDatos({
      fechaInicio,
      fechaFin,
      telefonoUsuario,
      correoUsuario,
      cargando: false,
    });
  }, [searchParams]);

  if (datos.cargando) {
    return <p className="GraciasMensaje">Cargando información...</p>;
  }

  return (
    <div className="GraciasContenedor">
      <HeaderIcono descripcion="Glamperos" />
      <h1 className="GraciasTitulo">¡Gracias por tu reserva!</h1>
      <p className="GraciasMensaje">      
         A tu WhatsApp <strong>{datos.telefonoUsuario}</strong> y correo{" "}
        <strong>{datos.correoUsuario}</strong> enviamos el código de reserva,
        ubicación del glamping y el contacto del anfitrión. ¡Gracias por
        elegirnos!
      </p>
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

export default Gracias;
