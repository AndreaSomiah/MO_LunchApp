import { useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CopyButton } from '@/components/ui/CopyButton';
import { OrderCard } from '@/components/orders/OrderCard';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { OrderFilters, type OrderFilterState } from '@/components/orders/OrderFilters';
import { useOrders, ordersQueryKey } from '@/hooks/useOrders';
import { useAuth } from '@/hooks/useAuth';
import { useSettings } from '@/hooks/useSettings';
import { formatCurrency } from '@/lib/formatCurrency';
import { formatLunchOrdersForWhatsApp } from '@/lib/whatsappFormat';
import { exportOrdersTxt, bulkUpdateOrderStatus } from '@/api/ordersApi';
import type { OrdersQuery } from '@/api/ordersApi';
import type { Order } from '@/types/order';

interface Props {
  scope: 'mine' | 'all';
  onBrowseMenu?: () => void;
}

const downloadTxt = (text: string, filename: string): void => {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const relativeDate = (iso: string): string => {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
};

export const OrdersList = ({ scope, onBrowseMenu }: Props): JSX.Element => {
  const { user } = useAuth();
  const { data: settings } = useSettings();
  const qc = useQueryClient();
  const [filters, setFilters] = useState<OrderFilterState>({ status: '', dateFrom: '', dateTo: '', userId: '' });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkPending, setBulkPending] = useState<'confirmed' | 'delivered' | null>(null);

  const query = useMemo<OrdersQuery>(() => {
    if (scope === 'mine' && user) return { userId: user.id };
    const q: OrdersQuery = {};
    if (filters.status) q.status = filters.status;
    if (filters.dateFrom) q.dateFrom = filters.dateFrom;
    if (filters.dateTo) q.dateTo = filters.dateTo;
    if (filters.userId) q.userId = filters.userId;
    return q;
  }, [filters, scope, user]);

  const { data, isLoading, isError, error } = useOrders(query);

  const bulkMutation = useMutation({
    mutationFn: ({ ids, status }: { ids: string[]; status: 'confirmed' | 'delivered' }) =>
      bulkUpdateOrderStatus(ids, status),
    onSuccess: (result, vars) => {
      toast.success(`${result.updated} order${result.updated === 1 ? '' : 's'} updated`);
      setSelectedIds([]);
      setBulkPending(null);
      void qc.invalidateQueries({ queryKey: ordersQueryKey(query) });
    },
    onError: () => {
      toast.error('Failed to update orders');
      setBulkPending(null);
    },
  });

  const handleBulk = (status: 'confirmed' | 'delivered'): void => {
    if (selectedIds.length === 0) return;
    setBulkPending(status);
    bulkMutation.mutate({ ids: selectedIds, status });
  };

  const allOrders: Order[] = data ?? [];
  const allIds = allOrders.map((o) => o.id);
  const allSelected = allIds.length > 0 && allIds.every((id) => selectedIds.includes(id));

  const toggleAll = (): void => {
    setSelectedIds(allSelected ? [] : allIds);
  };

  const toggleOne = (id: string): void => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const selectedOrders = allOrders.filter((o) => selectedIds.includes(o.id));
  const canConfirm = selectedOrders.length > 0 && selectedOrders.every((o) => o.status === 'pending');
  const canDeliver = selectedOrders.length > 0 && selectedOrders.every((o) => o.status === 'pending' || o.status === 'confirmed');

  // My Orders tab — card grid (unchanged)
  if (scope === 'mine') {
    return (
      <div className="space-y-4">
        {isLoading && <p className="text-sm text-slate-500">Loading...</p>}
        {isError && <p className="text-sm text-red-600">{(error as Error).message}</p>}
        {data && data.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <ShoppingBag className="w-10 h-10 mb-3" />
            <p className="text-sm font-medium mb-3">You haven't placed any orders yet.</p>
            {onBrowseMenu && (
              <Button variant="outline" onClick={onBrowseMenu}>Browse Menu</Button>
            )}
          </div>
        )}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {data?.map((o) => <OrderCard key={o.id} order={o} showUser={false} />)}
        </div>
      </div>
    );
  }

  // All Orders tab — table with bulk select
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <OrderFilters value={filters} onChange={setFilters} showUserFilter />
        <Button
          variant="outline"
          onClick={() => downloadTxt(exportOrdersTxt(allOrders), `orders-${Date.now()}.txt`)}
          disabled={allOrders.length === 0}
        >
          Export .txt
        </Button>
        <CopyButton
          text={formatLunchOrdersForWhatsApp(
            allOrders,
            settings,
            filters.dateFrom ? new Date(`${filters.dateFrom}T00:00:00`) : new Date()
          )}
          disabled={allOrders.length === 0}
          disabledTooltip="No orders to copy"
        />
      </div>

      {selectedIds.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-blue-200 bg-blue-50 p-3">
          <div className="flex items-center gap-3 text-sm text-blue-800">
            <span className="font-medium">{selectedIds.length} order{selectedIds.length === 1 ? '' : 's'} selected</span>
            <button
              type="button"
              className="text-blue-600 underline hover:text-blue-800"
              onClick={() => setSelectedIds([])}
            >
              Clear selection
            </button>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={!canConfirm || bulkMutation.isPending}
              onClick={() => handleBulk('confirmed')}
            >
              {bulkMutation.isPending && bulkPending === 'confirmed' ? 'Updating…' : 'Mark as Confirmed'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={!canDeliver || bulkMutation.isPending}
              onClick={() => handleBulk('delivered')}
            >
              {bulkMutation.isPending && bulkPending === 'delivered' ? 'Updating…' : 'Mark as Delivered'}
            </Button>
          </div>
        </div>
      )}

      {isLoading && <p className="text-sm text-slate-500">Loading...</p>}
      {isError && <p className="text-sm text-red-600">{(error as Error).message}</p>}
      {!isLoading && !isError && allOrders.length === 0 && (
        <p className="rounded-md border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
          No orders.
        </p>
      )}

      {allOrders.length > 0 && (
        <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-3">
                  <input
                    type="checkbox"
                    aria-label="Select all orders"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="h-4 w-4 rounded border-slate-300 accent-brand"
                  />
                </th>
                <th className="px-3 py-3 font-medium">Order</th>
                <th className="px-3 py-3 font-medium">User</th>
                <th className="px-3 py-3 font-medium">Items</th>
                <th className="px-3 py-3 font-medium">Total</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-3 py-3 font-medium">Placed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allOrders.map((o) => (
                <tr
                  key={o.id}
                  className={selectedIds.includes(o.id) ? 'bg-blue-50' : 'hover:bg-slate-50'}
                >
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      aria-label={`Select order ${o.id.slice(0, 8)}`}
                      checked={selectedIds.includes(o.id)}
                      onChange={() => toggleOne(o.id)}
                      className="h-4 w-4 rounded border-slate-300 accent-brand"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Link to={`/orders/${o.id}`} className="font-medium text-brand hover:underline">
                      #{o.id.slice(0, 8)}
                    </Link>
                  </td>
                  <td className="px-3 py-2 text-slate-700">{o.user?.name ?? '—'}</td>
                  <td className="px-3 py-2 text-slate-600">{o.items.length} item{o.items.length === 1 ? '' : 's'}</td>
                  <td className="px-3 py-2 font-medium text-slate-900">{formatCurrency(o.totalAmount, settings)}</td>
                  <td className="px-3 py-2"><OrderStatusBadge status={o.status} /></td>
                  <td className="px-3 py-2 text-slate-500">{relativeDate(o.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

