import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useSettings } from '@/hooks/useSettings';
import { useCart } from '@/hooks/useCart';
import { formatCurrency } from '@/lib/formatCurrency';
import { isOrderingOpen, minutesUntilCutoff } from '@/lib/cutoffUtils';
import { dietaryEmoji, dietaryLabel } from '@/data/dietaryOptions';
import type { MenuItem } from '@/types/menu';

interface Props {
  item: MenuItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MAX_NOTES = 200;

const MenuItemDetails = ({ item, open, onOpenChange }: Props): JSX.Element | null => {
  const { data: settings } = useSettings();
  const { addItem } = useCart();
  const [qty, setQty] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (open) {
      setQty(1);
      setNotes('');
    }
  }, [open, item?.id]);

  if (!item) return null;

  const orderingOpen = isOrderingOpen(settings);
  const minutesLeft = minutesUntilCutoff(settings);
  const showCutoffWarning = orderingOpen && minutesLeft <= 30;
  const disabled = !item.available || !orderingOpen;

  const handleAdd = (): void => {
    addItem(item, qty, notes);
    toast.success(`Added ${qty} × ${item.name} to your order`);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full max-w-md flex-col p-0">
        <div className="relative aspect-[4/3] w-full bg-slate-100">
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full place-items-center text-6xl">🍽️</div>
          )}
          {!item.available && (
            <Badge className="absolute left-3 top-3 bg-slate-900 text-white">Unavailable</Badge>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <SheetTitle>{item.name}</SheetTitle>
              <SheetDescription className="mt-1">{item.category}</SheetDescription>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-slate-900">
                {formatCurrency(item.price, settings)}
              </p>
              {item.dietary && (
                <p className="text-xs text-slate-500" aria-label={dietaryLabel(item.dietary)}>
                  {dietaryEmoji(item.dietary)} {dietaryLabel(item.dietary)}
                </p>
              )}
            </div>
          </div>

          {item.description && <p className="text-sm text-slate-600">{item.description}</p>}

          <dl className="grid grid-cols-2 gap-3 text-sm text-slate-600">
            {typeof item.calories === 'number' && (
              <div>
                <dt className="text-xs uppercase text-slate-400">Calories</dt>
                <dd>{item.calories} kcal</dd>
              </div>
            )}
            <div>
              <dt className="text-xs uppercase text-slate-400">Status</dt>
              <dd>{item.available ? 'Available' : 'Out of stock'}</dd>
            </div>
          </dl>

          {showCutoffWarning && (
            <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
              Heads up — only {minutesLeft} min until today’s cutoff.
            </div>
          )}
          {!orderingOpen && (
            <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800">
              Ordering is closed for today.
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700">Quantity</p>
            <div className="inline-flex items-center rounded-md border border-slate-300">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Decrease quantity"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                disabled={qty <= 1 || disabled}
              >
                −
              </Button>
              <span className="w-10 text-center text-sm font-medium" aria-live="polite">
                {qty}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Increase quantity"
                onClick={() => setQty((q) => Math.min(10, q + 1))}
                disabled={qty >= 10 || disabled}
              >
                +
              </Button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="item-notes" className="text-sm font-medium text-slate-700">
              Notes
            </label>
            <Textarea
              id="item-notes"
              placeholder="Special instructions (optional)"
              maxLength={MAX_NOTES}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={disabled}
            />
            <p className="text-right text-xs text-slate-400">
              {notes.length}/{MAX_NOTES}
            </p>
          </div>
        </div>

        <div className="border-t border-slate-200 bg-slate-50 p-4">
          <Button size="lg" className="w-full" onClick={handleAdd} disabled={disabled}>
            {disabled ? 'Unavailable' : `Add to Order — ${formatCurrency(item.price * qty, settings)}`}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MenuItemDetails;
