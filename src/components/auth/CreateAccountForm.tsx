import { useMemo, useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useSettings } from '@/hooks/useSettings';

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
}

const CreateAccountForm = (): JSX.Element => {
  const { signUp } = useAuth();
  const { data: settings } = useSettings();
  const allowedDomain = settings?.allowedEmailDomain ?? 'magicorange.com';

  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState<boolean>(false);

  const subtitle = useMemo(() => `Requires a @${allowedDomain} email`, [allowedDomain]);

  const validate = (): FieldErrors => {
    const next: FieldErrors = {};
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedName) {
      next.name = 'Full name is required';
    }
    if (!trimmedEmail) {
      next.email = 'Email is required';
    } else if (!trimmedEmail.endsWith(`@${allowedDomain.toLowerCase()}`)) {
      next.email = `Email must end with @${allowedDomain}`;
    }
    if (password.length < 6) {
      next.password = 'Password must be at least 6 characters';
    }
    return next;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length > 0) {
      return;
    }
    setSubmitting(true);
    try {
      await signUp(name.trim(), email.trim(), password);
      toast.success('Account created!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not create account';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <p className="text-sm text-slate-500">{subtitle}</p>

      <div className="space-y-1.5">
        <Label htmlFor="signup-name">Full name</Label>
        <Input
          id="signup-name"
          type="text"
          autoComplete="name"
          placeholder="Jane Smith"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-invalid={Boolean(errors.name)}
        />
        {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="signup-email">Email</Label>
        <Input
          id="signup-email"
          type="email"
          autoComplete="email"
          placeholder={`you@${allowedDomain}`}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={Boolean(errors.email)}
        />
        {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="signup-password">Password</Label>
        <Input
          id="signup-password"
          type="password"
          autoComplete="new-password"
          placeholder="Min. 6 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-invalid={Boolean(errors.password)}
        />
        {errors.password && <p className="text-xs text-red-600">{errors.password}</p>}
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={submitting}>
        {submitting ? 'Creating account…' : 'Create Account'}
      </Button>
    </form>
  );
};

export default CreateAccountForm;
