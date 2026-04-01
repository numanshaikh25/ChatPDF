import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', style, ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center gap-2 rounded-lg font-medium ' +
      'transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 ' +
      'focus-visible:ring-ring focus-visible:ring-offset-1 ' +
      'disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]'

    const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
      primary:     'text-white shadow-sm hover:opacity-90',
      secondary:   'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      outline:     'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
      ghost:       'hover:bg-accent hover:text-accent-foreground',
      destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm',
    }

    const sizes: Record<NonNullable<ButtonProps['size']>, string> = {
      sm: 'h-8 px-3 text-xs',
      md: 'h-9 px-4 text-sm',
      lg: 'h-11 px-6 text-sm',
    }

    const gradientStyle =
      variant === 'primary'
        ? { background: 'var(--gradient-brand)', ...style }
        : style

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        style={gradientStyle}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'

export { Button }
