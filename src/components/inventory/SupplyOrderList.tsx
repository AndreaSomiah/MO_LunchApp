import { useMemo, useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useSupplyOrders } from '@/hooks/useSupplyOrders';
import type { SupplyOrder, SupplyOrderStatus, SupplyOrderType } from '@/types/supplyOrder';
import { SupplyOrderCard } from './SupplyOrderCard';

interface Props {
  onEdit: (order: SupplyOrder) => void;
}

type TypeFilter = 'all' | SupplyOrderType;
type StatusFilter = 'all' | SupplyOrderStatus;

const EMPTY_TEXT: Record<TypeFilter, string> = {
  all: 'No supply orders yet. Create one to get started.',
  daily: 'No daily orders yet.',
  event: 'No event orders yet.',
};

export const SupplyOrderList = ({ onEdit }: Props): JSX.Element => {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const filters = useMemo(
    () => ({
      type: typeFilter === 'all' ? undefined : typeFilter,
      status: statusFilter === 'all' ? undefined : statusFilter,
    }),
    [typeFilter, statusFilter]
  );

  const query = useSupplyOrders(filters);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <Tabs value={typeFilter} onValueChange={(v) => setTypeFilter(v as TypeFilter)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="event">Events</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-2">
          <Label htmlFor="status-filter" className="text-xs text-slate-600">Status</Label>
          <Select
            id="status-filter"
            className="h-9 w-36 text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          >
            <option value="all">All</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="fulfilled">Fulfilled</option>
            <option value="cancelled">Cancelled</option>
          </Select>
        </div>
      </div>

      {query.isLoading && <p className="text-sm text-slate-500">Loading orders...</p>}
      {query.isError && (
        <p className="text-sm text-red-600">Failed to load orders: {(query.error as Error).message}</p>
      )}
      {query.data && query.data.length === 0 && (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
          {EMPTY_TEXT[typeFilter]}
        </div>
      )}
      {query.data && query.data.length > 0 && (
        <div className="space-y-3">
          {query.data.map((order) => (
            <SupplyOrderCard key={order.id} order={order} onEdit={onEdit} />
          ))}
        </div>
      )}
    </div>
  );
};
