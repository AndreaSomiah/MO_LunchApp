import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { createMenuItem, updateMenuItem, type MenuItemUpsert } from '@/api/menuApi';
import { menuItemsQueryKey } from '@/hooks/useMenuItems';
import { DIETARY_OPTIONS } from '@/data/dietaryOptions';
import type { MenuItem, DietaryPreference } from '@/types/menu';
import type { Restaurant } from '@/api/restaurantsApi';

interface Props {
  open: boolean;
  onClose: () => void;
  initial: MenuItem | null;
  restaurants: Restaurant[];
}

interface FormState {
  name: string;
  description: string;
  category: string;
  price: string;
  calories: string;
  dietary: '' | DietaryPreference;
  imageUrl: string;
  available: boolean;
  restaurantId: string;
}

const empty = (defaultRestaurant: string): FormState => ({
  name: '',
  description: '',
  category: '',
  price: '',
  calories: '',
  dietary: '',
  imageUrl: '',
  available: true,
  restaurantId: defaultRestaurant,
});

export const MenuItemForm = ({ open, onClose, initial, restaurants }: Props): JSX.Element => {
  const qc = useQueryClient();
  const defaultRestaurant = restaurants[0]?.id ?? '';
  const [state, setState] = useState<FormState>(empty(defaultRestaurant));

  useEffect(() => {
    if (initial) {
      setState({
        name: initial.name,
        description: initial.description ?? '',
        category: initial.category,
        price: String(initial.price),
        calories: initial.calories === undefined ? '' : String(initial.calories),
        dietary: initial.dietary ?? '',
        imageUrl: initial.imageUrl ?? '',
        available: initial.available,
        restaurantId: initial.restaurantId,
      });
    } else {
      setState(empty(defaultRestaurant));
    }
  }, [initial, defaultRestaurant, open]);

  const mutation = useMutation({
    mutationFn: async (): Promise<MenuItem> => {
      const price = Number(state.price);
      if (!state.name.trim() || !state.category.trim() || !state.restaurantId || !Number.isFinite(price) || price <= 0) {
        throw new Error('Name, category, restaurant, and a positive price are required');
      }
      const payload: MenuItemUpsert = {
        name: state.name.trim(),
        description: state.description.trim() || undefined,
        category: state.category.trim(),
        price,
        calories: state.calories.trim() === '' ? undefined : Number(state.calories),
        dietary: state.dietary === '' ? undefined : state.dietary,
        imageUrl: state.imageUrl.trim() || undefined,
        available: state.available,
        restaurantId: state.restaurantId,
      };
      return initial ? updateMenuItem(initial.id, payload) : createMenuItem(payload);
    },
    onSuccess: () => {
      toast.success(initial ? 'Menu item updated' : 'Menu item created');
      qc.invalidateQueries({ queryKey: ['menu-items'] });
      onClose();
    },
    onError: (err) => toast.error((err as Error).message),
  });

  const update = <K extends keyof FormState>(k: K, v: FormState[K]): void => {
    setState((p) => ({ ...p, [k]: v }));
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{initial ? 'Edit menu item' : 'New menu item'}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="md:col-span-2">
            <Label htmlFor="mi-name">Name</Label>
            <Input id="mi-name" value={state.name} onChange={(e) => update('name', e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="mi-desc">Description</Label>
            <Textarea id="mi-desc" rows={2} value={state.description} onChange={(e) => update('description', e.target.value)} />
          </div>
          <div>
            <Label htmlFor="mi-cat">Category</Label>
            <Input id="mi-cat" value={state.category} onChange={(e) => update('category', e.target.value)} />
          </div>
          <div>
            <Label htmlFor="mi-price">Price</Label>
            <Input id="mi-price" type="number" min={0} step="0.01" value={state.price} onChange={(e) => update('price', e.target.value)} />
          </div>
          <div>
            <Label htmlFor="mi-cal">Calories</Label>
            <Input id="mi-cal" type="number" min={0} value={state.calories} onChange={(e) => update('calories', e.target.value)} />
          </div>
          <div>
            <Label htmlFor="mi-diet">Dietary</Label>
            <Select id="mi-diet" value={state.dietary} onChange={(e) => update('dietary', e.target.value as FormState['dietary'])}>
              {DIETARY_OPTIONS.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="mi-rest">Restaurant</Label>
            <Select id="mi-rest" value={state.restaurantId} onChange={(e) => update('restaurantId', e.target.value)}>
              {restaurants.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </Select>
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="mi-img">Image URL</Label>
            <Input id="mi-img" value={state.imageUrl} onChange={(e) => update('imageUrl', e.target.value)} />
          </div>
          <div className="flex items-center gap-3 md:col-span-2">
            <Switch checked={state.available} onCheckedChange={(v) => update('available', v)} id="mi-avail" />
            <Label htmlFor="mi-avail">Available</Label>
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
