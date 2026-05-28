import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { createRestaurant, updateRestaurant, type Restaurant } from '@/api/restaurantsApi';

interface Props {
  open: boolean;
  onClose: () => void;
  initial: Restaurant | null;
}

export const RestaurantForm = ({ open, onClose, initial }: Props): JSX.Element => {
  const qc = useQueryClient();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (initial) {
      setName(initial.name);
      setDescription(initial.description ?? '');
      setCuisine(initial.cuisine ?? '');
      setActive(initial.active);
    } else {
      setName('');
      setDescription('');
      setCuisine('');
      setActive(true);
    }
  }, [initial, open]);

  const mutation = useMutation({
    mutationFn: async (): Promise<Restaurant> => {
      const payload = {
        name: name.trim(),
        description: description.trim() || undefined,
        cuisine: cuisine.trim() || undefined,
        active,
      };
      if (!payload.name) throw new Error('Name required');
      return initial ? updateRestaurant(initial.id, payload) : createRestaurant(payload);
    },
    onSuccess: () => {
      toast.success(initial ? 'Restaurant updated' : 'Restaurant created');
      qc.invalidateQueries({ queryKey: ['restaurants'] });
      onClose();
    },
    onError: (err) => toast.error((err as Error).message),
  });

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial ? 'Edit restaurant' : 'New restaurant'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label htmlFor="r-name">Name</Label>
            <Input id="r-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="r-cuisine">Cuisine</Label>
            <Input id="r-cuisine" value={cuisine} onChange={(e) => setCuisine(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="r-desc">Description</Label>
            <Textarea id="r-desc" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={active} onCheckedChange={setActive} id="r-active" />
            <Label htmlFor="r-active">Active</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
