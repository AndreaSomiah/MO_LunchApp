import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export const Badge = ({ className, ...rest }: HTMLAttributes<HTMLSpanElement>): JSX.Element => (
  <span
    className={cn(
      'inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700',
      className
    )}
    {...rest}
  />
);
