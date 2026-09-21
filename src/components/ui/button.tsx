import { ButtonHTMLAttributes, forwardRef } from 'react';

type Variant = 'primary' | 'outline';

export const Button = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }>(
  ({ variant = 'primary', className = '', ...props }, ref) => {
    const base = 'rounded-lg px-4 py-2 text-sm font-semibold transition-colors';
    const styles =
      variant === 'primary'
        ? 'bg-accent text-white hover:bg-indigo-700'
        : 'bg-white text-ink border border-border hover:bg-gray-50';
    return <button ref={ref} className={`${base} ${styles} ${className}`} {...props} />;
  }
);
Button.displayName = 'Button';
