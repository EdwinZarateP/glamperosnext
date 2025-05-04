"use client";

import { Suspense } from "react";
import GraciasContenido from "./GraciasContenido";

const GraciasPage = () => {
  return (
    <Suspense fallback={<p className="GraciasMensaje">Cargando información...</p>}>
      <GraciasContenido />
    </Suspense>
  );
};

export default GraciasPage;
