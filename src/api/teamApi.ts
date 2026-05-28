import { supabase } from '@/lib/supabase';
import type { User, UserRole, DietaryPreference } from '@/types/user';

interface ProfileRow {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  dietary: string[] | null;
  avatar_id: string;
  image_url: string | null;
  created_at: string;
}

const mapProfile = (r: ProfileRow): User => ({
  id: r.id,
  name: r.name,
  email: r.email,
  role: r.role,
  dietary: (r.dietary ?? []) as DietaryPreference[],
  avatarId: r.avatar_id,
  imageUrl: r.image_url ?? undefined,
  createdAt: r.created_at,
});

export const fetchTeam = async (): Promise<User[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) throw new Error(error.message);
  return (data as ProfileRow[]).map(mapProfile);
};

export const updateTeamRole = async (id: string, role: UserRole): Promise<User> => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return mapProfile(data as ProfileRow);
};

