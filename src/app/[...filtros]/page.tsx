// src/app/[...filtros]/page.tsx

import TarjetasEcommerce from "@/Componentes/TarjetasEcommerce";
import MenuUsuariosInferior from "@/Componentes/MenuUsuariosInferior";
import Footer from "@/Componentes/Footer";
import { Metadata } from "next";

interface Props {
  params: { filtros?: string[] };
}

// ✅ genera el metadata dinámico con canonical
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const filtros = params.filtros || [];
  const path = filtros.join("/");
  const url = `https://glamperos.com/${path}`;

  return {
    title: "Glampings filtrados | Glamperos", // puedes personalizar el título dinámico si deseas
    description: "Encuentra y reserva los mejores glampings filtrados.",
    alternates: {
      canonical: url,
    },
  };
}

export default async function FiltradosPage({ params: { filtros = [] } }: Props) {
  return (
    <div className="GlampingsPage-container">
      <div className="GlampingsPage-tarjetas">
        <TarjetasEcommerce filtros={filtros} />
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
