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

/* =====================================================
   🔒 LÓGICA OFICIAL DE RECARGO (server-safe)
   Mismo comportamiento que precioConRecargo.tsx
===================================================== */
const precioConRecargoServer = (precio: number): number => {
  if (precio <= 0) return 0;
  if (precio <= 299_999) return precio * 1.2;
  if (precio >= 300_000 && precio < 400_000) return precio * 1.16;
  if (precio >= 400_000 && precio < 500_000) return precio * 1.14;
  if (precio >= 500_000 && precio < 600_000) return precio * 1.13;
  if (precio >= 600_000 && precio < 800_000) return precio * 1.11;
  if (precio >= 800_000 && precio < 2_000_000) return precio * 1.1;
  return precio;
};

/* =====================================================
   Helpers
===================================================== */
const formatCOP = (n: number) =>
  `$${Math.round(n).toLocaleString("es-CO")} COP`;

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

// Capitaliza primera letra
const capFirst = (s: string) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1) : s;

// Normaliza el tipo de glamping
const tipoBonito = (tipoRaw?: string) => {
  const t = (tipoRaw || "Glamping").toLowerCase();

  const mapa: Record<string, string> = {
    cabana: "Cabaña",
    cabaña: "Cabaña",
    domo: "Domo",
    tiny_house: "Tiny house",
    tinyhouse: "Tiny house",
    casa_arbol: "Casa del árbol",
    casa_del_arbol: "Casa del árbol",
    tipi: "Tipi",
    chalet: "Chalet",
    contenedor: "Contenedor",
  };

  if (mapa[t]) return mapa[t];
  return capFirst(t.replace(/_/g, " "));
};

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
};

/* =====================================================
   METADATA (WhatsApp / OpenGraph)
===================================================== */
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const glamping = await ObtenerGlampingPorId(slug);

  const tipo = tipoBonito(glamping?.tipoGlamping);

  const ciudadRaw =
    glamping?.ciudad_departamento?.split(" - ")[0] || "Colombia";
  const ciudad = capFirst(ciudadRaw);

  // 💰 Precio base + recargo
  const precioBase = Number(glamping?.precioEstandar || 0);
  const precioFinal = precioConRecargoServer(precioBase);

  // ✅ PRECIO AFUERA → EN EL TÍTULO
  const titulo =
    precioFinal > 0
      ? `${tipo} en ${ciudad} · Desde ${formatCOP(precioFinal)} / noche`
      : `${tipo} en ${ciudad}`;

  // ✅ DESCRIPCIÓN LIMPIA (SIN PRECIO)
  const descripcion =
    limpiarTexto(glamping?.descripcionGlamping).slice(0, 180) ||
    "Explora una experiencia única de glamping en Colombia.";

  const imagenOG = normalizarOgImage(glamping?.imagenes?.[0]);
  const url = `https://glamperos.com/propiedad/${slug}`;

  return {
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
      card: "summary_large_image",
      title: titulo,
      description: descripcion,
      images: [imagenOG],
    },
  };
}

/* =====================================================
   PAGE
===================================================== */
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

  const nombreGlamping = `${tipoBonito(
    glamping.tipoGlamping
  )} en ${capFirst(glamping.ciudad_departamento.split(" - ")[0])}`;

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
