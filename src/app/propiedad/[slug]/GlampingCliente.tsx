// propiedad/[slug]/GlampingCliente.tsx
'use client';

import { useState, useEffect, useContext } from 'react';
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

  useEffect(() => {
    if (!initialData?._id || !isClient) return;
    (async () => {
      try {
        const resp = await fetch(
          `${API_BASE}/evaluaciones/glamping/${initialData._id}/promedio`
        );
        const js = await resp.json();
        setCalProm(js.calificacion_promedio || 5);
        setCalCount(js.calificacionEvaluaciones || 0);
      } catch {}
    })();
  }, [initialData._id, isClient]);

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
    initialData.video_youtube?.trim().toLowerCase() !== '' &&
    initialData.video_youtube?.trim().toLowerCase() !== 'sin video';
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
              calificacionNumero={calProm}
              calificacionEvaluaciones={calCount}
              calificacionMasAlta="Su piscina fue lo mejor calificado"
              descripcion_glamping={initialData.descripcionGlamping}
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
        <Comentarios glampingId={initialData.glampingId} />
      </section>

      <section className="GlampingCliente-mapa">
        <ManejoErrores>
          <MapaGlampings
            lat={initialData.ubicacion.lat}
            lng={initialData.ubicacion.lng}
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
