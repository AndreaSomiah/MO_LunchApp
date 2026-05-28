import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CalendarDays, ChevronDown, Edit3, Eye, MapPin, Trash2, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CopyButton } from '@/components/ui/CopyButton';
import { Select } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { deleteSupplyOrder, updateSupplyOrderStatus } from '@/api/supplyOrdersApi';
import type { SupplyOrder, SupplyOrderStatus } from '@/types/supplyOrder';
import { formatSupplyOrderForWhatsApp } from '@/lib/whatsappFormat';
import { cn } from '@/lib/utils';

interface Props {
  order: SupplyOrder;
  onEdit: (order: SupplyOrder) => void;
}

const STATUS_STYLES: Record<SupplyOrderStatus, string> = {
  draft:     'bg-slate-100 text-slate-700',
  sent:      'bg-blue-100 text-blue-700',
  fulfilled: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const STATUS_LABEL: Record<SupplyOrderStatus, string> = {
  draft: 'Draft',
  sent: 'Sent',
  fulfilled: 'Fulfilled',
  cancelled: 'Cancelled',
};

const formatDate = (iso: string): string => {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
};

export const SupplyOrderCard = ({ order, onEdit }: Props): JSX.Element => {
  const qc = useQueryClient();
  const [viewOpen, setViewOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const isDraft = order.status === 'draft';
  const isReadOnly = order.status === 'sent' || order.status === 'fulfilled' || order.status === 'cancelled';

  const statusMutation = useMutation({
    mutationFn: (status: SupplyOrderStatus) => updateSupplyOrderStatus(order.id, status),
    onSuccess: (_, status) => {
      toast.success(`Marked as ${STATUS_LABEL[status].toLowerCase()}`);
      qc.invalidateQueries({ queryKey: ['supply-orders'] });
    },
    onError: (err) => toast.error((err as Error).message),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteSupplyOrder(order.id),
    onSuccess: () => {
      toast.success('Order deleted');
      qc.invalidateQueries({ queryKey: ['supply-orders'] });
      setConfirmDelete(false);
    },
    onError: (err) => toast.error((err as Error).message),
  });

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-slate-900">{order.title}</h3>
            <Badge className={cn(STATUS_STYLES[order.status])}>{STATUS_LABEL[order.status]}</Badge>
            <Badge className="bg-slate-100 text-slate-600">{order.type === 'daily' ? 'Daily' : 'Event'}</Badge>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              {formatDate(order.eventDate)}{order.eventTime ? ` \u00b7 ${order.eventTime}` : ''}
            </span>
            {order.venue && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {order.venue}
              </span>
            )}
            {order.guestCount && (
              <span className="inline-flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {order.guestCount} guests
              </span>
            )}
            <span>{order.items.length} item{order.items.length === 1 ? '' : 's'}</span>
            {order.createdByName && <span>by {order.createdByName}</span>}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => setViewOpen(true)}>
            <Eye className="mr-1 h-4 w-4" /> View
          </Button>
          {isDraft && (
            <Button variant="ghost" size="sm" onClick={() => onEdit(order)}>
              <Edit3 className="mr-1 h-4 w-4" /> Edit
            </Button>
          )}
          <div className="relative inline-flex items-center">
            <Select
              className="h-8 pr-8 text-xs"
              value={order.status}
              onChange={(e) => statusMutation.mutate(e.target.value as SupplyOrderStatus)}
              disabled={statusMutation.isPending}
              aria-label="Change status"
            >
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="fulfilled">Fulfilled</option>
              <option value="cancelled">Cancelled</option>
            </Select>
            <ChevronDown className="pointer-events-none absolute right-2 h-3 w-3 text-slate-400" />
          </div>
          {isDraft && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setConfirmDelete(true)}
              aria-label="Delete order"
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          )}
        </div>
      </div>

      {isReadOnly && (
        <p className="mt-2 text-xs italic text-slate-400">
          This order is {STATUS_LABEL[order.status].toLowerCase()} and cannot be edited or deleted.
        </p>
      )}

      <div className="mt-3 flex justify-end">
        <CopyButton
          text={formatSupplyOrderForWhatsApp(order)}
          label="Copy order for WhatsApp"
          disabled={order.items.length === 0}
          disabledTooltip="No items to copy"
        />
      </div>

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{order.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <div className="text-slate-500">
              {formatDate(order.eventDate)}
              {order.eventTime ? ` \u00b7 ${order.eventTime}` : ''}
              {order.venue ? ` \u00b7 ${order.venue}` : ''}
              {order.guestCount ? ` \u00b7 ${order.guestCount} guests` : ''}
            </div>
            {order.notes && (
              <p className="rounded-md bg-slate-50 p-2 text-slate-700">{order.notes}</p>
            )}
            <ul className="divide-y divide-slate-200 rounded-md border border-slate-200">
              {order.items.map((i) => (
                <li key={i.id} className="flex items-center justify-between gap-2 px-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-900">{i.name}</p>
                    {i.notes && <p className="truncate text-xs text-slate-500">{i.notes}</p>}
                  </div>
                  <span className="whitespace-nowrap text-sm text-slate-700">
                    {i.quantity} {i.unit ?? ''}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this order?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600">
            "{order.title}" will be permanently removed. This cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
