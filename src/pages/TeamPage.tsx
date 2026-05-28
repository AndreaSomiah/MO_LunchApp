import { Users } from 'lucide-react';
import { TeamTable } from '@/components/settings/TeamTable';
import { useTeam } from '@/hooks/useTeam';
import { useAuth } from '@/hooks/useAuth';

export const TeamPage = (): JSX.Element => {
  const { user } = useAuth();
  const { data, isLoading, isError, error } = useTeam();
  const canEditRole = user?.role === 'admin';

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Team</h1>
      {isLoading && <p className="text-sm text-slate-500">Loading...</p>}
      {isError && <p className="text-sm text-red-600">{(error as Error).message}</p>}
      {data && data.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <Users className="w-10 h-10 mb-3" />
          <p className="text-sm font-medium mb-3">No team members yet.</p>
        </div>
      )}
      {data && data.length > 0 && (
        <TeamTable users={data} canEditRole={canEditRole} currentUserId={user?.id} />
      )}
    </div>
  );
};
