// app/ExplorarGlamping/page.tsx
import { Suspense } from "react";
import dynamic from "next/dynamic";
import animationData from "../../Componentes/Animaciones/AnimationPuntos.json";
import ExplorarGlampingContenido from "./ExplorarGlampingContenido";
import "./estilos.css";

interface MyLottieProps {
  animationData: unknown;
  loop?: boolean;
  autoplay?: boolean;
  style?: React.CSSProperties;
}

const Lottie = dynamic<MyLottieProps>(
  () => import("lottie-react").then((mod) => mod.default as React.ComponentType<MyLottieProps>),
  { ssr: false }
);

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="lottie-container">
          <Lottie
            animationData={animationData}
            loop
            autoplay
            style={{ height: 200, width: "100%", margin: "auto" }}
          />
        </div>
      }
    >
      <ExplorarGlampingContenido />
    </Suspense>
  );
}
