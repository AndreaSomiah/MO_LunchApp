import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { bulkImportMenuItems, type MenuItemUpsert } from '@/api/menuApi';
import type { DietaryPreference } from '@/types/menu';
import type { Restaurant } from '@/api/restaurantsApi';

interface Props {
  open: boolean;
  onClose: () => void;
  restaurants: Restaurant[];
}

// CSV header: name,description,category,price,calories,dietary,imageUrl,available
const parseCsv = (csv: string, defaultRestaurantId: string): MenuItemUpsert[] => {
  const lines = csv.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
  if (lines.length === 0) return [];
  const rows: MenuItemUpsert[] = [];
  const start = lines[0]?.toLowerCase().includes('name') ? 1 : 0;
  for (let i = start; i < lines.length; i += 1) {
    const cols = (lines[i] ?? '').split(',').map((c) => c.trim());
    const [name, description, category, price, calories, dietary, imageUrl, available] = cols;
    if (!name || !category || !price) continue;
    const priceNum = Number(price);
    if (!Number.isFinite(priceNum) || priceNum <= 0) continue;
    rows.push({
      name,
      description: description || undefined,
      category,
      price: priceNum,
      calories: calories ? Number(calories) : undefined,
      dietary: (dietary || undefined) as DietaryPreference | undefined,
      imageUrl: imageUrl || undefined,
      available: available === undefined ? true : available.toLowerCase() !== 'false',
      restaurantId: defaultRestaurantId,
    });
  }
  return rows;
};

export const BulkImportDialog = ({ open, onClose, restaurants }: Props): JSX.Element => {
  const qc = useQueryClient();
  const [csv, setCsv] = useState('');
  const [restaurantId, setRestaurantId] = useState(restaurants[0]?.id ?? '');
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [importing, setImporting] = useState(false);

  const run = async (): Promise<void> => {
    if (!restaurantId) {
      toast.error('Select a restaurant');
      return;
    }
    const rows = parseCsv(csv, restaurantId);
    if (rows.length === 0) {
      toast.error('No valid rows in CSV');
      return;
    }
    setImporting(true);
    setProgress({ done: 0, total: rows.length });
    const result = await bulkImportMenuItems(rows, (done, total) => setProgress({ done, total }));
    setImporting(false);
    qc.invalidateQueries({ queryKey: ['menu-items'] });
    if (result.failed === 0) {
      toast.success(`Imported ${result.ok} item${result.ok === 1 ? '' : 's'}`);
      setCsv('');
      onClose();
    } else {
      toast.error(`${result.ok} ok, ${result.failed} failed`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Bulk import menu items</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-slate-500">
          Paste CSV with columns: <code>name,description,category,price,calories,dietary,imageUrl,available</code>
        </p>
        <div className="mt-3 space-y-3">
          <div>
            <Label htmlFor="bulk-rest">Restaurant for new items</Label>
            <select
              id="bulk-rest"
              className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
              value={restaurantId}
              onChange={(e) => setRestaurantId(e.target.value)}
            >
              {restaurants.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="bulk-csv">CSV</Label>
            <Textarea
              id="bulk-csv"
              rows={10}
              value={csv}
              onChange={(e) => setCsv(e.target.value)}
              placeholder="name,description,category,price,calories,dietary,imageUrl,available"
            />
          </div>
          {progress && (
            <p className="text-sm text-slate-600">
              {progress.done} / {progress.total}
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={importing}>Cancel</Button>
          <Button onClick={run} disabled={importing}>
            {importing ? 'Importing...' : 'Import'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
