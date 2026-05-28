import { useState } from 'react';
import { Package } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { updateInventoryItem } from '@/api/inventoryApi';
import { inventoryItemsQueryKey } from '@/hooks/useInventory';
import { cn } from '@/lib/utils';
import type { InventoryItem } from '@/types/inventory';

interface Props {
  items: InventoryItem[];
  onAddItem?: () => void;
}

export const InventoryTable = ({ items, onAddItem }: Props): JSX.Element => {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Record<string, number>>({});

  const mutation = useMutation({
    mutationFn: ({ id, stockLevel }: { id: string; stockLevel: number }) =>
      updateInventoryItem(id, { stockLevel }),
    onSuccess: () => {
      toast.success('Stock updated');
      qc.invalidateQueries({ queryKey: inventoryItemsQueryKey });
    },
    onError: (err) => toast.error((err as Error).message),
  });

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <Package className="w-10 h-10 mb-3" />
        <p className="text-sm font-medium mb-3">No inventory items yet.</p>
        {onAddItem && (
          <Button variant="outline" onClick={onAddItem}>Add Item</Button>
        )}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">Stock</th>
            <th className="px-4 py-3">Threshold</th>
            <th className="px-4 py-3">Location</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const low = item.stockLevel <= item.threshold;
            const stockVal = editing[item.id] ?? item.stockLevel;
            const dirty = editing[item.id] !== undefined && editing[item.id] !== item.stockLevel;
            return (
              <tr key={item.id} className={cn('border-t border-slate-100', low && 'bg-amber-50')}>
                <td className="px-4 py-2 font-medium text-slate-900">{item.name}</td>
                <td className="px-4 py-2 text-slate-600">{item.category}</td>
                <td className="px-4 py-2">
                  <Input
                    type="number"
                    min={0}
                    value={stockVal}
                    onChange={(e) =>
                      setEditing((prev) => ({ ...prev, [item.id]: Number(e.target.value) || 0 }))
                    }
                    className="h-8 w-24"
                  />
                </td>
                <td className="px-4 py-2 text-slate-600">{item.threshold}</td>
                <td className="px-4 py-2 text-slate-600">{item.location ?? '—'}</td>
                <td className="px-4 py-2">
                  <Badge className={low ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}>
                    {low ? 'Low' : 'OK'}
                  </Badge>
                </td>
                <td className="px-4 py-2 text-right">
                  {dirty && (
                    <Button
                      size="sm"
                      onClick={() =>
                        mutation.mutate({ id: item.id, stockLevel: editing[item.id] ?? item.stockLevel })
                      }
                      disabled={mutation.isPending}
                    >
                      Save
                    </Button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
