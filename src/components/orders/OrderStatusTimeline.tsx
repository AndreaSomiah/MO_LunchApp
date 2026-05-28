import { cn } from '@/lib/utils';
import type { OrderStatus, OrderStatusEvent } from '@/types/order';

const TIMELINE: OrderStatus[] = ['pending', 'confirmed', 'delivered'];

interface Props {
  current: OrderStatus;
  history?: OrderStatusEvent[];
}

const formatDate = (s?: string): string => {
  if (!s) return '';
  try {
    return new Date(s).toLocaleString();
  } catch {
    return s;
  }
};

export const OrderStatusTimeline = ({ current, history }: Props): JSX.Element => {
  if (current === 'cancelled') {
    return (
      <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-medium text-slate-700">Order cancelled</p>
        <p className="mt-1 text-xs text-slate-500">
          {formatDate(history?.find((h) => h.toStatus === 'cancelled')?.changedAt)}
        </p>
      </div>
    );
  }
  const currentIdx = TIMELINE.indexOf(current);
  return (
    <ol className="space-y-3">
      {TIMELINE.map((step, idx) => {
        const isDone = idx <= currentIdx;
        const isCurrent = idx === currentIdx;
        const evt = history?.find((h) => h.toStatus === step);
        return (
          <li key={step} className="flex items-start gap-3">
            <span
              className={cn(
                'mt-1 inline-flex h-3 w-3 shrink-0 rounded-full',
                isDone ? 'bg-brand' : 'bg-slate-300',
                isCurrent && 'ring-4 ring-brand/20'
              )}
              aria-hidden
            />
            <div>
              <p className={cn('text-sm font-medium capitalize', isDone ? 'text-slate-900' : 'text-slate-400')}>
                {step}
              </p>
              {evt && (
                <p className="text-xs text-slate-500">
                  {formatDate(evt.changedAt)}
                  {evt.changedByName ? ` · by ${evt.changedByName}` : ''}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
};
