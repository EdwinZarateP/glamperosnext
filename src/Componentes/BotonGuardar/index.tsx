"use client";

import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useSearchParams } from "next/navigation";
import { AiTwotoneHeart } from "react-icons/ai";
import { BsBalloonHeartFill } from "react-icons/bs";
import { useRouter } from "next/navigation";
import axios from "axios";
import "./estilos.css";
// import { ContextoApp } from "../../../context/AppContext";

const BotonGuardar: React.FC = () => {
  const router = useRouter();
  const idUsuarioCookie = Cookies.get("idUsuario");
  const searchParams = useSearchParams();
  const glampingId = searchParams.get("glampingId") || "";
  const [esFavorito, setEsFavorito] = useState(false);

  useEffect(() => {
    const fetchFavoritos = async () => {
      if (idUsuarioCookie) {
        try {
          const response = await fetch(
            `https://glamperosapi.onrender.com/favoritos/${idUsuarioCookie}`
          );
          const data = await response.json();
          setEsFavorito(data.includes(glampingId));
        } catch (error) {
          console.error("Error al obtener los favoritos:", error);
        }
      }
    };
    fetchFavoritos();
  }, [idUsuarioCookie, glampingId]);

  const handleFavoritoChange = async () => {
    if (!idUsuarioCookie) {
      router.push("/RegistrarsePag");
      return;
    }

    try {
      const nuevoEstado = !esFavorito;
      setEsFavorito(nuevoEstado);

      if (nuevoEstado) {
        await axios.post("https://glamperosapi.onrender.com/favoritos/", {
          usuario_id: idUsuarioCookie,
          glamping_id: glampingId,
        });
      } else {
        await axios.delete(
          `https://glamperosapi.onrender.com/favoritos/?usuario_id=${idUsuarioCookie}&glamping_id=${glampingId}`
        );
      }
    } catch (error) {
      console.error("Error al actualizar el favorito:", error);
      alert("Hubo un problema al actualizar el favorito. Intenta nuevamente.");
      setEsFavorito(!esFavorito);
    }
  };

  return (
    <button className="boton-guardar" onClick={handleFavoritoChange}>
      {esFavorito ? (
        <BsBalloonHeartFill className="icono-guardar-lleno" />
      ) : (
        <AiTwotoneHeart className="icono-guardar-vacio" />
      )}
      <span className={`texto-guardar ${esFavorito ? "subrayado" : ""}`}>
        {esFavorito ? "Guardado" : "Guardar"}
      </span>
    </button>
  );
};

export default BotonGuardar;
