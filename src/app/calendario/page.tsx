import { Suspense } from "react";
import CalendarioContenido from "./CalendarioContenido";
import LottieFallback from "../../Componentes/LottieFallback";
import "./estilos.css";

export default function Page() {
  return (
    <Suspense fallback={<LottieFallback />}>
      <CalendarioContenido />
    </Suspense>
  );
}
