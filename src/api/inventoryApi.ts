import { supabase } from '@/lib/supabase';
import type { InventoryItem, InventoryRequest } from '@/types/inventory';

interface InventoryItemRow {
  id: string;
  name: string;
  category: string;
  stock_level: number;
  threshold: number;
  location: string | null;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

const mapItem = (r: InventoryItemRow): InventoryItem => ({
  id: r.id,
  name: r.name,
  category: r.category,
  stockLevel: r.stock_level,
  threshold: r.threshold,
  location: r.location ?? undefined,
  status: r.status,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

interface InventoryRequestRow {
  id: string;
  item_name: string;
  quantity_needed: number;
  reason: string | null;
  requested_by: string;
  status: 'open' | 'fulfilled' | 'rejected';
  fulfilled_by: string | null;
  linked_item_id: string | null;
  created_at: string;
  updated_at: string;
  requester?: { name: string } | null;
}

const mapRequest = (r: InventoryRequestRow): InventoryRequest => ({
  id: r.id,
  itemName: r.item_name,
  quantityNeeded: r.quantity_needed,
  reason: r.reason ?? undefined,
  requestedBy: r.requested_by,
  requestedByName: r.requester?.name,
  status: r.status,
  fulfilledBy: r.fulfilled_by ?? undefined,
  linkedItemId: r.linked_item_id ?? undefined,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

export const fetchInventoryItems = async (): Promise<InventoryItem[]> => {
  const { data, error } = await supabase
    .from('inventory_items')
    .select('*')
    .order('name', { ascending: true });
  if (error) throw new Error(error.message);
  return (data as InventoryItemRow[]).map(mapItem);
};

export type InventoryItemUpsert = Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>;
export type InventoryItemPatch = Partial<InventoryItemUpsert>;

const itemToRow = (p: InventoryItemPatch): Partial<InventoryItemRow> => {
  const r: Partial<InventoryItemRow> = {};
  if (p.name !== undefined) r.name = p.name;
  if (p.category !== undefined) r.category = p.category;
  if (p.stockLevel !== undefined) r.stock_level = p.stockLevel;
  if (p.threshold !== undefined) r.threshold = p.threshold;
  if (p.location !== undefined) r.location = p.location ?? null;
  if (p.status !== undefined) r.status = p.status;
  return r;
};

export const createInventoryItem = async (payload: InventoryItemUpsert): Promise<InventoryItem> => {
  const { data, error } = await supabase
    .from('inventory_items')
    .insert(itemToRow(payload))
    .select()
    .single();
  if (error) throw new Error(error.message);
  return mapItem(data as InventoryItemRow);
};

export const updateInventoryItem = async (id: string, payload: InventoryItemPatch): Promise<InventoryItem> => {
  const { data, error } = await supabase
    .from('inventory_items')
    .update(itemToRow(payload))
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return mapItem(data as InventoryItemRow);
};

export const deleteInventoryItem = async (id: string): Promise<void> => {
  const { error } = await supabase.from('inventory_items').delete().eq('id', id);
  if (error) throw new Error(error.message);
};

export const fetchInventoryRequests = async (status?: string): Promise<InventoryRequest[]> => {
  let q = supabase
    .from('inventory_requests')
    .select('*, requester:profiles!inventory_requests_requested_by_fkey(name)')
    .order('created_at', { ascending: false });
  if (status) q = q.eq('status', status);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data as InventoryRequestRow[]).map(mapRequest);
};

export interface NewInventoryRequest {
  itemName: string;
  quantityNeeded: number;
  reason?: string;
}

export const createInventoryRequest = async (payload: NewInventoryRequest): Promise<InventoryRequest> => {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error('Not signed in');
  const { data, error } = await supabase
    .from('inventory_requests')
    .insert({
      item_name: payload.itemName,
      quantity_needed: payload.quantityNeeded,
      reason: payload.reason ?? null,
      requested_by: auth.user.id,
    })
    .select('*, requester:profiles!inventory_requests_requested_by_fkey(name)')
    .single();
  if (error) throw new Error(error.message);
  return mapRequest(data as InventoryRequestRow);
};

export interface FulfilRequestPayload {
  status: 'open' | 'fulfilled' | 'rejected';
  linkedItemId?: string;
  addToStock?: number;
}

export const updateInventoryRequest = async (id: string, payload: FulfilRequestPayload): Promise<InventoryRequest> => {
  const { data: auth } = await supabase.auth.getUser();
  const update: Partial<InventoryRequestRow> = { status: payload.status };
  if (payload.linkedItemId !== undefined) update.linked_item_id = payload.linkedItemId;
  if (payload.status === 'fulfilled' && auth.user) update.fulfilled_by = auth.user.id;

  // Optionally bump stock on the linked item
  if (payload.status === 'fulfilled' && payload.linkedItemId && payload.addToStock && payload.addToStock > 0) {
    const { data: item } = await supabase
      .from('inventory_items')
      .select('stock_level')
      .eq('id', payload.linkedItemId)
      .single();
    if (item) {
      await supabase
        .from('inventory_items')
        .update({ stock_level: (item.stock_level ?? 0) + payload.addToStock })
        .eq('id', payload.linkedItemId);
    }
  }

  const { data, error } = await supabase
    .from('inventory_requests')
    .update(update)
    .eq('id', id)
    .select('*, requester:profiles!inventory_requests_requested_by_fkey(name)')
    .single();
  if (error) throw new Error(error.message);
  return mapRequest(data as InventoryRequestRow);
};

