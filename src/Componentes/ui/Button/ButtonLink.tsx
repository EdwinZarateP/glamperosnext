/* src/Componentes/ui/Button/ButtonLink.tsx */

import Link from 'next/link';
import styles from './Button.module.css';
import { ButtonLinkProps } from './Button.types';

/* ============================================================
   COMPONENTE BUTTON LINK
   Siempre renderiza <Link> de Next.js (→ <a> en el DOM).
   Para acciones usa Button.

   Por qué un componente separado y no asChild:
   - <a> dentro de <button> es HTML inválido
   - Separar acción de navegación hace el código más semántico
   - Sin cloneElement ni lógica de Slot: más simple y predecible
   ============================================================ */

export function ButtonLink({
  children,
  variant = 'primario',
  size = 'md',
  fullWidth = false,
  iconOnly = false,
  iconLeft,
  iconRight,
  external = false,
  className = '',
  ...rest
}: ButtonLinkProps) {
  const rootClass = [
    styles.btn,
    styles[variant],
    size !== 'md' && styles[size],
    fullWidth && styles.bloque,
    iconOnly && styles.icono,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const externalProps = external
    ? { target: '_blank', rel: 'noopener noreferrer' }
    : {};

  return (
    <Link className={rootClass} {...externalProps} {...rest}>
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
    </Link>
  );
}
