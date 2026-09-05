import { type ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', isLoading, disabled, children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-300 ease-out rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-indigo disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden';

    const variants = {
      primary: [
        'bg-gradient-to-r from-accent-indigo to-accent-purple text-white',
        'shadow-[0_0_20px_rgba(99,102,241,0.3),inset_0_1px_0_rgba(255,255,255,0.15)]',
        'hover:shadow-[0_0_30px_rgba(99,102,241,0.45),inset_0_1px_0_rgba(255,255,255,0.2)]',
        'hover:from-accent-indigo-light hover:to-accent-purple',
        'active:scale-[0.97]',
        'gradient-border',
      ].join(' '),
      secondary: [
        'bg-white text-text-primary border border-slate-200',
        'hover:bg-slate-50 hover:border-accent-indigo/40',
        'hover:shadow-[0_0_20px_rgba(99,102,241,0.12)]',
        'active:scale-[0.97]',
      ].join(' '),
      ghost: 'text-text-secondary hover:text-text-primary hover:bg-slate-100 active:bg-slate-200/70',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm gap-1.5',
      md: 'px-4 py-2.5 text-sm gap-2',
      lg: 'px-6 py-3.5 text-base gap-2.5',
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {/* Shimmer sweep overlay for primary */}
        {variant === 'primary' && (
          <span
            className="absolute inset-0 pointer-events-none"
            aria-hidden="true"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.12) 50%, transparent 100%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 3s ease-in-out infinite',
            }}
          />
        )}
        {isLoading && (
          <svg className="animate-spin h-4 w-4 relative z-10" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        <span className="relative z-10 inline-flex items-center gap-2 whitespace-nowrap">{children}</span>
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
