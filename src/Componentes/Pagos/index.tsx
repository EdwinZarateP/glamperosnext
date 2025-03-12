"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    WidgetCheckout?: any;
  }
}

const PUBLIC_KEY = "pub_test_XqijBLlWjkdPW4ymCgi2XPTLLlN2ykne"; // Llave pública de pruebas
const MONTO_CENTAVOS = 5000000; // 50.000 COP en centavos

const Pagos = () => {
  const [referencia, setReferencia] = useState("");

  useEffect(() => {
    // Generar referencia única de pago
    const timestamp = new Date().getTime();
    setReferencia(`REF-${timestamp}`);

    // Cargar el script de Wompi si no existe
    const scriptId = "wompi-widget-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://checkout.wompi.co/widget.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const abrirWidget = async () => {
    try {
      // 1) Llamamos a nuestro backend para generar la firma
      const response = await fetch(
        `https://glamperosapi.onrender.com/wompi/generar-firma?referencia=${referencia}&monto=${MONTO_CENTAVOS}&moneda=COP`
      );
      const data = await response.json();

      if (!data.firma_integridad) {
        console.error("No se pudo obtener la firma de integridad");
        return;
      }

      // 2) Abrir el widget
      if (window.WidgetCheckout) {
        const checkout = new window.WidgetCheckout({
          currency: "COP",
          amountInCents: MONTO_CENTAVOS,
          reference: referencia,
          publicKey: PUBLIC_KEY,
          redirectUrl: "https://glamperos.com/gracias",
          signature: {
            integrity: data.firma_integridad, // 🔥 Agregamos la firma
          },
        });

        checkout.open((result: any) => {
          console.log("Resultado de la transacción:", result);
        });
      } else {
        console.error("El widget de Wompi no se ha cargado correctamente.");
      }
    } catch (error) {
      console.error("Error al obtener la firma de integridad:", error);
    }
  };

  return (
    <div className="pagos-container">
      <h2>Pagar con Wompi</h2>
      <p>Presiona el botón para pagar <strong>$50.000 COP</strong></p>
      <button className="boton-pago" onClick={abrirWidget}>
        Pagar con Wompi
      </button>
    </div>
  );
};

export default Pagos;
