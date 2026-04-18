import React from 'react';

export type ButtonVariant =
  | 'primario'
  | 'secundario'
  | 'terciario'
  | 'fantasma';

export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  iconOnly?: boolean;

  // 🔥 Nuevas props
  loading?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;

  // 🔥 Para usar como Link / anchor
  asChild?: boolean;
  children: React.ReactNode;
}
