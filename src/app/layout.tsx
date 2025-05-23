// src/app/layout.tsx
import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import ClientProviders from "../Componentes/ClientProviders/index";

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: "400",
  display: "optional",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://glamperos.com"),
  title: "Glamperos | Encuentra y reserva los mejores glampings en Colombia",
  description:
    "Descubre y reserva glampings exclusivos en los mejores destinos naturales de Colombia. Vive una experiencia única en alojamientos de lujo en medio de la naturaleza.",
  robots: { index: true, follow: true },
  openGraph: {
    title: "Glamperos | Encuentra y reserva los mejores glampings en Colombia",
    description:
      "Explora glampings exclusivos en Colombia y vive una experiencia de lujo en la naturaleza. Reserva fácil y rápido.",
    url: "https://glamperos.com",
    siteName: "Glamperos",
    images: [
      {
        url: "https://storage.googleapis.com/glamperos-imagenes/Imagenes/animal5.jpeg",
        width: 1200,
        height: 630,
        alt: "Glamperos - Glamping de lujo en Colombia",
      },
    ],
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@glamperos",
    title: "Glamperos | Encuentra y reserva los mejores glampings en Colombia",
    description:
      "Descubre glampings exclusivos en Colombia y vive una experiencia de lujo en la naturaleza.",
    images: [
      "https://storage.googleapis.com/glamperos-imagenes/Imagenes/animal5.jpeg",
    ],
  },
  alternates: { canonical: "https://glamperos.com" },
};

export const viewport = {
  width: "device-width",
  initialScale: 1
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <meta
          name="google-site-verification"
          content="TU-CODIGO-DE-VERIFICACION"
        />
        {/* Carga el web component de Lottie antes de renderizar */}
        <Script
          src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js"
          strategy="beforeInteractive"
        />
        <Script
          src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDP8Es7GVLkm_qdCItKb60pGH7ov_tEif0&libraries=places"
          strategy="beforeInteractive"
        />
        <Script type="application/ld+json" strategy="afterInteractive">
          {`
            {
              "@context": "https://schema.org",
              "@type": "TravelAgency",
              "name": "Glamperos",
              "url": "https://glamperos.com",
              "description": "Plataforma para descubrir y reservar glampings exclusivos en Colombia.",
              "logo": "https://storage.googleapis.com/glamperos-imagenes/Imagenes/animal5.jpeg",
              "sameAs": [
                "https://www.instagram.com/glamperos",
                "https://www.facebook.com/glamperos"
              ]
            }
          `}
        </Script>
      </head>
      <body className={openSans.className}>
        <ClientProviders>{children}</ClientProviders>
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-NXB4CM5T4H"
        />
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
