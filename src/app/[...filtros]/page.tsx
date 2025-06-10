// src/app/[...filtros]/page.tsx

import TarjetasEcommerce from '@/Componentes/TarjetasEcommerce';
import MenuUsuariosInferior from '@/Componentes/MenuUsuariosInferior';
import Footer from "@/Componentes/Footer";

interface Props {
  params: { filtros?: string[] };
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
