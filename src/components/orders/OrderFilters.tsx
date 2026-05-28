import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { OrderStatus } from '@/types/order';

export interface OrderFilterState {
  status: OrderStatus | '';
  dateFrom: string;
  dateTo: string;
  userId: string;
}

interface Props {
  value: OrderFilterState;
  onChange: (next: OrderFilterState) => void;
  showUserFilter?: boolean;
}

export const OrderFilters = ({ value, onChange, showUserFilter }: Props): JSX.Element => {
  const update = <K extends keyof OrderFilterState>(k: K, v: OrderFilterState[K]): void => {
    onChange({ ...value, [k]: v });
  };
  const reset = (): void => {
    onChange({ status: '', dateFrom: '', dateTo: '', userId: '' });
  };
  return (
    <div className="grid grid-cols-1 gap-3 rounded-md border border-slate-200 bg-white p-3 md:grid-cols-5">
      <Select value={value.status} onChange={(e) => update('status', e.target.value as OrderFilterState['status'])}>
        <option value="">All statuses</option>
        <option value="pending">Pending</option>
        <option value="confirmed">Confirmed</option>
        <option value="delivered">Delivered</option>
        <option value="cancelled">Cancelled</option>
      </Select>
      <Input
        type="date"
        value={value.dateFrom}
        onChange={(e) => update('dateFrom', e.target.value)}
        placeholder="From"
      />
      <Input
        type="date"
        value={value.dateTo}
        onChange={(e) => update('dateTo', e.target.value)}
        placeholder="To"
      />
      {showUserFilter && (
        <Input
          value={value.userId}
          onChange={(e) => update('userId', e.target.value)}
          placeholder="User id"
        />
      )}
      <Button type="button" variant="outline" onClick={reset}>
        Reset
      </Button>
    </div>
  );
};
