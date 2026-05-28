import type { InventoryItem } from '@/types/inventory';

interface Props {
  items: InventoryItem[];
}

export const LowStockAlert = ({ items }: Props): JSX.Element | null => {
  const low = items.filter((i) => i.stockLevel <= i.threshold && i.status === 'active');
  if (low.length === 0) {
    return null;
  }
  return (
    <div className="rounded-md border border-amber-300 bg-amber-50 p-4">
      <p className="text-sm font-semibold text-amber-900">
        {low.length} item{low.length === 1 ? '' : 's'} below threshold
      </p>
      <ul className="mt-2 space-y-1 text-sm text-amber-800">
        {low.slice(0, 5).map((i) => (
          <li key={i.id}>
            {i.name} — {i.stockLevel} / {i.threshold}
          </li>
        ))}
      </ul>
    </div>
  );
};
