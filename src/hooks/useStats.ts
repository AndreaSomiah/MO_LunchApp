import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { fetchStatsSummary, fetchPopularItems, fetchRecentOrders, type StatsSummary, type PopularItem, type RecentOrder } from '@/api/statsApi';

export const useStatsSummary = (): UseQueryResult<StatsSummary> =>
  useQuery({ queryKey: ['stats', 'summary'], queryFn: fetchStatsSummary });

export const usePopularItems = (): UseQueryResult<PopularItem[]> =>
  useQuery({ queryKey: ['stats', 'popular-items'], queryFn: fetchPopularItems });

export const useRecentOrders = (): UseQueryResult<RecentOrder[]> =>
  useQuery({ queryKey: ['stats', 'recent-orders'], queryFn: fetchRecentOrders });
