// app/GestionarReserva/page.tsx

"use client";

import { Suspense } from "react";
import GestionReserva from "../../Componentes/GestionReserva";
import HeaderIcono from "../../Componentes/HeaderIcono";
import MenuUsuariosInferior from "../../Componentes/MenuUsuariosInferior";
import "./estilos.css";

export default function Page() {
  return (
    <div className="GestionarReserva-contenedor">
      <HeaderIcono descripcion="Glamperos" />

      <Suspense fallback={<div>Cargando gestión de reservas…</div>}>
        <GestionReserva />
      </Suspense>

      <MenuUsuariosInferior />
    </div>
  );
}
