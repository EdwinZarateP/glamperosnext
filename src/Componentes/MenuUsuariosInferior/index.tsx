"use client";

import React from "react";
import { CiSearch } from "react-icons/ci";
import { FaRegHeart, FaRegUser } from "react-icons/fa";
import { TiMessage } from "react-icons/ti";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import "./estilos.css";

const MenuUsuariosInferior: React.FC = () => {
  const correoUsuario = Cookies.get("correoUsuario");
  // const idEmisor = Cookies.get("idUsuario") ?? "";
  const router = useRouter();

  const redirigir = (ruta: string) => {
    if (!correoUsuario) {
      // Si no existe el correo, redirige a la página de registro
      router.push("/RegistroPag");
    } else {
      // Si existe el correo, redirige a la ruta correspondiente
      router.push(ruta);
    }
  };

  return (
    <div className="MenuUsuariosInferior">
      <div className="MenuUsuariosInferior-icono" onClick={() => redirigir("/")}>
        <CiSearch className="MenuUsuariosInferior-iconoImagen" />
        <span className="MenuUsuariosInferior-texto">Todo Colombia</span>
      </div>
      <div className="MenuUsuariosInferior-icono" onClick={() => redirigir("/ListaDeseos")}>
        <FaRegHeart className="MenuUsuariosInferior-iconoImagen" />
        <span className="MenuUsuariosInferior-texto">Favoritos</span>
      </div>
      <div className="MenuUsuariosInferior-icono" onClick={() => redirigir(`/Mensajes`)}>
        <TiMessage className="MenuUsuariosInferior-iconoImagen" />
        <span className="MenuUsuariosInferior-texto">Mensajes</span>
      </div>
      <div className="MenuUsuariosInferior-icono" onClick={() => redirigir("/GestionarCuenta")}>
        <FaRegUser className="MenuUsuariosInferior-iconoImagen" />
        <span className="MenuUsuariosInferior-texto">Perfil</span>
      </div>
    </div>
  );
};

export default MenuUsuariosInferior;
