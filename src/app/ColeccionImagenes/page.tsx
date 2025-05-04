// app/ColeccionImagenes/page.tsx

"use client";

import { Suspense } from "react";
import FotosCollage from '../../Componentes/FotosCollage';
import HeaderIcono from '../../Componentes/HeaderIcono';
import './estilos.css';

export default function ColeccionImagenes() {
  return (
    <div className="ColeccionImagenes-contenedor">
      <HeaderIcono descripcion="Glamperos" />

      <Suspense fallback={<div>Cargando imágenes…</div>}>
        <FotosCollage />
      </Suspense>
    </div>
  );
}
