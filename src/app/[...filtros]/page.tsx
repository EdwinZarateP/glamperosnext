// src/app/[...filtros]/page.tsx

// import TarjetasEcommerce from "@/Componentes/TarjetasEcommerce";
import TarjetasEcommerceServer from "@/Componentes/TarjetasEcommerce/TarjetasEcommerceServer";
import MenuUsuariosInferior from "@/Componentes/MenuUsuariosInferior";
import Footer from "@/Componentes/Footer";
import { Metadata } from "next";

interface Props {
  params: { filtros?: string[] };
}

// ✅ Metadata dinámico con await params
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // await params para acceder a filtros sin warning
  const { filtros = [] } = await params;
  const path = filtros.join("/");
  const url = `https://glamperos.com/${path}`;

  // Capitaliza cada filtro
  const filtrosCapitalizados = filtros.map(f =>
    f.charAt(0).toUpperCase() + f.slice(1)
  );

  // Genera texto natural: filtro1, filtro2 y filtro3
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
  // await params para no romper la nueva regla de Next.js 15
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
