import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { fetchMenuItems, type MenuQuery } from '@/api/menuApi';
import type { MenuItem } from '@/types/menu';

export const menuItemsQueryKey = (filters?: MenuQuery): readonly unknown[] =>
  ['menu-items', filters ?? {}] as const;

export const useMenuItems = (filters: MenuQuery = {}): UseQueryResult<MenuItem[]> =>
  useQuery({
    queryKey: menuItemsQueryKey(filters),
    queryFn: () => fetchMenuItems(filters),
  });
