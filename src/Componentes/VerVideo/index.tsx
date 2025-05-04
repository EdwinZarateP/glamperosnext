"use client";

import { useContext } from "react";
import { ContextoApp } from "../../context/AppContext"; // Ajusta la ruta según tu estructura
import "./estilos.css";

interface Props {
  urlVideo?: string; // URL del video de YouTube, ahora es opcional
}

export default function VerVideo({ urlVideo }: Props) {
  const { verVideo, setVerVideo } = useContext(ContextoApp)!;

  const onCerrar = () => {
    setVerVideo(false);
  };

  // Si no está activado el video o no hay URL, no renderiza nada
  if (!verVideo || !urlVideo) {
    return null;
  }

  // Convertir la URL de YouTube a formato embed
  const videoEmbedUrl = urlVideo.replace("watch?v=", "embed/");

  return (
    <div className="VerVideo-contenedor">
      <div className="VerVideo-video">
        <iframe
          className="VerVideo-iframe"
          src={videoEmbedUrl}
          title="Video de YouTube"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      <button className="VerVideo-boton-cerrar" onClick={onCerrar}>
        X
      </button>
    </div>
  );
}
