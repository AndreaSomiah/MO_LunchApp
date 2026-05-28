import type { ChangeEvent } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
  'aria-label'?: string;
}

export const Switch = ({ checked, onCheckedChange, disabled, id, ...rest }: Props): JSX.Element => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    onCheckedChange(e.target.checked);
  };
  return (
    <label
      className={cn(
        'relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full transition-colors',
        checked ? 'bg-brand' : 'bg-slate-300',
        disabled && 'cursor-not-allowed opacity-50'
      )}
    >
      <input
        id={id}
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
        {...rest}
      />
      <span
        className={cn(
          'inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform',
          checked ? 'translate-x-5' : 'translate-x-0.5'
        )}
        aria-hidden
      />
    </label>
  );
};
