import { useMemo, useState } from 'react';
import { Utensils } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useMenuItems } from '@/hooks/useMenuItems';
import { useSettings } from '@/hooks/useSettings';
import { isOrderingOpen } from '@/lib/cutoffUtils';
import type { MenuFilterState, MenuItem } from '@/types/menu';
import MenuItemCard from './MenuItemCard';
import MenuItemDetails from './MenuItemDetails';
import MenuFilters from './MenuFilters';

const defaultFilters: MenuFilterState = { category: '', dietary: '', search: '' };

const MenuGrid = (): JSX.Element => {
  const [filters, setFilters] = useState<MenuFilterState>(defaultFilters);
  const [selected, setSelected] = useState<MenuItem | null>(null);
  const [detailsOpen, setDetailsOpen] = useState<boolean>(false);

  const { data: settings } = useSettings();
  const { data, isLoading, isError, refetch } = useMenuItems({
    category: filters.category || undefined,
    search: filters.search.trim() || undefined,
  });

  const orderingOpen = isOrderingOpen(settings);

  const allItems = data ?? [];
  const categories = useMemo(() => {
    const set = new Set<string>(allItems.map((i) => i.category));
    return Array.from(set).sort();
  }, [allItems]);

  const visibleItems = useMemo(() => {
    return allItems.filter((i) => (filters.dietary ? i.dietary === filters.dietary : true));
  }, [allItems, filters.dietary]);

  const openDetails = (item: MenuItem): void => {
    setSelected(item);
    setDetailsOpen(true);
  };

  return (
    <div className="space-y-4">
      <MenuFilters
        value={filters}
        categories={categories}
        onChange={setFilters}
        onReset={() => setFilters(defaultFilters)}
      />

      {!orderingOpen && (
        <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          Today’s ordering is closed. Orders open again tomorrow.
        </div>
      )}

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-lg border border-slate-200 bg-white">
              <div className="space-y-2 p-4">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {isError && (
        <div className="rounded-md border border-red-300 bg-red-50 p-4 text-sm text-red-800">
          Couldn’t load the menu.{' '}
          <Button variant="link" onClick={() => void refetch()}>Try again</Button>
        </div>
      )}

      {!isLoading && !isError && visibleItems.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <Utensils className="w-10 h-10 mb-3" />
          <p className="text-sm font-medium mb-3">No items found.</p>
          <Button variant="outline" onClick={() => setFilters(defaultFilters)}>Clear filters</Button>
        </div>
      )}

      {!isLoading && visibleItems.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleItems.map((i) => (
            <MenuItemCard key={i.id} item={i} isOrderingOpen={orderingOpen} onClick={openDetails} />
          ))}
        </div>
      )}

      <MenuItemDetails item={selected} open={detailsOpen} onOpenChange={setDetailsOpen} />
    </div>
  );
};

export default MenuGrid;
