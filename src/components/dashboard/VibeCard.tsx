import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { categoryMeta, pickDailyVibe, pickRandomVibe, type Vibe } from '@/data/dailyVibes';

export const VibeCard = (): JSX.Element => {
  const [vibe, setVibe] = useState<Vibe>(() => pickDailyVibe());
  const meta = categoryMeta(vibe.category);

  const shuffle = (): void => {
    let next = pickRandomVibe();
    // Avoid showing the same vibe twice in a row.
    let guard = 0;
    while (next.text === vibe.text && guard < 5) {
      next = pickRandomVibe();
      guard++;
    }
    setVibe(next);
  };

  return (
    <section
      className="relative overflow-hidden rounded-md border border-slate-200 p-5"
      style={{ background: `linear-gradient(135deg, ${meta.bg} 0%, #ffffff 100%)` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl" aria-hidden>{meta.emoji}</span>
          <span
            className="rounded-full px-2 py-0.5 text-xs font-semibold uppercase tracking-wide"
            style={{ backgroundColor: meta.bg, color: meta.fg }}
          >
            {meta.label}
          </span>
        </div>
        <button
          type="button"
          onClick={shuffle}
          aria-label="Shuffle"
          className="rounded-full p-1.5 text-slate-500 transition hover:bg-white/70 hover:text-slate-900"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>
      <p className="mt-3 text-base leading-relaxed text-slate-800">{vibe.text}</p>
      {vibe.attribution && (
        <p className="mt-2 text-xs italic text-slate-500">{'\u2014'} {vibe.attribution}</p>
      )}
    </section>
  );
};
