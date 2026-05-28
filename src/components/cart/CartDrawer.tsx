import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { useSettings } from '@/hooks/useSettings';
import { formatCurrency } from '@/lib/formatCurrency';
import { cn } from '@/lib/utils';
import CartItem from './CartItem';
import OrderConfirmModal from './OrderConfirmModal';

interface Props {
  onOrderPlaced?: () => void;
}

const CartDrawer = ({ onOrderPlaced }: Props): JSX.Element => {
  const { items, totalAmount, itemCount } = useCart();
  const { data: settings } = useSettings();
  const [open, setOpen] = useState<boolean>(false);
  const [confirmOpen, setConfirmOpen] = useState<boolean>(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 rounded-full bg-brand px-5 py-3 text-white shadow-lg',
          'hover:bg-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand'
        )}
        aria-label={`Open cart (${itemCount} items)`}
      >
        <span aria-hidden>🛒</span>
        <span className="text-sm font-medium">Cart</span>
        {itemCount > 0 && (
          <span
            className="ml-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-white px-1.5 text-xs font-semibold text-brand"
            aria-label={`${itemCount} items in cart`}
          >
            {itemCount}
          </span>
        )}
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="flex w-full max-w-md flex-col p-0">
          <div className="border-b border-slate-200 p-6">
            <SheetTitle>Your order</SheetTitle>
            <SheetDescription>{itemCount} item{itemCount === 1 ? '' : 's'}</SheetDescription>
          </div>

          <div className="flex-1 overflow-y-auto px-6">
            {items.length === 0 ? (
              <div className="grid h-full place-items-center text-center text-sm text-slate-500">
                <div>
                  <p className="text-4xl" aria-hidden>🛒</p>
                  <p className="mt-2">Your cart is empty.</p>
                </div>
              </div>
            ) : (
              <ul>
                {items.map((line) => (
                  <CartItem key={line.menuItem.id} line={line} />
                ))}
              </ul>
            )}
          </div>

          <div className="border-t border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="font-medium text-slate-700">Total</span>
              <span className="text-lg font-semibold text-slate-900">
                {formatCurrency(totalAmount, settings)}
              </span>
            </div>
            <Button
              size="lg"
              className="w-full"
              disabled={items.length === 0}
              onClick={() => setConfirmOpen(true)}
            >
              Place Order
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <OrderConfirmModal
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onPlaced={() => {
          setConfirmOpen(false);
          setOpen(false);
          onOrderPlaced?.();
        }}
      />
    </>
  );
};

export default CartDrawer;
