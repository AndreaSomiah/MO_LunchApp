import { AVATAR_ANIMALS, AVATAR_FOOD, PASTEL_PALETTE, avatarDefaultBg, type AvatarOption } from '@/data/avatarOptions';
import { cn } from '@/lib/utils';

interface Props {
  value: string;
  onChange: (id: string) => void;
  avatarBg: string;
  onBgChange: (color: string) => void;
}

interface AvatarRowProps {
  avatars: AvatarOption[];
  label: string;
  selectedId: string;
  selectedBg: string;
  onSelect: (id: string) => void;
}

const AvatarRow = ({ avatars, label, selectedId, selectedBg, onSelect }: AvatarRowProps): JSX.Element => (
  <div className="space-y-2">
    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
    <div className="flex flex-wrap gap-2">
      {avatars.map((a, i) => {
        const isSelected = a.id === selectedId;
        const bg = isSelected ? selectedBg : PASTEL_PALETTE[i];
        return (
          <button
            key={a.id}
            type="button"
            onClick={() => onSelect(a.id)}
            aria-label={a.label}
            aria-pressed={isSelected}
            style={{ backgroundColor: bg, width: 60, height: 60 }}
            className={cn(
              'flex items-center justify-center rounded-full text-2xl transition-transform',
              isSelected ? 'ring-2 ring-offset-2 ring-[#082B63] scale-110' : 'hover:scale-105'
            )}
          >
            {a.emoji}
          </button>
        );
      })}
    </div>
  </div>
);

export const AvatarPicker = ({ value, onChange, avatarBg, onBgChange }: Props): JSX.Element => (
  <div className="space-y-4">
    <AvatarRow
      avatars={AVATAR_ANIMALS}
      label="Animals"
      selectedId={value}
      selectedBg={avatarBg}
      onSelect={onChange}
    />
    <AvatarRow
      avatars={AVATAR_FOOD}
      label="Food"
      selectedId={value}
      selectedBg={avatarBg}
      onSelect={onChange}
    />
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Background colour</p>
      <div className="flex flex-wrap gap-2">
        {PASTEL_PALETTE.map((c) => (
          <button
            key={c}
            type="button"
            aria-label={`Colour ${c}`}
            onClick={() => onBgChange(c)}
            style={{ backgroundColor: c, width: 28, height: 28 }}
            className={cn(
              'rounded-full transition-transform hover:scale-110',
              avatarBg === c ? 'ring-2 ring-offset-1 ring-[#082B63] scale-110' : ''
            )}
          />
        ))}
      </div>
    </div>
  </div>
);
