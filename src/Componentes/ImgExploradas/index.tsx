"use client";

import { useContext } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FiGrid } from "react-icons/fi";
import { MdOutlinePets, MdOndemandVideo } from "react-icons/md";
import VerVideo from "../../Componentes/VerVideo/index";
import { ContextoApp } from "../../context/AppContext";
import "./estilos.css";

interface ImgExploradasProps {
  imagenes: string[];
  Acepta_Mascotas: boolean;
  video_youtube?: string;
}

const ImgExploradas: React.FC<ImgExploradasProps> = ({
  imagenes,
  Acepta_Mascotas,
  video_youtube,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const glampingId = searchParams.get("glampingId") || ""; // Obtiene glampingId desde la URL

  const { setVerVideo } = useContext(ContextoApp)!;

  const imagenesMostrar = imagenes.slice(0, 5);

  const handleNavigate = () => {
    if (glampingId) {
      router.push(`/ColeccionImagenes?glampingId=${glampingId}`);
    }
  };

  const handleVideoClick = () => {
    setVerVideo(true);
  };

  return (
    <div className="ImgExploradas-contenedor">
      <div className="ImgExploradas-principal" onClick={handleNavigate}>
        <img src={imagenesMostrar[0]} alt="Imagen principal" />
      </div>

      <div className="ImgExploradas-secundarias">
        {imagenesMostrar.slice(1).map((imagen, index) => (
          <img
            key={index}
            src={imagen}
            alt={`Imagen secundaria ${index + 1}`}
            className="ImgExploradas-imagenSecundaria"
            onClick={handleNavigate}
          />
        ))}
      </div>

      {/* Iconos condicionales */}
      <div className="ImgExploradas-iconos">
        {Acepta_Mascotas && (
          <MdOutlinePets
            className="ImgExploradas-iconoMascotas"
            title="Acepta Mascotas"
          />
        )}
        {video_youtube &&
          video_youtube.trim().toLowerCase() !== "sin video" &&
          video_youtube.trim().toLowerCase() !== "no disponible" && (
            <button className="ImgExploradas-iconoVideo" onClick={handleVideoClick}>
              <MdOndemandVideo title="Mostrar Video" />
              Video
            </button>
          )}
      </div>

      <button className="ImgExploradas-botonMostrar" onClick={handleNavigate}>
        <FiGrid className="ImgExploradas-icono" /> Mostrar todas las fotos
      </button>

      <VerVideo urlVideo={video_youtube} />
    </div>
  );
};

export default ImgExploradas;