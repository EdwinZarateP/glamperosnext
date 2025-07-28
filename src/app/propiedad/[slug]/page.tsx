// app/propiedad/[slug]/page.tsx
export const dynamic = "force-dynamic";

import { ObtenerGlampingPorId } from "@/Funciones/ObtenerGlamping";
import GlampingCliente from "./GlampingCliente";
import EncabezadoExplorado from "@/Componentes/EncabezadoExplorado";
import ImagenesExploradas from "@/Componentes/ImgExploradas";
import HeaderIcono from "@/Componentes/HeaderIcono";
import Footer from "@/Componentes/Footer";
import GlampingCercanos from "@/Componentes/GlampingCercanos";
import type { Metadata } from "next";
import "./page.css";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const glamping = await ObtenerGlampingPorId(slug);
  const tipo =
    glamping?.tipoGlamping === "cabana"
      ? "Cabaña"
      : glamping?.tipoGlamping || "Glamping";
  const ciudad =
    glamping?.ciudad_departamento?.split(" - ")[0] || "Colombia";
  const titulo = `${tipo} en ${ciudad}`;
  const descripcion =
    glamping?.descripcionGlamping?.slice(0, 150) ||
    "Explora una experiencia única de glamping en Colombia.";
  const imagenOG =
    glamping?.imagenes?.[0] || "https://glamperos.com/og-default.jpg";
  const url = `https://glamperos.com/propiedad/${slug}`;

  return {
    title: titulo,
    description: descripcion,
    alternates: { canonical: url },
    openGraph: {
      title: titulo,
      description: descripcion,
      type: "website",
      url,
      images: [
        { url: imagenOG, width: 1200, height: 630, alt: titulo },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: titulo,
      description: descripcion,
      images: [imagenOG],
    },
  };
}

export default async function Page({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const glamping = await ObtenerGlampingPorId(slug);

  if (!glamping) {
    return <p className="propiedad-error">No se encontró el glamping.</p>;
  }

  const ubicacion =
    typeof glamping.ubicacion === "string"
      ? JSON.parse(glamping.ubicacion)
      : glamping.ubicacion;

  const nombreGlamping = `${
    glamping.tipoGlamping === "cabana" ? "Cabaña" : glamping.tipoGlamping
  } en ${glamping.ciudad_departamento.split(" - ")[0]}`;

  return (
    <div className="propiedad-container-principal">
      <header className="propiedad-header">
        <HeaderIcono descripcion="Glamperos" />
      </header>

      <main className="propiedad-container">
        <section className="propiedad-encabezado">
          <EncabezadoExplorado nombreGlamping={nombreGlamping} />
        </section>

        <section className="propiedad-imagenes">
          {glamping.imagenes?.length ? (
            <ImagenesExploradas
              imagenes={glamping.imagenes}
              video_youtube={glamping.video_youtube}
              Acepta_Mascotas={glamping.Acepta_Mascotas}
            />
          ) : (
            <div>(Lottie de carga)</div>
          )}
        </section>

        <section className="propiedad-informacion-cliente">
          <GlampingCliente
            initialData={glamping}
            initialParams={resolvedSearchParams}
          />
        </section>

        {ubicacion?.lat && ubicacion?.lng && (
          <GlampingCercanos
            lat={ubicacion.lat}
            lng={ubicacion.lng}
            searchParams={resolvedSearchParams}
          />
        )}
      </main>

      <footer className="propiedad-footer">
        <Footer />
      </footer>
    </div>
  );
}