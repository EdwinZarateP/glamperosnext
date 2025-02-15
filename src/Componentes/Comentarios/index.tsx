"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Comentario from "@/Componentes/Comentario/index"; // Asegúrate de que la ruta sea correcta según tu alias
import "./estilos.css";

interface ComentarioData {
  nombre: string;
  calificacionNumero: number;
  comentario: string;
  fotoPerfil?: string;
}

interface ComentariosProps {
  glampingId: string; // Se recibe el ID del glamping para obtener sus comentarios
}

export default function Comentarios({ glampingId }: ComentariosProps) {
  const [comentarios, setComentarios] = useState<ComentarioData[]>([]);

  useEffect(() => {
    const obtenerComentarios = async () => {
      try {
        const response = await axios.get(
          `https://glamperosapi.onrender.com/evaluaciones/glamping/${glampingId}`
        );
        if (response.data && response.data.length > 0) {
          const comentariosMapeados = response.data.map((comentario: any) => ({
            nombre: comentario.nombre_usuario,
            calificacionNumero: comentario.calificacion,
            comentario: comentario.comentario,
            fotoPerfil: comentario.fotoPerfil || "",
          }));
          setComentarios(comentariosMapeados);
        } else {
          setComentarios([]);
        }
      } catch (error) {
        console.error("Error al obtener los comentarios:", error);
        setComentarios([]);
      }
    };

    obtenerComentarios();
  }, [glampingId]);

  return (
    <div className="Comentarios-contenedor">
      <h2 className="Comentarios-titulo">Opiniones</h2>
      <div
        className={
          comentarios.length > 0
            ? "Comentarios-carrusel-con"
            : "Comentarios-carrusel-sin"
        }
      >
        {comentarios.length > 0 ? (
          comentarios.map((comentario, index) => (
            <Comentario key={index} {...comentario} />
          ))
        ) : (
          <div className="comentarios-vacios">
            {/* Si usas next/image podrías reemplazarlo, pero aquí se usa img */}
            <img src={"https://storage.googleapis.com/glamperos-imagenes/Imagenes/dameTiempo.png"} alt="Meme divertido" className="meme-dameTiempo" />
            <p>Sin reseñas (por ahora)</p>
          </div>
        )}
      </div>
    </div>
  );
}
