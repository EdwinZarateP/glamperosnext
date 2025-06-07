// pages/[...filtros].tsx

import TarjetasEcommerce from '@/Componentes/TarjetasEcommerce'
import MenuUsuariosInferior from '@/Componentes/MenuUsuariosInferior'
import Footer from "@/Componentes/Footer";

interface Props {
  params: { filtros?: string[] }
}

export default function FiltradosPage({ params }: Props) {
  const filtros = params.filtros ?? []

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
  )
}
