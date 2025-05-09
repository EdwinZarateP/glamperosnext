// src/app/glampings/[...filtros]/page.tsx

import TarjetasEcommerce from "../../../Componentes/TarjetasEcommerce";

interface PageProps {
  params: { filtros?: string[] };
}

export default function Page({ params }: PageProps) {
  return <TarjetasEcommerce filtros={params.filtros || []} />;
}
