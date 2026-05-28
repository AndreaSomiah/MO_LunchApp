import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { fetchSettings } from '@/api/settingsApi';
import type { AppSettings } from '@/types/settings';

export const settingsQueryKey = ['settings'] as const;

export const useSettings = (): UseQueryResult<AppSettings> =>
  useQuery({
    queryKey: settingsQueryKey,
    queryFn: fetchSettings,
    staleTime: 5 * 60_000,
  });
