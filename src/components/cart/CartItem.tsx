import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import type { CartContextValue } from '@/context/CartContext';
import { useSettings } from '@/hooks/useSettings';
import { formatCurrency } from '@/lib/formatCurrency';
import type { CartLine } from '@/context/CartContext';

interface Props {
  line: CartLine;
}

const CartItem = ({ line }: Props): JSX.Element => {
  const cart: CartContextValue = useCart();
  const { data: settings } = useSettings();

  return (
    <li className="flex gap-3 border-b border-slate-200 py-3 last:border-b-0">
      <div className="grid h-14 w-14 flex-shrink-0 place-items-center rounded-md bg-slate-100 text-2xl">
        {line.menuItem.imageUrl ? (
          <img
            src={line.menuItem.imageUrl}
            alt={line.menuItem.name}
            className="h-full w-full rounded-md object-cover"
          />
        ) : (
          <span aria-hidden>🍽️</span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-slate-900">{line.menuItem.name}</p>
          <button
            type="button"
            className="text-xs text-slate-500 hover:text-red-600"
            onClick={() => cart.removeItem(line.menuItem.id)}
            aria-label={`Remove ${line.menuItem.name}`}
          >
            Remove
          </button>
        </div>
        {line.notes && <p className="text-xs italic text-slate-500">“{line.notes}”</p>}

        <div className="flex items-center justify-between">
          <div className="inline-flex items-center rounded-md border border-slate-300">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Decrease quantity"
              onClick={() => cart.updateQty(line.menuItem.id, line.quantity - 1)}
            >
              −
            </Button>
            <span className="w-8 text-center text-sm" aria-live="polite">{line.quantity}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Increase quantity"
              onClick={() => cart.updateQty(line.menuItem.id, line.quantity + 1)}
              disabled={line.quantity >= 10}
            >
              +
            </Button>
          </div>
          <p className="text-sm font-semibold text-slate-900">
            {formatCurrency(line.menuItem.price * line.quantity, settings)}
          </p>
        </div>
      </div>
    </li>
  );
};

export default CartItem;
