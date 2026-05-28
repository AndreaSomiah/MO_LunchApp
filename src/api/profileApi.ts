import { supabase } from '@/lib/supabase';
import type { User, DietaryPreference, UserRole } from '@/types/user';

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

export const fetchProfile = async (): Promise<User> => {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error('Not signed in');
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', auth.user.id)
    .single();
  if (error) throw new Error(error.message);
  return mapProfile(data as ProfileRow);
};

export interface ProfilePatch {
  name?: string;
  dietary?: DietaryPreference[];
  avatarId?: 'bear' | 'fox' | 'koala' | 'penguin' | 'lion';
  imageUrl?: string;
}

export const updateProfile = async (payload: ProfilePatch): Promise<User> => {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error('Not signed in');

  const update: Partial<ProfileRow> = {};
  if (payload.name !== undefined) update.name = payload.name;
  if (payload.dietary !== undefined) update.dietary = payload.dietary;
  if (payload.avatarId !== undefined) update.avatar_id = payload.avatarId;
  if (payload.imageUrl !== undefined) update.image_url = payload.imageUrl;

  const { data, error } = await supabase
    .from('profiles')
    .update(update)
    .eq('id', auth.user.id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return mapProfile(data as ProfileRow);
};

