import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { User, DietaryPreference } from '@/types/user';
import type { Session } from '@supabase/supabase-js';

export interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  hasSeenProfileNudge: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  dismissProfileNudge: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface ProfileRow {
  id: string;
  name: string;
  email: string;
  role: User['role'];
  dietary: string[] | null;
  avatar_id: string;
  image_url: string | null;
  created_at: string;
}

const loadProfile = async (session: Session): Promise<User | null> => {
  // Try to fetch existing profile.
  let { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .maybeSingle();
  if (error) throw new Error(error.message);

  // If trigger hasn't created one yet (or it's a fresh signup), create it.
  if (!data) {
    const meta = session.user.user_metadata as { name?: string; avatarId?: string } | undefined;
    const insert = {
      id: session.user.id,
      email: session.user.email ?? '',
      name: meta?.name ?? (session.user.email?.split('@')[0] ?? 'User'),
      avatar_id: meta?.avatarId ?? 'bear',
    };
    const res = await supabase.from('profiles').insert(insert).select().single();
    if (res.error) {
      // If a concurrent insert won the race, fetch the row instead.
      const refetch = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      if (refetch.error) throw new Error(refetch.error.message);
      data = refetch.data;
    } else {
      data = res.data;
    }
  }

  const r = data as ProfileRow;
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    role: r.role,
    dietary: (r.dietary ?? []) as DietaryPreference[],
    avatarId: r.avatar_id,
    imageUrl: r.image_url ?? undefined,
    createdAt: r.created_at,
  };
};

export const AuthProvider = ({ children }: { children: ReactNode }): JSX.Element => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasSeenProfileNudge, setHasSeenProfileNudge] = useState<boolean>(false);

  const applySession = useCallback(async (session: Session | null): Promise<void> => {
    if (!session) {
      setUser(null);
      return;
    }
    try {
      const profile = await loadProfile(session);
      setUser(profile);
    } catch (err) {
      console.error('Failed to load profile', err);
      setUser(null);
    }
  }, []);

  // Initial session restore + subscription to auth state changes.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      await applySession(data.session ?? null);
      setIsLoading(false);
    })();
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      applySession(session ?? null);
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [applySession]);

  const dismissProfileNudge = useCallback((): void => {
    setHasSeenProfileNudge(true);
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<void> => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) throw new Error(error.message);
    setHasSeenProfileNudge(false);
  }, []);

  const signUp = useCallback(async (name: string, email: string, password: string): Promise<void> => {
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { name: name.trim() } },
    });
    if (error) throw new Error(error.message);
    setHasSeenProfileNudge(false);
  }, []);

  const signOut = useCallback(async (): Promise<void> => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isLoading, hasSeenProfileNudge, signIn, signUp, signOut, dismissProfileNudge }),
    [user, isLoading, hasSeenProfileNudge, signIn, signUp, signOut, dismissProfileNudge]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

