'use client';

import React, { useMemo, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { FiGrid } from "react-icons/fi";
import { MdOutlinePets, MdOndemandVideo } from "react-icons/md";
import "./estilos.css";

interface ImgExploradasProps {
  imagenes: string[];
  Acepta_Mascotas: boolean;
  video_youtube?: string;
}

/** Saca ID desde m.youtube.com, youtu.be, shorts, watch, etc */
function extractYouTubeId(input?: string | null): string | null {
  if (!input) return null;
  const raw = input.trim();

  if (/^[\w-]{10,15}$/.test(raw)) return raw; // parece ID

  try {
    const u = new URL(raw);
    const host = u.hostname.replace(/^m\./, "www."); // normaliza m.
    const path = u.pathname;

    if (host.includes("youtu.be")) {
      const id = path.split("/").filter(Boolean).pop();
      return id || null;
    }
    if (path.startsWith("/shorts/")) {
      const id = path.split("/")[2];
      return id || null;
    }
    const v = u.searchParams.get("v");
    if (v) return v;

    const last = path.split("/").filter(Boolean).pop();
    return last && /^[\w-]{10,15}$/.test(last) ? last : null;
  } catch {
    return /^[\w-]{10,15}$/.test(raw) ? raw : null;
  }
}

/** URL /embed para desktop */
function buildEmbedSrc(id: string, nocookie = true) {
  const base = nocookie
    ? "https://www.youtube-nocookie.com/embed/"
    : "https://www.youtube.com/embed/";
  return `${base}${id}?rel=0&autoplay=1&mute=1&playsinline=1&modestbranding=1`;
}

const ImgExploradas: React.FC<ImgExploradasProps> = ({
  imagenes,
  Acepta_Mascotas,
  video_youtube,
}) => {
  const router = useRouter();
  const params = useParams();
  const glampingId = useMemo(() => {
    const raw = (params as any)?.slug;
    return Array.isArray(raw) ? raw[0] : (raw ?? "");
  }, [params]);

  const [verVideo, setVerVideo] = useState(false);
  const [useNoCookie, setUseNoCookie] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const videoId = useMemo(() => extractYouTubeId(video_youtube), [video_youtube]);
  const watchUrl = videoId ? `https://www.youtube.com/watch?v=${videoId}` : null; // para móvil
  const srcEmbed = useMemo(
    () => (videoId ? buildEmbedSrc(videoId, useNoCookie) : null),
    [videoId, useNoCookie]
  );

  const imagenesMostrar = useMemo(
    () => (Array.isArray(imagenes) ? imagenes.slice(0, 5) : []),
    [imagenes]
  );

  const handleNavigate = () => {
    if (glampingId) {
      router.push(`/ColeccionImagenes?glampingId=${encodeURIComponent(glampingId)}`);
    }
  };

  const onVideoClick = () => {
    if (!videoId) return;
    // móvil → redirigir; desktop → abrir modal
    if (typeof window !== "undefined" && window.innerWidth <= 768) {
      // misma pestaña (si prefieres nueva: window.open(watchUrl!, "_blank"))
      window.location.href = watchUrl!;
    } else {
      setVerVideo(true);
    }
  };

  const onIframeError = () => {
    if (useNoCookie) setUseNoCookie(false);
  };

  return (
    <div className="ImgExploradas-contenedor">
      {/* Imagen principal */}
      <div className="ImgExploradas-principal" onClick={handleNavigate}>
        {imagenesMostrar[0] ? (
          <img src={imagenesMostrar[0]} alt="Imagen principal" loading="lazy" />
        ) : (
          <div className="ImgExploradas-placeholder">Sin imagen</div>
        )}
      </div>

      {/* Imágenes secundarias */}
      <div className="ImgExploradas-secundarias">
        {imagenesMostrar.slice(1).map((imagen, index) => (
          <img
            key={index}
            src={imagen}
            alt={`Imagen secundaria ${index + 1}`}
            className="ImgExploradas-imagenSecundaria"
            loading="lazy"
            onClick={handleNavigate}
          />
        ))}
      </div>

      {/* Íconos flotantes */}
      {Acepta_Mascotas && (
        <MdOutlinePets
          className="ImgExploradas-iconoMascotas"
          title="Acepta Mascotas"
          aria-label="Acepta Mascotas"
        />
      )}

      {videoId && (
        <button
          className="ImgExploradas-iconoVideo"
          onClick={onVideoClick}
          type="button"
          aria-label="Mostrar video"
        >
          <MdOndemandVideo title="Mostrar Video" />
          <span>Video</span>
        </button>
      )}

      {/* Botón ver todas */}
      <button
        className="ImgExploradas-botonMostrar"
        onClick={handleNavigate}
        type="button"
      >
        <FiGrid className="ImgExploradas-icono" /> Mostrar todas las fotos
      </button>

      {/* Modal SOLO DESKTOP */}
      {verVideo && srcEmbed && (
        <div
          className="VerVideo-overlay"
          role="dialog"
          aria-modal="true"
          onClick={() => setVerVideo(false)}
        >
          <div
            className="VerVideo-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="VerVideo-close"
              aria-label="Cerrar video"
              onClick={() => setVerVideo(false)}
              type="button"
            >
              ×
            </button>
            <iframe
              ref={iframeRef}
              src={srcEmbed}
              title="Video de YouTube"
              frameBorder={0}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
              loading="lazy"
              onError={onIframeError}
              style={{ width: "100%", height: "100%" }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ImgExploradas;
