import { DIETARY_OPTIONS } from '@/data/dietaryOptions';
import { cn } from '@/lib/utils';
import type { DietaryPreference } from '@/types/user';

interface Props {
  value: DietaryPreference[];
  onChange: (next: DietaryPreference[]) => void;
}

export const DietarySelect = ({ value, onChange }: Props): JSX.Element => {
  const toggle = (v: string): void => {
    if (v === '') {
      onChange([]);
      return;
    }
    const pref = v as DietaryPreference;
    if (value.includes(pref)) {
      onChange(value.filter((x) => x !== pref));
    } else {
      onChange([...value, pref]);
    }
  };
  return (
    <div className="flex flex-wrap gap-2">
      {DIETARY_OPTIONS.map((o) => {
        const active = o.value === '' ? value.length === 0 : value.includes(o.value as DietaryPreference);
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => toggle(o.value)}
            className={cn(
              'inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm transition',
              active
                ? 'border-brand bg-brand text-white'
                : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
            )}
          >
            <span aria-hidden>{o.emoji}</span>
            {o.label}
          </button>
        );
      })}
    </div>
  );
};
