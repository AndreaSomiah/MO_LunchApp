import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { CopyButton } from '@/components/ui/CopyButton';
import { InventoryTable } from '@/components/inventory/InventoryTable';
import { InventoryRequestForm } from '@/components/inventory/InventoryRequestForm';
import { InventoryRequestList } from '@/components/inventory/InventoryRequestList';
import { LowStockAlert } from '@/components/inventory/LowStockAlert';
import { SupplyOrderForm } from '@/components/inventory/SupplyOrderForm';
import { SupplyOrderList } from '@/components/inventory/SupplyOrderList';
import { useInventoryItems, useInventoryRequests } from '@/hooks/useInventory';
import { useAuth } from '@/hooks/useAuth';
import { formatInventoryForWhatsApp } from '@/lib/whatsappFormat';
import type { SupplyOrder, SupplyOrderType } from '@/types/supplyOrder';

export const InventoryPage = (): JSX.Element => {
  const { user } = useAuth();
  const items = useInventoryItems();
  const requests = useInventoryRequests();
  const [requesting, setRequesting] = useState(false);
  const [addingItem, setAddingItem] = useState(false);
  const [supplyFormOpen, setSupplyFormOpen] = useState(false);
  const [supplyFormType, setSupplyFormType] = useState<SupplyOrderType>('daily');
  const [editingSupplyOrder, setEditingSupplyOrder] = useState<SupplyOrder | null>(null);
  const canManage = user?.role === 'admin' || user?.role === 'manager';

  const openNewSupplyOrder = (type: SupplyOrderType): void => {
    setEditingSupplyOrder(null);
    setSupplyFormType(type);
    setSupplyFormOpen(true);
  };

  const openEditSupplyOrder = (order: SupplyOrder): void => {
    setEditingSupplyOrder(order);
    setSupplyFormType(order.type);
    setSupplyFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Inventory</h1>
        <Button onClick={() => setRequesting(true)}>New request</Button>
      </div>

      {items.data && <LowStockAlert items={items.data} />}

      <Tabs defaultValue="items">
        <TabsList>
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>
        <TabsContent value="items">
          {items.isLoading && <p className="text-sm text-slate-500">Loading...</p>}
          {items.data && (
            <div className="space-y-3">
              <div className="flex justify-end">
                <CopyButton
                  text={formatInventoryForWhatsApp(
                    items.data.filter((i) => i.status === 'active' && i.stockLevel <= i.threshold),
                    (requests.data ?? []).filter((r) => r.status === 'open'),
                    new Date()
                  )}
                />
              </div>
              <InventoryTable items={items.data} onAddItem={canManage ? () => setAddingItem(true) : undefined} />
            </div>
          )}
        </TabsContent>
        <TabsContent value="requests">
          {requests.isLoading && <p className="text-sm text-slate-500">Loading...</p>}
          {requests.data && <InventoryRequestList requests={requests.data} canFulfil={canManage} />}
        </TabsContent>
        <TabsContent value="orders">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Supply &amp; catering orders</h2>
                <p className="text-sm text-slate-500">
                  Procurement requests sent to suppliers. Separate from employee lunch orders.
                </p>
              </div>
              {canManage && (
                <div className="flex flex-wrap items-center gap-2">
                  <Button onClick={() => openNewSupplyOrder('daily')}>New daily order</Button>
                  <Button variant="outline" onClick={() => openNewSupplyOrder('event')}>
                    New event order
                  </Button>
                </div>
              )}
            </div>
            <SupplyOrderList onEdit={openEditSupplyOrder} />
          </div>
        </TabsContent>
      </Tabs>

      <InventoryRequestForm open={requesting} onClose={() => setRequesting(false)} />
      <SupplyOrderForm
        open={supplyFormOpen}
        onClose={() => setSupplyFormOpen(false)}
        type={supplyFormType}
        initial={editingSupplyOrder}
      />
    </div>
  );
};
