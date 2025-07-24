// propiedad/[slug]/GlampingCliente.tsx

'use client';

import { useState, useEffect, useContext } from 'react';
import ImgExploradasIndividual from '@/Componentes/ImgExploradasIndividual';
import { ContextoApp } from '@/context/AppContext';
import VerVideo from '@/Componentes/VerVideo';
import DescripcionGlamping from "@/Componentes/DescripcionGlamping/index";
import LoQueOfrece from"@/Componentes/LoQueOfrece/index";
import { MdOndemandVideo } from 'react-icons/md';
import ManejoErrores from "@/Funciones/ManejoErrores";
import Comentarios from "@/Componentes/Comentarios";
import MapaGlampings from "@/Componentes/Mapa/index";
import PerfilUsuario from "@/Componentes/PerfilUsuario";
import { IoChevronBackCircleSharp } from "react-icons/io5"
import FormularioReserva from '@/Componentes/FormularioReserva';
import NombreGlamping from "@/Componentes/NombreGlamping";
import FormularioReservaMobile from '@/Componentes/FormularioReservaMobile';
import './estilos.css';

type Props = {
  initialData: any;
  initialParams: Record<string, string | undefined>;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;

export default function GlampingCliente({ initialData }: Props) {
  // Estado para controlar si estamos en el cliente
  const [isClient, setIsClient] = useState(false);
  const { setVerVideo } = useContext(ContextoApp)!;

  useEffect(() => {
    // Esto solo se ejecuta en el cliente
    setIsClient(true);
  }, []);

  // Calificaciones
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

  // Si no estamos en el cliente, no renderizar nada
  if (!isClient) {
    return null;
  }

  // Obtener parámetros de la URL (solo en cliente)
  const search = new URLSearchParams(window.location.search);
  const utmParams: Record<string, string> = {};
  ['utm_source', 'utm_medium', 'utm_campaign'].forEach((key) => {
    const valor = search.get(key);
    if (valor) utmParams[key] = valor;
  });

  // Video
  const tieneVideo =
    initialData.video_youtube &&
    initialData.video_youtube.trim() !== '' &&
    initialData.video_youtube.trim().toLowerCase() !== 'sin video';
  const onVideo = () => setVerVideo(true);

  const redirigirWhatsApp = () => {
    const numeroWhatsApp = "+573218695196";
    const urlActual = window.location.href;
    const mensaje = encodeURIComponent(
      `Hola equipo Glamperos, ¡Quiero información sobre este glamping!\n \n${urlActual}`
    );
    const esPantallaPequena = window.innerWidth < 600;
    const urlWhatsApp = esPantallaPequena
      ? `https://wa.me/${numeroWhatsApp}?text=${mensaje}`
      : `https://web.whatsapp.com/send?phone=${numeroWhatsApp}&text=${mensaje}`;
    window.open(urlWhatsApp, "_blank");
  };

  return (
    <>
      {/* Galería móvil */}
      <section className="propiedad-imagen-individual">
        <div className="propiedad-boton-volver-exploracion" onClick={() => window.history.back()}>
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

      {/* Titulo para moviles */}
      <section className="propiedad-nombre-glamping">
        <NombreGlamping
          nombreGlamping={`${
            initialData.tipoGlamping === 'cabana' ? 'Cabaña' : initialData.tipoGlamping
          } en ${initialData.ciudad_departamento.split(" - ")[0]}`}
        />
      </section>

      <section className="propiedad-contenedor-descripcion">

        <div className="propiedad-contenedor-descripcion-izq">

          <div className="propiedad-descripcion">
            <DescripcionGlamping
              calificacionNumero={calProm}
              calificacionEvaluaciones={calCount}
              calificacionMasAlta="Su piscina fue lo mejor calificado"
              descripcion_glamping={
                initialData.descripcionGlamping
              }
            />
          </div>
          <div className="propiedad-amenidades">
            <LoQueOfrece
              amenidades={initialData.amenidadesGlobal}
            />
          </div>
        </div>

        <div className="propiedad-contenedor-descripcion-der">
          <FormularioReserva initialData={initialData} />
        </div>
      </section>
      <section className='propiedad-comentarios'>
        <Comentarios glampingId={initialData.glampingId} />
      </section>
      <section className='propiedad-mapa'>
        <ManejoErrores>
          <MapaGlampings
            lat={initialData.ubicacion.lat}
            lng={initialData.ubicacion.lng}
          />
        </ManejoErrores>
      </section>

      <section className='propiedad-propietario'>
      {initialData.propietario_id ? (
        <PerfilUsuario
          propietario_id={initialData.propietario_id}
        />
      ) : (
        <p>El propietario no está disponible</p>
      )}
      </section>

      <button
        type="button"
        className="contenedor-principal-whatsapp-button"
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
      <button
        type="button"
        className="contenedor-principal-whatsapp-button"
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

      <FormularioReservaMobile initialData={initialData} />
    </>
  );
}