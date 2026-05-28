import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { fetchOrders, fetchOrder, type OrdersQuery } from '@/api/ordersApi';
import type { Order } from '@/types/order';

export const ordersQueryKey = (filters?: OrdersQuery): readonly unknown[] =>
  ['orders', filters ?? {}] as const;

export const orderQueryKey = (id: string): readonly unknown[] => ['order', id] as const;

export const useOrders = (filters: OrdersQuery = {}): UseQueryResult<Order[]> =>
  useQuery({
    queryKey: ordersQueryKey(filters),
    queryFn: () => fetchOrders(filters),
  });

export const useOrder = (id: string | undefined): UseQueryResult<Order> =>
  useQuery({
    queryKey: orderQueryKey(id ?? ''),
    queryFn: () => fetchOrder(id!),
    enabled: Boolean(id),
  });
