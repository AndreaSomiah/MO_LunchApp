import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { createInventoryRequest } from '@/api/inventoryApi';
import { inventoryRequestsQueryKey } from '@/hooks/useInventory';

interface Props {
  open: boolean;
  onClose: () => void;
}

export const InventoryRequestForm = ({ open, onClose }: Props): JSX.Element => {
  const qc = useQueryClient();
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [description, setDescription] = useState('');

  const mutation = useMutation({
    mutationFn: createInventoryRequest,
    onSuccess: () => {
      toast.success('Request submitted');
      qc.invalidateQueries({ queryKey: inventoryRequestsQueryKey() });
      setItemName('');
      setQuantity(1);
      setDescription('');
      onClose();
    },
    onError: (err) => toast.error((err as Error).message),
  });

  const handleSubmit = (): void => {
    const name = itemName.trim();
    if (!name) {
      toast.error('Item name required');
      return;
    }
    mutation.mutate({ itemName: name, quantityNeeded: quantity, reason: description.trim() || undefined });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New inventory request</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label htmlFor="req-name">Item name</Label>
            <Input id="req-name" value={itemName} onChange={(e) => setItemName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="req-qty">Quantity needed</Label>
            <Input
              id="req-qty"
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
            />
          </div>
          <div>
            <Label htmlFor="req-reason">Description (optional)</Label>
            <Textarea id="req-reason" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Add details or paste a link..." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={mutation.isPending}>
            {mutation.isPending ? 'Submitting...' : 'Submit'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
