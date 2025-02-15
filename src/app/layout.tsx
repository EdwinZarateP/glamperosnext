// src/app/layout.tsx
import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import ClientProviders from "@/Componentes/ClientProviders/index";

const openSans = Open_Sans({ subsets: ["latin"], weight: "400", display: "optional" });

export const metadata: Metadata = {
  metadataBase: new URL("https://glamperos.com"),
  title: "Glamperos | Encuentra y reserva los mejores glampings",
  description: "Explora y reserva glampings exclusivos en los mejores destinos naturales.",
  keywords: "glamping, camping de lujo, reservas de glamping, turismo, naturaleza",
  robots: "index, follow",
  openGraph: {
    title: "Glamperos - Encuentra y reserva glampings exclusivos",
    description: "Explora y reserva glampings en destinos naturales únicos.",
    url: "https://glamperos.com",
    siteName: "Glamperos",
    images: [
      {
        url: "https://storage.googleapis.com/glamperos-imagenes/Imagenes/animal5.jpeg",
        width: 1200,
        height: 630,
        alt: "Glamperos - Encuentra y reserva los mejores glampings",
      },
    ],
    type: "website",
  },
  other: {
    "theme-color": "#ffffff",
    author: "Glamperos",
    fragment: "!",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head />
      <body
        className={`${openSans.className}`}
      >
        <ClientProviders>{children}</ClientProviders>
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=TU_API_KEY&libraries=places`}
          strategy="afterInteractive"
        />
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
