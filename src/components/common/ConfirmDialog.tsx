import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface Props {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  destructive?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

export const ConfirmDialog = ({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  destructive,
  onCancel,
  onConfirm,
  loading,
}: Props): JSX.Element => (
  <Dialog open={open} onOpenChange={(o) => { if (!o) onCancel(); }}>
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>
      {description && <p className="text-sm text-slate-600">{description}</p>}
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button
          type="button"
          variant={destructive ? 'destructive' : 'default'}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? 'Working...' : confirmLabel}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
