import { ClipboardList } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { updateInventoryRequest } from '@/api/inventoryApi';
import { inventoryRequestsQueryKey } from '@/hooks/useInventory';
import type { InventoryRequest } from '@/types/inventory';

const formatDate = (s: string): string => {
  try {
    return new Date(s).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return s;
  }
};

const renderWithLinks = (text: string): JSX.Element => {
  const parts: JSX.Element[] = [];
  let lastIndex = 0;
  const re = /https?:\/\/[^\s]+/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<span key={`t${lastIndex}`}>{text.slice(lastIndex, match.index)}</span>);
    }
    const url = match[0];
    parts.push(
      <a key={`l${match.index}`} href={url} rel="noopener noreferrer" target="_blank" className="text-blue-600 underline break-all">
        {url}
      </a>
    );
    lastIndex = match.index + url.length;
  }
  if (lastIndex < text.length) {
    parts.push(<span key={`t${lastIndex}`}>{text.slice(lastIndex)}</span>);
  }
  return <>{parts}</>;
};

interface Props {
  requests: InventoryRequest[];
  canFulfil: boolean;
}

const statusStyle: Record<InventoryRequest['status'], string> = {
  open:      'bg-amber-100 text-amber-800',
  fulfilled: 'bg-green-100 text-green-800',
  rejected:  'bg-slate-200 text-slate-700',
};

export const InventoryRequestList = ({ requests, canFulfil }: Props): JSX.Element => {
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'fulfilled' | 'rejected' }) =>
      updateInventoryRequest(id, { status }),
    onSuccess: () => {
      toast.success('Request updated');
      qc.invalidateQueries({ queryKey: inventoryRequestsQueryKey() });
    },
    onError: (err) => toast.error((err as Error).message),
  });

  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <ClipboardList className="w-10 h-10 mb-3" />
        <p className="text-sm font-medium mb-3">No requests.</p>
      </div>
    );
  }
  return (
    <ul className="space-y-3">
      {requests.map((r) => (
        <li key={r.id} className="rounded-md border border-slate-200 bg-white p-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-medium text-slate-900">
                {r.itemName} <span className="text-sm text-slate-500">× {r.quantityNeeded}</span>
              </p>
              <div className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-slate-500">
                {r.requestedByName && <span>By {r.requestedByName}</span>}
                <span>{formatDate(r.createdAt)}</span>
              </div>
              {r.reason && (
                <p className="mt-1 text-sm text-slate-600">
                  <span className="font-medium text-slate-700">Description: </span>
                  {renderWithLinks(r.reason)}
                </p>
              )}
            </div>
            <Badge className={statusStyle[r.status]}>{r.status}</Badge>
          </div>
          {canFulfil && r.status === 'open' && (
            <div className="mt-3 flex gap-2">
              <Button
                size="sm"
                onClick={() => mutation.mutate({ id: r.id, status: 'fulfilled' })}
                disabled={mutation.isPending}
              >
                Mark fulfilled
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => mutation.mutate({ id: r.id, status: 'rejected' })}
                disabled={mutation.isPending}
              >
                Reject
              </Button>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
};
