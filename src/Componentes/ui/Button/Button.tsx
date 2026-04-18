import React from 'react';
import styles from './Button.module.css';
import { ButtonProps } from './Button.types';

export const Button = React.forwardRef<
  HTMLButtonElement,
  ButtonProps
>((props, ref) => {
  const {
    children,
    variant = 'primario',
    size = 'md',
    fullWidth = false,
    iconOnly = false,
    loading = false,
    iconLeft,
    iconRight,
    asChild = false,
    className = '',
    disabled,
    ...rest
  } = props;

  const isDisabled = disabled || loading;

  const classNames = [
    styles.btn,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    iconOnly && styles.iconOnly,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      {loading && <span className={styles.loader} />}

      <span className={`${styles.content} ${loading ? styles.hidden : ''}`}>
        {iconLeft && <span>{iconLeft}</span>}
        {children}
        {iconRight && <span>{iconRight}</span>}
      </span>
    </>
  );

  // 🔥 asChild (para Link o <a>)
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      className: `${classNames} ${children.props.className || ''}`,
    });
  }

  return (
    <button
      ref={ref}
      className={classNames}
      disabled={isDisabled}
      {...rest}
    >
      {content}
    </button>
  );
});

Button.displayName = 'Button';