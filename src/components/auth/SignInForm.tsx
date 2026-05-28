import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import ForgotPasswordForm from './ForgotPasswordForm';

const SignInForm = (): JSX.Element => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [showForgot, setShowForgot] = useState<boolean>(false);

  if (showForgot) {
    return <ForgotPasswordForm onCancel={() => setShowForgot(false)} />;
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await signIn(email.trim(), password);
    } catch {
      setError('Invalid credentials');
      toast.error('Sign in failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="signin-email">Email</Label>
        <Input
          id="signin-email"
          type="email"
          autoComplete="email"
          placeholder="you@magicorange.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="signin-password">Password</Label>
        <Input
          id="signin-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <div className="flex justify-end">
          <button
            type="button"
            className="text-sm text-brand hover:underline"
            onClick={() => setShowForgot(true)}
          >
            Forgot password?
          </button>
        </div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" size="lg" className="w-full" disabled={submitting}>
        {submitting ? 'Signing in…' : 'Sign In'}
      </Button>
    </form>
  );
};

export default SignInForm;
