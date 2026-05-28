import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { updateTeamRole } from '@/api/teamApi';
import { teamQueryKey } from '@/hooks/useTeam';
import { avatarEmoji } from '@/data/avatarOptions';
import { dietaryLabel } from '@/data/dietaryOptions';
import type { User, UserRole } from '@/types/user';

interface Props {
  users: User[];
  canEditRole: boolean;
  currentUserId?: string;
}

const roleBadge: Record<UserRole, string> = {
  admin:    'bg-purple-100 text-purple-800',
  manager:  'bg-blue-100 text-blue-800',
  employee: 'bg-slate-200 text-slate-700',
};

export const TeamTable = ({ users, canEditRole, currentUserId }: Props): JSX.Element => {
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRole }) => updateTeamRole(id, role),
    onSuccess: () => {
      toast.success('Role updated');
      qc.invalidateQueries({ queryKey: teamQueryKey });
    },
    onError: (err) => toast.error((err as Error).message),
  });
  return (
    <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3">User</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3">Dietary</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t border-slate-100">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl" aria-hidden>{avatarEmoji(u.avatarId)}</span>
                  <span className="font-medium text-slate-900">{u.name}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-slate-600">{u.email}</td>
              <td className="px-4 py-3">
                {canEditRole && u.id !== currentUserId ? (
                  <Select
                    value={u.role}
                    onChange={(e) => mutation.mutate({ id: u.id, role: e.target.value as UserRole })}
                    className="h-8 w-32"
                  >
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </Select>
                ) : (
                  <Badge className={roleBadge[u.role]}>{u.role}</Badge>
                )}
              </td>
              <td className="px-4 py-3 text-slate-600">
                {u.dietary.length === 0 ? '—' : u.dietary.map((d) => dietaryLabel(d)).join(', ')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
