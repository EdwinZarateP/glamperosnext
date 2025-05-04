"use client";

import dynamic from "next/dynamic";
import animationData from "./Animaciones/AnimationPuntos.json"; // ajusta si tu ruta es diferente

interface MyLottieProps {
  animationData: unknown;
  loop?: boolean;
  autoplay?: boolean;
  style?: React.CSSProperties;
}

const Lottie = dynamic<MyLottieProps>(
  () =>
    import("lottie-react").then((mod) =>
      mod.default as React.ComponentType<MyLottieProps>
    ),
  { ssr: false }
);

export default function LottieFallback() {
  return (
    <div className="lottie-container">
      <Lottie
        animationData={animationData}
        loop
        autoplay
        style={{ height: 200, width: "100%", margin: "auto" }}
      />
    </div>
  );
}
