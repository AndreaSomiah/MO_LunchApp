import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { fetchTeam } from '@/api/teamApi';
import type { User } from '@/types/user';

export const teamQueryKey = ['team'] as const;

export const useTeam = (enabled = true): UseQueryResult<User[]> =>
  useQuery({
    queryKey: teamQueryKey,
    queryFn: fetchTeam,
    enabled,
  });
