import { useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { OrderStatusTimeline } from '@/components/orders/OrderStatusTimeline';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { useOrder, ordersQueryKey, orderQueryKey } from '@/hooks/useOrders';
import { useAuth } from '@/hooks/useAuth';
import { useSettings } from '@/hooks/useSettings';
import { updateOrderStatus, deleteOrder } from '@/api/ordersApi';
import { formatCurrency } from '@/lib/formatCurrency';
import type { OrderStatus } from '@/types/order';

const nextStatuses = (current: OrderStatus, role: 'employee' | 'manager' | 'admin', isOwner: boolean): OrderStatus[] => {
  if (role === 'admin') {
    return (['pending', 'confirmed', 'delivered', 'cancelled'] as OrderStatus[]).filter((s) => s !== current);
  }
  if (role === 'employee') {
    return isOwner && current === 'pending' ? ['cancelled'] : [];
  }
  if (current === 'pending') return ['confirmed', 'cancelled'];
  if (current === 'confirmed') return ['delivered', 'cancelled'];
  return [];
};

export const OrderDetailPage = (): JSX.Element => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = useAuth();
  const { data: settings } = useSettings();
  const { data: order, isLoading, isError } = useOrder(id);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const options = useMemo(() => {
    if (!order || !user) return [];
    return nextStatuses(order.status, user.role, order.userId === user.id);
  }, [order, user]);

  const updateMutation = useMutation({
    mutationFn: (status: OrderStatus) => updateOrderStatus(id!, status),
    onSuccess: (next) => {
      toast.success(`Status: ${next.status}`);
      qc.invalidateQueries({ queryKey: orderQueryKey(id!) });
      qc.invalidateQueries({ queryKey: ordersQueryKey() });
    },
    onError: (err) => toast.error((err as Error).message),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteOrder(id!),
    onSuccess: () => {
      toast.success('Order deleted');
      qc.invalidateQueries({ queryKey: ordersQueryKey() });
      navigate('/orders');
    },
    onError: (err) => toast.error((err as Error).message),
  });

  if (isLoading) {
    return <p className="text-sm text-slate-500">Loading...</p>;
  }
  if (isError || !order) {
    return (
      <div className="rounded-md border border-slate-200 bg-white p-6">
        <p className="text-base font-semibold">Order not found</p>
        <Link to="/orders" className="mt-3 inline-block text-sm text-brand underline">Back to orders</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase text-slate-500">Order</p>
          <h1 className="text-2xl font-bold text-slate-900">#{order.id.slice(0, 8)}</h1>
          {order.user && <p className="text-sm text-slate-500">{order.user.name} · {order.user.email}</p>}
        </div>
        <div className="flex items-center gap-3">
          <OrderStatusBadge status={order.status} />
          {options.length > 0 && (
            <Select
              defaultValue=""
              onChange={(e) => {
                const v = e.target.value as OrderStatus | '';
                if (v) updateMutation.mutate(v);
              }}
              disabled={updateMutation.isPending}
              className="w-44"
            >
              <option value="">Change status...</option>
              {options.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Select>
          )}
          {user?.role !== 'employee' && order.status === 'pending' && (
            <Button variant="outline" onClick={() => setConfirmCancel(true)}>Cancel</Button>
          )}
          {user?.role === 'admin' && (
            <Button variant="destructive" onClick={() => setConfirmDelete(true)}>Delete</Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-md border border-slate-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">Items</h2>
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2">Item</th>
                <th className="py-2">Qty</th>
                <th className="py-2">Price</th>
                <th className="py-2 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((it) => (
                <tr key={it.id} className="border-t border-slate-100">
                  <td className="py-2">
                    <div className="font-medium text-slate-900">{it.menuItem?.name ?? it.menuItemId}</div>
                    {it.notes && <div className="text-xs text-slate-500">{it.notes}</div>}
                  </td>
                  <td className="py-2">{it.quantity}</td>
                  <td className="py-2">{formatCurrency(it.price, settings)}</td>
                  <td className="py-2 text-right">{formatCurrency(it.price * it.quantity, settings)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-slate-200">
                <td colSpan={3} className="py-3 text-right text-sm font-semibold">Total</td>
                <td className="py-3 text-right text-base font-bold">{formatCurrency(order.totalAmount, settings)}</td>
              </tr>
            </tfoot>
          </table>
          {order.notes && (
            <div className="mt-4 rounded-md bg-slate-50 p-3 text-sm text-slate-700">
              <p className="font-semibold">Notes</p>
              <p>{order.notes}</p>
            </div>
          )}
        </div>
        <div className="rounded-md border border-slate-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">Status history</h2>
          <OrderStatusTimeline current={order.status} history={order.history} />
        </div>
      </div>

      <ConfirmDialog
        open={confirmCancel}
        title="Cancel this order?"
        description="The customer will no longer receive this order."
        destructive
        confirmLabel="Cancel order"
        loading={updateMutation.isPending}
        onCancel={() => setConfirmCancel(false)}
        onConfirm={() => {
          setConfirmCancel(false);
          updateMutation.mutate('cancelled');
        }}
      />
      <ConfirmDialog
        open={confirmDelete}
        title="Delete this order?"
        description="This permanently removes the order and its history."
        destructive
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          setConfirmDelete(false);
          deleteMutation.mutate();
        }}
      />
    </div>
  );
};
