import { supabase } from '@/lib/supabase';
import type { MenuItem, DietaryPreference } from '@/types/menu';

export interface MenuQuery {
  category?: string;
  restaurantId?: string;
  available?: boolean;
  search?: string;
}

interface MenuItemRow {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price: number | string;
  calories: number | null;
  dietary: string | null;
  image_url: string | null;
  available: boolean;
  restaurant_id: string;
  created_at: string;
  updated_at: string;
}

const mapMenuItem = (r: MenuItemRow): MenuItem => ({
  id: r.id,
  name: r.name,
  description: r.description ?? undefined,
  category: r.category,
  price: typeof r.price === 'string' ? Number(r.price) : r.price,
  calories: r.calories ?? undefined,
  dietary: (r.dietary ?? undefined) as DietaryPreference | undefined,
  imageUrl: r.image_url ?? undefined,
  available: r.available,
  restaurantId: r.restaurant_id,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

export const fetchMenuItems = async (query: MenuQuery = {}): Promise<MenuItem[]> => {
  let q = supabase.from('menu_items').select('*');
  if (query.category) q = q.eq('category', query.category);
  if (query.restaurantId) q = q.eq('restaurant_id', query.restaurantId);
  if (query.available !== undefined) q = q.eq('available', query.available);
  if (query.search) q = q.ilike('name', `%${query.search}%`);
  q = q.order('name', { ascending: true });
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data as MenuItemRow[]).map(mapMenuItem);
};

export type MenuItemUpsert = Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>;
export type MenuItemPatch = Partial<MenuItemUpsert>;

const toRow = (p: MenuItemPatch): Partial<MenuItemRow> => {
  const row: Partial<MenuItemRow> = {};
  if (p.name !== undefined) row.name = p.name;
  if (p.description !== undefined) row.description = p.description ?? null;
  if (p.category !== undefined) row.category = p.category;
  if (p.price !== undefined) row.price = p.price;
  if (p.calories !== undefined) row.calories = p.calories ?? null;
  if (p.dietary !== undefined) row.dietary = p.dietary ?? null;
  if (p.imageUrl !== undefined) row.image_url = p.imageUrl ?? null;
  if (p.available !== undefined) row.available = p.available;
  if (p.restaurantId !== undefined) row.restaurant_id = p.restaurantId;
  return row;
};

export const createMenuItem = async (payload: MenuItemUpsert): Promise<MenuItem> => {
  const { data, error } = await supabase
    .from('menu_items')
    .insert(toRow(payload))
    .select()
    .single();
  if (error) throw new Error(error.message);
  return mapMenuItem(data as MenuItemRow);
};

export const updateMenuItem = async (id: string, payload: MenuItemPatch): Promise<MenuItem> => {
  const { data, error } = await supabase
    .from('menu_items')
    .update(toRow(payload))
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return mapMenuItem(data as MenuItemRow);
};

export const deleteMenuItem = async (id: string): Promise<void> => {
  const { error } = await supabase.from('menu_items').delete().eq('id', id);
  if (error) throw new Error(error.message);
};

export const bulkImportMenuItems = async (
  rows: MenuItemUpsert[],
  onProgress?: (done: number, total: number) => void
): Promise<{ ok: number; failed: number; errors: string[] }> => {
  let ok = 0;
  let failed = 0;
  const errors: string[] = [];
  for (let i = 0; i < rows.length; i += 1) {
    try {
      const row = rows[i];
      if (!row) continue;
      await createMenuItem(row);
      ok += 1;
    } catch (err) {
      failed += 1;
      errors.push(`Row ${i + 1}: ${(err as Error).message}`);
    }
    onProgress?.(i + 1, rows.length);
  }
  return { ok, failed, errors };
};

