import { Link, Navigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { VibeCard } from '@/components/dashboard/VibeCard';
import { useStatsSummary, usePopularItems, useRecentOrders } from '@/hooks/useStats';
import { useAuth } from '@/hooks/useAuth';
import type { OrderStatus } from '@/types/order';

const Stat = ({ label, value, loading }: { label: string; value: string | number; loading?: boolean }): JSX.Element => (
  <div className="rounded-md border border-slate-200 bg-white p-4">
    <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
    {loading ? <Skeleton className="mt-2 h-8 w-20" /> : <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>}
  </div>
);

const relativeTime = (iso: string): string => {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff} sec ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr${Math.floor(diff / 3600) === 1 ? '' : 's'} ago`;
  return `${Math.floor(diff / 86400)} day${Math.floor(diff / 86400) === 1 ? '' : 's'} ago`;
};

export const DashboardPage = (): JSX.Element => {
  const { user } = useAuth();
  const summary = useStatsSummary();
  const popular = usePopularItems();
  const recent = useRecentOrders();

  if (user?.role === 'employee') {
    return <Navigate to="/orders" replace />;
  }

  const maxQty = popular.data && popular.data.length > 0 ? Math.max(...popular.data.map((p) => p.totalQty)) : 1;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Stat label="Orders today" value={summary.data?.ordersToday ?? 0}   loading={summary.isLoading} />
        <Stat label="Ordered"      value={summary.data?.orderedToday ?? 0} loading={summary.isLoading} />
      </div>

      <VibeCard />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-md border border-slate-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">Recent orders</h2>
          {recent.isLoading && <Skeleton className="h-32 w-full" />}
          {!recent.isLoading && recent.data?.length === 0 && (
            <p className="text-sm text-slate-500">No orders placed today.</p>
          )}
          {recent.data && recent.data.length > 0 && (
            <>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
                    <th className="pb-2 pr-3 font-medium">User</th>
                    <th className="pb-2 pr-3 font-medium">Items</th>
                    <th className="pb-2 pr-3 font-medium">Qty</th>
                    <th className="pb-2 pr-3 font-medium">Status</th>
                    <th className="pb-2 font-medium">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recent.data.map((o) => (
                    <tr key={o.id}>
                      <td className="py-2 pr-3 font-medium text-slate-900">
                        <Link to={`/orders/${o.id}`} className="text-brand hover:underline">{o.user}</Link>
                      </td>
                      <td className="py-2 pr-3 text-slate-600">{o.itemsSummary}</td>
                      <td className="py-2 pr-3 text-slate-600">{o.totalQty}</td>
                      <td className="py-2 pr-3">
                        <OrderStatusBadge status={o.status as OrderStatus} />
                      </td>
                      <td className="py-2 text-slate-400">{relativeTime(o.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-3 text-right">
                <Link to="/orders" className="text-xs text-brand hover:underline">View all orders →</Link>
              </div>
            </>
          )}
        </section>

        <section className="rounded-md border border-slate-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">Popular items</h2>
          {popular.isLoading && <Skeleton className="h-32 w-full" />}
          {popular.data && popular.data.length === 0 && (
            <p className="text-sm text-slate-500">Not enough data yet.</p>
          )}
          <ul className="space-y-3">
            {popular.data?.map((p) => (
              <li key={p.menuItemId}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-900">{p.name}</span>
                  <span className="text-slate-500">{p.totalQty}</span>
                </div>
                <div className="mt-1 h-2 w-full rounded bg-slate-100">
                  <div
                    className="h-full rounded bg-brand"
                    style={{ width: `${Math.round((p.totalQty / maxQty) * 100)}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};
