// src/fonts.ts
import localFont from 'next/font/local';
import { Work_Sans } from 'next/font/google';

// Fuente Bantayog
export const bantayog = localFont({
  src: [
    {
      path: '../public/Fuentes/Bantayog-Light.woff2',
      weight: '300', // Light ≈ 300
      style: 'normal',
    },
    {
      path: '../public/Fuentes/Bantayog-Semilight.woff2',
      weight: '400', // Semilight ≈ 400-500
      style: 'normal',
    },
    {
      path: '../public/Fuentes/Bantayog-Regular.woff2',
      weight: '500', // Regular ≈ 500-600
      style: 'normal',
    },
    // Agrega más si tienes Bold u otros pesos
  ],
  variable: '--font-bantayog', // Variable CSS para usarla fácilmente
  display: 'swap', // Evita flash de texto sin estilo (FOUT)
  fallback: ['sans-serif'], // Fallback si falla la carga
});

// Fuente Work Sans
export const workSans = Work_Sans({
  subsets: ['latin'],
  variable: '--font-work-sans',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'], // incluye SemiBold (600)
});
