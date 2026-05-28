import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { fetchSupplyOrders, type SupplyOrderFilters } from '@/api/supplyOrdersApi';
import type { SupplyOrder } from '@/types/supplyOrder';

export const supplyOrdersQueryKey = (filters: SupplyOrderFilters = {}): readonly unknown[] =>
  ['supply-orders', filters] as const;

export const useSupplyOrders = (filters: SupplyOrderFilters = {}): UseQueryResult<SupplyOrder[]> =>
  useQuery({
    queryKey: supplyOrdersQueryKey(filters),
    queryFn: () => fetchSupplyOrders(filters),
  });
