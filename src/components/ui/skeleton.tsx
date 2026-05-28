import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export const Skeleton = ({ className, ...rest }: HTMLAttributes<HTMLDivElement>): JSX.Element => (
  <div className={cn('animate-pulse rounded-md bg-slate-200', className)} {...rest} />
);
