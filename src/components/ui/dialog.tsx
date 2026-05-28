import * as DialogPrimitive from '@radix-ui/react-dialog';
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

const Overlay = forwardRef<
  ElementRef<typeof DialogPrimitive.Overlay>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...rest }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn('fixed inset-0 z-50 bg-black/50 backdrop-blur-sm', className)}
    {...rest}
  />
));
Overlay.displayName = 'DialogOverlay';

export interface DialogContentProps extends ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  children: ReactNode;
}

export const DialogContent = forwardRef<ElementRef<typeof DialogPrimitive.Content>, DialogContentProps>(
  ({ className, children, ...rest }, ref) => (
    <DialogPrimitive.Portal>
      <Overlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          'fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2',
          'rounded-lg border border-slate-200 bg-white p-6 shadow-lg focus:outline-none',
          className
        )}
        {...rest}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
);
DialogContent.displayName = 'DialogContent';

export const DialogTitle = forwardRef<
  ElementRef<typeof DialogPrimitive.Title>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...rest }, ref) => (
  <DialogPrimitive.Title ref={ref} className={cn('text-lg font-semibold text-slate-900', className)} {...rest} />
));
DialogTitle.displayName = 'DialogTitle';

export const DialogDescription = forwardRef<
  ElementRef<typeof DialogPrimitive.Description>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...rest }, ref) => (
  <DialogPrimitive.Description ref={ref} className={cn('text-sm text-slate-500', className)} {...rest} />
));
DialogDescription.displayName = 'DialogDescription';

// Side-anchored variant used as a "Sheet" (drawer)
export interface SheetContentProps extends DialogContentProps {
  side?: 'right' | 'left' | 'bottom';
}

export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;

const sideClasses: Record<NonNullable<SheetContentProps['side']>, string> = {
  right:  'inset-y-0 right-0 h-full w-full max-w-md border-l',
  left:   'inset-y-0 left-0 h-full w-full max-w-md border-r',
  bottom: 'inset-x-0 bottom-0 max-h-[85vh] w-full border-t rounded-t-lg',
};

export const SheetContent = forwardRef<ElementRef<typeof DialogPrimitive.Content>, SheetContentProps>(
  ({ className, side = 'right', children, ...rest }, ref) => (
    <DialogPrimitive.Portal>
      <Overlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          'fixed z-50 flex flex-col bg-white shadow-xl focus:outline-none',
          sideClasses[side],
          className
        )}
        {...rest}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
);
SheetContent.displayName = 'SheetContent';

export const SheetTitle = DialogTitle;
export const SheetDescription = DialogDescription;

export const DialogHeader = ({ className, ...rest }: HTMLAttributes<HTMLDivElement>): JSX.Element => (
  <div className={cn('mb-4 space-y-1', className)} {...rest} />
);

export const DialogFooter = ({ className, ...rest }: HTMLAttributes<HTMLDivElement>): JSX.Element => (
  <div className={cn('mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)} {...rest} />
);
