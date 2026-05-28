import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DIETARY_OPTIONS } from '@/data/dietaryOptions';
import type { MenuFilterState } from '@/types/menu';
import { cn } from '@/lib/utils';

interface Props {
  value: MenuFilterState;
  categories: string[];
  onChange: (next: MenuFilterState) => void;
  onReset: () => void;
}

const MenuFilters = ({ value, categories, onChange, onReset }: Props): JSX.Element => (
  <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-end">
    <div className="flex-1">
      <label htmlFor="menu-search" className="mb-1.5 block text-xs font-medium text-slate-600">
        Search
      </label>
      <Input
        id="menu-search"
        type="search"
        placeholder="Search menu…"
        value={value.search}
        onChange={(e) => onChange({ ...value, search: e.target.value })}
      />
    </div>

    <div className="w-full md:w-48">
      <label htmlFor="menu-category" className="mb-1.5 block text-xs font-medium text-slate-600">
        Category
      </label>
      <select
        id="menu-category"
        value={value.category}
        onChange={(e) => onChange({ ...value, category: e.target.value })}
        className={cn(
          'h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand'
        )}
      >
        <option value="">All categories</option>
        {categories.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
    </div>

    <div className="w-full md:w-48">
      <label htmlFor="menu-dietary" className="mb-1.5 block text-xs font-medium text-slate-600">
        Dietary
      </label>
      <select
        id="menu-dietary"
        value={value.dietary}
        onChange={(e) => onChange({ ...value, dietary: e.target.value })}
        className={cn(
          'h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand'
        )}
      >
        <option value="">All preferences</option>
        {DIETARY_OPTIONS.filter((d) => d.value !== '').map((d) => (
          <option key={d.value} value={d.value}>{d.emoji} {d.label}</option>
        ))}
      </select>
    </div>

    <Button type="button" variant="outline" onClick={onReset}>
      Reset
    </Button>
  </div>
);

export default MenuFilters;
