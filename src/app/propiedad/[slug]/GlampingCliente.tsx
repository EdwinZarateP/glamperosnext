// propiedad/[slug]/GlampingCliente.tsx
'use client';

import { useState, useEffect, useContext, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import ImgExploradasIndividual from '@/Componentes/ImgExploradasIndividual';
import { ContextoApp } from '@/context/AppContext';
import VerVideo from '@/Componentes/VerVideo';
import DescripcionGlamping from "@/Componentes/DescripcionGlamping";
import LoQueOfrece from "@/Componentes/LoQueOfrece";
import { MdOndemandVideo } from 'react-icons/md';
import ManejoErrores from "@/Funciones/ManejoErrores";
import Comentarios from "@/Componentes/Comentarios";
import MapaGlampings from "@/Componentes/Mapa";
import PerfilUsuario from "@/Componentes/PerfilUsuario";
import { IoChevronBackCircleSharp } from "react-icons/io5";
import FormularioReserva from '@/Componentes/FormularioReserva';
import NombreGlamping from "@/Componentes/NombreGlamping";
import FormularioReservaMobile from '@/Componentes/FormularioReservaMobile';
import SkeletonCard from '@/Componentes/SkeletonCard';
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
  // Permitimos 0 cuando venga ya como number
  return undefined;
};

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

  // Ubicación: en tu DB viene como string JSON
  const ubicacion = useMemo(() => {
    const raw = initialData?.ubicacion;
    if (!raw) return undefined as undefined | { lat: number; lng: number };
    if (typeof raw === 'object' && raw.lat && raw.lng) return raw;
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

  if (!isClient || loadingPage) {
    return (
      <div className="glamping-skeleton">
        <SkeletonCard />
      </div>
    );
  }

  const search = new URLSearchParams(window.location.search);
  const utmParams: Record<string, string> = {};
  ['utm_source', 'utm_medium', 'utm_campaign'].forEach((key) => {
    const val = search.get(key);
    if (val) utmParams[key] = val;
  });

  const tieneVideo =
    textOrUndef(initialData.video_youtube)?.toLowerCase() !== 'sin video' &&
    !!textOrUndef(initialData.video_youtube);

  const onVideo = () => setVerVideo(true);

  const redirigirWhatsApp = () => {
    const numero = "+573218695196";
    const urlActual = window.location.href;
    const msg = encodeURIComponent(
      `Hola equipo Glamperos, ¡Quiero información sobre este glamping!\n\n${urlActual}`
    );
    const esPequeña = window.innerWidth < 600;
    const waUrl = esPequeña
      ? `https://wa.me/${numero}?text=${msg}`
      : `https://web.whatsapp.com/send?phone=${numero}&text=${msg}`;
    window.open(waUrl, "_blank");
  };

  return (
    <div className="GlampingCliente-contenedor-principal-cliente">
      <section className="GlampingCliente-imagen-individual">
        <div
          className="GlampingCliente-boton-volver-exploracion"
          onClick={() =>
            window.history.length > 1
              ? window.history.back()
              : (window.location.href = "/")
          }
        >
          <IoChevronBackCircleSharp />
        </div>

        <ImgExploradasIndividual imagenes={initialData.imagenes} />

        {tieneVideo && (
          <button
            className="ImgExploradas-iconoVideo-peque"
            onClick={onVideo}
          >
            <MdOndemandVideo /> Video
          </button>
        )}
        <VerVideo urlVideo={initialData.video_youtube} />
      </section>

      <section className="GlampingCliente-nombre-glamping">
        <NombreGlamping
          nombreGlamping={`${
            initialData.tipoGlamping === 'cabana' ? 'Cabaña' : initialData.tipoGlamping
          } en ${initialData.ciudad_departamento.split(" - ")[0]}`}
        />
      </section>

      <section className="GlampingCliente-contenedor-descripcion">
        <div className="GlampingCliente-contenedor-descripcion-izq">
          <div className="GlampingCliente-descripcion">
            <DescripcionGlamping
              calificacionNumero={numOrUndef(initialData.calificacion) ?? calProm}
              calificacionEvaluaciones={calCount}
              // calificacionMasAlta="Su piscina fue lo mejor calificado" // si decides usarla

              // Descripción base (respeta saltos de línea del backend)
              descripcion_glamping={initialData.descripcionGlamping}

              // — Ten en cuenta —
              politicas_casa={textOrUndef(initialData.politicas_casa)}
              horarios={textOrUndef(initialData.horarios)}

              // — Servicios adicionales —
              decoracion_sencilla={textOrUndef(initialData.decoracion_sencilla)}
              valor_decoracion_sencilla={numOrUndef(initialData.valor_decoracion_sencilla)}

              decoracion_especial={textOrUndef(initialData.decoracion_especial)}
              valor_decoracion_especial={numOrUndef(initialData.valor_decoracion_especial)}

              paseo_cuatrimoto={textOrUndef(initialData.paseo_cuatrimoto)}
              valor_paseo_cuatrimoto={numOrUndef(initialData.valor_paseo_cuatrimoto)}

              paseo_caballo={textOrUndef(initialData.paseo_caballo)}
              valor_paseo_caballo={numOrUndef(initialData.valor_paseo_caballo)}

              masaje_pareja={textOrUndef(initialData.masaje_pareja)}
              valor_masaje_pareja={numOrUndef(initialData.valor_masaje_pareja)}

              dia_sol={textOrUndef(initialData.dia_sol)}
              valor_dia_sol={numOrUndef(initialData.valor_dia_sol)}

              caminata={textOrUndef(initialData.caminata)}
              valor_caminata={numOrUndef(initialData.valor_caminata)}
              torrentismo={textOrUndef(initialData.torrentismo)}
              valor_torrentismo={numOrUndef(initialData.valor_torrentismo)}
              parapente={textOrUndef(initialData.parapente)}
              valor_parapente={numOrUndef(initialData.valor_parapente)}
              paseo_lancha={textOrUndef(initialData.paseo_lancha)}
              valor_paseo_lancha={numOrUndef(initialData.valor_paseo_lancha)}

              kit_fogata={textOrUndef(initialData.kit_fogata)}
              valor_kit_fogata={numOrUndef(initialData.valor_kit_fogata)}

              cena_romantica={textOrUndef(initialData.cena_romantica)}
              valor_cena_romantica={numOrUndef(initialData.valor_cena_romantica)}
              cena_estandar={textOrUndef(initialData.cena_estandar)}
              valor_cena_estandar={numOrUndef(initialData.valor_cena_estandar)}
              

              mascota_adicional={textOrUndef(initialData.mascota_adicional)}
              valor_mascota_adicional={numOrUndef(initialData.valor_mascota_adicional)}
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
          <MapaGlampings
            lat={ubicacion?.lat ?? 0}
            lng={ubicacion?.lng ?? 0}
          />
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
