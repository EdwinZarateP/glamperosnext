"use client";

import { Suspense } from "react";
import EditarGlamping from "../../Componentes/EditarGlamping";
import HeaderIcono from "../../Componentes/HeaderIcono";
import MenuUsuariosInferior from "../../Componentes/MenuUsuariosInferior";
import "./estilos.css";

export default function EdicionGlamping() {
  return (
    <div className="EdicionGlamping-contenedor">
      <HeaderIcono descripcion="Glamperos" />

      <Suspense fallback={<div>Cargando edición del glamping...</div>}>
        <EditarGlamping />
      </Suspense>

      <MenuUsuariosInferior />
    </div>
  );
}
