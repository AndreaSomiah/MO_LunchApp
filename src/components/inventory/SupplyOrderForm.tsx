import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowDown, ArrowUp, Download, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  createSupplyOrder,
  fetchDailyPrefill,
  updateSupplyOrder,
  updateSupplyOrderStatus,
} from '@/api/supplyOrdersApi';
import { supplyOrdersQueryKey } from '@/hooks/useSupplyOrders';
import type {
  CreateSupplyOrderInput,
  SupplyOrder,
  SupplyOrderItemInput,
  SupplyOrderType,
} from '@/types/supplyOrder';

interface Props {
  open: boolean;
  onClose: () => void;
  type: SupplyOrderType;
  initial?: SupplyOrder | null;
}

const UNIT_OPTIONS = ['portions', 'units', 'kg', 'loaves', 'boxes', 'litres'];

const todayIso = (): string => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const defaultDailyTitle = (isoDate: string): string => {
  const d = new Date(`${isoDate}T00:00:00`);
  return `Daily Order \u2014 ${d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}`;
};

interface DraftItem extends SupplyOrderItemInput {
  key: string;
}

const newKey = (): string => Math.random().toString(36).slice(2, 10);

const blankItem = (): DraftItem => ({ key: newKey(), name: '', quantity: 1, unit: 'units', notes: '' });

export const SupplyOrderForm = ({ open, onClose, type, initial }: Props): JSX.Element => {
  const qc = useQueryClient();
  const isEdit = !!initial;

  const [title, setTitle] = useState('');
  const [eventDate, setEventDate] = useState(todayIso());
  const [eventTime, setEventTime] = useState('');
  const [venue, setVenue] = useState('');
  const [guestCount, setGuestCount] = useState<number | ''>('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<DraftItem[]>([blankItem()]);
  const [submitMode, setSubmitMode] = useState<'draft' | 'sent'>('draft');

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setTitle(initial.title);
      setEventDate(initial.eventDate);
      setEventTime(initial.eventTime ?? '');
      setVenue(initial.venue ?? '');
      setGuestCount(initial.guestCount ?? '');
      setNotes(initial.notes ?? '');
      setItems(
        initial.items.length
          ? initial.items.map((i) => ({
              key: i.id,
              name: i.name,
              quantity: i.quantity,
              unit: i.unit ?? 'units',
              notes: i.notes ?? '',
            }))
          : [blankItem()]
      );
    } else {
      const today = todayIso();
      setTitle(type === 'daily' ? defaultDailyTitle(today) : '');
      setEventDate(today);
      setEventTime('');
      setVenue('');
      setGuestCount('');
      setNotes('');
      setItems([blankItem()]);
    }
    setSubmitMode('draft');
  }, [open, initial, type]);

  const prefillMutation = useMutation({
    mutationFn: fetchDailyPrefill,
    onSuccess: (data) => {
      if (!data.items.length) {
        toast.info('No lunch orders found for today');
        return;
      }
      setItems(
        data.items.map((i) => ({
          key: newKey(),
          name: i.name,
          quantity: i.quantity,
          unit: i.unit,
          notes: '',
        }))
      );
      toast.success(`Pulled ${data.items.length} item(s) from today's lunch orders`);
    },
    onError: (err) => toast.error((err as Error).message),
  });

  const saveMutation = useMutation({
    mutationFn: async (): Promise<SupplyOrder> => {
      const cleanedItems: SupplyOrderItemInput[] = items
        .map((i) => ({
          name: i.name.trim(),
          quantity: i.quantity,
          unit: i.unit?.trim() || null,
          notes: (i.notes ?? '').trim() || null,
        }))
        .filter((i) => i.name);
      if (!cleanedItems.length) {
        throw new Error('Add at least one item');
      }
      const trimmedTitle = title.trim();
      if (type === 'event' && !trimmedTitle) {
        throw new Error('Event title is required');
      }
      const payloadBase = {
        title: trimmedTitle || undefined,
        eventDate,
        eventTime: eventTime || null,
        venue: venue.trim() || null,
        guestCount: typeof guestCount === 'number' ? guestCount : null,
        notes: notes.trim() || null,
        items: cleanedItems,
      };
      if (isEdit && initial) {
        const updated = await updateSupplyOrder(initial.id, payloadBase);
        if (submitMode === 'sent' && updated.status !== 'sent') {
          return updateSupplyOrderStatus(initial.id, 'sent');
        }
        return updated;
      }
      const body: CreateSupplyOrderInput = {
        type,
        ...payloadBase,
        status: submitMode,
      };
      return createSupplyOrder(body);
    },
    onSuccess: () => {
      toast.success(isEdit ? 'Order updated' : submitMode === 'sent' ? 'Order saved and sent' : 'Draft saved');
      qc.invalidateQueries({ queryKey: ['supply-orders'] });
      onClose();
    },
    onError: (err) => toast.error((err as Error).message),
  });

  const updateItem = (key: string, patch: Partial<DraftItem>): void => {
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, ...patch } : i)));
  };

  const removeItem = (key: string): void => {
    setItems((prev) => (prev.length <= 1 ? prev : prev.filter((i) => i.key !== key)));
  };

  const moveItem = (key: string, dir: -1 | 1): void => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.key === key);
      const target = idx + dir;
      if (idx < 0 || target < 0 || target >= prev.length) return prev;
      const next = prev.slice();
      [next[idx]!, next[target]!] = [next[target]!, next[idx]!];
      return next;
    });
  };

  const addItem = (): void => setItems((prev) => [...prev, blankItem()]);

  const dialogTitle = useMemo((): string => {
    if (isEdit) return `Edit ${type === 'daily' ? 'daily' : 'event'} order`;
    return type === 'daily' ? 'New daily order' : 'New event order';
  }, [isEdit, type]);

  const handleSubmit = (mode: 'draft' | 'sent'): void => {
    setSubmitMode(mode);
    // schedule on next tick so submitMode is current before mutate
    setTimeout(() => saveMutation.mutate(), 0);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="so-title">Title{type === 'event' ? ' *' : ''}</Label>
              <Input
                id="so-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={type === 'event' ? 'e.g. Q2 Team Lunch' : 'Daily Order \u2014 ...'}
              />
            </div>
            <div>
              <Label htmlFor="so-date">Date *</Label>
              <Input
                id="so-date"
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
              />
            </div>
            {type === 'event' && (
              <div>
                <Label htmlFor="so-time">Time</Label>
                <Input
                  id="so-time"
                  type="time"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                />
              </div>
            )}
            {type === 'event' && (
              <div>
                <Label htmlFor="so-venue">Venue</Label>
                <Input
                  id="so-venue"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="e.g. Boardroom"
                />
              </div>
            )}
            {type === 'event' && (
              <div>
                <Label htmlFor="so-guests">Guest count</Label>
                <Input
                  id="so-guests"
                  type="number"
                  min={1}
                  value={guestCount}
                  onChange={(e) => {
                    const v = e.target.value;
                    setGuestCount(v === '' ? '' : Math.max(1, Number(v) || 1));
                  }}
                />
              </div>
            )}
            <div className="sm:col-span-2">
              <Label htmlFor="so-notes">Notes</Label>
              <Textarea
                id="so-notes"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Anything the supplier should know..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800">Items</h3>
              <div className="flex items-center gap-2">
                {type === 'daily' && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => prefillMutation.mutate()}
                    disabled={prefillMutation.isPending}
                  >
                    <Download className="mr-1 h-4 w-4" />
                    {prefillMutation.isPending ? 'Pulling...' : "Pull from today's lunch orders"}
                  </Button>
                )}
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="mr-1 h-4 w-4" /> Add item
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              {items.map((item, idx) => (
                <div
                  key={item.key}
                  className="grid grid-cols-12 gap-2 rounded-md border border-slate-200 bg-slate-50 p-2"
                >
                  <div className="col-span-12 sm:col-span-4">
                    <Input
                      placeholder="Item name"
                      value={item.name}
                      onChange={(e) => updateItem(item.key, { name: e.target.value })}
                    />
                  </div>
                  <div className="col-span-4 sm:col-span-2">
                    <Input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => updateItem(item.key, { quantity: Math.max(1, Number(e.target.value) || 1) })}
                    />
                  </div>
                  <div className="col-span-8 sm:col-span-2">
                    <Select
                      value={item.unit ?? ''}
                      onChange={(e) => updateItem(item.key, { unit: e.target.value })}
                    >
                      {UNIT_OPTIONS.map((u) => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </Select>
                  </div>
                  <div className="col-span-12 sm:col-span-3">
                    <Input
                      placeholder="Notes"
                      value={item.notes ?? ''}
                      onChange={(e) => updateItem(item.key, { notes: e.target.value })}
                    />
                  </div>
                  <div className="col-span-12 flex items-center justify-end gap-1 sm:col-span-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => moveItem(item.key, -1)}
                      disabled={idx === 0}
                      aria-label="Move up"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => moveItem(item.key, 1)}
                      disabled={idx === items.length - 1}
                      aria-label="Move down"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.key)}
                      disabled={items.length <= 1}
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saveMutation.isPending}>
            Cancel
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSubmit('draft')}
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending && submitMode === 'draft' ? 'Saving...' : 'Save as draft'}
          </Button>
          <Button onClick={() => handleSubmit('sent')} disabled={saveMutation.isPending}>
            {saveMutation.isPending && submitMode === 'sent' ? 'Sending...' : 'Save and mark as sent'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
