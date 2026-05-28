import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { forgotPasswordRequest } from '@/api/authApi';

interface Props {
  onCancel: () => void;
}

const ForgotPasswordForm = ({ onCancel }: Props): JSX.Element => {
  const [email, setEmail] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [sent, setSent] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await forgotPasswordRequest(email);
      setSent(true);
      toast.success('If that email exists, a reset link is on its way.');
    } catch {
      toast.error('Could not send reset link');
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-slate-900">Check your inbox</h3>
        <p className="text-sm text-slate-600">
          If an account exists for <span className="font-medium">{email.trim()}</span>, we’ve sent a reset link.
        </p>
        <Button variant="outline" size="lg" className="w-full" onClick={onCancel}>
          Back to sign in
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <h3 className="text-base font-semibold text-slate-900">Reset your password</h3>
        <p className="text-sm text-slate-500">We’ll email you a link to set a new one.</p>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="forgot-email">Email</Label>
        <Input
          id="forgot-email"
          type="email"
          autoComplete="email"
          placeholder="you@magicorange.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="flex-1" disabled={submitting}>
          {submitting ? 'Sending…' : 'Send reset link'}
        </Button>
      </div>
    </form>
  );
};

export default ForgotPasswordForm;
