import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { OrderStatus } from '@/types/order';

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending:   'bg-amber-100 text-amber-800 hover:bg-amber-100',
  confirmed: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  delivered: 'bg-green-100 text-green-800 hover:bg-green-100',
  cancelled: 'bg-slate-200 text-slate-700 hover:bg-slate-200',
};

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending:   'Pending',
  confirmed: 'Confirmed',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

interface Props {
  status: OrderStatus;
  className?: string;
}

export const OrderStatusBadge = ({ status, className }: Props): JSX.Element => (
  <Badge className={cn(STATUS_STYLES[status], 'font-medium', className)}>
    {STATUS_LABEL[status]}
  </Badge>
);
