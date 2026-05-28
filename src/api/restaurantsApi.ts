import { supabase } from '@/lib/supabase';

export interface Restaurant {
  id: string;
  name: string;
  description?: string;
  cuisine?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export type RestaurantUpsert = Omit<Restaurant, 'id' | 'createdAt' | 'updatedAt'>;
export type RestaurantPatch = Partial<RestaurantUpsert>;

interface RestaurantRow {
  id: string;
  name: string;
  description: string | null;
  cuisine: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

const mapRestaurant = (r: RestaurantRow): Restaurant => ({
  id: r.id,
  name: r.name,
  description: r.description ?? undefined,
  cuisine: r.cuisine ?? undefined,
  active: r.active,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

export const fetchRestaurants = async (): Promise<Restaurant[]> => {
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) throw new Error(error.message);
  return (data as RestaurantRow[]).map(mapRestaurant);
};

export const createRestaurant = async (payload: RestaurantUpsert): Promise<Restaurant> => {
  const { data, error } = await supabase
    .from('restaurants')
    .insert({
      name: payload.name,
      description: payload.description ?? null,
      cuisine: payload.cuisine ?? null,
      active: payload.active,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return mapRestaurant(data as RestaurantRow);
};

export const updateRestaurant = async (id: string, payload: RestaurantPatch): Promise<Restaurant> => {
  const update: Partial<RestaurantRow> = {};
  if (payload.name !== undefined) update.name = payload.name;
  if (payload.description !== undefined) update.description = payload.description ?? null;
  if (payload.cuisine !== undefined) update.cuisine = payload.cuisine ?? null;
  if (payload.active !== undefined) update.active = payload.active;
  const { data, error } = await supabase
    .from('restaurants')
    .update(update)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return mapRestaurant(data as RestaurantRow);
};

export const deleteRestaurant = async (id: string): Promise<void> => {
  const { error } = await supabase.from('restaurants').delete().eq('id', id);
  if (error) throw new Error(error.message);
};

