import { supabase } from '@/lib/supabase';
import type {
  CreateSupplyOrderInput,
  PrefillItem,
  SupplyOrder,
  SupplyOrderItem,
  SupplyOrderStatus,
  SupplyOrderType,
  UpdateSupplyOrderInput,
} from '@/types/supplyOrder';

export interface SupplyOrderFilters {
  type?: SupplyOrderType;
  status?: SupplyOrderStatus;
  dateFrom?: string;
  dateTo?: string;
}

interface SupplyOrderRow {
  id: string;
  type: SupplyOrderType;
  title: string;
  event_date: string;
  event_time: string | null;
  venue: string | null;
  guest_count: number | null;
  status: SupplyOrderStatus;
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  creator?: { name: string } | null;
  items?: SupplyOrderItemRow[];
}

interface SupplyOrderItemRow {
  id: string;
  supply_order_id: string;
  name: string;
  quantity: number;
  unit: string | null;
  notes: string | null;
  sort_order: number;
}

const mapItem = (r: SupplyOrderItemRow): SupplyOrderItem => ({
  id: r.id,
  name: r.name,
  quantity: r.quantity,
  unit: r.unit,
  notes: r.notes,
  sortOrder: r.sort_order,
});

const mapOrder = (r: SupplyOrderRow): SupplyOrder => ({
  id: r.id,
  type: r.type,
  title: r.title,
  eventDate: r.event_date,
  eventTime: r.event_time,
  venue: r.venue,
  guestCount: r.guest_count,
  status: r.status,
  notes: r.notes,
  createdBy: r.created_by,
  createdByName: r.creator?.name ?? null,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
  items: (r.items ?? [])
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(mapItem),
});

const SELECT = `
  *,
  creator:profiles!supply_orders_created_by_fkey(name),
  items:supply_order_items(*)
`;

export const fetchSupplyOrders = async (filters: SupplyOrderFilters = {}): Promise<SupplyOrder[]> => {
  let q = supabase.from('supply_orders').select(SELECT).order('event_date', { ascending: false });
  if (filters.type) q = q.eq('type', filters.type);
  if (filters.status) q = q.eq('status', filters.status);
  if (filters.dateFrom) q = q.gte('event_date', filters.dateFrom);
  if (filters.dateTo) q = q.lte('event_date', filters.dateTo);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data as SupplyOrderRow[]).map(mapOrder);
};

export const fetchSupplyOrder = async (id: string): Promise<SupplyOrder> => {
  const { data, error } = await supabase
    .from('supply_orders')
    .select(SELECT)
    .eq('id', id)
    .single();
  if (error) throw new Error(error.message);
  return mapOrder(data as SupplyOrderRow);
};

const insertItems = async (orderId: string, items: CreateSupplyOrderInput['items']): Promise<void> => {
  if (!items.length) return;
  const rows = items.map((it, idx) => ({
    supply_order_id: orderId,
    name: it.name,
    quantity: it.quantity,
    unit: it.unit ?? null,
    notes: it.notes ?? null,
    sort_order: idx,
  }));
  const { error } = await supabase.from('supply_order_items').insert(rows);
  if (error) throw new Error(error.message);
};

export const createSupplyOrder = async (body: CreateSupplyOrderInput): Promise<SupplyOrder> => {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error('Not signed in');

  const { data, error } = await supabase
    .from('supply_orders')
    .insert({
      type: body.type,
      title: body.title ?? (body.type === 'daily' ? 'Daily order' : 'Event order'),
      event_date: body.eventDate,
      event_time: body.eventTime ?? null,
      venue: body.venue ?? null,
      guest_count: body.guestCount ?? null,
      notes: body.notes ?? null,
      status: body.status ?? 'draft',
      created_by: auth.user.id,
    })
    .select('id')
    .single();
  if (error) throw new Error(error.message);
  const id = (data as { id: string }).id;
  await insertItems(id, body.items);
  return fetchSupplyOrder(id);
};

export const updateSupplyOrder = async (id: string, body: UpdateSupplyOrderInput): Promise<SupplyOrder> => {
  const update: Partial<SupplyOrderRow> = {};
  if (body.title !== undefined) update.title = body.title;
  if (body.eventDate !== undefined) update.event_date = body.eventDate;
  if (body.eventTime !== undefined) update.event_time = body.eventTime;
  if (body.venue !== undefined) update.venue = body.venue;
  if (body.guestCount !== undefined) update.guest_count = body.guestCount;
  if (body.notes !== undefined) update.notes = body.notes;

  if (Object.keys(update).length) {
    const { error } = await supabase.from('supply_orders').update(update).eq('id', id);
    if (error) throw new Error(error.message);
  }

  if (body.items) {
    const del = await supabase.from('supply_order_items').delete().eq('supply_order_id', id);
    if (del.error) throw new Error(del.error.message);
    await insertItems(id, body.items);
  }

  return fetchSupplyOrder(id);
};

export const updateSupplyOrderStatus = async (id: string, status: SupplyOrderStatus): Promise<SupplyOrder> => {
  const { error } = await supabase.from('supply_orders').update({ status }).eq('id', id);
  if (error) throw new Error(error.message);
  return fetchSupplyOrder(id);
};

export const deleteSupplyOrder = async (id: string): Promise<null> => {
  const { error } = await supabase.from('supply_orders').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return null;
};

// Suggest items to restock: any active inventory item at or below threshold.
export const fetchDailyPrefill = async (): Promise<{ items: PrefillItem[] }> => {
  const { data, error } = await supabase
    .from('inventory_items')
    .select('name, stock_level, threshold')
    .eq('status', 'active')
    .order('name', { ascending: true });
  if (error) throw new Error(error.message);
  const items: PrefillItem[] = (data ?? [])
    .filter((r) => (r.stock_level as number) <= (r.threshold as number))
    .map((r) => ({
      name: r.name as string,
      quantity: Math.max(1, (r.threshold as number) - (r.stock_level as number)),
      unit: 'unit',
    }));
  return { items };
};

