/* Componentes/ui/Button.tsx */
import React from 'react';
import styles from './Button.module.css';
import { ButtonProps } from './Button.types';

/* ============================================================
   HELPER — composición de clases
   ============================================================ */

function buildClassName(
  variant: string,
  size: string,
  fullWidth: boolean,
  iconOnly: boolean,
  loading: boolean,
  className: string,
): string {
  return [
    styles.btn,
    styles[variant],
    size !== 'md' && styles[size],
    fullWidth && styles.bloque,
    iconOnly && styles.icono,
    loading && styles.cargando,
    className,
  ]
    .filter(Boolean)
    .join(' ');
}


/* ============================================================
   COMPONENTE BUTTON
   Siempre renderiza <button>. Para navegación usa ButtonLink.
   ============================================================ */

export function Button({
  children,
  variant = 'primario',
  size = 'md',
  fullWidth = false,
  iconOnly = false,
  loading = false,
  iconLeft,
  iconRight,
  className = '',
  disabled,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const rootClass = buildClassName(
    variant, size, fullWidth, iconOnly, loading, className,
  );

  return (
    <button
      className={rootClass}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      aria-disabled={isDisabled || undefined}
      {...rest}
    >
      {iconLeft && (
        <span className={styles.iconoSlot} aria-hidden="true">
          {iconLeft}
        </span>
      )}

      {!iconOnly && children && (
        <span className={styles.texto}>{children}</span>
      )}

      {iconRight && (
        <span className={styles.iconoSlot} aria-hidden="true">
          {iconRight}
        </span>
      )}
    </button>
  );
}
