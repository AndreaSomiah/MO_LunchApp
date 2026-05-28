import { supabase } from '@/lib/supabase';

export interface StatsSummary {
  ordersToday: number;
  orderedToday: number;
  inventoryItems: number;
  weekSpend: number;
}

export interface PopularItem {
  menuItemId: string;
  name: string;
  totalQty: number;
}

export interface RecentOrder {
  id: string;
  user: string;
  total: number;
  status: string;
  createdAt: string;
  itemsSummary: string;
  totalQty: number;
}

const startOfTodayIso = (): string => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
};

const startOfWeekAgoIso = (): string => {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
};

export const fetchStatsSummary = async (): Promise<StatsSummary> => {
  const today = startOfTodayIso();
  const weekAgo = startOfWeekAgoIso();

  const [ordersTodayRes, orderedTodayRes, invRes, weekOrdersRes] = await Promise.all([
    supabase
      .from('orders')
      .select('id', { head: true, count: 'exact' })
      .gte('created_at', today),
    supabase
      .from('order_items')
      .select('quantity, order_id, orders!inner(created_at)')
      .gte('orders.created_at', today),
    supabase.from('inventory_items').select('id', { head: true, count: 'exact' }),
    supabase
      .from('orders')
      .select('total_amount')
      .gte('created_at', weekAgo),
  ]);

  if (ordersTodayRes.error) throw new Error(ordersTodayRes.error.message);
  if (orderedTodayRes.error) throw new Error(orderedTodayRes.error.message);
  if (invRes.error) throw new Error(invRes.error.message);
  if (weekOrdersRes.error) throw new Error(weekOrdersRes.error.message);

  const orderedToday = (orderedTodayRes.data ?? []).reduce(
    (sum, row) => sum + (row.quantity as number),
    0
  );
  const weekSpend = (weekOrdersRes.data ?? []).reduce(
    (sum, row) => sum + Number(row.total_amount),
    0
  );

  return {
    ordersToday: ordersTodayRes.count ?? 0,
    orderedToday,
    inventoryItems: invRes.count ?? 0,
    weekSpend,
  };
};

export const fetchPopularItems = async (): Promise<PopularItem[]> => {
  const { data, error } = await supabase
    .from('v_popular_items')
    .select('*');
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => ({
    menuItemId: r.menu_item_id as string,
    name: r.name as string,
    totalQty: Number(r.total_qty),
  }));
};

export const fetchRecentOrders = async (): Promise<RecentOrder[]> => {
  const { data, error } = await supabase
    .from('v_recent_orders')
    .select('*');
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => ({
    id: r.id as string,
    user: r.user_name as string,
    total: Number(r.total),
    status: r.status as string,
    createdAt: r.created_at as string,
    itemsSummary: (r.items_summary as string) ?? '',
    totalQty: Number(r.total_qty),
  }));
};

