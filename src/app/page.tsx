// src/app/page.tsx
import React from "react";
import type { Metadata } from "next";
import TarjetasEcommerceServer from "@/Componentes/TarjetasEcommerce/TarjetasEcommerceServer";
import MenuUsuariosInferior from "@/Componentes/MenuUsuariosInferior";
import "./page.css";

// ✅ Canonical del home
export const metadata: Metadata = {
  alternates: { canonical: "/" },   // se resolverá a https://glamperos.com/ gracias a metadataBase del layout
  robots: { index: true, follow: true },
};

export default function GlampingsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  return (
    <>
      <div className="GlampingsPage-container">
        <div className="GlampingsPage-tarjetas">
          {/* En home no hay filtros de segmento, así que filtros: [] */}
          <TarjetasEcommerceServer filtros={[]} searchParams={searchParams} />
        </div>

        <div className="GlampingsPage-menu">
          <MenuUsuariosInferior />
        </div>
      </div>
    </>
  );
}
