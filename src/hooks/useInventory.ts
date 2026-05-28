import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { fetchInventoryItems, fetchInventoryRequests } from '@/api/inventoryApi';
import type { InventoryItem, InventoryRequest } from '@/types/inventory';

export const inventoryItemsQueryKey = ['inventory-items'] as const;
export const inventoryRequestsQueryKey = (status?: string): readonly unknown[] =>
  ['inventory-requests', status ?? 'all'] as const;

export const useInventoryItems = (): UseQueryResult<InventoryItem[]> =>
  useQuery({
    queryKey: inventoryItemsQueryKey,
    queryFn: fetchInventoryItems,
  });

export const useInventoryRequests = (status?: string): UseQueryResult<InventoryRequest[]> =>
  useQuery({
    queryKey: inventoryRequestsQueryKey(status),
    queryFn: () => fetchInventoryRequests(status),
  });
