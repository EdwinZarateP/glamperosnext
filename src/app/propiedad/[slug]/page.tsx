// app/propiedad/[slug]/page.tsx
export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { ObtenerGlampingPorId } from "@/Funciones/ObtenerGlamping";

import GlampingCliente from "./GlampingCliente";
import EncabezadoExplorado from "@/Componentes/EncabezadoExplorado";
import ImagenesExploradas from "@/Componentes/ImgExploradas";
import HeaderIcono from "@/Componentes/HeaderIcono";
import Footer from "@/Componentes/Footer";
import GlampingCercanos from "@/Componentes/GlampingCercanos";

import "./page.css";

// =========================
// Helpers OG (precio + texto)
// =========================

// ✅ AJUSTA ESTO al incremento real que manejas (porcentaje)
// Ejemplo: 12 significa +12%
const INCREMENTO_PORC = 0;

const formatCOP = (n: number) => `$${Math.round(n).toLocaleString("es-CO")} COP`;

const aplicarIncremento = (valor: number) =>
  Math.round(valor * (1 + INCREMENTO_PORC / 100));

const aplicarDescuento = (valor: number, descuentoPorc?: number) => {
  const d = Number(descuentoPorc || 0);
  if (!d || d <= 0) return Math.round(valor);
  return Math.round(valor * (1 - d / 100));
};

const limpiarTexto = (t?: string) =>
  (t || "")
    .replace(/\s+/g, " ")
    .replace(/\r?\n/g, " ")
    .trim();

const normalizarOgImage = (img?: string) => {
  if (!img) return "https://glamperos.com/og-default.jpg";
  if (img.startsWith("http://") || img.startsWith("https://")) return img;
  if (img.startsWith("/")) return `https://glamperos.com${img}`;
  return `https://glamperos.com/${img}`;
};

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const glamping = await ObtenerGlampingPorId(slug);

  const tipo =
    glamping?.tipoGlamping === "cabana"
      ? "Cabaña"
      : glamping?.tipoGlamping || "Glamping";

  const ciudad = glamping?.ciudad_departamento?.split(" - ")[0] || "Colombia";
  const titulo = `${tipo} en ${ciudad}`;

  // ✅ Precio "Desde" (simple): precioEstandar -> descuento (si hay) -> incremento
  const precioBase = Number(glamping?.precioEstandar || 0);
  const descuentoPorc = Number(glamping?.descuento || 0);

  const precioConDescuento = aplicarDescuento(precioBase, descuentoPorc);
  const precioFinal = aplicarIncremento(precioConDescuento);

  const textoPrecio =
    precioFinal > 0 ? `Desde ${formatCOP(precioFinal)} / noche. ` : "";

  const descBase =
    limpiarTexto(glamping?.descripcionGlamping).slice(0, 150) ||
    "Explora una experiencia única de glamping en Colombia.";

  // WhatsApp corta rápido; dejamos margen
  const descripcion = `${textoPrecio}${descBase}`.slice(0, 200);

  const imagenOG = normalizarOgImage(glamping?.imagenes?.[0]);
  const url = `https://glamperos.com/propiedad/${slug}`;

  return {
    // Opcional pero recomendado para consistencia
    metadataBase: new URL("https://glamperos.com"),

    title: titulo,
    description: descripcion,
    alternates: { canonical: url },

    openGraph: {
      title: titulo,
      description: descripcion,
      type: "website",
      url,
      siteName: "Glamperos",
      images: [{ url: imagenOG, width: 1200, height: 630, alt: titulo }],
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
