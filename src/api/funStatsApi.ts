import { supabase } from '@/lib/supabase';

export interface FunStatsMostLoyal {
  userId: string;
  userName: string;
  avatarId: string;
  orderCount: number;
}

export interface FunStatsCreature {
  userId: string;
  userName: string;
  avatarId: string;
  itemName: string;
  repeatCount: number;
}

export interface FunStatsLate {
  userId: string;
  userName: string;
  avatarId: string;
  count: number;
}

export interface FunStatsTopDish {
  menuItemId: string;
  itemName: string;
  orderCount: number;
}

export interface BattleEntry {
  restaurantId: string;
  restaurantName: string;
  tagline: string | null;
  lunchLadyName: string | null;
  lunchLadyAvatarId: string | null;
  orderCount: number;
  avgPrice: number;
  sharePct: number;
}

export interface FunStats {
  mostLoyal: FunStatsMostLoyal;
  creatureOfHabit: FunStatsCreature;
  lateOrderer: FunStatsLate;
  topDish: FunStatsTopDish;
  battle: BattleEntry[];
}

/**
 * Calls the public Postgres function get_fun_stats().
 * No auth token needed — the function uses SECURITY DEFINER and is
 * GRANTED to the anon role.
 */
export const fetchFunStats = async (): Promise<FunStats> => {
  const { data, error } = await supabase.rpc('get_fun_stats');
  if (error) throw new Error(error.message);
  return data as FunStats;
};
