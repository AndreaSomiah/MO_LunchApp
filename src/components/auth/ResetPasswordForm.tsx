import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';

const ResetPasswordForm = (): JSX.Element => {
  const navigate = useNavigate();

  const [ready, setReady] = useState<boolean>(false);
  const [hasSession, setHasSession] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [confirm, setConfirm] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Supabase emits a `PASSWORD_RECOVERY` event when the user arrives via the
  // reset link. We also accept any active session as valid.
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || session) {
        setHasSession(true);
      }
      setReady(true);
    });
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) setHasSession(true);
      setReady(true);
    })();
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!ready) {
    return <p className="text-sm text-slate-500">Loading…</p>;
  }

  if (!hasSession) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-slate-600">This reset link is invalid or has expired.</p>
        <Link to="/" className="text-sm font-medium text-brand underline">
          Back to sign in
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) throw new Error(err.message);
      toast.success('Password updated! Please sign in.');
      await supabase.auth.signOut();
      navigate('/', { replace: true });
    } catch (err) {
      setError((err as Error).message || 'Could not update password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <h3 className="text-base font-semibold text-slate-900">Set a new password</h3>
        <p className="text-sm text-slate-500">Choose a password with at least 6 characters.</p>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="rp-password">New password</Label>
        <Input
          id="rp-password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="rp-confirm">Confirm password</Label>
        <Input
          id="rp-confirm"
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? 'Saving…' : 'Set new password'}
      </Button>
      <div className="text-center">
        <Link to="/" className="text-sm text-slate-500 hover:underline">
          Back to sign in
        </Link>
      </div>
    </form>
  );
};

export default ResetPasswordForm;

