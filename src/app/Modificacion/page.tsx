// app/Modificacion/page.tsx

import React, { Suspense } from "react";
import HeaderIcono from "@/Componentes/HeaderIcono";
import ModificarGlamping from "@/Componentes/ModificarGlamping";
import ModificarFotos from "@/Componentes/ModificarFotos";
import "./estilos.css";

export default function Modificacion() {
  return (
    <div className="Modificacion-contenedor">
      <HeaderIcono descripcion="Glamperos" />

      <h1 className="Modificacion-titulo">Modificar datos del glamping</h1>
      <Suspense fallback={<div>Cargando formulario…</div>}>
        <ModificarGlamping />
      </Suspense>

      <h1 className="Modificacion-titulo">Modifica tus fotos</h1>
      <Suspense fallback={<div>Cargando fotos…</div>}>
        <ModificarFotos />
      </Suspense>
    </div>
  );
}
