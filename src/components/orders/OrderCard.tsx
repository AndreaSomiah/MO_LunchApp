import { Link } from 'react-router-dom';
import { OrderStatusBadge } from './OrderStatusBadge';
import { formatCurrency } from '@/lib/formatCurrency';
import { useSettings } from '@/hooks/useSettings';
import type { Order } from '@/types/order';

interface Props {
  order: Order;
  showUser?: boolean;
}

export const OrderCard = ({ order, showUser }: Props): JSX.Element => {
  const { data: settings } = useSettings();
  const placed = (() => {
    try {
      return new Date(order.createdAt).toLocaleString();
    } catch {
      return order.createdAt;
    }
  })();

  return (
    <Link
      to={`/orders/${order.id}`}
      className="block rounded-lg border border-slate-200 bg-white p-4 transition hover:border-brand hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">Order #{order.id.slice(0, 8)}</p>
          {showUser && order.user && (
            <p className="text-xs text-slate-500">{order.user.name}</p>
          )}
          <p className="mt-1 text-xs text-slate-500">{placed}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>
      <div className="mt-3 flex items-end justify-between">
        <p className="text-xs text-slate-500">
          {order.items.length} item{order.items.length === 1 ? '' : 's'}
        </p>
        <p className="text-base font-semibold text-slate-900">
          {formatCurrency(order.totalAmount, settings)}
        </p>
      </div>
    </Link>
  );
};
