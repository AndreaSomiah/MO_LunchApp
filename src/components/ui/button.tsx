import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium ' +
    'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ' +
    'disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:   'bg-brand text-white hover:bg-brand-500',
        secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200',
        outline:   'border border-slate-300 bg-white text-slate-900 hover:bg-slate-50',
        ghost:     'bg-transparent text-slate-700 hover:bg-slate-100',
        destructive: 'bg-red-600 text-white hover:bg-red-700',
        link:      'bg-transparent text-brand underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-8 px-3',
        md: 'h-10 px-4',
        lg: 'h-12 px-6 text-base',
        icon: 'h-9 w-9 p-0',
      },
    },
    defaultVariants: { variant: 'default', size: 'md' },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = 'button', ...rest }, ref) => (
    <button ref={ref} type={type} className={cn(buttonVariants({ variant, size }), className)} {...rest} />
  )
);
Button.displayName = 'Button';
