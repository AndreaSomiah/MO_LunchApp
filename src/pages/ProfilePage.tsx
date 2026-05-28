import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AvatarPicker } from '@/components/profile/AvatarPicker';
import { DietarySelect } from '@/components/profile/DietarySelect';
import { useAuth } from '@/hooks/useAuth';
import { updateProfile, type ProfilePatch } from '@/api/profileApi';
import { avatarById, avatarDefaultBg } from '@/data/avatarOptions';
import type { DietaryPreference } from '@/types/user';

const DIETARY_TAGLINE: Record<string, string> = {
  halal: 'Halal eater 🌙',
  vegan: 'Plant powered 🌱',
  vegetarian: 'Veggie lover 🥗',
  'gluten-free': 'Gluten-free crew 🌾',
  'dairy-free': 'Dairy-free 🥛',
};

const dietaryTagline = (dietary: DietaryPreference[]): string => {
  if (dietary.length === 0) return 'Eats everything 🍽️';
  return DIETARY_TAGLINE[dietary[0] ?? ''] ?? 'Eats everything 🍽️';
};

export const ProfilePage = (): JSX.Element => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [name, setName] = useState('');
  const [avatarId, setAvatarId] = useState('bear');
  const [avatarBg, setAvatarBg] = useState(() => avatarDefaultBg('bear'));
  const [dietary, setDietary] = useState<DietaryPreference[]>([]);

  useEffect(() => {
    if (user) {
      setName(user.name);
      const id = user.avatarId ?? 'bear';
      setAvatarId(id);
      setAvatarBg(avatarDefaultBg(id));
      setDietary(user.dietary);
    }
  }, [user]);

  const handleAvatarChange = (id: string): void => {
    setAvatarId(id);
    setAvatarBg(avatarDefaultBg(id));
  };

  const mutation = useMutation({
    mutationFn: () => updateProfile({ name: name.trim(), avatarId: avatarId as ProfilePatch['avatarId'], dietary }),
    onSuccess: () => {
      toast.success('Profile updated');
      qc.invalidateQueries({ queryKey: ['auth-user'] });
      window.location.reload();
    },
    onError: (err) => toast.error((err as Error).message),
  });

  if (!user) {
    return <p className="text-sm text-slate-500">Loading...</p>;
  }

  const avatar = avatarById(avatarId);
  const completedCount = [!!name.trim(), !!avatarId, dietary.length > 0].filter(Boolean).length;
  const isComplete = completedCount === 3;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">My profile</h1>
      <div className="flex flex-col gap-8 md:flex-row md:items-start">
        {/* Edit form */}
        <div className="flex-1 space-y-6">
          <div>
            <Label htmlFor="p-name">Name</Label>
            <Input id="p-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label>Avatar</Label>
            <AvatarPicker
              value={avatarId}
              onChange={handleAvatarChange}
              avatarBg={avatarBg}
              onBgChange={setAvatarBg}
            />
          </div>
          <div>
            <Label>Dietary preferences</Label>
            <DietarySelect value={dietary} onChange={setDietary} />
          </div>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving...' : 'Save changes'}
          </Button>
        </div>

        {/* Preview card */}
        <div className="w-full md:w-72 md:sticky md:top-6 shrink-0">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col items-center gap-3 text-center">
              <div
                style={{ backgroundColor: avatarBg, width: 80, height: 80 }}
                className="flex items-center justify-center rounded-full text-4xl"
              >
                {avatar?.emoji ?? '🐻'}
              </div>
              <div>
                <p className="text-lg font-semibold text-slate-900">
                  {name.trim() ? name.trim() : <span className="italic text-slate-400">Your name</span>}
                </p>
                <p className="mt-1 text-sm text-slate-500">{dietaryTagline(dietary)}</p>
              </div>
              {dietary.length > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
                  {dietary.join(' · ')}
                </span>
              )}
              <div className="mt-2">
                {isComplete ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                    Profile complete ✓
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                    {completedCount} of 3 done
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
