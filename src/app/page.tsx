// src/app/page.tsx
import React from "react";
import TarjetasEcommerceServer from "@/Componentes/TarjetasEcommerce/TarjetasEcommerceServer";
import MenuUsuariosInferior from "@/Componentes/MenuUsuariosInferior";
import "./page.css";

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
