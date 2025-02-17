"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import HeaderIcono from "@/Componentes/HeaderIcono/index";
import MenuUsuariosInferior from "@/Componentes/MenuUsuariosInferior/index";
import "./estilos.css";

const Gracias: React.FC = () => {
  const params = useParams();
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
    // Extraer parámetros
    const parametros = Object.values(params);
    const [fechaInicio = "", fechaFin = ""] = parametros.map(param =>
      Array.isArray(param) ? param[0] : param ?? ""
    );

    // Obtener datos de cookies
    const telefonoUsuario = Cookies.get("telefonoUsuario") || "No disponible";
    const correoUsuario = Cookies.get("correoUsuario") || "No disponible";

    // Guardar datos en el estado
    setDatos({
      fechaInicio,
      fechaFin,
      telefonoUsuario,
      correoUsuario,
      cargando: false,
    });
  }, [params]);

  if (datos.cargando) {
    return <p className="GraciasMensaje">Cargando información...</p>;
  }

  return (
    <div className="GraciasContenedor">
      <HeaderIcono descripcion="Glamperos" />
      <h1 className="GraciasTitulo">¡Gracias por tu reserva!</h1>
      <p className="GraciasMensaje">
        Tu estancia será del{" "}
        <span className="fecha-destacada">
          {datos.fechaInicio
            ? new Date(`${datos.fechaInicio}T12:00:00`).toLocaleDateString("es-ES", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "Fecha no disponible"}
        </span>{" "}
        al{" "}
        <span className="fecha-destacada">
          {datos.fechaFin
            ? new Date(`${datos.fechaFin}T12:00:00`).toLocaleDateString("es-ES", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "Fecha no disponible"}
        </span>

        . A tu WhatsApp <strong>{datos.telefonoUsuario}</strong> y correo{" "}
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
