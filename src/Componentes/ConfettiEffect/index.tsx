"use client";
import { useEffect } from "react";

const ConfettiEffect = () => {
  useEffect(() => {
    import("canvas-confetti").then((module) => {
      const confetti = module.default;
      // Creamos un canvas para el confeti
      const canvas = document.createElement("canvas");
      canvas.style.position = "fixed";
      canvas.style.top = "0";
      canvas.style.left = "0";
      canvas.style.width = "100vw";
      canvas.style.height = "100vh";
      canvas.style.pointerEvents = "none";
      canvas.style.zIndex = "9999";
      document.body.appendChild(canvas);

      const confettiInstance = confetti.create(canvas, { resize: true, useWorker: true });

      confettiInstance({
        particleCount: 200,
        spread: 120,
        origin: { x: 0.5, y: 0.5 },
      });

      // Eliminamos el canvas después de 5 segundos
      setTimeout(() => {
        document.body.removeChild(canvas);
      }, 5000);
    });
  }, []);

  return null;
};

export default ConfettiEffect;
