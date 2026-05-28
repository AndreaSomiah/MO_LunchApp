import { useState } from 'react';
import { InventoryRequestForm } from '@/components/inventory/InventoryRequestForm';
import { InventoryRequestList } from '@/components/inventory/InventoryRequestList';
import { Button } from '@/components/ui/button';
import { useInventoryItems, useInventoryRequests } from '@/hooks/useInventory';
import { useAuth } from '@/hooks/useAuth';

const Stat = ({ label, value }: { label: string; value: number | string }): JSX.Element => (
  <div className="rounded-md border border-slate-200 bg-white p-4">
    <p className="text-xs uppercase text-slate-500">{label}</p>
    <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
  </div>
);

export const InventoryDashboardPage = (): JSX.Element => {
  const { user } = useAuth();
  const items = useInventoryItems();
  const requests = useInventoryRequests();
  const [requesting, setRequesting] = useState(false);
  const canManage = user?.role === 'admin' || user?.role === 'manager';

  const itemsCount = items.data?.length ?? 0;
  const lowCount = items.data?.filter((i) => i.stockLevel <= i.threshold && i.status === 'active').length ?? 0;
  const openCount = requests.data?.filter((r) => r.status === 'open').length ?? 0;
  const fulfilledCount = requests.data?.filter((r) => r.status === 'fulfilled').length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Inventory</h1>
        <Button onClick={() => setRequesting(true)}>New request</Button>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat label="Total items" value={itemsCount} />
        <Stat label="Low stock" value={lowCount} />
        <Stat label="Open requests" value={openCount} />
        <Stat label="Fulfilled" value={fulfilledCount} />
      </div>
      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Requests</h2>
        {requests.isLoading && <p className="text-sm text-slate-500">Loading...</p>}
        {requests.data && <InventoryRequestList requests={requests.data} canFulfil={canManage} />}
      </div>
      <InventoryRequestForm open={requesting} onClose={() => setRequesting(false)} />
    </div>
  );
};
