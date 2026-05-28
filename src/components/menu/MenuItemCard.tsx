import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/formatCurrency';
import { dietaryEmoji, dietaryLabel } from '@/data/dietaryOptions';
import { useSettings } from '@/hooks/useSettings';
import type { MenuItem } from '@/types/menu';
import { cn } from '@/lib/utils';

interface Props {
  item: MenuItem;
  isOrderingOpen: boolean;
  onClick: (item: MenuItem) => void;
}

const MenuItemCard = ({ item, isOrderingOpen, onClick }: Props): JSX.Element => {
  const { data: settings } = useSettings();
  const disabled = !item.available || !isOrderingOpen;

  return (
    <button
      type="button"
      onClick={() => !disabled && onClick(item)}
      disabled={disabled}
      aria-disabled={disabled}
      aria-label={`${item.name}, ${formatCurrency(item.price, settings)}`}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white text-left shadow-sm transition',
        disabled ? 'cursor-not-allowed opacity-60' : 'hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-brand'
      )}
    >
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1">
            <h3 className="text-base font-semibold text-slate-900">{item.name}</h3>
            {!item.available && (
              <Badge className="w-fit bg-slate-900 text-white">Unavailable</Badge>
            )}
          </div>
          {item.dietary && (
            <span title={dietaryLabel(item.dietary)} aria-label={dietaryLabel(item.dietary)}>
              {dietaryEmoji(item.dietary)}
            </span>
          )}
        </div>
        {item.description && (
          <p className="line-clamp-2 text-sm text-slate-500">{item.description}</p>
        )}
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-sm font-semibold text-slate-900">
            {formatCurrency(item.price, settings)}
          </span>
          <Badge>{item.category}</Badge>
        </div>
      </div>
    </button>
  );
};

export default MenuItemCard;
