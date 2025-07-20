// Archivo: /propiedad/[slug]/page.tsx

export const dynamic = 'force-dynamic';

import { ObtenerGlampingPorId } from '@/Funciones/ObtenerGlamping';
import GlampingCliente from './GlampingCliente';
import EncabezadoExplorado from '@/Componentes/EncabezadoExplorado';
import ImagenesExploradas from '@/Componentes/ImgExploradas';
import NombreGlamping from "@/Componentes/NombreGlamping";
import type { Metadata } from 'next';
import './estilos.css';

type PageProps = {
  params: { slug: string };
  searchParams: Record<string, string | undefined>;
};

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const glamping = await ObtenerGlampingPorId(params.slug);
  return {
    title: `Reserva tu experiencia | Glamperos`,
    description: glamping?.descripcionGlamping?.slice(0, 150) ?? 'Explora una experiencia única de glamping en Colombia.',
    alternates: {
      canonical: `https://glamperos.com/propiedad/${params.slug}`,
    },
  };
}

export default async function Page({ params, searchParams }: PageProps) {
  const { slug } = params;
  const glamping = await ObtenerGlampingPorId(slug);

  if (!glamping) {
    return <p className="propiedad-error">No se encontró el glamping.</p>;
  }

  const nombreGlamping = `${
    glamping?.tipoGlamping === 'cabana' ? 'Cabaña' : glamping?.tipoGlamping
  } en ${glamping?.ciudad_departamento?.split(' - ')[0]}`;

  return (
    <main className="propiedad-container">
      {/* Encabezado SSR */}
      <header className="propiedad-header">
        <h1>Aca va el encabezado</h1>
      </header>

      <section className="propiedad-encabezado">
        <EncabezadoExplorado nombreGlamping={nombreGlamping} />
      </section>

      {/* Imágenes SSR */}
      <section className="propiedad-imagenes">
        {glamping.imagenes?.length > 0 ? (
          <ImagenesExploradas
            imagenes={glamping.imagenes}
            video_youtube={glamping.video_youtube}
            Acepta_Mascotas={glamping.Acepta_Mascotas}
          />
        ) : (
          <div className="propiedad-lottie">(Lottie de carga)</div>
        )}
      </section>

      {/* Cliente con lógica JS */}
      <GlampingCliente initialData={glamping} initialParams={searchParams} />

      
      {/* Título */}
      <section className="propiedad-tipo-ubicacion">
        <NombreGlamping
        nombreGlamping={`${
            glamping.tipoGlamping === 'cabana' ? 'Cabaña' : glamping.tipoGlamping
        } en ${glamping.ciudad_departamento.split(" - ")[0]}`}
        />        
      </section>

    </main>
  );
}
