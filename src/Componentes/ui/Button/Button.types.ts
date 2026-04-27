/* src/Componentes/ui/Button/Button.types.ts */

import React from 'react';
import { LinkProps } from 'next/link';

/* ============================================================
   VARIANTES Y TAMAÑOS
   ============================================================ */

export type ButtonVariant =
  | 'primario'
  | 'secundario'
  | 'terciario'
  | 'fantasma'
  | 'peligro';

export type ButtonSize = 'sm' | 'md' | 'lg';

/* ============================================================
   PROPS COMPARTIDAS (entre Button y ButtonLink)
   ============================================================ */

interface ButtonBaseProps {
  /** Variante visual. Default: 'primario' */
  variant?: ButtonVariant;

  /** Tamaño. Default: 'md' */
  size?: ButtonSize;

  /** Ocupa el 100% del ancho del contenedor */
  fullWidth?: boolean;

  /**
   * Modo solo ícono: padding cuadrado, aspect-ratio 1:1.
   * Úsalo sin children de texto y siempre con aria-label.
   */
  iconOnly?: boolean;

  /**
   * SVG a la izquierda del texto.
   * @example iconLeft={<IconSearch />}
   */
  iconLeft?: React.ReactNode;

  /**
   * SVG a la derecha del texto.
   * @example iconRight={<IconArrowRight />}
   */
  iconRight?: React.ReactNode;
}

/* ============================================================
   BUTTON — acción, siempre <button>
   ============================================================ */

export interface ButtonProps
  extends ButtonBaseProps, React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Deshabilita el botón y muestra un spinner */
  loading?: boolean;
}

/* ============================================================
   BUTTON LINK — navegación, siempre <Link> de Next.js
   ============================================================ */

export interface ButtonLinkProps extends ButtonBaseProps, LinkProps {
  children?: React.ReactNode;
  className?: string;

  /** Abre en pestaña nueva. Añade rel="noopener noreferrer" automáticamente */
  external?: boolean;
}
