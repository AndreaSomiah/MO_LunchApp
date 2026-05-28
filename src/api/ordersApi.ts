import { supabase } from '@/lib/supabase';
import type { Order, OrderItem, OrderStatus, OrderStatusEvent } from '@/types/order';
import type { MenuItem, DietaryPreference } from '@/types/menu';

export interface PlaceOrderItem {
  menuItemId: string;
  quantity: number;
  notes?: string;
}

export interface PlaceOrderPayload {
  items: PlaceOrderItem[];
  notes?: string;
}

export interface OrdersQuery {
  userId?: string;
  status?: OrderStatus;
  dateFrom?: string;
  dateTo?: string;
}

interface MenuItemRow {
  id: string; name: string; description: string | null; category: string;
  price: number | string; calories: number | null; dietary: string | null;
  image_url: string | null; available: boolean; restaurant_id: string;
  created_at: string; updated_at: string;
}
interface OrderItemRow {
  id: string; order_id: string; menu_item_id: string;
  quantity: number; price: number | string; notes: string | null;
  menu_item?: MenuItemRow | null;
}
interface OrderRow {
  id: string; user_id: string; status: OrderStatus;
  total_amount: number | string; notes: string | null;
  created_at: string; updated_at: string;
  user?: { id: string; name: string; email: string } | null;
  items?: OrderItemRow[];
  history?: HistoryRow[];
}
interface HistoryRow {
  id: string; order_id: string;
  from_status: OrderStatus | null; to_status: OrderStatus;
  changed_by: string | null; changed_at: string;
  changed_by_profile?: { name: string } | null;
}

const num = (v: number | string): number => (typeof v === 'string' ? Number(v) : v);

const mapMenuItem = (r: MenuItemRow): MenuItem => ({
  id: r.id,
  name: r.name,
  description: r.description ?? undefined,
  category: r.category,
  price: num(r.price),
  calories: r.calories ?? undefined,
  dietary: (r.dietary ?? undefined) as DietaryPreference | undefined,
  imageUrl: r.image_url ?? undefined,
  available: r.available,
  restaurantId: r.restaurant_id,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

const mapItem = (r: OrderItemRow): OrderItem => ({
  id: r.id,
  orderId: r.order_id,
  menuItemId: r.menu_item_id,
  quantity: r.quantity,
  price: num(r.price),
  notes: r.notes ?? undefined,
  menuItem: r.menu_item ? mapMenuItem(r.menu_item) : undefined,
});

const mapHistory = (r: HistoryRow): OrderStatusEvent => ({
  id: r.id,
  orderId: r.order_id,
  fromStatus: r.from_status,
  toStatus: r.to_status,
  changedBy: r.changed_by,
  changedByName: r.changed_by_profile?.name,
  changedAt: r.changed_at,
});

const mapOrder = (r: OrderRow): Order => ({
  id: r.id,
  userId: r.user_id,
  status: r.status,
  totalAmount: num(r.total_amount),
  notes: r.notes ?? undefined,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
  items: (r.items ?? []).map(mapItem),
  user: r.user ?? undefined,
  history: r.history?.map(mapHistory),
});

const ORDER_SELECT = `
  *,
  user:profiles!orders_user_id_fkey(id, name, email),
  items:order_items(
    *,
    menu_item:menu_items(*)
  )
`;

const ORDER_DETAIL_SELECT = `
  *,
  user:profiles!orders_user_id_fkey(id, name, email),
  items:order_items(
    *,
    menu_item:menu_items(*)
  ),
  history:order_status_history(
    *,
    changed_by_profile:profiles!order_status_history_changed_by_fkey(name)
  )
`;

export const fetchOrders = async (query: OrdersQuery = {}): Promise<Order[]> => {
  let q = supabase.from('orders').select(ORDER_SELECT).order('created_at', { ascending: false });
  if (query.userId) q = q.eq('user_id', query.userId);
  if (query.status) q = q.eq('status', query.status);
  if (query.dateFrom) q = q.gte('created_at', query.dateFrom);
  if (query.dateTo) q = q.lte('created_at', query.dateTo);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data as OrderRow[]).map(mapOrder);
};

export const fetchOrder = async (id: string): Promise<Order> => {
  const { data, error } = await supabase
    .from('orders')
    .select(ORDER_DETAIL_SELECT)
    .eq('id', id)
    .single();
  if (error) throw new Error(error.message);
  return mapOrder(data as OrderRow);
};

export const placeOrder = async (payload: PlaceOrderPayload): Promise<Order> => {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error('Not signed in');
  if (!payload.items.length) throw new Error('Cart is empty');

  // Fetch authoritative prices for the requested menu items.
  const menuItemIds = payload.items.map((i) => i.menuItemId);
  const { data: menuRows, error: mErr } = await supabase
    .from('menu_items')
    .select('id, price, available')
    .in('id', menuItemIds);
  if (mErr) throw new Error(mErr.message);
  const priceById = new Map<string, number>();
  for (const row of menuRows ?? []) {
    if (!row.available) throw new Error('One or more items are no longer available');
    priceById.set(row.id as string, num(row.price as number | string));
  }
  let total = 0;
  for (const it of payload.items) {
    const p = priceById.get(it.menuItemId);
    if (p === undefined) throw new Error('Unknown menu item in cart');
    total += p * it.quantity;
  }

  const { data: orderRow, error: oErr } = await supabase
    .from('orders')
    .insert({
      user_id: auth.user.id,
      status: 'pending' as OrderStatus,
      total_amount: total,
      notes: payload.notes ?? null,
    })
    .select('id')
    .single();
  if (oErr) throw new Error(oErr.message);
  const orderId = (orderRow as { id: string }).id;

  const itemsToInsert = payload.items.map((it) => ({
    order_id: orderId,
    menu_item_id: it.menuItemId,
    quantity: it.quantity,
    price: priceById.get(it.menuItemId)!,
    notes: it.notes ?? null,
  }));
  const { error: iErr } = await supabase.from('order_items').insert(itemsToInsert);
  if (iErr) {
    // best-effort cleanup
    await supabase.from('orders').delete().eq('id', orderId);
    throw new Error(iErr.message);
  }

  return fetchOrder(orderId);
};

export const updateOrderStatus = async (id: string, status: OrderStatus): Promise<Order> => {
  const { error } = await supabase.from('orders').update({ status }).eq('id', id);
  if (error) throw new Error(error.message);
  return fetchOrder(id);
};

export const bulkUpdateOrderStatus = async (
  ids: string[],
  status: 'confirmed' | 'delivered' | 'cancelled'
): Promise<{ updated: number }> => {
  if (!ids.length) return { updated: 0 };
  const { error, count } = await supabase
    .from('orders')
    .update({ status }, { count: 'exact' })
    .in('id', ids);
  if (error) throw new Error(error.message);
  return { updated: count ?? ids.length };
};

export const deleteOrder = async (id: string): Promise<void> => {
  const { error } = await supabase.from('orders').delete().eq('id', id);
  if (error) throw new Error(error.message);
};

export const exportOrdersTxt = (orders: Order[]): string => {
  const lines: string[] = [];
  lines.push('=== ORRA ORDERS EXPORT ===');
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push(`Total orders: ${orders.length}`);
  lines.push('');
  for (const o of orders) {
    lines.push(`Order #${o.id.slice(0, 8)}`);
    lines.push(`  User:    ${o.user?.name ?? o.userId}`);
    lines.push(`  Status:  ${o.status}`);
    lines.push(`  Placed:  ${o.createdAt}`);
    lines.push(`  Total:   ${o.totalAmount.toFixed(2)}`);
    for (const it of o.items) {
      lines.push(`    - ${it.quantity}x ${it.menuItem?.name ?? it.menuItemId} @ ${it.price.toFixed(2)}`);
      if (it.notes) lines.push(`      note: ${it.notes}`);
    }
    if (o.notes) lines.push(`  Notes:   ${o.notes}`);
    lines.push('');
  }
  return lines.join('\n');
};

