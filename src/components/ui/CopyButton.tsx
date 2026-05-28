import { useEffect, useRef, useState } from 'react';
import { Check, ClipboardCopy } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface Props {
  text: string;
  label?: string;
  disabled?: boolean;
  disabledTooltip?: string;
}

export const CopyButton = ({
  text,
  label = 'Copy for WhatsApp',
  disabled = false,
  disabledTooltip,
}: Props): JSX.Element => {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleCopy = async (): Promise<void> => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error((err as Error).message || 'Failed to copy');
    }
  };

  const title = disabled ? (disabledTooltip ?? 'Nothing to copy') : 'Copy to clipboard';

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCopy}
      disabled={disabled}
      title={title}
      aria-label={label}
    >
      {copied ? <Check className="mr-1 h-4 w-4 text-green-600" /> : <ClipboardCopy className="mr-1 h-4 w-4" />}
      {copied ? 'Copied!' : label}
    </Button>
  );
};
