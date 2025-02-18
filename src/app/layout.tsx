// src/app/layout.tsx
import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import ClientProviders from "@/Componentes/ClientProviders/index";

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: "400",
  display: "optional",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://glamperos.com"),
  title: "Glamperos | Encuentra y reserva los mejores glampings",
  description: "Explora y reserva glampings exclusivos en los mejores destinos naturales.",
  // Más metadata...
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        {/* Aquí podrías añadir <link> o <meta> extra si lo deseas */}
        <Script          
          src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDP8Es7GVLkm_qdCItKb60pGH7ov_tEif0&libraries=places"
          // Cambia el strategy
          strategy="beforeInteractive"
        />
      </head>
      <body className={openSans.className}>
        <ClientProviders>{children}</ClientProviders>

        {/* Google Tag Manager / Analytics */}
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-NXB4CM5T4H" />
        <Script id="google-analytics" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-NXB4CM5T4H');
          `}
        </Script>
      </body>
    </html>
  );
}
