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

// ---------------------------------------
// METADATA (Next.js App Router)
// ---------------------------------------
export const metadata: Metadata = {
  metadataBase: new URL("https://glamperos.com"),
  title: "Glamperos | Encuentra y reserva los mejores glampings en Colombia",
  description:
    "Descubre y reserva glampings exclusivos en los mejores destinos naturales de Colombia. Vive una experiencia única en alojamientos de lujo en medio de la naturaleza.",

  viewport: {
    width: "device-width",
    initialScale: 1,
  },

  robots: {
    index: true,
    follow: true,
  },

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

  alternates: {
    canonical: "https://glamperos.com",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        {/* ✅ Favicon actualizado */}
        <link
          rel="icon"
          type="image/jpeg"
          href="/Imagenes/animal5.ico"
        />

        {/* ✅ Verificación de Google Search Console */}
        <meta name="google-site-verification" content="TU-CODIGO-DE-VERIFICACION" />

        {/* ✅ Google Maps API */}
        <Script
          src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDP8Es7GVLkm_qdCItKb60pGH7ov_tEif0&libraries=places"
          strategy="beforeInteractive"
        />

        {/* ✅ JSON-LD para SEO */}
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

        {/* ✅ Google Analytics (GA4) */}
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
