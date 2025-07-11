// src/app/[...filtros]/page.tsx

import TarjetasEcommerceServer from "@/Componentes/TarjetasEcommerce/TarjetasEcommerceServer";
import MenuUsuariosInferior from "@/Componentes/MenuUsuariosInferior";
import Footer from "@/Componentes/Footer";
import { Metadata } from "next";

interface Props {
  params: { filtros?: string[] };
}

// ✅ Metadata dinámico con await params
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { filtros = [] } = await params;

  // 🔍 Lista de ciudades (ajústala según tu base de datos)
  const ciudades = ["bogota", "medellin", "cali"];

  // Determina segmento canónico: ciudad o primer filtro
  let canonicalSegment = "";
  if (filtros.length > 0) {
    const primerFiltro = filtros[0].toLowerCase();
    canonicalSegment = primerFiltro;
    // Si es ciudad, úsala; si no, también usamos el primer filtro
    if (!ciudades.includes(primerFiltro)) {
      canonicalSegment = primerFiltro;
    }
  }

  // Construye URL canónica (homepage si está vacío)
  const url = `https://glamperos.com${canonicalSegment ? `/${canonicalSegment}` : ""}`;

  // Prepara title y description usando todos los filtros
  const filtrosCapitalizados = filtros.map(f =>
    f.charAt(0).toUpperCase() + f.slice(1)
  );

  let filtrosTexto = "";
  if (filtrosCapitalizados.length === 1) {
    filtrosTexto = filtrosCapitalizados[0];
  } else if (filtrosCapitalizados.length === 2) {
    filtrosTexto = `${filtrosCapitalizados[0]} y ${filtrosCapitalizados[1]}`;
  } else if (filtrosCapitalizados.length > 2) {
    filtrosTexto = `${filtrosCapitalizados.slice(0, -1).join(", ")} y ${filtrosCapitalizados.slice(-1)}`;
  }

  const descBase = filtrosCapitalizados.length > 0
    ? `Explora glampings en ${filtrosTexto} y vive una experiencia única de lujo en la naturaleza. Reserva fácil y rápido en Glamperos.`
    : "Explora glampings exclusivos en Colombia y vive una experiencia de lujo en la naturaleza. Reserva fácil y rápido.";

  const title = filtrosCapitalizados.length > 0
    ? `Glampings en ${filtrosTexto} | Glamperos`
    : "Glampings en Colombia | Glamperos";

  return {
    title,
    description: descBase,
    alternates: {
      canonical: url,
    },
  };
}

// ✅ Server Component con await params
export default async function FiltradosPage({ params }: Props) {
  const { filtros = [] } = await params;

  return (
    <div className="GlampingsPage-container">
      <div className="GlampingsPage-tarjetas">
        <TarjetasEcommerceServer filtros={filtros} />
      </div>

      <div className="GlampingsPage-Footer">
        <Footer />
      </div>

      <div className="GlampingsPage-menu">
        <MenuUsuariosInferior />
      </div>
    </div>
  );
}
