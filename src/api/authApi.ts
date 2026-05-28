import { supabase } from '@/lib/supabase';

// Most auth flows (sign in, sign up, sign out, session restore) are handled
// directly via `supabase.auth` inside AuthContext. These helpers cover the
// password reset flow used by `ForgotPasswordForm` / `ResetPasswordForm`.

export const forgotPasswordRequest = async (email: string): Promise<{ ok: true }> => {
  const redirectTo = `${window.location.origin}/reset-password`;
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });
  if (error) throw new Error(error.message);
  return { ok: true };
};

// With Supabase Auth, the recovery link signs the user in to a temporary
// "recovery" session. The token query param isn't used; we simply update
// the user's password on the existing session.
export const resetPasswordRequest = async (_token: string, password: string): Promise<{ ok: true }> => {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw new Error(error.message);
  return { ok: true };
};

