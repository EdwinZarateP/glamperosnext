// Archivo: /propiedad/[slug]/page.tsx

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

// ✅ CORREGIDO: Desestructuración directa en el argumento
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const glamping = await ObtenerGlampingPorId(params.slug);

  return {
    title: `Reserva tu experiencia | Glamperos`,
    description:
      glamping?.descripcionGlamping?.slice(0, 150) ??
      'Explora una experiencia única de glamping en Colombia.',
    alternates: {
      canonical: `https://glamperos.com/propiedad/${params.slug}`,
    },
  };
}

// ✅ CORREGIDO: sin desestructurar `params` dentro de la función
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

      <footer className='propiedad-footer'>
        <Footer />
      </footer>
    </div>
  );
}
