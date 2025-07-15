"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Comentario from "../../Componentes/Comentario/index";
import "./estilos.css";

interface ComentarioData {
  nombre: string;
  calificacionNumero: number;
  comentario: string;
  fotoPerfil?: string;
}

interface ComentariosProps {
  glampingId: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;

export default function Comentarios({ glampingId }: ComentariosProps) {
  const [comentarios, setComentarios] = useState<ComentarioData[]>([]);

  useEffect(() => {
    const obtenerComentarios = async () => {
      try {
        const response = await axios.get(
          `${API_BASE}/evaluaciones/glamping/${glampingId}`
        );
        if (response.data?.length > 0) {
          const comentariosMapeados = response.data.map((comentario: any) => ({
            nombre: comentario.nombre_usuario,
            calificacionNumero: comentario.calificacion,
            comentario: comentario.comentario,
            fotoPerfil: comentario.fotoPerfil || "",
          }));
          setComentarios(comentariosMapeados);
        }
      } catch (error) {
        console.error("Error al obtener los comentarios:", error);
      }
    };

    obtenerComentarios();
  }, [glampingId]);

  if (comentarios.length === 0) {
    return null;
  }

  return (
    <div className="Comentarios-contenedor">
      <h2 className="Comentarios-titulo">Opiniones</h2>
      <div className="Comentarios-carrusel-con">
        {comentarios.map((comentario, index) => (
          <Comentario key={index} {...comentario} />
        ))}
      </div>
    </div>
  );
}
