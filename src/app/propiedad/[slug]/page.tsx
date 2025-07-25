export const dynamic = 'force-dynamic';

import { ObtenerGlampingPorId } from '@/Funciones/ObtenerGlamping';
import GlampingCliente from './GlampingCliente';
import EncabezadoExplorado from '@/Componentes/EncabezadoExplorado';
import ImagenesExploradas from '@/Componentes/ImgExploradas';
import HeaderIcono from "@/Componentes/HeaderIcono";
import Footer from "@/Componentes/Footer";
import type { Metadata } from 'next';
import './estilos.css';

type PageProps = {
  params: { slug: string };
  searchParams: Record<string, string | undefined>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const glamping = await ObtenerGlampingPorId(params.slug);

  const tipo = glamping?.tipoGlamping === 'cabana' ? 'Cabaña' : glamping?.tipoGlamping || 'Glamping';
  const ciudad = glamping?.ciudad_departamento?.split(' - ')[0] || 'Colombia';

  const titulo = `${tipo} en ${ciudad}`;
  const descripcion = glamping?.descripcionGlamping?.slice(0, 150) || 'Explora una experiencia única de glamping en Colombia.';
  const imagenOG = glamping?.imagenes?.[0] || 'https://glamperos.com/og-default.jpg';
  const url = `https://glamperos.com/propiedad/${params.slug}`;

  return {
    title: titulo,
    description: descripcion,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: titulo,
      description: descripcion,
      type: 'website',
      url,
      images: [
        {
          url: imagenOG,
          width: 1200,
          height: 630,
          alt: titulo,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: titulo,
      description: descripcion,
      images: [imagenOG],
    },
  };
}

export default async function Page({ params, searchParams }: PageProps) {
  const glamping = await ObtenerGlampingPorId(params.slug);

  if (!glamping) {
    return <p className="propiedad-error">No se encontró el glamping.</p>;
  }

  const nombreGlamping = `${
    glamping?.tipoGlamping === 'cabana' ? 'Cabaña' : glamping?.tipoGlamping
  } en ${glamping?.ciudad_departamento?.split(' - ')[0]}`;

  return (
    <div className="propiedad-container-principal">
      {/* Encabezado SSR */}
      <header className="propiedad-header">
        <HeaderIcono descripcion="Glamperos" />
      </header>

      <main className="propiedad-container">
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
      </main>

      <footer className="propiedad-footer">
        <Footer />
      </footer>
    </div>
  );
}
