import { forwardRef } from 'react';
import { Link } from 'react-router';
import styles from './Button.module.css';

export const Button = forwardRef(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    to,
    href,
    type = 'button',
    className = '',
    fullWidth = false,
    onDark = false,
    ...rest
  },
  ref
) {
  const classes = [
    styles.button,
    styles[variant] || styles.primary,
    styles[size] || styles.md,
    fullWidth ? styles.fullWidth : '',
    onDark ? 'focus-on-dark' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (to) {
    return (
      <Link ref={ref} to={to} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a ref={ref} href={href} className={classes} {...rest}>
        {children}
      </a>
    );
  }

  return (
    <button ref={ref} type={type} className={classes} {...rest}>
      {children}
    </button>
  );
});
