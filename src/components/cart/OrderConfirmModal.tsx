import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useCart } from '@/hooks/useCart';
import { useSettings } from '@/hooks/useSettings';
import { formatCurrency } from '@/lib/formatCurrency';
import { isOrderingOpen, minutesUntilCutoff } from '@/lib/cutoffUtils';
import { placeOrder, type PlaceOrderPayload } from '@/api/ordersApi';
import { ApiError } from '@/api/client';
import type { Order } from '@/types/order';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPlaced?: () => void;
}

const MAX_NOTES = 500;

const OrderConfirmModal = ({ open, onOpenChange, onPlaced }: Props): JSX.Element => {
  const { items, totalAmount, clearCart } = useCart();
  const { data: settings } = useSettings();
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState<string>('');

  const orderingOpen = isOrderingOpen(settings);
  const minutesLeft = minutesUntilCutoff(settings);
  const showCutoffWarning = orderingOpen && minutesLeft <= 30;

  const mutation = useMutation<Order, ApiError, PlaceOrderPayload>({
    mutationFn: placeOrder,
    onSuccess: () => {
      toast.success('Order placed!');
      clearCart();
      setNotes('');
      void queryClient.invalidateQueries({ queryKey: ['orders'] });
      onPlaced?.();
    },
    onError: (err) => {
      if (err.status === 403) {
        toast.error('Ordering is closed for today');
      } else {
        toast.error(err.message || 'Could not place order');
      }
    },
  });

  const handleConfirm = (): void => {
    if (items.length === 0) return;
    mutation.mutate({
      items: items.map((l) => ({
        menuItemId: l.menuItem.id,
        quantity: l.quantity,
        notes: l.notes?.trim() || undefined,
      })),
      notes: notes.trim() || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <div className="mb-4">
          <DialogTitle>Confirm your order</DialogTitle>
          <DialogDescription>Review the details before placing.</DialogDescription>
        </div>

        {showCutoffWarning && (
          <div className="mb-3 rounded-md border border-amber-300 bg-amber-50 p-2 text-sm text-amber-800">
            Only {minutesLeft} min until today’s cutoff.
          </div>
        )}
        {!orderingOpen && (
          <div className="mb-3 rounded-md border border-red-300 bg-red-50 p-2 text-sm text-red-800">
            Ordering is closed for today.
          </div>
        )}

        <div className="mb-4 max-h-72 overflow-y-auto rounded-md border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2 font-medium">Item</th>
                <th className="px-3 py-2 text-center font-medium">Qty</th>
                <th className="px-3 py-2 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((l) => (
                <tr key={l.menuItem.id} className="border-t border-slate-200">
                  <td className="px-3 py-2">
                    <p className="font-medium text-slate-900">{l.menuItem.name}</p>
                    {l.notes && <p className="text-xs italic text-slate-500">“{l.notes}”</p>}
                  </td>
                  <td className="px-3 py-2 text-center">{l.quantity}</td>
                  <td className="px-3 py-2 text-right">
                    {formatCurrency(l.menuItem.price * l.quantity, settings)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-slate-200 bg-slate-50">
                <td className="px-3 py-2 font-medium" colSpan={2}>Grand total</td>
                <td className="px-3 py-2 text-right font-semibold">
                  {formatCurrency(totalAmount, settings)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="mb-4 space-y-1.5">
          <label htmlFor="order-notes" className="text-sm font-medium text-slate-700">
            Order notes
          </label>
          <Textarea
            id="order-notes"
            placeholder="e.g. Leave at reception"
            maxLength={MAX_NOTES}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={mutation.isPending || !orderingOpen || items.length === 0}
          >
            {mutation.isPending ? 'Placing…' : 'Confirm Order'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderConfirmModal;
