// propiedad/[slug]/GlampingCliente.tsx
'use client';

import { useState, useEffect, useContext, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import ImgExploradasIndividual from '@/Componentes/ImgExploradasIndividual';
import { ContextoApp } from '@/context/AppContext';
import VerVideo from '@/Componentes/VerVideo';
import DescripcionGlamping from '@/Componentes/DescripcionGlamping';
import LoQueOfrece from '@/Componentes/LoQueOfrece';
import { MdOndemandVideo } from 'react-icons/md';
import ManejoErrores from '@/Funciones/ManejoErrores';
import Comentarios from '@/Componentes/Comentarios';
import MapaGlampings from '@/Componentes/Mapa';
import PerfilUsuario from '@/Componentes/PerfilUsuario';
import { IoChevronBackCircleSharp } from 'react-icons/io5';
import FormularioReserva from '@/Componentes/FormularioReserva';
import NombreGlamping from '@/Componentes/NombreGlamping';
import FormularioReservaMobile from '@/Componentes/FormularioReservaMobile';
import SkeletonCard from '@/Componentes/SkeletonCard';
import { mapExtrasToDescripcionProps } from '@/Funciones/serviciosExtras';
import './estilos.css';

type Props = {
  initialData: any;
  initialParams: Record<string, string | undefined>;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;

// Helpers: normalización segura
const textOrUndef = (v: unknown): string | undefined => {
  if (typeof v !== 'string') return undefined;
  const t = v.trim();
  return t.length ? t : undefined;
};

const numOrUndef = (v: unknown): number | undefined => {
  if (typeof v === 'number') return v;
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v);
    return Number.isNaN(n) ? undefined : n;
  }
  return undefined;
};

// === NUEVO: helpers para YouTube ===
function extractYouTubeId(input?: string | null): string | null {
  if (!input) return null;
  const raw = input.trim();
  if (/^[\w-]{10,15}$/.test(raw)) return raw;
  try {
    const u = new URL(raw);
    const host = u.hostname.replace(/^m\./, 'www.');
    const path = u.pathname;

    if (host.includes('youtu.be')) {
      const id = path.split('/').filter(Boolean).pop();
      return id || null;
    }
    if (path.startsWith('/shorts/')) {
      const id = path.split('/')[2];
      return id || null;
    }
    const v = u.searchParams.get('v');
    if (v) return v;

    const last = path.split('/').filter(Boolean).pop();
    return last && /^[\w-]{10,15}$/.test(last) ? last : null;
  } catch {
    return /^[\w-]{10,15}$/.test(raw) ? raw : null;
  }
}

export default function GlampingCliente({ initialData }: Props) {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);

  useEffect(() => {
    setIsClient(true);
    setLoadingPage(false);
  }, []);

  useEffect(() => {
    if (isClient) window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname, isClient]);

  const { setVerVideo } = useContext(ContextoApp)!;
  const [calProm, setCalProm] = useState(5);
  const [calCount, setCalCount] = useState(0);

  // Ubicación
  const ubicacion = useMemo(() => {
    const raw = initialData?.ubicacion;
    if (!raw) return undefined as undefined | { lat: number; lng: number };
    if (typeof raw === 'object' && (raw as any)?.lat && (raw as any)?.lng) {
      return raw as { lat: number; lng: number };
    }
    if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed.lat === 'number' && typeof parsed.lng === 'number'
          ? parsed
          : undefined;
      } catch {
        return undefined;
      }
    }
    return undefined;
  }, [initialData?.ubicacion]);

  // Calificaciones desde API
  useEffect(() => {
    if (!initialData?._id || !isClient) return;
    (async () => {
      try {
        const resp = await fetch(`${API_BASE}/evaluaciones/glamping/${initialData._id}/promedio`);
        const js = await resp.json();
        setCalProm(js.calificacion_promedio ?? 5);
        setCalCount(js.calificacionEvaluaciones ?? 0);
      } catch {}
    })();
  }, [initialData?._id, isClient]);

  // Servicios extra
  const extrasProps = useMemo(
    () => mapExtrasToDescripcionProps(initialData, textOrUndef, numOrUndef),
    [initialData]
  );

  if (!isClient || loadingPage) {
    return (
      <div className="glamping-skeleton">
        <SkeletonCard />
      </div>
    );
  }

  const videoStr = textOrUndef(initialData.video_youtube);
  const videoId = extractYouTubeId(videoStr);
  const tieneVideo = !!videoId;
  const watchUrl = videoId ? `https://www.youtube.com/watch?v=${videoId}` : undefined;

  // DESKTOP: abre modal  |  MÓVIL: redirige a YouTube
  const onVideo = () => {
    if (!videoId) return;
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      window.location.href = watchUrl!;
    } else {
      setVerVideo(true);
    }
  };

  const redirigirWhatsApp = () => {
    const numero = '+573218695196';
    const urlActual = window.location.href;
    const msg = encodeURIComponent(
      `Hola equipo Glamperos, ¡Quiero información sobre este glamping!\n\n${urlActual}`
    );
    const esPequena = window.innerWidth < 600;
    const waUrl = esPequena
      ? `https://wa.me/${numero}?text=${msg}`
      : `https://web.whatsapp.com/send?phone=${numero}&text=${msg}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className="GlampingCliente-contenedor-principal-cliente">
      <section className="GlampingCliente-imagen-individual">
        <div
          className="GlampingCliente-boton-volver-exploracion"
          onClick={() =>
            window.history.length > 1
              ? window.history.back()
              : (window.location.href = '/')
          }
        >
          <IoChevronBackCircleSharp />
        </div>

        <ImgExploradasIndividual imagenes={initialData.imagenes} />

        {tieneVideo && (
          <button
            className="ImgExploradas-iconoVideo-peque"
            onClick={onVideo}
            type="button"
            aria-label="Ver video"
            title="Ver video"
          >
            <MdOndemandVideo /> Video
          </button>
        )}

        {/* Modal solo se abrirá en desktop por onVideo() */}
        <VerVideo urlVideo={videoStr} />
      </section>

      <section className="GlampingCliente-nombre-glamping">
        <NombreGlamping
          nombreGlamping={`${
            initialData.tipoGlamping === 'cabana' ? 'Cabaña' : initialData.tipoGlamping
          } en ${initialData.ciudad_departamento.split(' - ')[0]}`}
        />
      </section>

      <section className="GlampingCliente-contenedor-descripcion">
        <div className="GlampingCliente-contenedor-descripcion-izq">
          <div className="GlampingCliente-descripcion">
            <DescripcionGlamping
              calificacionNumero={numOrUndef(initialData.calificacion) ?? calProm}
              calificacionEvaluaciones={calCount}
              descripcion_glamping={initialData.descripcionGlamping}
              politicas_casa={textOrUndef(initialData.politicas_casa)}
              horarios={textOrUndef(initialData.horarios)}
              {...extrasProps}
            />
          </div>

          <div className="GlampingCliente-amenidades">
            <LoQueOfrece amenidades={initialData.amenidadesGlobal} />
          </div>
        </div>

        <div className="GlampingCliente-contenedor-descripcion-der">
          <FormularioReserva initialData={initialData} />
        </div>
      </section>

      <section className="GlampingCliente-comentarios">
        <Comentarios glampingId={initialData._id} />
      </section>

      <section className="GlampingCliente-mapa">
        <ManejoErrores>
          <MapaGlampings lat={ubicacion?.lat ?? 0} lng={ubicacion?.lng ?? 0} />
        </ManejoErrores>
      </section>

      <section className="GlampingCliente-propietario">
        {initialData.propietario_id ? (
          <PerfilUsuario propietario_id={initialData.propietario_id} />
        ) : (
          <p>El propietario no está disponible</p>
        )}
      </section>

      <button
        type="button"
        className="GlampingCliente-principal-whatsapp-button"
        onClick={redirigirWhatsApp}
        aria-label="Chatea por WhatsApp"
      >
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
          alt="WhatsApp"
          width={32}
          height={32}
        />
      </button>

      <div className="GlampingCliente-contenedor-mobile">
        <FormularioReservaMobile initialData={initialData} />
      </div>
    </div>
  );
}
